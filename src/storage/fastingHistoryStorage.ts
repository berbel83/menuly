import type { ActiveFast } from "../services/fastingService";

const PENDING_HISTORY_KEY =
  "compausa_pending_fasting_history";

export interface PendingFastingHistoryEntry {
  localId: string;
  startedAt: string;
  endedAt: string;
  targetHours: number;
  actualMinutes: number;
  completedTarget: boolean;
}

function createLocalId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function writePendingHistory(
  entries: PendingFastingHistoryEntry[]
) {
  localStorage.setItem(
    PENDING_HISTORY_KEY,
    JSON.stringify(entries)
  );
}

export function loadPendingFastingHistory(): PendingFastingHistoryEntry[] {
  try {
    const stored = localStorage.getItem(PENDING_HISTORY_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is PendingFastingHistoryEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.localId === "string" &&
        typeof entry.startedAt === "string" &&
        typeof entry.endedAt === "string" &&
        typeof entry.targetHours === "number" &&
        typeof entry.actualMinutes === "number" &&
        typeof entry.completedTarget === "boolean"
    );
  } catch {
    return [];
  }
}

export function queueFastingHistory(
  fast: ActiveFast,
  endedAt: Date
) {
  const startedAt = new Date(fast.startAt);
  const actualMinutes = Math.max(
    0,
    Math.round(
      (endedAt.getTime() - startedAt.getTime()) / 1000 / 60
    )
  );
  const completedTarget = actualMinutes >= fast.fastingHours * 60;

  const entry: PendingFastingHistoryEntry = {
    localId: createLocalId(),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    targetHours: fast.fastingHours,
    actualMinutes,
    completedTarget,
  };

  writePendingHistory([
    ...loadPendingFastingHistory(),
    entry,
  ]);

  return entry;
}

export function removePendingFastingHistory(localId: string) {
  writePendingHistory(
    loadPendingFastingHistory().filter(
      (entry) => entry.localId !== localId
    )
  );
}
