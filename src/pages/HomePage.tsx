import { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import MealDetails from "../components/MealDetails";
import AppShell from "../components/layout/AppShell";
import HomeHeader from "../components/layout/HomeHeader";
import MealList from "../components/meals/MealList";
import WeekNavigator from "../components/navigation/WeekNavigator";
import ShoppingSummary from "../components/shopping/ShoppingSummary";
import { useHouse } from "../context/useHouse";
import { meals } from "../data/meals";
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
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

function dateFromWeekStart(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWeekLabel(monday: Date) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startMonth = monday.toLocaleDateString("es-ES", { month: "long" });
  const endMonth = sunday.toLocaleDateString("es-ES", { month: "long" });

  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${endMonth}`;
  }

  return `${monday.getDate()} ${startMonth} – ${sunday.getDate()} ${endMonth}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { house } = useHouse();

  const currentMonday = useMemo(() => getMonday(new Date()), []);
  const initialMonday = useMemo(
    () => dateFromWeekStart(searchParams.get("week")) ?? currentMonday,
    [currentMonday, searchParams],
  );
  const [selectedMonday, setSelectedMonday] = useState(initialMonday);
  const weekStart = useMemo(
    () => formatWeekStart(selectedMonday),
    [selectedMonday],
  );

  const {
    weeklyMenu,
    selectedMeals,
    loading,
    saving,
    errorMessage,
    removeMeal,
    clearWeek,
  } = useWeeklyMenu(house?.code ?? "", weekStart);

  const { itemCount } = useShoppingList(selectedMeals);
  const [selectedMealDetails, setSelectedMealDetails] =
    useState<Meal | null>(null);
  const [selectedMealDay, setSelectedMealDay] =
    useState<Day | null>(null);

  if (!house) {
    return null;
  }

  const weekLabel = formatWeekLabel(selectedMonday);
  const isCurrentWeek =
    formatWeekStart(selectedMonday) === formatWeekStart(currentMonday);

  const mealsByDay = DAYS.map((day, index) => {
    const date = new Date(selectedMonday);
    date.setDate(selectedMonday.getDate() + index);

    const mealId = weeklyMenu[day];
    const meal = mealId
      ? meals.find((item) => item.id === mealId)
      : undefined;

    return {
      dayShort: shortDays[day],
      dayNumber: String(date.getDate()),
      meal,
    };
  });

  function changeWeek(monday: Date) {
    setSelectedMonday(monday);
    setSearchParams({ week: formatWeekStart(monday) });
  }

  function goToPreviousWeek() {
    const previous = new Date(selectedMonday);
    previous.setDate(previous.getDate() - 7);
    changeWeek(previous);
  }

  function goToNextWeek() {
    const next = new Date(selectedMonday);
    next.setDate(next.getDate() + 7);
    changeWeek(next);
  }

  function openRecipeSelector(day: Day) {
    navigate(
      `/choose?day=${encodeURIComponent(day)}&week=${weekStart}`,
    );
  }

  function handleDayClick(index: number) {
    const day = DAYS[index];
    const mealId = weeklyMenu[day];

    if (!mealId) {
      openRecipeSelector(day);
      return;
    }

    const meal = meals.find((item) => item.id === mealId);

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
    openRecipeSelector(day);
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
    if (window.confirm("¿Quieres borrar todo el menú de esta semana?")) {
      await clearWeek();
    }
  }

  return (
    <AppShell>
      <div className="pb-24">
        <HomeHeader
          houseName={house.name}
          shoppingCount={itemCount}
          onOpenShopping={() => navigate("/shopping")}
        />

        <section className="px-4 pb-3 pt-1 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
            Planificación compartida
          </p>
          <h1 className="mt-1 font-serif text-[30px] font-semibold">
            Menú familiar
          </h1>
          <p className="mt-1 text-xs leading-5 text-white/65">
            Una comida principal al día. Después podrás añadir otras cuando las necesites.
          </p>
        </section>

        <WeekNavigator
          label={weekLabel}
          plannedCount={selectedMeals.length}
          totalCount={7}
          isCurrentWeek={isCurrentWeek}
          onPrevious={goToPreviousWeek}
          onNext={goToNextWeek}
          onToday={() => changeWeek(currentMonday)}
        />

        {errorMessage && (
          <div className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-white/65">
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
          onClick={() => navigate("/shopping")}
        />

        {!loading && selectedMeals.length > 0 && (
          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={confirmClearWeek}
              disabled={saving}
              className="w-full py-2 text-center text-[11px] font-medium text-white/55 transition hover:text-[#FFD9CB] disabled:opacity-50"
            >
              Vaciar semana
            </button>
          </div>
        )}

        {selectedMealDetails && (
          <MealDetails
            meal={selectedMealDetails}
            onClose={closeMealDetails}
            onChange={changeCurrentMeal}
            onRemove={removeCurrentMeal}
          />
        )}
      </div>
    </AppShell>
  );
}
