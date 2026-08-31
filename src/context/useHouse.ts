import { useContext } from "react";

import { HouseContext } from "./houseContextDefinition";

export function useHouse() {
  const context = useContext(HouseContext);

  if (!context) {
    throw new Error(
      "useHouse debe utilizarse dentro de HouseProvider"
    );
  }

  return context;
}
