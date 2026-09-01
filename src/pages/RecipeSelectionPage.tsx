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
    if (window.confirm(`¿Quitar “${meal.name}” de vuestra lista de recetas? Podréis recuperarla más adelante desde los ajustes del catálogo.`)) {
      await hideMeal(meal.id);
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col sm:min-h-[760px]">
        <header className="brand-hero shrink-0 px-5 pb-5 pt-5 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/menu?week=${weekStart}`)
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-[25px] font-light text-white"
              aria-label="Volver"
            >
              ‹
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                {selectedDay}
              </p>

              <h1 className="font-serif text-[25px] font-semibold tracking-[-0.03em] text-white">
                {selectedSlot === "main"
                  ? "Elegir comida principal"
                  : "Añadir otra comida"}
              </h1>
            </div>
          </div>

          <div className="relative mt-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#697269]"
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
              className="w-full rounded-2xl border border-white/15 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[#8A928B] focus:border-[var(--coral)] focus:ring-4 focus:ring-white/15"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCollection("main_fasting")}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                collection === "main_fasting"
                  ? "bg-white text-[var(--forest)] shadow-sm"
                  : "border border-white/20 bg-white/10 text-white/85"
              }`}
            >
              Comida principal
            </button>

            <button
              type="button"
              onClick={() => setCollection("all")}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                collection === "all"
                  ? "bg-white text-[var(--forest)] shadow-sm"
                  : "border border-white/20 bg-white/10 text-white/85"
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
                ? "bg-[#F9E1D9] text-[#913E2B]"
                : "border border-white/20 bg-white/10 text-white/85"
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
                      ? "bg-[var(--coral)] text-white"
                      : "border border-white/20 bg-white/10 text-white/85"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--canvas)] px-5 pb-8">
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
            <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_16px_38px_rgba(28,52,39,.08)]">
              {filteredMeals.map((meal) => (
                <article key={meal.id} className="flex items-stretch border-b border-[var(--line)] last:border-b-0">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => chooseMeal(meal.id)}
                    className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left transition hover:bg-[var(--sage-soft)] disabled:opacity-60"
                  >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--sage-soft)] text-lg font-semibold text-[var(--forest)]" aria-hidden="true">
                    {meal.category === "Pescado" ? "≈" : meal.category === "Ligero" ? "❋" : meal.category === "Pasta" ? "∿" : "✦"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[18px] font-semibold leading-[1.25] text-[var(--ink)]">
                      {meal.name}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-[var(--muted)]">
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

                  <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-1 border-l border-[var(--line)] bg-[#F3F4EE]">
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
                      className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                        meal.isSystem === false || meal.householdId
                          ? "text-[#657168] hover:bg-white"
                          : "text-[#A45340] hover:bg-[#F9E1D9]"
                      }`}
                      aria-label={meal.isSystem === false || meal.householdId ? "Editar plato" : "Quitar receta de la lista"}
                    >
                      {meal.isSystem === false || meal.householdId ? (
                        <span className="text-base" aria-hidden="true">✎</span>
                      ) : (
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                          <path d="M10 11v5M14 11v5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </article>
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
