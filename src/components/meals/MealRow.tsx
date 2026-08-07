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
  accentColor = "#D96536",
  onClick,
}: MealRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        border-b
        border-[#E7DFD6]
        px-0
        py-2.5
        text-left
        transition
        hover:bg-[#F8F3ED]
      "
    >
      <div className="flex w-[54px] shrink-0 items-center gap-2">
        <div
          className="h-9 w-[3px] rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        <div>
          <p
            className="font-serif text-[21px] font-semibold leading-none"
            style={{ color: accentColor }}
          >
            {dayNumber}
          </p>

          <p
            className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: accentColor }}
          >
            {dayShort}
          </p>
        </div>
      </div>

      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2ECE4]"
        style={{
          boxShadow: `inset 0 0 0 1px ${accentColor}22`,
        }}
      >
        <div
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="min-w-0 flex-1">
        {meal ? (
          <>
            <p className="truncate font-serif text-[16px] font-semibold leading-tight text-[#272720]">
              {meal.name}
            </p>

            <p className="mt-0.5 text-[11px] text-[#8A8076]">
              {meal.cookingTime} min
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-[15px] font-semibold text-[#91877D]">
              Elegir comida
            </p>

            <p className="mt-0.5 text-[11px] text-[#ACA399]">
              Sin planificar
            </p>
          </>
        )}
      </div>

      <span className="shrink-0 pr-1 text-[24px] font-light leading-none text-[#B4AAA0] transition group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  );
}