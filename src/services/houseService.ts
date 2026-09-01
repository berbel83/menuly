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

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `No se pudo recuperar tu hogar: ${membershipError.message}`
    );
  }

  if (!membership?.household_id) {
    return null;
  }

  const { data: house, error: houseError } = await supabase
    .from("households")
    .select("id, code, name")
    .eq("id", membership.household_id)
    .maybeSingle();

  if (houseError) {
    throw new Error(
      `No se pudo abrir tu hogar: ${houseError.message}`
    );
  }

  return house ? toHouse(house as HouseholdRpcRow) : null;
}
