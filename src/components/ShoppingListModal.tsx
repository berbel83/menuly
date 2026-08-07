interface ShoppingItem {
  name: string;
  quantity: string;
}

interface ShoppingListModalProps {
  items: ShoppingItem[];
  onClose: () => void;
}

export default function ShoppingListModal({
  items,
  onClose,
}: ShoppingListModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(33, 26, 21, 0.58)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 16,
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "82vh",
          overflowY: "auto",
          background: "#fffaf4",
          borderRadius: "24px 24px 0 0",
          padding: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#2f6f62",
                fontWeight: 700,
              }}
            >
              COMPRA SEMANAL
            </p>

            <h2
              style={{
                margin: "4px 0 0",
                color: "#2f2a26",
              }}
            >
              Lista de la compra
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#eee6df",
              width: 38,
              height: 38,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p
            style={{
              color: "#766d66",
              lineHeight: 1.5,
            }}
          >
            Todavía no hay ingredientes porque no has elegido ninguna comida.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {items.map((ingredient) => (
              <label
                key={ingredient.name}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "#ffffff",
                  border: "1px solid #eadfd5",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    marginTop: 3,
                    width: 18,
                    height: 18,
                  }}
                />

                <span>
                  <strong
                    style={{
                      display: "block",
                      color: "#2f2a26",
                    }}
                  >
                    {ingredient.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: "#766d66",
                      fontSize: 14,
                    }}
                  >
                    {ingredient.quantity}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}