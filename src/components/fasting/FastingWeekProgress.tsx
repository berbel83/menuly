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

  const loadHistory =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const data =
            await loadCurrentWeekFastingHistory();

          setHistory(data);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadHistory();

    function update() {
      void loadHistory();
    }

    window.addEventListener(
      "fasting-history-updated",
      update
    );

    window.addEventListener(
      "focus",
      update
    );

    return () => {
      window.removeEventListener(
        "fasting-history-updated",
        update
      );

      window.removeEventListener(
        "focus",
        update
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
          (
            label,
            index
          ) => {
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

            return {
              label,
              date,

              entry:
                entries.length >
                0
                  ? entries[
                      entries.length -
                        1
                    ]
                  : null,
            };
          }
        );
      },
      [history]
    );

  const streak =
    useMemo(() => {
      const todayIndex =
        days.findIndex(
          (day) =>
            sameLocalDay(
              day.date,
              new Date()
            )
        );

      let index =
        todayIndex >= 0 &&
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
    return null;
  }

  return (
    <section className="mx-4 mb-3 rounded-[18px] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(42,60,44,0.07)] ring-1 ring-[#DDE5DB]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E97857]">
            Tu progreso
          </p>

          <h3 className="font-serif text-[20px] font-semibold text-[#263129]">
            Esta semana
          </h3>
        </div>

        {streak > 0 && (
          <span className="rounded-full bg-[#FCEAE4] px-3 py-1.5 text-[10px] font-bold text-[#B85E45]">
            🔥 {streak}{" "}
            {streak === 1
              ? "día"
              : "días"}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map(
          (day) => {
            const today =
              sameLocalDay(
                day.date,
                new Date()
              );

            return (
              <div
                key={
                  day.date.toISOString()
                }
                className="text-center"
              >
                <p
                  className={`text-[9px] font-bold ${
                    today
                      ? "text-[#E97857]"
                      : "text-[#7E847B]"
                  }`}
                >
                  {day.label}
                </p>

                <div
                  className={`mt-1 flex h-[50px] flex-col items-center justify-center rounded-xl ${
                    day.entry
                      ? day.entry.completedTarget
                        ? "bg-[#3F6248] text-white"
                        : "bg-[#FCEAE4] text-[#B85E45]"
                      : today
                      ? "border-2 border-[#E97857] bg-[#FFF8F5]"
                      : "bg-[#EEF2EC]"
                  }`}
                >
                  {day.entry ? (
                    <>
                      <span className="text-[13px] font-bold">
                        {Math.floor(
                          day.entry.actualMinutes /
                            60
                        )}
                        h
                      </span>

                      {day.entry.completedTarget && (
                        <span className="text-[9px] text-[#E8C75A]">
                          ✓
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#A8AEA6]">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      <Link
        to="/fasting/history"
        className="mt-3 flex items-center justify-between rounded-xl bg-[#EDF3EB] px-3 py-2.5 text-xs font-bold text-[#3F6248]"
      >
        <span>
          Ver historial
        </span>

        <span>
          ›
        </span>
      </Link>
    </section>
  );
}