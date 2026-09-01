import { supabase } from "../lib/supabase";
import type { House } from "../types/house";
import { ensureAuthenticatedSession } from "./authService";

interface HouseholdRpcRow {
  id: string;
  code: string;
  name: string;
}

function getRpcRow(data: unknown): HouseholdRpcRow | null {
  const row = Array.isArray(data) ? data[0] : data;

  if (
    !row ||
    typeof row !== "object" ||
    !("id" in row) ||
    !("code" in row) ||
    !("name" in row)
  ) {
    return null;
  }

  return row as HouseholdRpcRow;
}

function toHouse(row: HouseholdRpcRow): House {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
  };
}

export async function createHouse(name: string): Promise<House> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("El hogar necesita un nombre.");
  }

  await ensureAuthenticatedSession();

  const { data, error } = await supabase.rpc("create_household", {
    p_name: cleanName,
  });

  if (error) {
    throw new Error(`No se pudo crear el hogar: ${error.message}`);
  }

  const row = getRpcRow(data);

  if (!row) {
    throw new Error("No se recibió el hogar creado.");
  }

  return toHouse(row);
}

export async function findHouseByCode(
  inputCode: string
): Promise<House | null> {
  const code = inputCode.trim().toUpperCase();

  if (!code) {
    return null;
  }

  await ensureAuthenticatedSession();

  const { data, error } = await supabase.rpc("join_household", {
    p_code: code,
  });

  if (error) {
    if (error.message.includes("No encontramos ningún hogar")) {
      return null;
    }

    throw new Error(`No se pudo buscar el hogar: ${error.message}`);
  }

  const row = getRpcRow(data);
  return row ? toHouse(row) : null;
}

export async function loadCurrentUserHouse(): Promise<House | null> {
  await ensureAuthenticatedSession();

  const { data: preference } = await supabase
    .from("user_preferences")
    .select("active_household_id")
    .maybeSingle();

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id, created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `No se pudo recuperar tu hogar: ${membershipError.message}`
    );
  }

  const householdId = preference?.active_household_id ?? membership?.household_id;
  if (!householdId) {
    return null;
  }

  const { data: house, error: houseError } = await supabase
    .from("households")
    .select("id, code, name")
    .eq("id", householdId)
    .maybeSingle();

  if (houseError) {
    throw new Error(
      `No se pudo abrir tu hogar: ${houseError.message}`
    );
  }

  return house ? toHouse(house as HouseholdRpcRow) : null;
}

export async function listUserHouses(): Promise<House[]> {
  await ensureAuthenticatedSession();
  const { data: memberships, error } = await supabase.from("household_members")
    .select("household_id").order("created_at", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar tus hogares: ${error.message}`);
  const ids = (memberships ?? []).map((row) => row.household_id);
  if (!ids.length) return [];
  const { data, error: houseError } = await supabase.from("households")
    .select("id,code,name").in("id", ids);
  if (houseError) throw new Error(`No se pudieron cargar tus hogares: ${houseError.message}`);
  return (data ?? []).map((row) => toHouse(row as HouseholdRpcRow));
}

export async function saveActiveHouse(householdId: string) {
  const userId = await ensureAuthenticatedSession();
  const { error } = await supabase.from("user_preferences").upsert({
    user_id: userId, active_household_id: householdId,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid",
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`No se pudo cambiar de hogar: ${error.message}`);
}

export async function leaveHouse(householdId: string) {
  const { error } = await supabase.rpc("leave_household", { p_household_id: householdId });
  if (error) throw new Error(`No se pudo abandonar el hogar: ${error.message}`);
}

export async function rotateHouseCode(householdId: string) {
  const { data, error } = await supabase.rpc("rotate_household_code", { p_household_id: householdId });
  if (error) throw new Error(`No se pudo renovar el código: ${error.message}`);
  return String(data);
}
