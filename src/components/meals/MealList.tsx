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
  "#3F6248",
  "#EF704B",
  "#3F6248",
  "#EF704B",
  "#3F6248",
  "#EF704B",
  "#3F6248",
];

export default function MealList({
  mealsByDay,
  onSelectDay,
}: MealListProps) {
  return (
    <section className="px-4 pb-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-serif text-[21px] font-semibold text-[#243025]">Comidas</h3>
        <span className="rounded-full bg-[#EEF4EC] px-3 py-1 text-[9px] font-bold text-[#3F6248]">ESTA SEMANA</span>
      </div>

      <div className="space-y-2">
        {mealsByDay.map((item, index) => (
          <MealRow
            key={`${item.dayShort}-${item.dayNumber}`}
            dayShort={item.dayShort}
            dayNumber={item.dayNumber}
            meal={item.meal}
            accentColor={accents[index]}
            onClick={() => onSelectDay(index)}
          />
        ))}
      </div>
    </section>
  );
}
