import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";

import {
  loadFastingHistory,
  type FastingHistoryEntry,
} from "../services/fastingProgressService";

function formatDuration(
  minutes: number
) {
  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function formatDay(
  value: string
) {
  const date =
    new Date(value);

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const sameDay = (
    first: Date,
    second: Date
  ) =>
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate();

  if (
    sameDay(
      date,
      today
    )
  ) {
    return "Hoy";
  }

  if (
    sameDay(
      date,
      yesterday
    )
  ) {
    return "Ayer";
  }

  return date.toLocaleDateString(
    "es-ES",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );
}

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    "es-ES",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function FastingHistoryPage() {
  const [
    history,
    setHistory,
  ] =
    useState<
      FastingHistoryEntry[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const data =
          await loadFastingHistory();

        setHistory(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el historial."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FBF8F3] sm:min-h-[760px]">
        <header className="flex items-center gap-3 border-b border-[#E7DFD6] px-5 py-5">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E2D9CF] bg-[#FFFDFC] text-[24px] font-light text-[#5E574F]"
            aria-label="Volver"
          >
            ‹
          </Link>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A8B65]">
              Tu progreso
            </p>

            <h1 className="font-serif text-[27px] font-semibold text-[#25251F]">
              Historial de ayuno
            </h1>
          </div>
        </header>

        <main className="px-5 py-5">
          {loading ? (
            <div className="py-10 text-center text-sm text-[#81766D]">
              Cargando historial...
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : history.length ===
            0 ? (
            <section className="rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5 text-center">
              <p className="font-serif text-[21px] font-semibold text-[#292923]">
                Aún no hay ayunos registrados
              </p>

              <p className="mt-2 text-sm leading-6 text-[#92877D]">
                Cuando termines un ayuno aparecerá aquí con su duración real.
              </p>
            </section>
          ) : (
            <div className="space-y-3">
              {history.map(
                (entry) => (
                  <article
                    key={
                      entry.id
                    }
                    className="rounded-[22px] border border-[#E3D9CE] bg-[#FFFDFC] px-4 py-4 shadow-[0_5px_16px_rgba(80,60,42,0.035)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-[19px] font-semibold capitalize text-[#292923]">
                          {formatDay(
                            entry.endedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#92877D]">
                          {formatTime(
                            entry.startedAt
                          )}
                          {" → "}
                          {formatTime(
                            entry.endedAt
                          )}
                        </p>

                        {entry.pendingSync && (
                          <p className="mt-2 text-[11px] font-semibold text-[#A66A39]">
                            Pendiente de sincronizar
                          </p>
                        )}
                      </div>

                      {entry.completedTarget && (
                        <span className="rounded-full bg-[#EAF0E5] px-2.5 py-1 text-[10px] font-bold text-[#60764C]">
                          ✓ Objetivo
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A19589]">
                          Tiempo real
                        </p>

                        <p className="mt-1 font-serif text-[25px] font-semibold text-[#30302A]">
                          {formatDuration(
                            entry.actualMinutes
                          )}
                        </p>
                      </div>

                      <p className="pb-1 text-xs text-[#92877D]">
                        Objetivo{" "}
                        <strong className="text-[#71675E]">
                          {entry.targetHours} h
                        </strong>
                      </p>
                    </div>

                    {!entry.completedTarget && (
                      <div className="mt-3 border-t border-[#EEE6DD] pt-3">
                        <p className="text-[11px] text-[#9A8F85]">
                          Ayuno finalizado antes del objetivo
                        </p>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
