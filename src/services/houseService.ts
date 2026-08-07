import { supabase } from "../lib/supabase";
import type { House } from "../types/house";

function generateHouseCode(length = 6) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    );

    code += characters[randomIndex];
  }

  return code;
}

export async function createHouse(
  name: string
): Promise<House> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error(
      "El hogar necesita un nombre."
    );
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateHouseCode();

    const { data: existingHouse, error: checkError } =
      await supabase
        .from("households")
        .select("code")
        .eq("code", code)
        .maybeSingle();

    if (checkError) {
      throw new Error(
        `No se pudo comprobar el código: ${checkError.message}`
      );
    }

    if (existingHouse) {
      continue;
    }

    const { data, error } = await supabase
      .from("households")
      .insert({
        code,
        name: cleanName,
      })
      .select("code, name")
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear el hogar: ${error.message}`
      );
    }

    return {
      code: data.code,
      name: data.name,
    };
  }

  throw new Error(
    "No se pudo generar un código único. Inténtalo de nuevo."
  );
}

export async function findHouseByCode(
  inputCode: string
): Promise<House | null> {
  const code = inputCode
    .trim()
    .toUpperCase();

  if (!code) {
    return null;
  }

  const { data, error } = await supabase
    .from("households")
    .select("code, name")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo buscar el hogar: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return {
    code: data.code,
    name: data.name,
  };
}