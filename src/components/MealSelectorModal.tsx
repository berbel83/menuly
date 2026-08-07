import { useMemo, useState } from "react";
import type { Meal } from "../types/meal";
import { getCategoryStyle } from "../utils/categoryStyles";

interface MealSelectorModalProps {
  day: string;
  meals: Meal[];
  onSelect: (mealId: number) => void;
  onClose: () => void;
}

export default function MealSelectorModal({
  day,
  meals,
  onSelect,
  onClose,
}: MealSelectorModalProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Todas");

  const categories = useMemo(
    () => [
      "Todas",
      ...Array.from(new Set(meals.map((meal) => meal.category))),
    ],
    [meals]
  );

  const filteredMeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return meals.filter((meal) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        meal.name.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "Todas" ||
        meal.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [meals, query, selectedCategory]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-stone-950/55 p-3 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-stone-50 shadow-2xl sm:max-h-[90dvh] sm:rounded-[2rem]">
        <header className="shrink-0 border-b border-stone-200 bg-white px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                {day}
              </p>

              <h2 className="mt-1 text-2xl font-black text-stone-900">
                Elegir comida
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Busca o filtra entre vuestros platos.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-600 transition hover:bg-stone-200"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="relative mt-5">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
              🔍
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar una comida..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const isActive = category === selectedCategory;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    isActive
                      ? "shrink-0 whitespace-nowrap rounded-full bg-stone-900 px-4 py-2 text-xs font-black text-white"
                      : "shrink-0 whitespace-nowrap rounded-full bg-stone-100 px-4 py-2 text-xs font-black text-stone-600 transition hover:bg-stone-200"
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-10 sm:p-5 sm:pb-6">
          {filteredMeals.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white px-6 py-12 text-center">
              <div className="text-4xl">🔎</div>

              <h3 className="mt-3 text-lg font-black text-stone-800">
                No hay resultados
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Prueba con otro nombre o categoría.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredMeals.map((meal) => {
                const categoryStyle = getCategoryStyle(
                  meal.category
                );

                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => onSelect(meal.id)}
                    className="group overflow-hidden rounded-3xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                  >
                    <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 to-orange-50">
                      <div
                        className="grid h-20 w-20 place-items-center rounded-[1.7rem] text-4xl shadow-md transition group-hover:scale-105"
                        style={{
                          backgroundColor:
                            categoryStyle.background,
                          color: categoryStyle.color,
                        }}
                      >
                        {categoryStyle.icon}
                      </div>

                      {meal.favorite && (
                        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow">
                          ❤️
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p
                        className="text-[11px] font-black uppercase tracking-[0.14em]"
                        style={{
                          color: categoryStyle.color,
                        }}
                      >
                        {meal.category}
                      </p>

                      <h3 className="mt-1 text-base font-black leading-tight text-stone-900">
                        {meal.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">
                          ⏱️ {meal.cookingTime} min
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          {meal.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}