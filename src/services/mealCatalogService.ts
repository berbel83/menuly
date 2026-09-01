import { catalogMeals as fallbackMeals } from "../data/catalogMeals";
import { supabase } from "../lib/supabase";
import type { Category, Ingredient, Meal } from "../types/meal";

interface MealRow {
  id: number;
  household_id: string | null;
  name: string;
  description: string;
  collection: Meal["collection"];
  category: Category;
  ingredients: Ingredient[];
  instructions: string[];
  cooking_time: number;
  difficulty: Meal["difficulty"];
  tags: string[];
  protein: boolean;
  healthy: boolean;
  air_fryer: boolean;
  notes: string;
  is_system: boolean;
}

function fallbackCatalog(): Meal[] {
  return fallbackMeals.map((meal) => ({
    ...meal,
    collection: "main_fasting",
    tags: [meal.category, meal.airFryer ? "Airfryer" : ""].filter(Boolean),
    isSystem: true,
    householdId: null,
  }));
}

const CATALOG_CACHE_PREFIX = "compausa-meal-catalog";

function loadCachedCatalog(householdId: string): Meal[] | null {
  try {
    const value = localStorage.getItem(`${CATALOG_CACHE_PREFIX}:${householdId}`);
    return value ? JSON.parse(value) as Meal[] : null;
  } catch { return null; }
}

function cacheCatalog(householdId: string, meals: Meal[]) {
  try { localStorage.setItem(`${CATALOG_CACHE_PREFIX}:${householdId}`, JSON.stringify(meals)); } catch { /* cache opcional */ }
}

function mapMeal(row: MealRow, favoriteIds: Set<number>): Meal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    collection: row.collection,
    category: row.category,
    image: "",
    ingredients: row.ingredients,
    instructions: row.instructions,
    cookingTime: row.cooking_time,
    difficulty: row.difficulty,
    tags: row.tags,
    protein: row.protein,
    healthy: row.healthy,
    favorite: favoriteIds.has(row.id),
    airFryer: row.air_fryer,
    notes: row.notes,
    householdId: row.household_id,
    isSystem: row.is_system,
  };
}

export async function loadMealCatalog(householdId?: string): Promise<Meal[]> {
  if (!householdId) {
    return fallbackCatalog();
  }

  const [{ data: rows, error }, { data: preferences, error: preferencesError }] =
    await Promise.all([
      supabase
        .from("meals")
        .select(
          "id, household_id, name, description, collection, category, ingredients, instructions, cooking_time, difficulty, tags, protein, healthy, air_fryer, notes, is_system",
        )
        .or(`household_id.is.null,household_id.eq.${householdId}`)
        .order("name"),
      supabase
        .from("household_meal_preferences")
        .select("meal_id, is_favorite, is_hidden")
        .eq("household_id", householdId),
    ]);

  if (error || preferencesError || !rows?.length) {
    const cached = loadCachedCatalog(householdId);
    if (cached?.length) return cached;
    throw new Error("No se pudo cargar el catálogo compartido. Comprueba la conexión e inténtalo de nuevo.");
  }

  const hiddenIds = new Set(
    (preferences ?? []).filter((item) => item.is_hidden).map((item) => item.meal_id),
  );
  const favoriteIds = new Set(
    (preferences ?? []).filter((item) => item.is_favorite).map((item) => item.meal_id),
  );

  const catalog = (rows as MealRow[])
    .filter((row) => !hiddenIds.has(row.id))
    .map((row) => mapMeal(row, favoriteIds));
  cacheCatalog(householdId, catalog);
  return catalog;
}

export async function saveMealPreference(
  householdId: string,
  mealId: number,
  preference: { isFavorite: boolean; isHidden: boolean },
) {
  const { error } = await supabase
    .from("household_meal_preferences")
    .upsert(
      {
        household_id: householdId,
        meal_id: mealId,
        is_favorite: preference.isFavorite,
        is_hidden: preference.isHidden,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "household_id,meal_id" },
    );

  if (error) {
    throw new Error(`No se pudo guardar la preferencia: ${error.message}`);
  }
}

export interface NewHouseholdMeal {
  name: string;
  category: Category;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
}

export async function createHouseholdMeal(
  householdId: string,
  input: NewHouseholdMeal,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No se pudo identificar al usuario.");
  }

  const { error } = await supabase.from("meals").insert({
    household_id: householdId,
    created_by: user.id,
    name: input.name.trim(),
    description: "Receta creada por vuestro hogar.",
    collection: "custom",
    category: input.category,
    ingredients: input.ingredients,
    instructions: input.instructions,
    cooking_time: input.cookingTime,
    difficulty: input.cookingTime >= 45 ? "Media" : "Fácil",
    tags: ["Nuestro plato"],
    protein: false,
    healthy: false,
    air_fryer: false,
    notes: "",
  });

  if (error) {
    throw new Error(`No se pudo crear el plato: ${error.message}`);
  }
}

export async function updateHouseholdMeal(
  householdId: string,
  mealId: number,
  input: NewHouseholdMeal,
) {
  const { error } = await supabase
    .from("meals")
    .update({
      name: input.name.trim(),
      category: input.category,
      ingredients: input.ingredients,
      instructions: input.instructions,
      cooking_time: input.cookingTime,
      difficulty: input.cookingTime >= 45 ? "Media" : "Fácil",
      updated_at: new Date().toISOString(),
    })
    .eq("id", mealId)
    .eq("household_id", householdId);

  if (error) {
    throw new Error(`No se pudo actualizar el plato: ${error.message}`);
  }
}

export async function deleteHouseholdMeal(householdId: string, mealId: number) {
  const { error } = await supabase.rpc("delete_household_meal", {
    p_household_id: householdId,
    p_meal_id: mealId,
  });

  if (error) {
    throw new Error(`No se pudo eliminar el plato: ${error.message}`);
  }
}

export async function loadRecentMealIds(householdId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("weekly_menu")
    .select("meal_id, week_start")
    .eq("household_id", householdId)
    .not("meal_id", "is", null)
    .order("week_start", { ascending: false })
    .limit(42);

  if (error) return [];
  return Array.from(new Set((data ?? []).map((row) => row.meal_id).filter(Number.isInteger)));
}

export async function restoreHiddenMeals(householdId: string) {
  const { error } = await supabase
    .from("household_meal_preferences")
    .update({ is_hidden: false, updated_at: new Date().toISOString() })
    .eq("household_id", householdId)
    .eq("is_hidden", true);

  if (error) {
    throw new Error(`No se pudieron restaurar los platos: ${error.message}`);
  }
}
