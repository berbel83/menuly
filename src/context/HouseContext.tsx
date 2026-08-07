import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type { House } from "../types/house";

import {
  loadHouse,
  saveHouse,
  clearHouse,
} from "../storage/houseStorage";

interface HouseContextValue {
  house: House | null;

  setHouse(house: House): void;

  logout(): void;
}

const HouseContext =
  createContext<HouseContextValue | null>(null);

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

export function useHouse() {
  const context =
    useContext(HouseContext);

  if (!context) {
    throw new Error(
      "useHouse debe utilizarse dentro de HouseProvider"
    );
  }

  return context;
}