import type { House } from "../types/house";

const STORAGE_KEY = "menuly-house";

export function loadHouse(): House | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveHouse(house: House) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(house)
  );
}

export function clearHouse() {
  localStorage.removeItem(STORAGE_KEY);
}