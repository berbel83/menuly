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
  "#E86632",
  "#536B4A",
  "#D5A93C",
  "#A55749",
  "#6E7A4A",
  "#D9784A",
  "#7B7067",
];

export default function MealList({
  mealsByDay,
  onSelectDay,
}: MealListProps) {
  return (
    <section className="px-5 pb-5">
      <div className="mb-3 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E86632]">
            Comidas
          </p>

          <h3 className="mt-1 font-serif text-[23px] font-semibold tracking-[-0.03em] text-[#2C332B]">
            Tu semana
          </h3>
        </div>

        <span className="rounded-full bg-[#F6E5DC] px-3 py-1.5 text-[10px] font-bold text-[#B85A35]">
          7 días
        </span>
      </div>

      <div className="space-y-3">
        {mealsByDay.map((item, index) => (
          <MealRow
            key={`${item.dayShort}-${item.dayNumber}`}
            dayShort={item.dayShort}
            dayNumber={item.dayNumber}
            meal={item.meal}
            accentColor={accents[index % accents.length]}
            onClick={() => onSelectDay(index)}
          />
        ))}
      </div>
    </section>
  );
}