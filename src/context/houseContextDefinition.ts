import { createContext } from "react";

import type { House } from "../types/house";

export interface HouseContextValue {
  house: House | null;
  setHouse(house: House): void;
  logout(): void;
}

export const HouseContext =
  createContext<HouseContextValue | null>(null);
