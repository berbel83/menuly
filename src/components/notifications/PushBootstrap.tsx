import { useEffect } from "react";

import {
  notificationsSupported,
  subscribeToPush,
} from "../../services/notificationService";
import { syncPendingFastingHistory } from "../../services/fastingHistoryService";

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
        await syncPendingFastingHistory();

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
