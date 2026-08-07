import { useMemo } from "react";

import type { Meal } from "../types/meal";

import {
  aggregateShoppingList,
  type ShoppingItem,
} from "../utils/shoppingList";

export function useShoppingList(
  selectedMeals: Meal[]
) {
  const shoppingList = useMemo<ShoppingItem[]>(() => {
    const ingredients = selectedMeals.flatMap(
      (meal) => meal.ingredients
    );

    return aggregateShoppingList(ingredients);
  }, [selectedMeals]);

  return {
    shoppingList,
    itemCount: shoppingList.length,
  };
}