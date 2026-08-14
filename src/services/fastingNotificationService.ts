import { supabase } from "../lib/supabase";

import {
  getServiceWorkerRegistration,
} from "./notificationService";

import type {
  ActiveFast,
} from "./fastingService";

export async function scheduleFastCompletedNotification(
  fast: ActiveFast
) {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const registration =
    await getServiceWorkerRegistration();

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint =
    subscription.endpoint;

  /*
   * Si por cualquier motivo volvemos a programar
   * este mismo ayuno, cancelamos avisos anteriores
   * pendientes de finalización para este dispositivo.
   */
  const { error: cancelError } =
    await supabase
      .from("scheduled_notifications")
      .update({
        status: "cancelled",
      })
      .eq(
        "subscription_endpoint",
        endpoint
      )
      .eq(
        "notification_type",
        "fast_completed"
      )
      .eq(
        "status",
        "pending"
      );

  if (cancelError) {
    throw new Error(
      `No se pudieron cancelar avisos anteriores: ${cancelError.message}`
    );
  }

  const endDate =
    new Date(
      fast.targetEndAt
    );

  const endTime =
    endDate.toLocaleTimeString(
      "es-ES",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const { error } =
    await supabase
      .from("scheduled_notifications")
      .insert({
        subscription_endpoint:
          endpoint,

        notification_type:
          "fast_completed",

        scheduled_at:
          fast.targetEndAt,

        title:
          "Ayuno completado 🎉",

        body:
          `Has completado tu ayuno de ${fast.fastingHours} horas. Ya puedes comer. Objetivo alcanzado a las ${endTime}.`,

        url:
          "/fasting",

        status:
          "pending",
      });

  if (error) {
    throw new Error(
      `No se pudo programar la notificación: ${error.message}`
    );
  }
}

export async function cancelFastCompletedNotification() {
  const registration =
    await getServiceWorkerRegistration();

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const { error } =
    await supabase
      .from("scheduled_notifications")
      .update({
        status: "cancelled",
      })
      .eq(
        "subscription_endpoint",
        subscription.endpoint
      )
      .eq(
        "notification_type",
        "fast_completed"
      )
      .eq(
        "status",
        "pending"
      );

  if (error) {
    throw new Error(
      `No se pudo cancelar la notificación: ${error.message}`
    );
  }
}