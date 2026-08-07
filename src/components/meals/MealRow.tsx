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
        gap-4
        border-b
        border-[#E5DDD3]
        px-0
        py-3.5
        text-left
        transition
        hover:bg-[#F8F3ED]
      "
    >
      <div className="flex w-16 shrink-0 items-center gap-3">
        <div
          className="h-12 w-[3px] rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        <div>
          <p
            className="font-serif text-[24px] font-semibold leading-none"
            style={{ color: accentColor }}
          >
            {dayNumber}
          </p>

          <p
            className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: accentColor }}
          >
            {dayShort}
          </p>
        </div>
      </div>

      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-[#EFE8DF]">
        {meal?.image ? (
          <img
            src={meal.image}
            alt={meal.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <div
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {meal ? (
          <>
            <p className="truncate font-serif text-[19px] font-semibold leading-tight text-[#25251F]">
              {meal.name}
            </p>

            <p className="mt-1 text-[13px] text-[#847A71]">
              {meal.cookingTime} min
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-[18px] font-semibold text-[#8F877F]">
              Elegir comida
            </p>

            <p className="mt-1 text-[12px] text-[#AAA197]">
              Añade un plato a este día
            </p>
          </>
        )}
      </div>

      <span className="pr-1 text-[30px] font-light leading-none text-[#A99E92] transition group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  );
}