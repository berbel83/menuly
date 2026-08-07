import type { Category } from "../types/meal";

interface CategoryStyle {
  icon: string;
  background: string;
  color: string;
}

export function getCategoryStyle(category: Category): CategoryStyle {
  switch (category) {
    case "Pollo":
      return {
        icon: "🍗",
        background: "#fff0e6",
        color: "#b85e2f",
      };

    case "Carne":
      return {
        icon: "🥩",
        background: "#fbe8e6",
        color: "#a94a40",
      };

    case "Pescado":
      return {
        icon: "🐟",
        background: "#e8f4f7",
        color: "#28748a",
      };

    case "Pasta":
      return {
        icon: "🍝",
        background: "#fff4d9",
        color: "#9b6a19",
      };

    case "Arroz":
      return {
        icon: "🥘",
        background: "#fff1d8",
        color: "#9d641e",
      };

    case "Huevos":
      return {
        icon: "🥚",
        background: "#fff8d9",
        color: "#8c7320",
      };

    case "Wraps":
      return {
        icon: "🌯",
        background: "#edf5df",
        color: "#5c7b32",
      };

    case "Caprichos":
      return {
        icon: "🍔",
        background: "#f4e8dd",
        color: "#875737",
      };

    case "Ligero":
      return {
        icon: "🥗",
        background: "#e4f3e9",
        color: "#36724c",
      };

    case "Merienda":
      return {
        icon: "🥪",
        background: "#eee9fa",
        color: "#67528b",
      };

    default:
      return {
        icon: "🍽️",
        background: "#f1ece7",
        color: "#6f655e",
      };
  }
}