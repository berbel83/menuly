import { useEffect } from "react";

import {
  notificationsSupported,
  subscribeToPush,
} from "../../services/notificationService";

export default function PushBootstrap() {
  useEffect(() => {
    async function ensurePushSubscription() {
      if (!notificationsSupported()) {
        return;
      }

      if (Notification.permission !== "granted") {
        return;
      }

      try {
        await subscribeToPush();

        console.log(
          "Suscripción push de Compausa registrada."
        );
      } catch (error) {
        console.error(
          "No se pudo registrar la suscripción push:",
          error
        );
      }
    }

    ensurePushSubscription();
  }, []);

  return null;
}