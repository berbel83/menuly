import { useEffect, useMemo, useState } from "react";

import AppShell from "../components/layout/AppShell";
import { useHouse } from "../context/useHouse";
import { useMealCatalog } from "../hooks/useMealCatalog";
import { useShoppingList } from "../hooks/useShoppingList";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";
import { formatWeekStart } from "../services/weeklyMenuService";
import { addManualShoppingItem, removeManualShoppingItem, setShoppingItemChecked, syncShoppingItems, type SharedShoppingItem } from "../services/shoppingService";
import { supabase } from "../lib/supabase";

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

export default function ShoppingPage() {
  const { house } = useHouse();
  const weekStart = useMemo(() => formatWeekStart(getMonday(new Date())), []);
  const { meals, loading: catalogLoading } = useMealCatalog(house?.id);
  const { selectedMeals, loading: menuLoading, errorMessage: menuError } = useWeeklyMenu(house?.code ?? "", weekStart, meals);
  const { shoppingList } = useShoppingList(selectedMeals);
  const [items, setItems] = useState<SharedShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [syncing, setSyncing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!house || catalogLoading || menuLoading) return;
    let active = true;
    void syncShoppingItems(house.id, weekStart, shoppingList)
      .then((result) => { if (active) setItems(result); })
      .catch((error) => { if (active) setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar la compra."); })
      .finally(() => { if (active) setSyncing(false); });
    return () => { active = false; };
  }, [house, weekStart, shoppingList, catalogLoading, menuLoading]);

  useEffect(() => {
    if (!house) return;
    const channel = supabase.channel(`shopping-${house.id}-${weekStart}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items", filter: `household_id=eq.${house.id}` }, () => {
        void syncShoppingItems(house.id, weekStart, shoppingList).then(setItems).catch(() => undefined);
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [house, weekStart, shoppingList]);

  if (!house) return null;
  const checkedCount = items.filter((item) => item.checked).length;

  async function toggle(item: SharedShoppingItem) {
    const next = !item.checked;
    setItems((current) => current.map((row) => row.key === item.key ? { ...row, checked: next } : row));
    try { await setShoppingItemChecked(house!.id, weekStart, item.key, next); }
    catch (error) {
      setItems((current) => current.map((row) => row.key === item.key ? item : row));
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
    }
  }

  async function addItem() {
    if (!newItem.trim()) return;
    try {
      await addManualShoppingItem(house!.id, weekStart, newItem);
      setNewItem("");
      setItems(await syncShoppingItems(house!.id, weekStart, shoppingList));
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudo añadir."); }
  }

  async function removeItem(item: SharedShoppingItem) {
    await removeManualShoppingItem(house!.id, weekStart, item.key);
    setItems((current) => current.filter((row) => row.key !== item.key));
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[var(--canvas)] pb-28">
        <header className="brand-hero px-5 pb-7 pt-6 text-white">
          <p className="eyebrow text-white/70">Hogar · {house.name}</p>
          <h1 className="mt-1 font-serif text-[32px] font-semibold">Lista de la compra</h1>
          <p className="mt-1 text-sm text-white/75">Compartida y actualizada con vuestro menú</p>
        </header>
        <main className="-mt-2 px-5 py-5">
          {(menuError || errorMessage) && <div className="alert-error mb-4">{menuError || errorMessage}</div>}
          <form onSubmit={(event) => { event.preventDefault(); void addItem(); }} className="surface-card mb-5 flex gap-2 p-2">
            <input value={newItem} onChange={(event) => setNewItem(event.target.value)} className="min-w-0 flex-1 rounded-2xl bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" placeholder="Añadir algo que también necesitéis" aria-label="Nuevo producto" />
            <button className="rounded-2xl bg-[var(--coral)] px-4 text-sm font-bold text-white" type="submit">Añadir</button>
          </form>
          {(syncing || catalogLoading || menuLoading) ? <p className="py-12 text-center text-sm text-[var(--muted)]">Preparando la lista…</p> : items.length === 0 ? (
            <section className="surface-card px-6 py-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--sage-soft)] text-2xl text-[var(--forest)]">✓</div>
              <h2 className="mt-4 font-serif text-[23px] font-semibold">Todavía no hay productos</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Añade platos al menú o escribe cualquier producto arriba.</p>
            </section>
          ) : <>
            <div className="mb-3 flex items-end justify-between"><div><p className="eyebrow text-[var(--forest)]">Esta semana</p><p className="mt-1 text-sm text-[var(--muted)]">{checkedCount} de {items.length} comprados</p></div><div className="h-2 w-28 overflow-hidden rounded-full bg-[var(--sage-soft)]"><div className="h-full rounded-full bg-[var(--sage)] transition-all" style={{ width: `${checkedCount / items.length * 100}%` }} /></div></div>
            <div className="surface-card overflow-hidden">
              {items.map((item) => <div key={item.key} className="flex items-center border-b border-[var(--line)] last:border-0">
                <button type="button" onClick={() => void toggle(item)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${item.checked ? "border-[var(--sage)] bg-[var(--sage)] text-white" : "border-[var(--line-strong)] text-transparent"}`}>✓</span>
                  <span className={`min-w-0 flex-1 text-sm font-semibold ${item.checked ? "text-[var(--muted)] line-through" : "text-[var(--ink)]"}`}>{item.name}</span>
                  {item.quantity && <span className={`shrink-0 text-sm ${item.checked ? "text-[var(--muted)] line-through" : "text-[var(--ink-soft)]"}`}>{item.quantity}</span>}
                </button>
                {item.manuallyAdded && <button onClick={() => void removeItem(item)} type="button" aria-label={`Eliminar ${item.name}`} className="mr-2 grid h-10 w-10 place-items-center rounded-full text-[var(--muted)]">×</button>}
              </div>)}
            </div>
          </>}
        </main>
      </div>
    </AppShell>
  );
}
