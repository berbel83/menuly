import { supabase } from "../lib/supabase";

import {
  getServiceWorkerRegistration,
} from "./notificationService";

export interface FastingHistoryEntry {
  id: string;
  startedAt: string;
  endedAt: string;
  targetHours: number;
  actualMinutes: number;
  completedTarget: boolean;
}

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

export function getMonday(date: Date) {
  const result = new Date(date);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

export async function loadCurrentWeekFastingHistory() {
  const endpoint =
    await getCurrentPushEndpoint();

  if (!endpoint) {
    return [];
  }

  const monday =
    getMonday(
      new Date()
    );

  const nextMonday =
    new Date(monday);

  nextMonday.setDate(
    nextMonday.getDate() + 7
  );

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
      .eq(
        "subscription_endpoint",
        endpoint
      )
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
    throw new Error(
      `No se pudo cargar el progreso: ${error.message}`
    );
  }

  return (
    data ?? []
  ).map(
    (entry) => ({
      id: entry.id,
      startedAt:
        entry.started_at,
      endedAt:
        entry.ended_at,
      targetHours:
        Number(
          entry.target_hours
        ),
      actualMinutes:
        entry.actual_minutes,
      completedTarget:
        entry.completed_target,
    })
  ) as FastingHistoryEntry[];
}