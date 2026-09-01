import type { Meal } from "../types/meal";

interface MealDetailsProps {
  meal: Meal;
  onClose: () => void;
  onChange?: () => void;
  onRemove?: () => void;
}

export default function MealDetails({
  meal,
  onClose,
  onChange,
  onRemove,
}: MealDetailsProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:items-center">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-[#FBF8F3] shadow-2xl sm:max-h-[92dvh]">
        <header className="shrink-0 border-b border-[#E5DDD3] px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D96536]">
                {meal.category}
              </p>

              <h2 className="mt-1 font-serif text-[28px] font-semibold leading-tight text-[#25251F]">
                {meal.name}
              </h2>

              <div className="mt-3 flex gap-4 text-sm text-[#81766D]">
                <span>{meal.cookingTime} min</span>
                <span>·</span>
                <span>{meal.difficulty}</span>
              </div>

              {meal.description && (
                <p className="mt-3 max-w-md text-[15px] font-medium leading-7 text-[#49443E]">
                  {meal.description}
                </p>
              )}

              {meal.tags && meal.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {meal.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F1E9DF] px-2.5 py-1 text-[11px] font-semibold text-[#786A5E]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E2D9CF] bg-white text-[#5E5851]"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="font-serif text-[21px] font-semibold text-[#292923]">
              Ingredientes
            </h3>

            <p className="mt-1 text-sm font-medium text-[#6C645C]">
              Para 2 personas
            </p>

            <div className="mt-4 divide-y divide-[#ECE5DC]">
              {meal.ingredients.map(
                (ingredient, index) => (
                  <div
                    key={`${ingredient.name}-${index}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-[15px] font-semibold text-[#302D29]">
                      {ingredient.name}
                    </span>

                    <span className="text-right text-[15px] font-medium text-[#4F4943]">
                      {ingredient.quantity}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="mt-7">
            <h3 className="font-serif text-[21px] font-semibold text-[#292923]">
              Preparación
            </h3>

            <ol className="mt-4 grid gap-4">
              {meal.instructions.map(
                (instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F1E2D8] text-xs font-bold text-[#D96536]">
                      {index + 1}
                    </div>

                    <p className="pt-0.5 text-[15px] font-medium leading-7 text-[#37332E]">
                      {instruction}
                    </p>
                  </li>
                )
              )}
            </ol>
          </section>

          {meal.notes && (
            <div className="mt-7 rounded-2xl bg-[#F3ECE3] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7661]">
                Nota
              </p>

              <p className="mt-1 text-[15px] font-medium leading-7 text-[#403A34]">
                {meal.notes}
              </p>
            </div>
          )}
        </div>

        {(onChange || onRemove) && (
          <footer className="shrink-0 border-t border-[#E5DDD3] bg-[#FFFDFC] px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              {onChange && (
                <button
                  type="button"
                  onClick={onChange}
                  className="rounded-xl bg-[#D96536] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C7592D]"
                >
                  Cambiar plato
                </button>
              )}

              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-xl border border-[#D9CEC4] bg-white px-4 py-3 text-sm font-semibold text-[#8E4D3C] transition hover:bg-[#FCF1EC]"
                >
                  Quitar del día
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
