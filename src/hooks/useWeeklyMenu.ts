import { useEffect, useMemo, useState } from "react";

import { catalogMeals as fallbackMeals } from "../data/catalogMeals";
import { supabase } from "../lib/supabase";
import {
  clearWeeklyMenu,
  createEmptyWeeklyMenu,
  DAYS,
  loadWeeklyMenu,
  MEAL_SLOTS,
  saveMealForDay,
  type Day,
  type MealSlot,
  type WeeklyMenu,
  type WeeklyMenuRow,
} from "../services/weeklyMenuService";
import type { Meal } from "../types/meal";

export function useWeeklyMenu(
  houseCode: string,
  weekStart: string,
  catalog: Meal[] = fallbackMeals,
) {
  const [weeklyMenu, setWeeklyMenu] =
    useState<WeeklyMenu>(() => createEmptyWeeklyMenu());
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
        const menu = await loadWeeklyMenu(houseCode, weekStart);

        if (isMounted) {
          setWeeklyMenu(menu);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el menú.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    const channel = supabase
      .channel(`weekly-menu-${houseCode}-${weekStart}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_menu",
          filter: `room_code=eq.${houseCode}`,
        },
        (payload) => {
          const row = (
            payload.eventType === "DELETE"
              ? payload.old
              : payload.new
          ) as Partial<WeeklyMenuRow>;

          if (
            row.week_start !== weekStart ||
            !row.day ||
            !DAYS.includes(row.day as Day)
          ) {
            return;
          }

          const slot =
            row.meal_slot &&
            MEAL_SLOTS.includes(row.meal_slot as MealSlot)
              ? (row.meal_slot as MealSlot)
              : "main";

          setWeeklyMenu((current) => ({
            ...current,
            [slot]: {
              ...current[slot],
              [row.day as Day]:
                payload.eventType === "DELETE"
                  ? null
                  : row.meal_id ?? null,
            },
          }));
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [houseCode, weekStart]);

  const selectedMeals = useMemo(() => {
    return MEAL_SLOTS.flatMap((slot) =>
      DAYS.map((day) => {
        const mealId = weeklyMenu[slot][day];

        return mealId
          ? catalog.find((meal) => meal.id === mealId)
          : null;
      }),
    ).filter((meal): meal is Meal => Boolean(meal));
  }, [catalog, weeklyMenu]);

  async function refreshAfterError() {
    const menu = await loadWeeklyMenu(houseCode, weekStart);
    setWeeklyMenu(menu);
  }

  async function selectMeal(
    day: Day,
    mealId: number,
    mealSlot: MealSlot = "main",
  ) {
    try {
      setSaving(true);
      setErrorMessage(null);
      setWeeklyMenu((current) => ({
        ...current,
        [mealSlot]: {
          ...current[mealSlot],
          [day]: mealId,
        },
      }));

      await saveMealForDay(
        houseCode,
        weekStart,
        day,
        mealId,
        mealSlot,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la comida.",
      );
      await refreshAfterError();
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(
    day: Day,
    mealSlot: MealSlot = "main",
  ) {
    try {
      setSaving(true);
      setErrorMessage(null);
      setWeeklyMenu((current) => ({
        ...current,
        [mealSlot]: {
          ...current[mealSlot],
          [day]: null,
        },
      }));

      await saveMealForDay(
        houseCode,
        weekStart,
        day,
        null,
        mealSlot,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo quitar la comida.",
      );
      await refreshAfterError();
    } finally {
      setSaving(false);
    }
  }

  async function clearWeek() {
    try {
      setSaving(true);
      setErrorMessage(null);
      setWeeklyMenu(createEmptyWeeklyMenu());
      await clearWeeklyMenu(houseCode, weekStart);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo vaciar el menú.",
      );
      await refreshAfterError();
    } finally {
      setSaving(false);
    }
  }

  return {
    weeklyMenu,
    selectedMeals,
    loading,
    saving,
    errorMessage,
    selectMeal,
    removeMeal,
    clearWeek,
  };
}
