import { supabase } from "../lib/supabase";

import { syncPendingFastingHistory } from "./fastingHistoryService";
import {
  loadPendingFastingHistory,
  updatePendingFastingHistory,
} from "../storage/fastingHistoryStorage";
import { getAuthenticatedUserId } from "./authService";

export interface FastingHistoryEntry {
  id: string;
  startedAt: string;
  endedAt: string;
  targetHours: number;
  actualMinutes: number;
  completedTarget: boolean;
  pendingSync?: boolean;
}

function loadLocalHistory(): FastingHistoryEntry[] {
  return loadPendingFastingHistory().map((entry) => ({
    id: `local-${entry.localId}`,
    startedAt: entry.startedAt,
    endedAt: entry.endedAt,
    targetHours: entry.targetHours,
    actualMinutes: entry.actualMinutes,
    completedTarget: entry.completedTarget,
    pendingSync: true,
  }));
}

export function getMonday(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

function mapHistoryEntry(entry: {
  id: string;
  started_at: string;
  ended_at: string;
  target_hours: number | string;
  actual_minutes: number;
  completed_target: boolean;
}): FastingHistoryEntry {
  return {
    id: entry.id,
    startedAt: entry.started_at,
    endedAt: entry.ended_at,
    targetHours: Number(
      entry.target_hours
    ),
    actualMinutes:
      entry.actual_minutes,
    completedTarget:
      entry.completed_target,
  };
}

export async function loadCurrentWeekFastingHistory() {
  await syncPendingFastingHistory();

  const monday = getMonday(new Date());
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const localHistory = loadLocalHistory().filter((entry) => {
    const endedAt = new Date(entry.endedAt);
    return endedAt >= monday && endedAt < nextMonday;
  });

  const userId = await getAuthenticatedUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from("fasting_history")
      .select(
        `
          id,
          started_at,
          ended_at,
          target_hours,
          actual_minutes,
          completed_target
        `
      )
      .eq("user_id", userId)
      .gte(
        "ended_at",
        monday.toISOString()
      )
      .lt(
        "ended_at",
        nextMonday.toISOString()
      )
      .order(
        "ended_at",
        {
          ascending: true,
        }
      );

  if (error) {
    if (localHistory.length > 0) {
      return localHistory;
    }

    throw new Error(
      `No se pudo cargar el progreso: ${error.message}`
    );
  }

  return [
    ...(data ?? []).map(mapHistoryEntry),
    ...localHistory,
  ].sort(
    (a, b) =>
      new Date(a.endedAt).getTime() -
      new Date(b.endedAt).getTime()
  );
}

export async function loadFastingHistory() {
  await syncPendingFastingHistory();

  const localHistory = loadLocalHistory();
  const userId = await getAuthenticatedUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from("fasting_history")
      .select(
        `
          id,
          started_at,
          ended_at,
          target_hours,
          actual_minutes,
          completed_target
        `
      )
      .eq("user_id", userId)
      .order(
        "ended_at",
        {
          ascending: false,
        }
      );

  if (error) {
    if (localHistory.length > 0) {
      return localHistory;
    }

    throw new Error(
      `No se pudo cargar el historial: ${error.message}`
    );
  }

  return [
    ...(data ?? []).map(mapHistoryEntry),
    ...localHistory,
  ].sort(
    (a, b) =>
      new Date(b.endedAt).getTime() -
      new Date(a.endedAt).getTime()
  );
}

export async function updateFastingHistoryEntry(
  entry: FastingHistoryEntry,
  startedAt: Date,
  endedAt: Date,
  targetHours: number
) {
  const actualMinutes = Math.max(
    0,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
  );
  const completedTarget = actualMinutes >= targetHours * 60;

  if (entry.pendingSync && entry.id.startsWith("local-")) {
    updatePendingFastingHistory(
      entry.id.slice("local-".length),
      startedAt.toISOString(),
      endedAt.toISOString(),
      targetHours
    );
  } else {
    const userId = await getAuthenticatedUserId();
    const { error } = await supabase
      .from("fasting_history")
      .update({
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        target_hours: targetHours,
        actual_minutes: actualMinutes,
        completed_target: completedTarget,
      })
      .eq("id", entry.id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`No se pudo actualizar el ayuno: ${error.message}`);
    }
  }

  return {
    ...entry,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    targetHours,
    actualMinutes,
    completedTarget,
  };
}
