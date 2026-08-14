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
                    entries.length -
                      1
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
      <section className="mx-5 mb-4 rounded-[22px] border border-[#E3D9CE] bg-[#FFFDFC] px-4 py-4">
        <p className="text-xs text-[#92877D]">
          Cargando tu progreso...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-5 mb-4 rounded-[22px] border border-[#E3D9CE] bg-[#FFFDFC] px-4 py-4 shadow-[0_6px_20px_rgba(80,60,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#7A8B65]">
            Tu progreso
          </p>

          <p className="mt-1 font-serif text-[19px] font-semibold text-[#292923]">
            Esta semana
          </p>
        </div>

        {streak > 0 && (
          <div className="rounded-full bg-[#F4E8DF] px-3 py-1.5 text-[11px] font-bold text-[#C35B32]">
            🔥 {streak}{" "}
            {streak === 1
              ? "día"
              : "días"}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {days.map(
          (day) => {
            const isToday =
              sameLocalDay(
                day.date,
                new Date()
              );

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
                      : "text-[#9A9086]"
                  }`}
                >
                  {day.label}
                </p>

                <div
                  className={`mt-2 flex min-h-[58px] flex-col items-center justify-center rounded-xl px-1 ${
                    day.entry
                      ? day.entry.completedTarget
                        ? "bg-[#EAF0E5]"
                        : "bg-[#F5F0E9]"
                      : isToday
                      ? "border border-dashed border-[#E7B39D] bg-[#FFF9F6]"
                      : "bg-[#F7F3EE]"
                  }`}
                >
                  {day.entry ? (
                    <>
                      <span
                        className={`text-[12px] font-bold leading-tight ${
                          day.entry.completedTarget
                            ? "text-[#60764C]"
                            : "text-[#756C63]"
                        }`}
                      >
                        {Math.floor(
                          day.entry.actualMinutes /
                            60
                        )}
                        h
                      </span>

                      {day.entry.completedTarget && (
                        <span className="mt-1 text-[10px] font-bold text-[#7A8B65]">
                          ✓
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[13px] text-[#B7AEA5]">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {fastingDays > 0 ? (
        <div className="mt-4 flex items-center justify-between border-t border-[#EEE6DD] pt-3 text-[11px]">
          <span className="text-[#8D837A]">
            {fastingDays}{" "}
            {fastingDays === 1
              ? "día registrado"
              : "días registrados"}
          </span>

          <span className="font-semibold text-[#637452]">
            Objetivo:{" "}
            {completedCount}/
            {fastingDays}
          </span>
        </div>
      ) : (
        <p className="mt-4 border-t border-[#EEE6DD] pt-3 text-xs leading-5 text-[#92877D]">
          Cuando termines tu primer ayuno de la semana,
          aparecerá aquí.
        </p>
      )}

      {history.length > 0 && (
        <div className="mt-3 space-y-1">
          {history
            .slice()
            .reverse()
            .slice(0, 2)
            .map(
              (entry) => (
                <p
                  key={
                    entry.id
                  }
                  className="text-[10px] text-[#A0968C]"
                >
                  {new Date(
                    entry.endedAt
                  ).toLocaleDateString(
                    "es-ES",
                    {
                      weekday:
                        "long",
                    }
                  )}
                  :{" "}
                  {formatDuration(
                    entry.actualMinutes
                  )}
                </p>
              )
            )}
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-xs text-red-600">
          {errorMessage}
        </p>
      )}

      <Link
        to="/fasting/history"
        className="mt-4 flex items-center justify-between border-t border-[#EEE6DD] pt-3 text-xs font-semibold text-[#667956]"
      >
        <span>
          Ver historial completo
        </span>

        <span className="text-lg font-light text-[#9A9086]">
          ›
        </span>
      </Link>
    </section>
  );
}