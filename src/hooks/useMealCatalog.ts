import { useEffect, useState } from "react";

import { catalogMeals as fallbackMeals } from "../data/catalogMeals";
import {
  createHouseholdMeal,
  deleteHouseholdMeal,
  loadMealCatalog,
  saveMealPreference,
  updateHouseholdMeal,
  type NewHouseholdMeal,
} from "../services/mealCatalogService";
import type { Meal } from "../types/meal";

export function useMealCatalog(householdId?: string) {
  const [meals, setMeals] = useState<Meal[]>(fallbackMeals);
  const [loading, setLoading] = useState(Boolean(householdId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void loadMealCatalog(householdId)
      .then((catalog) => {
        if (mounted) setMeals(catalog);
      })
      .catch((error) => {
        if (mounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "No se pudo cargar el catálogo.",
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [householdId]);

  async function toggleFavorite(mealId: number) {
    if (!householdId) return;
    const meal = meals.find((item) => item.id === mealId);
    if (!meal) return;

    const nextFavorite = !meal.favorite;
    setMeals((current) =>
      current.map((item) =>
        item.id === mealId ? { ...item, favorite: nextFavorite } : item,
      ),
    );

    try {
      await saveMealPreference(householdId, mealId, {
        isFavorite: nextFavorite,
        isHidden: false,
      });
    } catch (error) {
      setMeals((current) =>
        current.map((item) =>
          item.id === mealId ? { ...item, favorite: meal.favorite } : item,
        ),
      );
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo guardar el favorito.",
      );
    }
  }

  async function hideMeal(mealId: number) {
    if (!householdId) return;
    const meal = meals.find((item) => item.id === mealId);
    if (!meal) return;

    setMeals((current) => current.filter((item) => item.id !== mealId));

    try {
      await saveMealPreference(householdId, mealId, {
        isFavorite: meal.favorite,
        isHidden: true,
      });
    } catch (error) {
      setMeals((current) => [...current, meal].sort((a, b) => a.name.localeCompare(b.name)));
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo ocultar el plato.",
      );
    }
  }

  async function addMeal(input: NewHouseholdMeal) {
    if (!householdId) {
      throw new Error("No se encontró el hogar.");
    }

    await createHouseholdMeal(householdId, input);
    const catalog = await loadMealCatalog(householdId);
    setMeals(catalog);
  }

  async function editMeal(mealId: number, input: NewHouseholdMeal) {
    if (!householdId) throw new Error("No se encontró el hogar.");
    await updateHouseholdMeal(householdId, mealId, input);
    setMeals(await loadMealCatalog(householdId));
  }

  async function removeCustomMeal(mealId: number) {
    if (!householdId) throw new Error("No se encontró el hogar.");
    await deleteHouseholdMeal(householdId, mealId);
    setMeals((current) => current.filter((meal) => meal.id !== mealId));
  }

  return {
    meals, loading, errorMessage, toggleFavorite, hideMeal, addMeal,
    editMeal, removeCustomMeal,
  };
}
