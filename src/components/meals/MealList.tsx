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
  "#D96536", // terracota
  "#2F6F73", // azul petróleo
  "#C79A35", // mostaza
  "#8B4A45", // burdeos
  "#6E7A4A", // oliva
  "#D96536", // terracota
  "#9A8C7D", // piedra
];

export default function MealList({
  mealsByDay,
  onSelectDay,
}: MealListProps) {
  return (
    <section className="px-6">
      <div className="border-t border-[#E4DCD1]">
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