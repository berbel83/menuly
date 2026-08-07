import { useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import { useHouse } from "../context/HouseContext";
import { meals } from "../data/meals";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";

import {
  DAYS,
  type Day,
} from "../services/weeklyMenuService";

function isValidDay(value: string | null): value is Day {
  return value !== null && DAYS.includes(value as Day);
}

export default function RecipeSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { house } = useHouse();

  const dayParam = searchParams.get("day");
  const weekStart = searchParams.get("week");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  if (!house || !isValidDay(dayParam) || !weekStart) {
    return <Navigate to="/" replace />;
  }

  const selectedDay: Day = dayParam;

  const {
    selectMeal,
    saving,
  } = useWeeklyMenu(
    house.code,
    weekStart
  );

  const categories = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(meals.map((meal) => meal.category))
      ),
    ];
  }, []);

  const filteredMeals = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return meals.filter((meal) => {
      const matchesSearch =
        normalizedQuery === "" ||
        meal.name
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        category === "Todas" ||
        meal.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [query, category]);

  async function chooseMeal(mealId: number) {
    await selectMeal(selectedDay, mealId);

    navigate(`/?week=${weekStart}`);
  }

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col sm:min-h-[760px]">
        <header className="shrink-0 border-b border-[#E7DFD6] bg-[#FBF8F3] px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/?week=${weekStart}`)
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E2D9CF] bg-[#FFFDFC] text-[25px] font-light text-[#5E574F]"
              aria-label="Volver"
            >
              ‹
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D96536]">
                {selectedDay}
              </p>

              <h1 className="font-serif text-[25px] font-semibold tracking-[-0.03em] text-[#25251F]">
                Elegir comida
              </h1>
            </div>
          </div>

          <div className="relative mt-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93887D]"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Buscar una receta..."
              autoFocus
              className="w-full rounded-2xl border border-[#E1D8CE] bg-[#FFFDFC] py-3.5 pl-11 pr-4 text-sm text-[#2D2A26] outline-none transition placeholder:text-[#AAA197] focus:border-[#D96536] focus:ring-4 focus:ring-[#D96536]/10"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-[#D96536] text-white"
                      : "border border-[#E2D9CF] bg-[#FFFDFC] text-[#71685F]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          <div className="flex items-center justify-between py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#998D82]">
              Recetas
            </p>

            <p className="text-xs text-[#9C9289]">
              {filteredMeals.length} resultados
            </p>
          </div>

          {filteredMeals.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl font-semibold text-[#39362F]">
                No encontramos nada
              </p>

              <p className="mt-2 text-sm text-[#938A82]">
                Prueba con otro nombre o categoría.
              </p>
            </div>
          ) : (
            <div className="border-t border-[#E7DFD6]">
              {filteredMeals.map((meal) => (
                <button
                  key={meal.id}
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    chooseMeal(meal.id)
                  }
                  className="group flex w-full items-center gap-3 border-b border-[#E7DFD6] py-3 text-left transition hover:bg-[#F8F3ED] disabled:opacity-60"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F1E8DE]">
                    <div className="h-3 w-3 rounded-full bg-[#D96536]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[16px] font-semibold text-[#272720]">
                      {meal.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8B8178]">
                      <span>{meal.cookingTime} min</span>
                      <span>·</span>
                      <span>{meal.category}</span>

                      {meal.airFryer && (
                        <>
                          <span>·</span>
                          <span>Air Fryer</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[25px] font-light text-[#B4AAA0] transition group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}