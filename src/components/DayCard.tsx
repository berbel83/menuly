import type { Meal } from "../types/meal";
import { getCategoryStyle } from "../utils/categoryStyles";

interface DayCardProps {
  day: string;
  meal?: Meal;
  onChoose: () => void;
  onViewRecipe: () => void;
  onRemove: () => void;
}

export default function DayCard({
  day,
  meal,
  onChoose,
  onViewRecipe,
  onRemove,
}: DayCardProps) {
  const categoryStyle = meal
    ? getCategoryStyle(meal.category)
    : {
        icon: "＋",
        background: "#f5f5f4",
        color: "#78716c",
      };

  if (!meal) {
    return (
      <button
        type="button"
        onClick={onChoose}
        className="group flex w-full items-center gap-4 rounded-3xl border-2 border-dashed border-stone-300 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-stone-100 text-2xl font-light text-stone-500 transition group-hover:bg-orange-100 group-hover:text-orange-600">
          ＋
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">
            {day}
          </p>

          <h3 className="mt-1 text-lg font-black text-stone-800">
            Elegir comida
          </h3>

          <p className="mt-1 text-sm text-stone-500">
            Pulsa para añadir un plato
          </p>
        </div>

        <span className="text-2xl text-stone-300 transition group-hover:translate-x-1 group-hover:text-orange-400">
          ›
        </span>
      </button>
    );
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <button
        type="button"
        onClick={onViewRecipe}
        className="w-full text-left"
      >
        <div className="relative flex min-h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-orange-200/35" />
          <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-rose-200/30" />

          <div
            className="relative grid h-24 w-24 place-items-center rounded-[2rem] text-5xl shadow-lg"
            style={{
              backgroundColor: categoryStyle.background,
              color: categoryStyle.color,
            }}
          >
            {categoryStyle.icon}
          </div>

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-stone-600 shadow-sm backdrop-blur">
            {day}
          </div>

          {meal.favorite && (
            <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-sm">
              ❤️
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-black uppercase tracking-[0.15em]"
                style={{ color: categoryStyle.color }}
              >
                {meal.category}
              </p>

              <h3 className="mt-1 text-xl font-black leading-tight text-stone-900">
                {meal.name}
              </h3>
            </div>

            <span className="text-2xl text-stone-300">›</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
              ⏱️ {meal.cookingTime} min
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {meal.difficulty}
            </span>

            {meal.airFryer && (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                Air Fryer
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 border-t border-stone-100">
        <button
          type="button"
          onClick={onChoose}
          className="border-r border-stone-100 px-4 py-3.5 text-sm font-black text-orange-600 transition hover:bg-orange-50"
        >
          Cambiar
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-3.5 text-sm font-black text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          Quitar
        </button>
      </div>
    </article>
  );
}