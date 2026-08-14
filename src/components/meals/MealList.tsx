import type { Meal } from "../../types/meal";
import MealRow from "./MealRow";

interface MealListProps {
  mealsByDay: {
    dayShort: string;
    dayNumber: string;
    meal?: Meal;
  }[];
  onSelectDay: (index: number) => void;
}

const accents = [
  "#FF6B2C",
  "#4D7C3A",
  "#F3C84B",
  "#FF876B",
  "#4D7C3A",
  "#FF6B2C",
  "#DDA83A",
];

export default function MealList({
  mealsByDay,
  onSelectDay,
}: MealListProps) {
  return (
    <section className="px-4 pb-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-serif text-[21px] font-semibold text-[#243025]">
          Comidas
        </h3>

        <span className="rounded-full bg-[#DDECBF] px-3 py-1 text-[9px] font-bold text-[#42652F]">
          ESTA SEMANA
        </span>
      </div>

      <div className="space-y-2">
        {mealsByDay.map((item, index) => (
          <MealRow
            key={`${item.dayShort}-${item.dayNumber}`}
            dayShort={item.dayShort}
            dayNumber={item.dayNumber}
            meal={item.meal}
            accentColor={accents[index]}
            onClick={() =>
              onSelectDay(index)
            }
          />
        ))}
      </div>
    </section>
  );
}