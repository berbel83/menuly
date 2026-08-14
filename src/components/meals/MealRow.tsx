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
  accentColor = "#FF6B2C",
  onClick,
}: MealRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 overflow-hidden rounded-[16px] bg-white px-3 py-2.5 text-left shadow-[0_4px_14px_rgba(50,45,38,0.06)]"
    >
      <div
        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white"
        style={{
          backgroundColor: accentColor,
        }}
      >
        <span className="font-serif text-[18px] font-bold leading-none">
          {dayNumber}
        </span>

        <span className="mt-0.5 text-[8px] font-bold uppercase">
          {dayShort}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        {meal ? (
          <>
            <p className="truncate font-serif text-[16px] font-semibold text-[#273127]">
              {meal.name}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-[#807970]">
              {meal.cookingTime} min
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-[15px] font-semibold text-[#6F6A63]">
              Elegir comida
            </p>

            <p className="text-[10px] text-[#A09A92]">
              Sin planificar
            </p>
          </>
        )}
      </div>

      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[20px] font-light"
        style={{
          backgroundColor: `${accentColor}22`,
          color: accentColor,
        }}
      >
        ›
      </span>
    </button>
  );
}