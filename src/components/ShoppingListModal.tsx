import { useMemo, useState } from "react";

interface ShoppingItem {
  name: string;
  quantity: string;
}

interface ShoppingListModalProps {
  items: ShoppingItem[];
  onClose: () => void;
}

function normalizeCategory(name: string) {
  const value = name
    .toLowerCase()
    .trim();

  // DESPENSA
  // Debe comprobarse antes que carne/pescado,
  // porque "caldo de pollo" contiene "pollo".
  if (
    value.includes("caldo") ||
    value.includes("arroz") ||
    value.includes("pasta") ||
    value.includes("espagueti") ||
    value.includes("macarr") ||
    value.includes("lasaña") ||
    value.includes("pan ") ||
    value === "pan" ||
    value.includes("pan de") ||
    value.includes("tortita") ||
    value.includes("harina") ||
    value.includes("pan rallado") ||
    value.includes("aceite") ||
    value.includes("tomate frito") ||
    value.includes("mayonesa") ||
    value.includes("curry") ||
    value.includes("base de pizza")
  ) {
    return "Despensa";
  }

  // CARNICERÍA
  if (
    value.includes("pechuga") ||
    value.includes("pollo") ||
    value.includes("pavo") ||
    value.includes("ternera") ||
    value.includes("carne picada") ||
    value.includes("filete")
  ) {
    return "Carnicería";
  }

  // PESCADERÍA
  if (
    value.includes("salmón") ||
    value.includes("atún") ||
    value.includes("merluza") ||
    value.includes("gamba") ||
    value.includes("boquer") ||
    value.includes("calamar")
  ) {
    return "Pescadería";
  }

  // FRUTA Y VERDURA
  if (
    value.includes("lechuga") ||
    value.includes("zanahoria") ||
    value.includes("calabac") ||
    value.includes("berenjen") ||
    value.includes("patata") ||
    value.includes("ajo") ||
    value.includes("limón") ||
    value.includes("plátano") ||
    value.includes("cebolla") ||
    value.includes("tomate") ||
    value.includes("pepino") ||
    value.includes("pimiento")
  ) {
    return "Fruta y verdura";
  }

  // LÁCTEOS
  if (
    value.includes("queso") ||
    value.includes("leche") ||
    value.includes("yogur")
  ) {
    return "Lácteos";
  }

  // HUEVOS
  if (
    value === "huevo" ||
    value === "huevos" ||
    value.includes("huevo")
  ) {
    return "Huevos";
  }

  return "Otros";
}

const categoryOrder = [
  "Carnicería",
  "Pescadería",
  "Fruta y verdura",
  "Lácteos",
  "Huevos",
  "Despensa",
  "Otros",
];

export default function ShoppingListModal({
  items,
  onClose,
}: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] =
    useState<Set<string>>(
      new Set()
    );

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      ShoppingItem[]
    >();

    for (const item of items) {
      const category =
        normalizeCategory(
          item.name
        );

      const current =
        groups.get(category) ?? [];

      current.push(item);

      groups.set(
        category,
        current
      );
    }

    return categoryOrder
      .map((category) => ({
        category,
        items:
          groups.get(category) ??
          [],
      }))
      .filter(
        (group) =>
          group.items.length > 0
      );
  }, [items]);

  const checkedCount =
    checkedItems.size;

  const totalCount =
    items.length;

  function getItemKey(
    item: ShoppingItem
  ) {
    return `${item.name}-${item.quantity}`;
  }

  function toggleItem(
    item: ShoppingItem
  ) {
    const key =
      getItemKey(item);

    setCheckedItems(
      (current) => {
        const next =
          new Set(current);

        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }

        return next;
      }
    );
  }

  function isChecked(
    item: ShoppingItem
  ) {
    return checkedItems.has(
      getItemKey(item)
    );
  }

  function clearChecked() {
    setCheckedItems(
      new Set()
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[30px] bg-[#FBF8F3] shadow-2xl sm:h-[86dvh] sm:rounded-[30px]">
        <header className="shrink-0 border-b border-[#E7DFD6] px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D96536]">
                Compra
              </p>

              <h2 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.03em] text-[#25251F]">
                Lista de la compra
              </h2>

              <p className="mt-1 text-sm text-[#81766D]">
                {checkedCount} de{" "}
                {totalCount} comprados
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E2D9CF] bg-[#FFFDFC] text-[#655E57]"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {totalCount > 0 && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E9E1D8]">
              <div
                className="h-full rounded-full bg-[#7A8B65] transition-all duration-300"
                style={{
                  width: `${
                    (checkedCount /
                      totalCount) *
                    100
                  }%`,
                }}
              />
            </div>
          )}

          {checkedCount > 0 && (
            <button
              type="button"
              onClick={clearChecked}
              className="mt-3 text-xs font-semibold text-[#9A6C58] transition hover:text-[#D96536]"
            >
              Desmarcar todo
            </button>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl font-semibold text-[#39362F]">
                La lista está vacía
              </p>

              <p className="mt-2 text-sm text-[#938A82]">
                Añade comidas a la
                semana para generar la
                compra.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {groupedItems.map(
                (group) => {
                  const pendingItems =
                    group.items.filter(
                      (item) =>
                        !isChecked(
                          item
                        )
                    );

                  const completedItems =
                    group.items.filter(
                      (item) =>
                        isChecked(
                          item
                        )
                    );

                  return (
                    <section
                      key={
                        group.category
                      }
                      className="py-4"
                    >
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A19589]">
                        {
                          group.category
                        }
                      </p>

                      <div className="border-t border-[#E7DFD6]">
                        {[
                          ...pendingItems,
                          ...completedItems,
                        ].map(
                          (item) => {
                            const checked =
                              isChecked(
                                item
                              );

                            return (
                              <button
                                key={getItemKey(
                                  item
                                )}
                                type="button"
                                onClick={() =>
                                  toggleItem(
                                    item
                                  )
                                }
                                className="flex w-full items-center gap-3 border-b border-[#E7DFD6] py-3 text-left transition hover:bg-[#F8F3ED]"
                              >
                                <div
                                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold transition ${
                                    checked
                                      ? "border-[#7A8B65] bg-[#7A8B65] text-white"
                                      : "border-[#CFC5BA] bg-[#FFFDFC] text-transparent"
                                  }`}
                                >
                                  ✓
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-[14px] font-medium transition ${
                                      checked
                                        ? "text-[#AAA197] line-through"
                                        : "text-[#3A3732]"
                                    }`}
                                  >
                                    {
                                      item.name
                                    }
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 text-sm transition ${
                                    checked
                                      ? "text-[#B8B0A7] line-through"
                                      : "font-medium text-[#746B63]"
                                  }`}
                                >
                                  {
                                    item.quantity
                                  }
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>
                  );
                }
              )}
            </div>
          )}
        </main>

        <footer className="shrink-0 border-t border-[#E7DFD6] bg-[#FFFDFC] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-[#2F312B] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#20221E]"
          >
            Volver al menú
          </button>
        </footer>
      </div>
    </div>
  );
}