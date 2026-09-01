import { supabase } from "../lib/supabase";
import { getAuthenticatedUserId } from "./authService";
import type { ShoppingItem } from "../utils/shoppingList";

export interface SharedShoppingItem extends ShoppingItem {
  key: string;
  checked: boolean;
  manuallyAdded: boolean;
}

export function shoppingItemKey(name: string, quantity: string) {
  return `${name.trim().toLocaleLowerCase("es-ES")}::${quantity.trim().toLocaleLowerCase("es-ES")}`;
}

export async function syncShoppingItems(
  householdId: string,
  weekStart: string,
  generated: ShoppingItem[],
): Promise<SharedShoppingItem[]> {
  const userId = await getAuthenticatedUserId();
  const { data: existing, error: existingError } = await supabase.from("shopping_items")
    .select("item_key,manually_added").eq("household_id", householdId).eq("week_start", weekStart);
  if (existingError) throw new Error(`No se pudo sincronizar la compra: ${existingError.message}`);
  const generatedKeys = new Set(generated.map((item) => shoppingItemKey(item.name, item.quantity)));
  const staleKeys = (existing ?? []).filter((item) => !item.manually_added && !generatedKeys.has(item.item_key)).map((item) => item.item_key);
  if (staleKeys.length) {
    const { error: deleteError } = await supabase.from("shopping_items").delete()
      .eq("household_id", householdId).eq("week_start", weekStart).in("item_key", staleKeys);
    if (deleteError) throw new Error(`No se pudo actualizar la compra: ${deleteError.message}`);
  }
  const rows = generated.map((item) => ({
    household_id: householdId,
    week_start: weekStart,
    item_key: shoppingItemKey(item.name, item.quantity),
    name: item.name,
    quantity: item.quantity,
    manually_added: false,
    updated_by: userId,
  }));
  if (rows.length) {
    const { error } = await supabase.from("shopping_items").upsert(rows, {
      onConflict: "household_id,week_start,item_key",
      ignoreDuplicates: true,
    });
    if (error) throw new Error(`No se pudo sincronizar la compra: ${error.message}`);
  }
  const { data, error } = await supabase.from("shopping_items")
    .select("item_key,name,quantity,checked,manually_added")
    .eq("household_id", householdId).eq("week_start", weekStart)
    .order("name");
  if (error) throw new Error(`No se pudo cargar la compra: ${error.message}`);
  return (data ?? []).map((row) => ({
    key: row.item_key, name: row.name, quantity: row.quantity,
    checked: row.checked, manuallyAdded: row.manually_added,
  }));
}

export async function setShoppingItemChecked(
  householdId: string, weekStart: string, key: string, checked: boolean,
) {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from("shopping_items")
    .update({ checked, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("household_id", householdId).eq("week_start", weekStart).eq("item_key", key);
  if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`);
}

export async function addManualShoppingItem(householdId: string, weekStart: string, name: string) {
  const userId = await getAuthenticatedUserId();
  const key = shoppingItemKey(name, "");
  const { error } = await supabase.from("shopping_items").upsert({
    household_id: householdId, week_start: weekStart, item_key: key,
    name: name.trim(), quantity: "", manually_added: true, updated_by: userId,
  });
  if (error) throw new Error(`No se pudo añadir el producto: ${error.message}`);
}

export async function removeManualShoppingItem(householdId: string, weekStart: string, key: string) {
  const { error } = await supabase.from("shopping_items").delete()
    .eq("household_id", householdId).eq("week_start", weekStart)
    .eq("item_key", key).eq("manually_added", true);
  if (error) throw new Error(`No se pudo eliminar el producto: ${error.message}`);
}
