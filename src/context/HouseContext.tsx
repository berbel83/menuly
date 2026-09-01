import {
  useMemo,
  useState,
} from "react";

import type { House } from "../types/house";

import {
  loadHouse,
  saveHouse,
  clearHouse,
} from "../storage/houseStorage";
import { HouseContext } from "./houseContextDefinition";
import { saveActiveHouse } from "../services/houseService";

export function HouseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [house, setHouseState] =
    useState<House | null>(loadHouse());

  function setHouse(house: House) {
    saveHouse(house);

    setHouseState(house);
    void saveActiveHouse(house.id).catch(() => undefined);
  }

  function logout() {
    clearHouse();

    setHouseState(null);
  }

  const value = useMemo(
    () => ({
      house,
      setHouse,
      logout,
    }),
    [house]
  );

  return (
    <HouseContext.Provider value={value}>
      {children}
    </HouseContext.Provider>
  );
}
