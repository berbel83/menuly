import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import Header from "../components/layout/Header";
import MealList from "../components/meals/MealList";
import ShoppingSummary from "../components/shopping/ShoppingSummary";
import WeekNavigator from "../components/navigation/WeekNavigator";
import ProgressCard from "../components/navigation/ProgressCard";

import MealDetails from "../components/MealDetails";
import MealSelectorModal from "../components/MealSelectorModal";
import ShoppingListModal from "../components/ShoppingListModal";

import { meals } from "../data/meals";
import { useHouse } from "../context/HouseContext";
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
  const result = new Date(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function formatWeekLabel(monday: Date) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = monday.getDate();
  const endDay = sunday.getDate();

  const startMonth = monday.toLocaleDateString("es-ES", {
    month: "long",
  });

  const endMonth = sunday.toLocaleDateString("es-ES", {
    month: "long",
  });

  if (monday.getMonth() === sunday.getMonth()) {
    return `${startDay}–${endDay} ${endMonth}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

export default function HomePage() {
  const { house } = useHouse();

  if (!house) {
    return null;
  }

  const currentMonday = useMemo(
    () => getMonday(new Date()),
    []
  );

  const [selectedMonday, setSelectedMonday] =
    useState<Date>(currentMonday);

  const weekStart = useMemo(
    () => formatWeekStart(selectedMonday),
    [selectedMonday]
  );

  const {
    weeklyMenu,
    selectedMeals,
    loading,
    saving,
    errorMessage,
    selectMeal,
    removeMeal,
    clearWeek,
  } = useWeeklyMenu(house.code, weekStart);

  const {
    shoppingList,
    itemCount,
  } = useShoppingList(selectedMeals);

  const [selectedDay, setSelectedDay] =
    useState<Day | null>(null);

  const [selectedMealDetails, setSelectedMealDetails] =
    useState<Meal | null>(null);

  const [selectedMealDay, setSelectedMealDay] =
    useState<Day | null>(null);

  const [showShoppingList, setShowShoppingList] =
    useState(false);

  const weekLabel = useMemo(
    () => formatWeekLabel(selectedMonday),
    [selectedMonday]
  );

  const isCurrentWeek =
    formatWeekStart(selectedMonday) ===
    formatWeekStart(currentMonday);

  const mealsByDay = useMemo(() => {
    return DAYS.map((day, index) => {
      const date = new Date(selectedMonday);
      date.setDate(
        selectedMonday.getDate() + index
      );

      const mealId = weeklyMenu[day];

      const meal = mealId
        ? meals.find(
            (item) => item.id === mealId
          )
        : undefined;

      return {
        dayShort: shortDays[day],
        dayNumber: String(date.getDate()),
        meal,
      };
    });
  }, [weeklyMenu, selectedMonday]);

  function goToPreviousWeek() {
    const previous = new Date(selectedMonday);

    previous.setDate(
      selectedMonday.getDate() - 7
    );

    setSelectedMonday(previous);
  }

  function goToNextWeek() {
    const next = new Date(selectedMonday);

    next.setDate(
      selectedMonday.getDate() + 7
    );

    setSelectedMonday(next);
  }

  function goToCurrentWeek() {
    setSelectedMonday(currentMonday);
  }

  function handleDayClick(index: number) {
    const day = DAYS[index];
    const mealId = weeklyMenu[day];

    if (!mealId) {
      setSelectedDay(day);
      return;
    }

    const meal = meals.find(
      (item) => item.id === mealId
    );

    if (meal) {
      setSelectedMealDay(day);
      setSelectedMealDetails(meal);
    }
  }

  function closeMealDetails() {
    setSelectedMealDetails(null);
    setSelectedMealDay(null);
  }

  function changeCurrentMeal() {
    if (!selectedMealDay) {
      return;
    }

    const day = selectedMealDay;

    closeMealDetails();
    setSelectedDay(day);
  }

  async function removeCurrentMeal() {
    if (!selectedMealDay) {
      return;
    }

    const day = selectedMealDay;

    closeMealDetails();
    await removeMeal(day);
  }

  async function confirmClearWeek() {
    const confirmed = window.confirm(
      "¿Quieres borrar todo el menú de esta semana?"
    );

    if (!confirmed) {
      return;
    }

    await clearWeek();
  }

  return (
    <AppShell>
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A08E80]">
              Hogar
            </p>

            <p className="mt-1 font-serif text-[18px] font-semibold text-[#292923]">
              {house.name}
            </p>
          </div>

          <Link
            to="/settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#E2D9CF] bg-white text-lg text-[#81766D] transition hover:bg-[#F6F1EB]"
            aria-label="Abrir ajustes"
          >
            ⚙
          </Link>
        </div>
      </div>

      <Header
        plannedCount={selectedMeals.length}
        totalCount={7}
        dateLabel=""
        onOpenShopping={() =>
          setShowShoppingList(true)
        }
      />

      <WeekNavigator
        label={weekLabel}
        isCurrentWeek={isCurrentWeek}
        onPrevious={goToPreviousWeek}
        onNext={goToNextWeek}
        onToday={goToCurrentWeek}
      />

      <ProgressCard
        plannedCount={selectedMeals.length}
        totalCount={7}
      />

      {errorMessage && (
        <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="px-6 py-12 text-center text-sm text-[#81766D]">
          Cargando vuestro menú...
        </div>
      ) : (
        <MealList
          mealsByDay={mealsByDay}
          onSelectDay={handleDayClick}
        />
      )}

      <ShoppingSummary
        itemCount={itemCount}
        onClick={() =>
          setShowShoppingList(true)
        }
      />

      {!loading &&
        selectedMeals.length > 0 && (
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={confirmClearWeek}
              disabled={saving}
              className="w-full py-2 text-center text-xs font-medium text-[#9A8C82] transition hover:text-[#D96536] disabled:opacity-50"
            >
              Vaciar semana
            </button>
          </div>
        )}

      {selectedDay && (
        <MealSelectorModal
          day={selectedDay}
          meals={meals}
          onSelect={async (mealId) => {
            await selectMeal(
              selectedDay,
              mealId
            );

            setSelectedDay(null);
          }}
          onClose={() =>
            setSelectedDay(null)
          }
        />
      )}

      {showShoppingList && (
        <ShoppingListModal
          items={shoppingList}
          onClose={() =>
            setShowShoppingList(false)
          }
        />
      )}

      {selectedMealDetails && (
        <MealDetails
          meal={selectedMealDetails}
          onClose={closeMealDetails}
          onChange={changeCurrentMeal}
          onRemove={removeCurrentMeal}
        />
      )}
    </AppShell>
  );
}