import { supabase } from "../lib/supabase";

export const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const MEAL_SLOTS = [
  "main",
  "secondary",
] as const;

export type Day = (typeof DAYS)[number];
export type MealSlot = (typeof MEAL_SLOTS)[number];
export type DayMenu = Record<Day, number | null>;
export type WeeklyMenu = Record<MealSlot, DayMenu>;

export interface WeeklyMenuRow {
  room_code: string;
  week_start: string;
  day: Day;
  meal_slot: MealSlot;
  meal_id: number | null;
  updated_at: string;
}

function emptyDayMenu(): DayMenu {
  return {
    Lunes: null,
    Martes: null,
    Miércoles: null,
    Jueves: null,
    Viernes: null,
    Sábado: null,
    Domingo: null,
  };
}

export function createEmptyWeeklyMenu(): WeeklyMenu {
  return {
    main: emptyDayMenu(),
    secondary: emptyDayMenu(),
  };
}

export function formatWeekStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function loadWeeklyMenu(
  houseCode: string,
  weekStart: string,
): Promise<WeeklyMenu> {
  const { data, error } = await supabase
    .from("weekly_menu")
    .select(
      "room_code, week_start, day, meal_slot, meal_id, updated_at",
    )
    .eq("room_code", houseCode)
    .eq("week_start", weekStart);

  if (error) {
    throw new Error(
      `No se pudo cargar el menú: ${error.message}`,
    );
  }

  const menu = createEmptyWeeklyMenu();

  for (const row of (data ?? []) as WeeklyMenuRow[]) {
    if (
      DAYS.includes(row.day) &&
      MEAL_SLOTS.includes(row.meal_slot)
    ) {
      menu[row.meal_slot][row.day] = row.meal_id;
    }
  }

  return menu;
}

export async function saveMealForDay(
  houseCode: string,
  weekStart: string,
  day: Day,
  mealId: number | null,
  mealSlot: MealSlot = "main",
): Promise<void> {
  const { error } = await supabase
    .from("weekly_menu")
    .upsert(
      {
        room_code: houseCode,
        week_start: weekStart,
        day,
        meal_slot: mealSlot,
        meal_id: mealId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "room_code,week_start,day,meal_slot",
      },
    );

  if (error) {
    throw new Error(
      `No se pudo guardar el menú: ${error.message}`,
    );
  }
}

export async function clearWeeklyMenu(
  houseCode: string,
  weekStart: string,
): Promise<void> {
  const rows = MEAL_SLOTS.flatMap((mealSlot) =>
    DAYS.map((day) => ({
      room_code: houseCode,
      week_start: weekStart,
      day,
      meal_slot: mealSlot,
      meal_id: null,
      updated_at: new Date().toISOString(),
    })),
  );

  const { error } = await supabase
    .from("weekly_menu")
    .upsert(rows, {
      onConflict: "room_code,week_start,day,meal_slot",
    });

  if (error) {
    throw new Error(
      `No se pudo vaciar el menú: ${error.message}`,
    );
  }
}
