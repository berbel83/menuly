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

  const permission =
    await Notification.requestPermission();

  return permission;
}

export async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Este navegador no admite service workers."
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  return registration;
}