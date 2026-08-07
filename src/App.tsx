import { useEffect, useMemo, useState } from "react";
import DayCard from "./components/DayCard";
import Header from "./components/Header";
import MealDetails from "./components/MealDetails";
import MealSelectorModal from "./components/MealSelectorModal";
import ShoppingListModal from "./components/ShoppingListModal";
import { meals } from "./data/meals";
import { supabase } from "./lib/supabase";
import {
  clearWeeklyMenu,
  DAYS,
  emptyWeeklyMenu,
  loadWeeklyMenu,
  ROOM_CODE,
  saveMealForDay,
  type Day,
  type WeeklyMenu,
  type WeeklyMenuRow,
} from "./services/weeklyMenuService";
import type { Meal } from "./types/meal";

export default function App() {
  const [weeklyMenu, setWeeklyMenu] =
    useState<WeeklyMenu>(emptyWeeklyMenu);

  const [selectedDay, setSelectedDay] =
    useState<Day | null>(null);

  const [selectedMealDetails, setSelectedMealDetails] =
    useState<Meal | null>(null);

  const [showShoppingList, setShowShoppingList] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const menu = await loadWeeklyMenu();

        if (isMounted) {
          setWeeklyMenu(menu);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el menú."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    const channel = supabase
      .channel(`weekly-menu-${ROOM_CODE}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_menu",
          filter: `room_code=eq.${ROOM_CODE}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as Partial<WeeklyMenuRow>;

            if (
              oldRow.day &&
              DAYS.includes(oldRow.day as Day)
            ) {
              setWeeklyMenu((current) => ({
                ...current,
                [oldRow.day as Day]: null,
              }));
            }

            return;
          }

          const newRow = payload.new as WeeklyMenuRow;

          if (DAYS.includes(newRow.day)) {
            setWeeklyMenu((current) => ({
              ...current,
              [newRow.day]: newRow.meal_id,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const selectedMeals = useMemo(() => {
    return DAYS.map((day) => {
      const mealId = weeklyMenu[day];

      return mealId
        ? meals.find((meal) => meal.id === mealId)
        : null;
    }).filter((meal): meal is Meal => Boolean(meal));
  }, [weeklyMenu]);

  const shoppingList = useMemo(() => {
    const ingredientMap = new Map<string, string[]>();

    selectedMeals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const quantities =
          ingredientMap.get(ingredient.name) ?? [];

        quantities.push(ingredient.quantity);

        ingredientMap.set(
          ingredient.name,
          quantities
        );
      });
    });

    return Array.from(ingredientMap.entries()).map(
      ([name, quantities]) => ({
        name,
        quantity: quantities.join(" + "),
      })
    );
  }, [selectedMeals]);

  const progress =
    (selectedMeals.length / DAYS.length) * 100;

  async function selectMeal(
    day: Day,
    mealId: number
  ) {
    try {
      setSaving(true);
      setErrorMessage(null);

      setWeeklyMenu((current) => ({
        ...current,
        [day]: mealId,
      }));

      setSelectedDay(null);

      await saveMealForDay(day, mealId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la comida."
      );

      const menu = await loadWeeklyMenu();
      setWeeklyMenu(menu);
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(day: Day) {
    try {
      setSaving(true);
      setErrorMessage(null);

      setWeeklyMenu((current) => ({
        ...current,
        [day]: null,
      }));

      await saveMealForDay(day, null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo quitar la comida."
      );

      const menu = await loadWeeklyMenu();
      setWeeklyMenu(menu);
    } finally {
      setSaving(false);
    }
  }

  async function clearWeek() {
    const confirmed = window.confirm(
      "¿Quieres borrar todo el menú semanal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setWeeklyMenu(emptyWeeklyMenu);

      await clearWeeklyMenu();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo vaciar el menú."
      );

      const menu = await loadWeeklyMenu();
      setWeeklyMenu(menu);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-5 pb-28 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Header />

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-orange-500">
                PLAN SEMANAL
              </p>

              <h2 className="mt-1 text-2xl font-black text-stone-900">
                Esta semana
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {loading
                  ? "Cargando menú compartido..."
                  : `${selectedMeals.length} de 7 comidas elegidas`}
              </p>
            </div>

            {!loading && selectedMeals.length > 0 && (
              <button
                type="button"
                onClick={clearWeek}
                disabled={saving}
                className="rounded-xl px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vaciar
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="text-3xl">⏳</div>

              <p className="mt-3 font-bold text-stone-700">
                Cargando vuestro menú...
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {DAYS.map((day) => {
                const mealId = weeklyMenu[day];

                const meal = meals.find(
                  (item) => item.id === mealId
                );

                return (
                  <DayCard
                    key={day}
                    day={day}
                    meal={meal}
                    onChoose={() => setSelectedDay(day)}
                    onViewRecipe={() => {
                      if (meal) {
                        setSelectedMealDetails(meal);
                      }
                    }}
                    onRemove={() => removeMeal(day)}
                  />
                );
              })}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() => setShowShoppingList(true)}
          disabled={
            loading ||
            saving ||
            selectedMeals.length === 0
          }
          className="mt-6 w-full rounded-2xl bg-emerald-700 px-5 py-4 text-base font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        >
          🛒 Generar lista de la compra
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
          <span
            className={`h-2 w-2 rounded-full ${
              errorMessage
                ? "bg-rose-500"
                : "bg-emerald-500"
            }`}
          />

          <span>
            {saving
              ? "Guardando cambios..."
              : "Menú sincronizado en la nube"}
          </span>
        </div>
      </div>

      {selectedDay && (
        <MealSelectorModal
          day={selectedDay}
          meals={meals}
          onSelect={(mealId) =>
            selectMeal(selectedDay, mealId)
          }
          onClose={() => setSelectedDay(null)}
        />
      )}

      {showShoppingList && (
        <ShoppingListModal
          items={shoppingList}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      {selectedMealDetails && (
        <MealDetails
          meal={selectedMealDetails}
          onClose={() =>
            setSelectedMealDetails(null)
          }
        />
      )}
    </main>
  );
}