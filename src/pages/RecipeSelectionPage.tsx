import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import MealEditorModal from "../components/meals/MealEditorModal";
import { useHouse } from "../context/useHouse";
import { useMealCatalog } from "../hooks/useMealCatalog";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";
import { loadRecentMealIds } from "../services/mealCatalogService";
import type { Meal } from "../types/meal";

import {
  DAYS,
  MEAL_SLOTS,
  type Day,
  type MealSlot,
} from "../services/weeklyMenuService";

function isValidDay(value: string | null): value is Day {
  return value !== null && DAYS.includes(value as Day);
}

function isValidMealSlot(value: string): value is MealSlot {
  return MEAL_SLOTS.includes(value as MealSlot);
}

export default function RecipeSelectionPage() {
  const [searchParams] = useSearchParams();
  const { house } = useHouse();

  const dayParam = searchParams.get("day");
  const weekStart = searchParams.get("week");
  const slotParam = searchParams.get("slot") ?? "main";

  if (
    !house ||
    !isValidDay(dayParam) ||
    !weekStart ||
    !isValidMealSlot(slotParam)
  ) {
    return <Navigate to="/menu" replace />;
  }

  return (
    <RecipeSelectionContent
      houseCode={house.code}
      householdId={house.id}
      selectedDay={dayParam}
      weekStart={weekStart}
      selectedSlot={slotParam}
    />
  );
}

interface RecipeSelectionContentProps {
  houseCode: string;
  householdId?: string;
  selectedDay: Day;
  weekStart: string;
  selectedSlot: MealSlot;
}

