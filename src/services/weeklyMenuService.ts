import { supabase } from "../lib/supabase";

export const ROOM_CODE = "familia-berbel";

export const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export type Day = (typeof DAYS)[number];

export type WeeklyMenu = Record<Day, number | null>;

export interface WeeklyMenuRow {
  room_code: string;
  day: Day;
  meal_id: number | null;
  updated_at: string;
}

export const emptyWeeklyMenu: WeeklyMenu = {
  Lunes: null,
  Martes: null,
  Miércoles: null,
  Jueves: null,
  Viernes: null,
  Sábado: null,
  Domingo: null,
};

export async function loadWeeklyMenu(): Promise<WeeklyMenu> {
  const { data, error } = await supabase
    .from("weekly_menu")
    .select("room_code, day, meal_id, updated_at")
    .eq("room_code", ROOM_CODE);

  if (error) {
    throw new Error(`No se pudo cargar el menú: ${error.message}`);
  }

  const menu: WeeklyMenu = { ...emptyWeeklyMenu };

  for (const row of (data ?? []) as WeeklyMenuRow[]) {
    if (DAYS.includes(row.day)) {
      menu[row.day] = row.meal_id;
    }
  }

  return menu;
}

export async function saveMealForDay(
  day: Day,
  mealId: number | null
): Promise<void> {
  const { error } = await supabase.from("weekly_menu").upsert(
    {
      room_code: ROOM_CODE,
      day,
      meal_id: mealId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "room_code,day",
    }
  );

  if (error) {
    throw new Error(`No se pudo guardar el menú: ${error.message}`);
  }
}

export async function clearWeeklyMenu(): Promise<void> {
  const rows = DAYS.map((day) => ({
    room_code: ROOM_CODE,
    day,
    meal_id: null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("weekly_menu").upsert(rows, {
    onConflict: "room_code,day",
  });

  if (error) {
    throw new Error(`No se pudo vaciar el menú: ${error.message}`);
  }
}