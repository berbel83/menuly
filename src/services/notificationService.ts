import { supabase } from "../lib/supabase";
import { ensureAuthenticatedSession } from "./authService";

export function notificationsSupported() {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) {
    throw new Error(
      "Este dispositivo no admite notificaciones web."
    );
  }

  return await Notification.requestPermission();
}

export async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Este navegador no admite service workers."
    );
  }

  return await navigator.serviceWorker.ready;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (character) =>
        character.charCodeAt(0)
    )
  );
}

export async function subscribeToPush() {
  if (!notificationsSupported()) {
    throw new Error(
      "Este dispositivo no admite notificaciones push."
    );
  }

  if (Notification.permission !== "granted") {
    throw new Error(
      "No hay permiso para enviar notificaciones."
    );
  }

  const publicKey =
    import.meta.env
      .VITE_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "Falta VITE_VAPID_PUBLIC_KEY."
    );
  }

  const registration =
    await getServiceWorkerRegistration();

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(
            publicKey
          ),
      });
  }

  const json =
    subscription.toJSON();

  const endpoint =
    json.endpoint;

  const p256dh =
    json.keys?.p256dh;

  const auth =
    json.keys?.auth;

  if (
    !endpoint ||
    !p256dh ||
    !auth
  ) {
    throw new Error(
      "La suscripción push no contiene todas las claves necesarias."
    );
  }

  await ensureAuthenticatedSession();

  const { error } = await supabase.rpc(
    "claim_push_subscription",
    {
      p_endpoint: endpoint,
      p_p256dh: p256dh,
      p_auth: auth,
    }
  );

  if (error) {
    throw new Error(
      `No se pudo guardar la suscripción push: ${error.message}`
    );
  }

  return subscription;
}
