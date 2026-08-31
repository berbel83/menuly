import { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import HomeHeader from "../components/layout/HomeHeader";
import FastingSummary from "../components/fasting/FastingSummary";
import FastingWeekProgress from "../components/fasting/FastingWeekProgress";
import MealList from "../components/meals/MealList";
import ShoppingSummary from "../components/shopping/ShoppingSummary";
import WeekNavigator from "../components/navigation/WeekNavigator";

import MealDetails from "../components/MealDetails";
import ShoppingListModal from "../components/ShoppingListModal";

import { meals } from "../data/meals";
import { useHouse } from "../context/useHouse";
import { useShoppingList } from "../hooks/useShoppingList";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";

import {
  DAYS,
  formatWeekStart,
  type Day,
} from "../services/weeklyMenuService";

import type { Meal } from "../types/meal";

const shortDays: Record<Day, string> = {
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mié",
  Jueves: "Jue",
  Viernes: "Vie",
  Sábado: "Sáb",
  Domingo: "Dom",
};

function getMonday(date: Date) {
  const result =
    new Date(date);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function dateFromWeekStart(
  value: string | null
) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatWeekLabel(
  monday: Date
) {
  const sunday =
    new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  const startDay =
    monday.getDate();

  const endDay =
    sunday.getDate();

  const startMonth =
    monday.toLocaleDateString(
      "es-ES",
      {
        month: "long",
      }
    );

  const endMonth =
    sunday.toLocaleDateString(
      "es-ES",
      {
        month: "long",
      }
    );

  if (
    monday.getMonth() ===
    sunday.getMonth()
  ) {
    return `${startDay}–${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

export default function HomePage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

  const { house } =
    useHouse();

  const currentMonday =
    useMemo(
      () =>
        getMonday(
          new Date()
        ),
      []
    );

  const initialMonday =
    useMemo(() => {
      const fromUrl =
        dateFromWeekStart(
          searchParams.get(
            "week"
          )
        );

      return (
        fromUrl ??
        currentMonday
      );
    }, [currentMonday, searchParams]);

  const [
    selectedMonday,
    setSelectedMonday,
  ] =
    useState<Date>(
      initialMonday
    );

  const weekStart =
    useMemo(
      () =>
        formatWeekStart(
          selectedMonday
        ),
      [selectedMonday]
    );

  const houseCode =
    house?.code ?? "";

  const {
    weeklyMenu,
    selectedMeals,
    loading,
    saving,
    errorMessage,
    removeMeal,
    clearWeek,
  } =
    useWeeklyMenu(
      houseCode,
      weekStart
    );

  const {
    shoppingList,
    itemCount,
  } =
    useShoppingList(
      selectedMeals
    );

  const [
    selectedMealDetails,
    setSelectedMealDetails,
  ] =
    useState<Meal | null>(
      null
    );

  const [
    selectedMealDay,
    setSelectedMealDay,
  ] =
    useState<Day | null>(
      null
    );

  const [
    showShoppingList,
    setShowShoppingList,
  ] =
    useState(false);

  if (!house) {
    return null;
  }

  const weekLabel =
    formatWeekLabel(
      selectedMonday
    );

  const isCurrentWeek =
    formatWeekStart(
      selectedMonday
    ) ===
    formatWeekStart(
      currentMonday
    );

  const mealsByDay =
    DAYS.map(
      (day, index) => {
        const date =
          new Date(
            selectedMonday
          );

        date.setDate(
          selectedMonday.getDate() +
            index
        );

        const mealId =
          weeklyMenu[day];

        const meal =
          mealId
            ? meals.find(
                (item) =>
                  item.id ===
                  mealId
              )
            : undefined;

        return {
          dayShort:
            shortDays[day],

          dayNumber:
            String(
              date.getDate()
            ),

          meal,
        };
      }
    );

  function changeWeek(
    monday: Date
  ) {
    setSelectedMonday(
      monday
    );

    setSearchParams({
      week:
        formatWeekStart(
          monday
        ),
    });
  }

  function goToPreviousWeek() {
    const previous =
      new Date(
        selectedMonday
      );

    previous.setDate(
      previous.getDate() -
        7
    );

    changeWeek(
      previous
    );
  }

  function goToNextWeek() {
    const next =
      new Date(
        selectedMonday
      );

    next.setDate(
      next.getDate() +
        7
    );

    changeWeek(next);
  }

  function goToCurrentWeek() {
    changeWeek(
      currentMonday
    );
  }

  function openRecipeSelector(
    day: Day
  ) {
    navigate(
      `/choose?day=${encodeURIComponent(
        day
      )}&week=${weekStart}`
    );
  }

  function handleDayClick(
    index: number
  ) {
    const day =
      DAYS[index];

    const mealId =
      weeklyMenu[day];

    if (!mealId) {
      openRecipeSelector(
        day
      );

      return;
    }

    const meal =
      meals.find(
        (item) =>
          item.id ===
          mealId
      );

    if (meal) {
      setSelectedMealDay(
        day
      );

      setSelectedMealDetails(
        meal
      );
    }
  }

  function closeMealDetails() {
    setSelectedMealDetails(
      null
    );

    setSelectedMealDay(
      null
    );
  }

  function changeCurrentMeal() {
    if (
      !selectedMealDay
    ) {
      return;
    }

    const day =
      selectedMealDay;

    closeMealDetails();

    openRecipeSelector(
      day
    );
  }

  async function removeCurrentMeal() {
    if (
      !selectedMealDay
    ) {
      return;
    }

    const day =
      selectedMealDay;

    closeMealDetails();

    await removeMeal(
      day
    );
  }

  async function confirmClearWeek() {
    const confirmed =
      window.confirm(
        "¿Quieres borrar todo el menú de esta semana?"
      );

    if (!confirmed) {
      return;
    }

    await clearWeek();
  }

  return (
    <AppShell>
      <HomeHeader
        houseName={
          house.name
        }
        shoppingCount={
          itemCount
        }
        onOpenShopping={() =>
          setShowShoppingList(
            true
          )
        }
      />

      <FastingSummary />

      <FastingWeekProgress />

      <WeekNavigator
        label={
          weekLabel
        }
        plannedCount={
          selectedMeals.length
        }
        totalCount={7}
        isCurrentWeek={
          isCurrentWeek
        }
        onPrevious={
          goToPreviousWeek
        }
        onNext={
          goToNextWeek
        }
        onToday={
          goToCurrentWeek
        }
      />

      {errorMessage && (
        <div className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-10 text-center text-sm text-[#81766D]">
          Cargando vuestro menú...
        </div>
      ) : (
        <MealList
          mealsByDay={
            mealsByDay
          }
          onSelectDay={
            handleDayClick
          }
        />
      )}

      <ShoppingSummary
        itemCount={
          itemCount
        }
        onClick={() =>
          setShowShoppingList(
            true
          )
        }
      />

      {!loading &&
        selectedMeals.length >
          0 && (
          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={
                confirmClearWeek
              }
              disabled={
                saving
              }
              className="w-full py-2 text-center text-[11px] font-medium text-[#A0968C] transition hover:text-[#D96536] disabled:opacity-50"
            >
              Vaciar semana
            </button>
          </div>
        )}

      {showShoppingList && (
        <ShoppingListModal
          items={
            shoppingList
          }
          onClose={() =>
            setShowShoppingList(
              false
            )
          }
        />
      )}

      {selectedMealDetails && (
        <MealDetails
          meal={
            selectedMealDetails
          }
          onClose={
            closeMealDetails
          }
          onChange={
            changeCurrentMeal
          }
          onRemove={
            removeCurrentMeal
          }
        />
      )}
    </AppShell>
  );
}
