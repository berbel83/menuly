export type Category =
  | "Pollo"
  | "Carne"
  | "Pescado"
  | "Pasta"
  | "Arroz"
  | "Huevos"
  | "Wraps"
  | "Caprichos"
  | "Ligero"
  | "Merienda";

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Meal {
  id: number;
  name: string;
  category: Category;
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: "Fácil" | "Media";
  protein: boolean;
  healthy: boolean;
  favorite: boolean;
  airFryer: boolean;
  notes: string;
  description?: string;
  collection?: "main_fasting" | "breakfast" | "optional_snack" | "family" | "custom";
  tags?: string[];
  householdId?: string | null;
  isSystem?: boolean;
}
