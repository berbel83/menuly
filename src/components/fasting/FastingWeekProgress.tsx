import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getMonday,
  loadCurrentWeekFastingHistory,
  type FastingHistoryEntry,
} from "../../services/fastingProgressService";

const DAY_LABELS = [
  "L",
  "M",
  "X",
  "J",
  "V",
  "S",
  "D",
];

interface DayProgress {
  label: string;
  date: Date;
  entry: FastingHistoryEntry | null;
}

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

  return `${hours} h ${remainingMinutes} m`;
}

function sameLocalDay(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

export default function FastingWeekProgress() {
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

  const loadHistory =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage(null);

          const data =
            await loadCurrentWeekFastingHistory();

          setHistory(data);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el progreso."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadHistory();

    function handleUpdate() {
      void loadHistory();
    }

    function handleFocus() {
      void loadHistory();
    }

    window.addEventListener(
      "fasting-history-updated",
      handleUpdate
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "fasting-history-updated",
        handleUpdate
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadHistory]);

  const days =
    useMemo<DayProgress[]>(
      () => {
        const monday =
          getMonday(
            new Date()
          );

        return DAY_LABELS.map(
          (label, index) => {
            const date =
              new Date(
                monday
              );

            date.setDate(
              monday.getDate() +
                index
            );

            const entries =
              history.filter(
                (entry) =>
                  sameLocalDay(
                    new Date(
                      entry.endedAt
                    ),
                    date
                  )
              );

            const entry =
              entries.length > 0
                ? entries[
                    entries.length - 1
                  ]
                : null;

            return {
              label,
              date,
              entry,
            };
          }
        );
      },
      [history]
    );

  const completedCount =
    history.filter(
      (entry) =>
        entry.completedTarget
    ).length;

  const fastingDays =
    days.filter(
      (day) =>
        day.entry !== null
    ).length;

  const streak =
    useMemo(() => {
      const today =
        new Date();

      const todayIndex =
        days.findIndex(
          (day) =>
            sameLocalDay(
              day.date,
              today
            )
        );

      if (
        todayIndex === -1
      ) {
        return 0;
      }

      let index =
        days[todayIndex].entry
          ? todayIndex
          : todayIndex - 1;

      let count = 0;

      while (
        index >= 0 &&
        days[index].entry
      ) {
        count++;
        index--;
      }

      return count;
    }, [days]);

  if (
    loading &&
    history.length === 0
  ) {
    return (
      <section className="mx-5 mb-5 rounded-[26px] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(76,67,56,0.07)] ring-1 ring-[#ECE5DC]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-[#EAF0E5]" />

          <div>
            <div className="h-3 w-24 animate-pulse rounded bg-[#ECE6DE]" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[#F3EEE8]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-5 mb-5 overflow-hidden rounded-[26px] bg-white shadow-[0_12px_32px_rgba(76,67,56,0.08)] ring-1 ring-[#ECE5DC]">
      <div className="px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E8F0E3] text-[#536B4A]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 14 4-4 3 3 5-6" />
                </svg>
              </span>

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#536B4A]">
                Tu progreso
              </p>
            </div>

            <p className="mt-3 font-serif text-[24px] font-semibold tracking-[-0.03em] text-[#2C332B]">
              Esta semana
            </p>
          </div>

          {streak > 0 && (
            <div className="rounded-full bg-[#F6E5DC] px-3 py-2 text-[11px] font-bold text-[#C55A31] shadow-sm">
              🔥 {streak}{" "}
              {streak === 1
                ? "día"
                : "días"}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {days.map(
            (day) => {
              const isToday =
                sameLocalDay(
                  day.date,
                  new Date()
                );

              const hasEntry =
                day.entry !== null;

              const completedTarget =
                day.entry?.completedTarget ??
                false;

              return (
                <div
                  key={
                    day.date.toISOString()
                  }
                  className="min-w-0 text-center"
                >
                  <p
                    className={`text-[10px] font-bold ${
                      isToday
                        ? "text-[#E86632]"
                        : "text-[#90867C]"
                    }`}
                  >
                    {day.label}
                  </p>

                  <div
                    className={`mt-2 flex min-h-[70px] flex-col items-center justify-center rounded-[16px] px-1 transition ${
                      hasEntry
                        ? completedTarget
                          ? "bg-[#536B4A] text-white shadow-[0_5px_14px_rgba(83,107,74,0.16)]"
                          : "bg-[#F4E2D7] text-[#A84E2F]"
                        : isToday
                        ? "border-2 border-dashed border-[#E86632]/55 bg-[#FFF6F1]"
                        : "bg-[#F6F3EF]"
                    }`}
                  >
                    {hasEntry ? (
                      <>
                        <span
                          className={`text-[15px] font-bold leading-none ${
                            completedTarget
                              ? "text-white"
                              : "text-[#A84E2F]"
                          }`}
                        >
                          {Math.floor(
                            day.entry!.actualMinutes /
                              60
                          )}
                        </span>

                        <span
                          className={`mt-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
                            completedTarget
                              ? "text-white/70"
                              : "text-[#B96B50]"
                          }`}
                        >
                          horas
                        </span>

                        {completedTarget && (
                          <span className="mt-1 text-[11px] font-bold text-[#F3C969]">
                            ✓
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-[16px] text-[#BFB6AC]">
                          —
                        </span>

                        {isToday && (
                          <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#E86632]">
                            hoy
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {fastingDays > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F6F3EF] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A09489]">
                Días registrados
              </p>

              <p className="mt-1 font-serif text-[22px] font-semibold text-[#2F332C]">
                {fastingDays}
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF0E5] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#758568]">
                Objetivo cumplido
              </p>

              <p className="mt-1 font-serif text-[22px] font-semibold text-[#536B4A]">
                {completedCount}/{fastingDays}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#F8F5F1] px-4 py-4">
            <p className="text-xs leading-5 text-[#8F857B]">
              Cuando termines tu primer ayuno de la semana,
              aparecerá aquí.
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 rounded-2xl bg-[#FBF9F6] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A19589]">
              Últimos registros
            </p>

            <div className="mt-2 space-y-2">
              {history
                .slice()
                .reverse()
                .slice(0, 2)
                .map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-[11px] capitalize text-[#7D736A]">
                        {new Date(
                          entry.endedAt
                        ).toLocaleDateString(
                          "es-ES",
                          {
                            weekday:
                              "long",
                          }
                        )}
                      </span>

                      <span className="text-[11px] font-bold text-[#536B4A]">
                        {formatDuration(
                          entry.actualMinutes
                        )}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMessage}
          </p>
        )}

        <Link
          to="/fasting/history"
          className="mt-5 flex items-center justify-between rounded-2xl bg-[#536B4A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(83,107,74,0.16)] transition active:scale-[0.99]"
        >
          <span>
            Ver historial completo
          </span>

          <span className="text-xl font-light text-white/80">
            ›
          </span>
        </Link>
      </div>
    </section>
  );
}