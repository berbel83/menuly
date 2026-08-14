import type { Meal } from "../../types/meal";

interface MealRowProps {
  dayShort: string;
  dayNumber: string;
  meal?: Meal;
  accentColor?: string;
  onClick: () => void;
}

export default function MealRow({
  dayShort,
  dayNumber,
  meal,
  accentColor = "#3F6248",
  onClick,
}: MealRowProps) {
  const isCoral = accentColor.toUpperCase() === "#EF704B";
  const softBackground = isCoral ? "#FBE7DF" : "#EEF4EC";
  const softText = isCoral ? "#B95B3F" : "#3F6248";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 overflow-hidden rounded-[15px] bg-white px-3 py-2.5 text-left shadow-[0_4px_14px_rgba(42,60,44,0.05)] ring-1 ring-[#E0E6DD] transition active:scale-[0.995]"
    >
      <div
        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: accentColor }}
      >
        <span className="font-serif text-[18px] font-bold leading-none">{dayNumber}</span>
        <span className="mt-0.5 text-[8px] font-bold uppercase">{dayShort}</span>
      </div>

      <div className="min-w-0 flex-1">
        {meal ? (
          <>
            <p className="truncate font-serif text-[16px] font-semibold text-[#273127]">{meal.name}</p>
            <p className="mt-0.5 text-[10px] font-medium text-[#7F857C]">{meal.cookingTime} min</p>
          </>
        ) : (
          <>
            <p className="font-serif text-[15px] font-semibold text-[#666C64]">Elegir comida</p>
            <p className="text-[10px] text-[#9DA39A]">Sin planificar</p>
          </>
        )}
      </div>

      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[20px] font-light"
        style={{ backgroundColor: softBackground, color: softText }}
      >
        ›
      </span>
    </button>
  );
}
