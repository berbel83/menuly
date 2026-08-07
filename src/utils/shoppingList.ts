import type { Ingredient } from "../types/meal";

export interface ShoppingItem {
  name: string;
  quantity: string;
}

type ParsedQuantity = {
  value: number;
  unit: string;
};

function parseQuantity(quantity: string): ParsedQuantity | null {
  const normalized = quantity
    .trim()
    .toLowerCase()
    .replace(",", ".");

  if (normalized === "media unidad") {
    return {
      value: 0.5,
      unit: "unidades",
    };
  }

  const match = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|unidad|unidades|cucharada|cucharadas|diente|dientes|lata|latas)$/
  );

  if (!match) {
    return null;
  }

  let value = Number(match[1]);
  let unit = match[2];

  if (unit === "kg") {
    value *= 1000;
    unit = "g";
  }

  if (unit === "l") {
    value *= 1000;
    unit = "ml";
  }

  if (unit === "unidad") unit = "unidades";
  if (unit === "cucharada") unit = "cucharadas";
  if (unit === "diente") unit = "dientes";
  if (unit === "lata") unit = "latas";

  return {
    value,
    unit,
  };
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value
    .toFixed(2)
    .replace(/0+$/, "")
    .replace(/\.$/, "")
    .replace(".", ",");
}

function formatQuantity(
  value: number,
  unit: string
): string {
  if (unit === "g") {
    if (value >= 1000) {
      return `${formatNumber(value / 1000)} kg`;
    }

    return `${formatNumber(value)} g`;
  }

  if (unit === "ml") {
    if (value >= 1000) {
      return `${formatNumber(value / 1000)} l`;
    }

    return `${formatNumber(value)} ml`;
  }

  if (unit === "unidades") {
    return value === 1
      ? "1 unidad"
      : `${formatNumber(value)} unidades`;
  }

  if (unit === "cucharadas") {
    return value === 1
      ? "1 cucharada"
      : `${formatNumber(value)} cucharadas`;
  }

  if (unit === "dientes") {
    return value === 1
      ? "1 diente"
      : `${formatNumber(value)} dientes`;
  }

  if (unit === "latas") {
    return value === 1
      ? "1 lata"
      : `${formatNumber(value)} latas`;
  }

  return `${formatNumber(value)} ${unit}`;
}

export function aggregateShoppingList(
  ingredients: Ingredient[]
): ShoppingItem[] {
  const groups = new Map<
    string,
    {
      name: string;
      numeric: Map<string, number>;
      texts: Set<string>;
    }
  >();

  for (const ingredient of ingredients) {
    const key = ingredient.name
      .trim()
      .toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        name: ingredient.name.trim(),
        numeric: new Map(),
        texts: new Set(),
      });
    }

    const group = groups.get(key)!;
    const parsed = parseQuantity(
      ingredient.quantity
    );

    if (parsed) {
      group.numeric.set(
        parsed.unit,
        (group.numeric.get(parsed.unit) ?? 0) +
          parsed.value
      );
    } else {
      group.texts.add(
        ingredient.quantity.trim()
      );
    }
  }

  return Array.from(groups.values())
    .map((group) => {
      const numericParts = Array.from(
        group.numeric.entries()
      ).map(([unit, value]) =>
        formatQuantity(value, unit)
      );

      const textParts = Array.from(
        group.texts
      );

      return {
        name: group.name,
        quantity: [
          ...numericParts,
          ...textParts,
        ].join(" · "),
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "es")
    );
}