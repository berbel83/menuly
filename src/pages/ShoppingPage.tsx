import { useMemo, useState } from "react";

import AppShell from "../components/layout/AppShell";
import { useHouse } from "../context/useHouse";
import { useShoppingList } from "../hooks/useShoppingList";
import { useWeeklyMenu } from "../hooks/useWeeklyMenu";
import { formatWeekStart } from "../services/weeklyMenuService";

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

export default function ShoppingPage() {
  const { house } = useHouse();
  const weekStart = useMemo(
    () => formatWeekStart(getMonday(new Date())),
    [],
  );

  const {
    selectedMeals,
    loading,
    errorMessage,
  } = useWeeklyMenu(house?.code ?? "", weekStart);

  const { shoppingList, itemCount } = useShoppingList(selectedMeals);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  if (!house) {
    return null;
  }

  function itemKey(name: string, quantity: string) {
    return `${name}-${quantity}`;
  }

  function toggleItem(name: string, quantity: string) {
    const key = itemKey(name, quantity);

    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FBF8F3] pb-24">
        <header className="bg-[#3F6248] px-5 pb-5 pt-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
            Hogar · {house.name}
          </p>
          <h1 className="mt-1 font-serif text-[30px] font-semibold">
            Lista de la compra
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Generada con el menú de esta semana
          </p>
        </header>

        <main className="px-5 py-5">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-[#81766D]">
              Preparando la lista...
            </p>
          ) : itemCount === 0 ? (
            <section className="rounded-[24px] border border-[#E3D9CE] bg-white px-6 py-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EDF3EB] text-2xl">
                ✓
              </div>
              <h2 className="mt-4 font-serif text-[22px] font-semibold">
                Todavía no hay productos
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#81766D]">
                Añade platos al menú semanal y reuniremos aquí sus ingredientes.
              </p>
            </section>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#3F6248]">
                  {checkedItems.size} de {itemCount} comprados
                </p>
                {checkedItems.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setCheckedItems(new Set())}
                    className="text-xs font-bold text-[#D96536]"
                  >
                    Desmarcar
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-[22px] border border-[#E3D9CE] bg-white">
                {shoppingList.map((item) => {
                  const key = itemKey(item.name, item.quantity);
                  const checked = checkedItems.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleItem(item.name, item.quantity)}
                      className="flex w-full items-center gap-3 border-b border-[#EEE7DF] px-4 py-3.5 text-left last:border-b-0"
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                          checked
                            ? "border-[#7A8B65] bg-[#7A8B65] text-white"
                            : "border-[#CFC5BA] text-transparent"
                        }`}
                      >
                        ✓
                      </span>

                      <span
                        className={`min-w-0 flex-1 truncate text-sm font-medium ${
                          checked
                            ? "text-[#AAA197] line-through"
                            : "text-[#3A3732]"
                        }`}
                      >
                        {item.name}
                      </span>

                      <span
                        className={`shrink-0 text-sm ${
                          checked
                            ? "text-[#B8B0A7] line-through"
                            : "font-medium text-[#746B63]"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
}
