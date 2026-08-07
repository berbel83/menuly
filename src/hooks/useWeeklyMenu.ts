import { useEffect, useMemo, useState } from "react";

import { meals } from "../data/meals";
import { supabase } from "../lib/supabase";

import {
  clearWeeklyMenu,
  DAYS,
  emptyWeeklyMenu,
  loadWeeklyMenu,
  saveMealForDay,
  type Day,
  type WeeklyMenu,
  type WeeklyMenuRow,
} from "../services/weeklyMenuService";

import type { Meal } from "../types/meal";

export function useWeeklyMenu(
  houseCode: string,
  weekStart: string
) {
  const [weeklyMenu, setWeeklyMenu] =
    useState<WeeklyMenu>(emptyWeeklyMenu);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const menu =
          await loadWeeklyMenu(
            houseCode,
            weekStart
          );

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
      .channel(
        `weekly-menu-${houseCode}-${weekStart}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_menu",
          filter: `room_code=eq.${houseCode}`,
        },
        (payload) => {
          if (
            payload.eventType === "DELETE"
          ) {
            const oldRow =
              payload.old as Partial<WeeklyMenuRow>;

            if (
              oldRow.week_start ===
                weekStart &&
              oldRow.day &&
              DAYS.includes(
                oldRow.day as Day
              )
            ) {
              setWeeklyMenu(
                (current) => ({
                  ...current,
                  [oldRow.day as Day]:
                    null,
                })
              );
            }

            return;
          }

          const newRow =
            payload.new as WeeklyMenuRow;

          if (
            newRow.week_start ===
              weekStart &&
            DAYS.includes(newRow.day)
          ) {
            setWeeklyMenu(
              (current) => ({
                ...current,
                [newRow.day]:
                  newRow.meal_id,
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;

      supabase.removeChannel(
        channel
      );
    };
  }, [houseCode, weekStart]);

  const selectedMeals = useMemo(() => {
    return DAYS.map((day) => {
      const mealId =
        weeklyMenu[day];

      return mealId
        ? meals.find(
            (meal) =>
              meal.id === mealId
          )
        : null;
    }).filter(
      (meal): meal is Meal =>
        Boolean(meal)
    );
  }, [weeklyMenu]);

  async function selectMeal(
    day: Day,
    mealId: number
  ) {
    try {
      setSaving(true);
      setErrorMessage(null);

      setWeeklyMenu(
        (current) => ({
          ...current,
          [day]: mealId,
        })
      );

      await saveMealForDay(
        houseCode,
        weekStart,
        day,
        mealId
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la comida."
      );

      const menu =
        await loadWeeklyMenu(
          houseCode,
          weekStart
        );

      setWeeklyMenu(menu);
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(
    day: Day
  ) {
    try {
      setSaving(true);
      setErrorMessage(null);

      setWeeklyMenu(
        (current) => ({
          ...current,
          [day]: null,
        })
      );

      await saveMealForDay(
        houseCode,
        weekStart,
        day,
        null
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo quitar la comida."
      );

      const menu =
        await loadWeeklyMenu(
          houseCode,
          weekStart
        );

      setWeeklyMenu(menu);
    } finally {
      setSaving(false);
    }
  }

  async function clearWeek() {
    try {
      setSaving(true);
      setErrorMessage(null);

      setWeeklyMenu(
        emptyWeeklyMenu
      );

      await clearWeeklyMenu(
        houseCode,
        weekStart
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo vaciar el menú."
      );

      const menu =
        await loadWeeklyMenu(
          houseCode,
          weekStart
        );

      setWeeklyMenu(menu);
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