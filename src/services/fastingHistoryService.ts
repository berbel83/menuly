import { supabase } from "../lib/supabase";

import {
  getServiceWorkerRegistration,
} from "./notificationService";

import type {
  ActiveFast,
} from "./fastingService";

async function getCurrentPushEndpoint() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return null;
  }

  const registration =
    await getServiceWorkerRegistration();

  const subscription =
    await registration.pushManager.getSubscription();

  return subscription?.endpoint ?? null;
}

export async function saveFastingHistory(
  fast: ActiveFast,
  endedAt = new Date()
) {
  const endpoint =
    await getCurrentPushEndpoint();

  if (!endpoint) {
    throw new Error(
      "No se pudo identificar este dispositivo."
    );
  }

  const startedAt =
    new Date(
      fast.startAt
    );

  const durationMilliseconds =
    endedAt.getTime() -
    startedAt.getTime();

  const actualMinutes =
    Math.max(
      0,
      Math.round(
        durationMilliseconds /
          1000 /
          60
      )
    );

  const targetMinutes =
    fast.fastingHours * 60;

  const completedTarget =
    actualMinutes >=
    targetMinutes;

  const { error } =
    await supabase
      .from("fasting_history")
      .insert({
        subscription_endpoint:
          endpoint,

        started_at:
          startedAt.toISOString(),

        ended_at:
          endedAt.toISOString(),

        target_hours:
          fast.fastingHours,

        actual_minutes:
          actualMinutes,

        completed_target:
          completedTarget,
      });

  if (error) {
    throw new Error(
      `No se pudo guardar el historial: ${error.message}`
    );
  }

  return {
    actualMinutes,
    completedTarget,
  };
}