import { supabase } from "../lib/supabase";

import {
  getServiceWorkerRegistration,
} from "./notificationService";

import type {
  ActiveFast,
} from "./fastingService";

import {
  loadPendingFastingHistory,
  queueFastingHistory,
  removePendingFastingHistory,
  type PendingFastingHistoryEntry,
} from "../storage/fastingHistoryStorage";
import { getAuthenticatedUserId } from "./authService";

async function getCurrentPushEndpoint() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return null;
  }

  try {
    const registration =
      await getServiceWorkerRegistration();

    const subscription =
      await registration.pushManager.getSubscription();

    return subscription?.endpoint ?? null;
  } catch {
    return null;
  }
}

async function uploadHistoryEntry(
  entry: PendingFastingHistoryEntry,
  endpoint: string | null
) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("fasting_history")
    .insert({
      subscription_endpoint: endpoint,
      started_at: entry.startedAt,
      ended_at: entry.endedAt,
      target_hours: entry.targetHours,
      actual_minutes: entry.actualMinutes,
      completed_target: entry.completedTarget,
      user_id: userId,
    });

  if (error) {
    throw new Error(
      `No se pudo guardar el historial: ${error.message}`
    );
  }
}

export async function syncPendingFastingHistory() {
  const pending = loadPendingFastingHistory();

  if (pending.length === 0) {
    return { synced: 0, remaining: 0 };
  }

  const endpoint = await getCurrentPushEndpoint();

  let synced = 0;

  for (const entry of pending) {
    try {
      await uploadHistoryEntry(entry, endpoint);
      removePendingFastingHistory(entry.localId);
      synced += 1;
    } catch {
      // Se conserva localmente para volver a intentarlo más adelante.
    }
  }

  return {
    synced,
    remaining: loadPendingFastingHistory().length,
  };
}

export async function saveFastingHistory(
  fast: ActiveFast,
  endedAt = new Date()
) {
  const entry = queueFastingHistory(fast, endedAt);
  const syncResult = await syncPendingFastingHistory();

  return {
    actualMinutes: entry.actualMinutes,
    completedTarget: entry.completedTarget,
    synced: syncResult.remaining === 0,
  };
}
