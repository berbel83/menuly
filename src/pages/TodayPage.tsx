import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import FastingSummary from "../components/fasting/FastingSummary";
import FastingWeekProgress from "../components/fasting/FastingWeekProgress";
import AppShell from "../components/layout/AppShell";
import HomeHeader from "../components/layout/HomeHeader";
import MealRow from "../components/meals/MealRow";
import ShoppingSummary from "../components/shopping/ShoppingSummary";
import { useHouse } from "../context/useHouse";
import { meals } from "../data/meals";
import { useShoppingList } from "../hooks/useShoppingList";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";
import {
  DAYS,
  formatWeekStart,
} from "../services/weeklyMenuService";

const shortDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

export default function TodayPage() {
  const navigate = useNavigate();
  const { house } = useHouse();
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(
    () => formatWeekStart(getMonday(today)),
    [today],
  );

  const {
    weeklyMenu,
    selectedMeals,
    loading,
    errorMessage,
  } = useWeeklyMenu(house?.code ?? "", weekStart);

  const { itemCount } = useShoppingList(selectedMeals);

  if (!house) {
    return null;
  }

  const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const day = DAYS[dayIndex];
  const mealId = weeklyMenu[day];
  const meal = mealId
    ? meals.find((item) => item.id === mealId)
    : undefined;

  const dateLabel = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      <div className="pb-24">
        <HomeHeader
          houseName={house.name}
          shoppingCount={itemCount}
          onOpenShopping={() => navigate("/shopping")}
        />

        <main>
          <section className="px-4 pb-3 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
              {dateLabel}
            </p>
            <h1 className="mt-1 font-serif text-[30px] font-semibold text-white">
              Tu día, de un vistazo
            </h1>
          </section>

          <FastingSummary />
          <FastingWeekProgress />

          <section className="px-4 pb-3">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Menú familiar
                </p>
                <h2 className="font-serif text-[21px] font-semibold text-white">
                  Comida principal de hoy
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="text-xs font-bold text-[#FFD9CB]"
              >
                Ver semana
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : loading ? (
              <div className="rounded-[15px] bg-white px-4 py-5 text-sm text-[#7F857C]">
                Cargando el menú de hoy...
              </div>
            ) : (
              <MealRow
                dayShort={shortDays[today.getDay()]}
                dayNumber={String(today.getDate())}
                meal={meal}
                accentColor="#E97857"
                onClick={() => navigate("/menu")}
              />
            )}
          </section>

          <ShoppingSummary
            itemCount={itemCount}
            onClick={() => navigate("/shopping")}
          />
        </main>
      </div>
    </AppShell>
  );
}
