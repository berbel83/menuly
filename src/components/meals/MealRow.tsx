import type { Meal } from "../../types/meal";

interface MealRowProps {
  dayShort: string;
  dayNumber: string;
  meal?: Meal;
  secondaryMeal?: Meal;
  accentColor?: string;
  onClick: () => void;
  onSecondaryClick?: () => void;
}

export default function MealRow({
  dayShort,
  dayNumber,
  meal,
  secondaryMeal,
  accentColor = "#3F6248",
  onClick,
  onSecondaryClick,
}: MealRowProps) {
  const isCoral = accentColor.toUpperCase() === "#E97857";
  const softBackground = isCoral ? "#FCEAE4" : "#EDF3EB";
  const softText = isCoral ? "#B85E45" : "#3F6248";

  return (
    <div className="overflow-hidden rounded-[15px] bg-white shadow-[0_4px_14px_rgba(42,60,44,0.05)] ring-1 ring-[#DFE6DD]">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition active:scale-[0.995]"
      >
        <div
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: accentColor }}
        >
          <span className="font-serif text-[18px] font-bold leading-none">
            {dayNumber}
          </span>
          <span className="mt-0.5 text-[8px] font-bold uppercase">
            {dayShort}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#A0968C]">
            Comida principal
          </p>

          {meal ? (
            <>
              <p className="font-serif text-[16px] font-semibold leading-snug text-[#273127]">
                {meal.name}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-[#7F857C]">
                {meal.cookingTime} min
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-[15px] font-semibold text-[#666C64]">
                Elegir comida
              </p>
              <p className="text-[10px] text-[#9DA39A]">
                Sin planificar
              </p>
            </>
          )}
        </div>

        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[20px] font-light"
          style={{
            backgroundColor: softBackground,
            color: softText,
          }}
        >
          ›
        </span>
      </button>

      {onSecondaryClick && (
        <button
          type="button"
          onClick={onSecondaryClick}
          className="flex w-full items-center gap-2 border-t border-[#E9EEE7] bg-[#FAFCF9] px-3 py-2.5 text-left"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EDF3EB] text-sm font-bold text-[#3F6248]">
            {secondaryMeal ? "·" : "+"}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A9388]">
              Otra comida
            </span>
            <span className="block text-xs font-semibold leading-snug text-[#4F594F]">
              {secondaryMeal
                ? secondaryMeal.name
                : "Añadir solo si la necesitas"}
            </span>
          </span>

          <span className="text-lg text-[#AAB2A8]">›</span>
        </button>
      )}
    </div>
  );
}
