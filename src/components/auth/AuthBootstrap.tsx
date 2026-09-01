import { useEffect, useRef, useState } from "react";

import { useHouse } from "../../context/useHouse";
import { ensureAuthenticatedSession } from "../../services/authService";
import {
  findHouseByCode,
  loadCurrentUserHouse,
} from "../../services/houseService";
import {
  notificationsSupported,
  subscribeToPush,
} from "../../services/notificationService";
import { syncPendingFastingHistory } from "../../services/fastingHistoryService";
import { hydrateFastingStateFromCloud } from "../../services/fastingService";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const { house, setHouse } = useHouse();
  const initialHouseRef = useRef(house);
  const setHouseRef = useRef(setHouse);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        setReady(false);
        setErrorMessage(null);

        await ensureAuthenticatedSession();
        await hydrateFastingStateFromCloud();

        if (initialHouseRef.current) {
          const migratedHouse = await findHouseByCode(
            initialHouseRef.current.code
          );

          if (!migratedHouse) {
            throw new Error(
              "No encontramos el hogar guardado en este dispositivo."
            );
          }

          if (active) {
            setHouseRef.current(migratedHouse);
          }
        } else {
          const recoveredHouse = await loadCurrentUserHouse();

          if (active && recoveredHouse) {
            setHouseRef.current(recoveredHouse);
          }
        }

        if (
          notificationsSupported() &&
          Notification.permission === "granted"
        ) {
          try {
            await subscribeToPush();
          } catch (error) {
            console.error(
              "No se pudieron migrar todavía las notificaciones:",
              error
            );
          }
        }

        await syncPendingFastingHistory();

        if (active) {
          setReady(true);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo iniciar Compausa."
          );
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [retryKey]);

  if (errorMessage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#2F4A36] px-5 text-[#263129]">
        <section className="w-full max-w-md rounded-[24px] bg-[#FFFDFC] p-6 text-center shadow-2xl">
          <p className="font-serif text-[24px] font-semibold">
            No pudimos iniciar Compausa
          </p>

          <p className="mt-3 text-sm leading-6 text-[#81766D]">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-5 w-full rounded-2xl bg-[#E86632] px-4 py-3.5 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </section>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#2F4A36] text-white">
        <div className="text-center">
          <img
            src="/pwa-192x192.png"
            alt=""
            className="mx-auto h-16 w-16 rounded-[18px]"
          />

          <p className="mt-4 text-sm font-semibold">
            Preparando Compausa…
          </p>
        </div>
      </main>
    );
  }

  return children;
}
