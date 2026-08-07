import type { Meal } from "../types/meal";

interface MealDetailsProps {
  meal: Meal;
  onClose: () => void;
}

export default function MealDetails({
  meal,
  onClose,
}: MealDetailsProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        background: "rgba(33, 26, 21, 0.58)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fffaf4",
          borderRadius: "26px 26px 0 0",
          padding: 22,
          boxShadow: "0 -10px 40px rgba(33, 26, 21, 0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#d97745",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {meal.category}
            </p>

            <h2
              style={{
                margin: "5px 0 0",
                color: "#2f2a26",
                fontSize: 28,
                lineHeight: 1.15,
              }}
            >
              {meal.name}
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                color: "#766d66",
              }}
            >
              ⏱️ {meal.cookingTime} min · {meal.difficulty}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#eee6df",
              width: 40,
              height: 40,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfd5",
            borderRadius: 18,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              color: "#2f2a26",
              fontSize: 20,
            }}
          >
            Ingredientes para 2 personas
          </h3>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {meal.ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient.name}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  borderBottom:
                    index === meal.ingredients.length - 1
                      ? "none"
                      : "1px solid #f0e8e1",
                  paddingBottom:
                    index === meal.ingredients.length - 1
                      ? 0
                      : 10,
                }}
              >
                <span
                  style={{
                    color: "#3d3732",
                    fontWeight: 700,
                  }}
                >
                  {ingredient.name}
                </span>

                <span
                  style={{
                    color: "#766d66",
                    textAlign: "right",
                  }}
                >
                  {ingredient.quantity}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eadfd5",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              color: "#2f2a26",
              fontSize: 20,
            }}
          >
            Preparación
          </h3>

          <ol
            style={{
              margin: 0,
              paddingLeft: 22,
              display: "grid",
              gap: 12,
              color: "#4a433e",
              lineHeight: 1.55,
            }}
          >
            {meal.instructions.map((instruction, index) => (
              <li key={`${instruction}-${index}`}>
                {instruction}
              </li>
            ))}
          </ol>
        </section>

        {meal.notes && (
          <section
            style={{
              marginTop: 16,
              background: "#fff0e6",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#8d4f31",
                marginBottom: 6,
              }}
            >
              Nota
            </strong>

            <span
              style={{
                color: "#6f5548",
                lineHeight: 1.5,
              }}
            >
              {meal.notes}
            </span>
          </section>
        )}
      </div>
    </div>
  );
}