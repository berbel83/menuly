import { supabase } from "../lib/supabase";

import {
  getServiceWorkerRegistration,
} from "./notificationService";

function getNextReminderDate(
  time: string
) {
  const [hours, minutes] =
    time.split(":").map(Number);

  const now = new Date();

  const reminder =
    new Date(now);

  reminder.setHours(
    hours,
    minutes,
    0,
    0
  );

  /*
   * Si la hora de hoy ya ha pasado,
   * programamos el aviso para mañana.
   */
  if (
    reminder.getTime() <=
    now.getTime()
  ) {
    reminder.setDate(
      reminder.getDate() + 1
    );
  }

  return reminder;
}

async function getCurrentPushEndpoint() {
  if (
    !("Notification" in window) ||
    Notification.permission !==
      "granted"
  ) {
    return null;
  }

  const registration =
    await getServiceWorkerRegistration();

  const subscription =
    await registration.pushManager.getSubscription();

  return (
    subscription?.endpoint ??
    null
  );
}

export async function scheduleStartReminder(
  reminderTime: string,
  fastingHours: number
) {
  const endpoint =
    await getCurrentPushEndpoint();

  if (!endpoint) {
    throw new Error(
      "No hay una suscripción de notificaciones activa en este dispositivo."
    );
  }

  /*
   * Cancelamos cualquier recordatorio
   * de inicio pendiente de este móvil.
   */
  const { error: cancelError } =
    await supabase
      .from(
        "scheduled_notifications"
      )
      .update({
        status: "cancelled",
      })
      .eq(
        "subscription_endpoint",
        endpoint
      )
      .eq(
        "notification_type",
        "fast_start_reminder"
      )
      .eq(
        "status",
        "pending"
      );

  if (cancelError) {
    throw new Error(
      `No se pudo actualizar el recordatorio anterior: ${cancelError.message}`
    );
  }

  const reminderDate =
    getNextReminderDate(
      reminderTime
    );

  const { error } =
    await supabase
      .from(
        "scheduled_notifications"
      )
      .insert({
        subscription_endpoint:
          endpoint,

        notification_type:
          "fast_start_reminder",

        scheduled_at:
          reminderDate.toISOString(),

        title:
          "¿Empezamos el ayuno? ⏱️",

        body:
          `Es tu hora habitual. Cuando estés listo, abre Compausa y empieza tu ayuno de ${fastingHours} horas.`,

        url:
          "/fasting",

        status:
          "pending",
      });

  if (error) {
    throw new Error(
      `No se pudo programar el recordatorio: ${error.message}`
    );
  }

  return reminderDate;
}

export async function cancelStartReminder() {
  const endpoint =
    await getCurrentPushEndpoint();

  if (!endpoint) {
    return;
  }

  const { error } =
    await supabase
      .from(
        "scheduled_notifications"
      )
      .update({
        status: "cancelled",
      })
      .eq(
        "subscription_endpoint",
        endpoint
      )
      .eq(
        "notification_type",
        "fast_start_reminder"
      )
      .eq(
        "status",
        "pending"
      );

  if (error) {
    throw new Error(
      `No se pudo cancelar el recordatorio: ${error.message}`
    );
  }
}