function RecipeSelectionContent({
  houseCode,
  householdId,
  selectedDay,
  weekStart,
  selectedSlot,
}: RecipeSelectionContentProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [collection, setCollection] = useState(
    selectedSlot === "main" ? "main_fasting" : "all",
  );
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [recentMealIds, setRecentMealIds] = useState<number[]>([]);
  const {
    meals,
    loading: catalogLoading,
    errorMessage: catalogError,
    toggleFavorite,
    hideMeal,
    addMeal,
    editMeal,
    removeCustomMeal,
  } = useMealCatalog(householdId);

  const {
    selectMeal,
    saving,
    weeklyMenu,
  } = useWeeklyMenu(
    houseCode,
    weekStart,
    meals,
  );

  useEffect(() => {
    if (!householdId) return;
    void loadRecentMealIds(householdId).then(setRecentMealIds);
  }, [householdId]);

  const categories = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(meals.map((meal) => meal.category))
      ),
    ];
  }, [meals]);

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

      const matchesCollection =
        collection === "all" || meal.collection === collection;
      const matchesFavorite = !onlyFavorites || meal.favorite;

      return matchesSearch && matchesCategory && matchesCollection && matchesFavorite;
    });
  }, [query, category, collection, onlyFavorites, meals]);

  async function chooseMeal(mealId: number) {
    await selectMeal(selectedDay, mealId, selectedSlot);

    navigate(`/menu?week=${weekStart}`);
  }

  async function surpriseMe() {
    if (filteredMeals.length === 0) return;

    const selectedThisWeek = new Set(
      Object.values(weeklyMenu).flatMap((slot) => Object.values(slot)).filter(Number.isInteger),
    );
    const recent = new Set(recentMealIds);
    const freshMeals = filteredMeals.filter(
      (meal) => !selectedThisWeek.has(meal.id) && !recent.has(meal.id),
    );
    const notThisWeek = filteredMeals.filter((meal) => !selectedThisWeek.has(meal.id));
    const candidates = freshMeals.length > 0
      ? freshMeals
      : notThisWeek.length > 0
        ? notThisWeek
        : filteredMeals;
    const suggestion = candidates[Math.floor(Math.random() * candidates.length)];
    await chooseMeal(suggestion.id);
  }

  async function confirmHide(meal: Meal) {
    if (window.confirm(`¿Ocultar “${meal.name}” de vuestro catálogo?`)) {
      await hideMeal(meal.id);
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col sm:min-h-[760px]">
        <header className="shrink-0 border-b border-[#E7DFD6] bg-[#FBF8F3] px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/menu?week=${weekStart}`)
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
                {selectedSlot === "main"
                  ? "Elegir comida principal"
                  : "Añadir otra comida"}
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

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCollection("main_fasting")}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                collection === "main_fasting"
                  ? "bg-[#3F6248] text-white"
                  : "border border-[#D9E1D7] bg-[#F4F7F2] text-[#4E6853]"
              }`}
            >
              Comida principal
            </button>

            <button
              type="button"
              onClick={() => setCollection("all")}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                collection === "all"
                  ? "bg-[#3F6248] text-white"
                  : "border border-[#D9E1D7] bg-[#F4F7F2] text-[#4E6853]"
              }`}
            >
              Ver todos
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavorites((current) => !current)}
            className={`mt-2 w-full rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
              onlyFavorites
                ? "bg-[#F9E8E3] text-[#B5533C]"
                : "border border-[#E5DDD3] bg-[#FFFDFC] text-[#71685F]"
            }`}
          >
            {onlyFavorites ? "♥ Solo favoritos" : "♡ Ver solo favoritos"}
          </button>

          <div
            className="
              mt-3
              flex
              gap-2
              overflow-x-auto
              pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
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
          {catalogError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {catalogError}
            </div>
          )}
          <div className="flex items-center justify-between py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#998D82]">
              Recetas
            </p>

            <p className="text-xs text-[#9C9289]">
              {filteredMeals.length} resultados
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="mb-3 w-full rounded-2xl border border-dashed border-[#D4C7BB] bg-[#FFFDFC] px-4 py-3 text-sm font-semibold text-[#6D635B]"
          >
            ＋ Añadir uno de nuestros platos
          </button>

          {!catalogLoading && filteredMeals.length > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={surpriseMe}
              className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#D8E0D5] bg-[#F4F7F2] px-4 py-3.5 text-left transition hover:bg-[#EDF3EB] disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-semibold text-[#344D39]">
                  Sorpréndeme
                </span>
                <span className="mt-0.5 block text-xs text-[#758078]">
                  Elegir una opción de estos resultados
                </span>
              </span>
              <span className="text-xl" aria-hidden="true">↻</span>
            </button>
          )}

          {catalogLoading ? (
            <div className="py-16 text-center text-sm text-[#938A82]">
              Preparando vuestro catálogo...
            </div>
          ) : filteredMeals.length === 0 ? (
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
                <div key={meal.id} className="flex items-center border-b border-[#E7DFD6]">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => chooseMeal(meal.id)}
                    className="group flex min-w-0 flex-1 items-center gap-3 py-3.5 pr-2 text-left transition hover:bg-[#F8F3ED] disabled:opacity-60"
                  >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[17px] font-semibold leading-tight text-[#272720]">
                      {meal.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8B8178]">
                      <span>
                        {meal.cookingTime} min
                      </span>

                      <span>·</span>

                      <span>
                        {meal.category}
                      </span>

                      {meal.airFryer && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-[#7A8B65]">
                            Air Fryer
                          </span>
                        </>
                      )}

                      {meal.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#F1ECE6] px-2 py-0.5 text-[10px] font-medium text-[#7B7067]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="shrink-0 text-[25px] font-light text-[#B4AAA0] transition group-hover:translate-x-0.5">
                    ›
                  </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 pl-1">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite(meal.id)}
                      className={`grid h-10 w-10 place-items-center rounded-full text-lg transition ${
                        meal.favorite ? "bg-[#F9E8E3] text-[#C85C43]" : "text-[#A79C92] hover:bg-[#F1ECE6]"
                      }`}
                      aria-label={meal.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      {meal.favorite ? "♥" : "♡"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (meal.isSystem === false || meal.householdId) {
                          setEditingMeal(meal);
                          setShowEditor(true);
                        } else {
                          void confirmHide(meal);
                        }
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full text-sm text-[#A79C92] transition hover:bg-[#F1ECE6]"
                      aria-label={meal.isSystem === false || meal.householdId ? "Editar plato" : "Ocultar plato"}
                    >
                      {meal.isSystem === false || meal.householdId ? "✎" : "◌"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {showEditor && (
          <MealEditorModal
            meal={editingMeal ?? undefined}
            onClose={() => {
              setShowEditor(false);
              setEditingMeal(null);
            }}
            onSave={(input) =>
              editingMeal ? editMeal(editingMeal.id, input) : addMeal(input)
            }
            onDelete={
              editingMeal
                ? () => removeCustomMeal(editingMeal.id)
                : undefined
            }
          />
        )}
      </div>
    </AppShell>
  );
}
