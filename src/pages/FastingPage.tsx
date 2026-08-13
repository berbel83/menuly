import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

import {
  DEFAULT_FASTING_SETTINGS,
  getFastProgress,
  getFastingHours,
  getRemainingMilliseconds,
  loadActiveFast,
  loadFastingSettings,
  saveFastingSettings,
  startFast,
  stopFast,
  type ActiveFast,
  type FastingPreset,
  type FastingSettings,
} from "../services/fastingService";

function formatClock(date: Date) {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  const day = date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return `${day} · ${formatClock(date)}`;
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.floor(
    milliseconds / 1000 / 60
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  return {
    hours,
    minutes,
  };
}

export default function FastingPage() {
  const [settings, setSettings] =
    useState<FastingSettings>(
      DEFAULT_FASTING_SETTINGS
    );

  const [activeFast, setActiveFast] =
    useState<ActiveFast | null>(
      null
    );

  const [now, setNow] =
    useState(new Date());

  useEffect(() => {
    setSettings(
      loadFastingSettings()
    );

    setActiveFast(
      loadActiveFast()
    );
  }, []);

  useEffect(() => {
    if (!activeFast) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setNow(new Date());
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [activeFast]);

  const fastingHours =
    getFastingHours(settings);

  const progress = useMemo(() => {
    if (!activeFast) {
      return 0;
    }

    return getFastProgress(
      activeFast,
      now
    );
  }, [activeFast, now]);

  const remaining =
    useMemo(() => {
      if (!activeFast) {
        return {
          hours: 0,
          minutes: 0,
        };
      }

      return formatDuration(
        getRemainingMilliseconds(
          activeFast,
          now
        )
      );
    }, [activeFast, now]);

  const completed =
    activeFast
      ? new Date(
          activeFast.targetEndAt
        ).getTime() <=
        now.getTime()
      : false;

  function updatePreset(
    preset: FastingPreset
  ) {
    const nextSettings = {
      ...settings,
      preset,
    };

    setSettings(
      nextSettings
    );

    saveFastingSettings(
      nextSettings
    );
  }

  function updateCustomHours(
    hours: number
  ) {
    const safeHours = Math.min(
      Math.max(hours, 1),
      48
    );

    const nextSettings = {
      preset: "custom" as const,
      customHours: safeHours,
    };

    setSettings(
      nextSettings
    );

    saveFastingSettings(
      nextSettings
    );
  }

  function handleStartFast() {
    const fast = startFast(
      fastingHours
    );

    setActiveFast(fast);
    setNow(new Date());
  }

  function handleStopFast() {
    const confirmed =
      window.confirm(
        completed
          ? "¿Quieres finalizar este ayuno?"
          : "¿Quieres terminar el ayuno antes de tiempo?"
      );

    if (!confirmed) {
      return;
    }

    stopFast();
    setActiveFast(null);
  }

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
              Menuly
            </p>

            <h1 className="mt-0.5 font-serif text-[28px] font-semibold tracking-[-0.03em] text-[#25251F]">
              Ayuno
            </h1>
          </div>
        </header>

        <main className="px-5 py-5">
          {!activeFast ? (
            <>
              <section className="rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5 shadow-[0_8px_25px_rgba(80,60,42,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A19589]">
                  Tu protocolo
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-semibold text-[#292923]">
                  ¿Cuánto quieres ayunar?
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    "14:10",
                    "16:8",
                    "18:6",
                  ].map((preset) => {
                    const active =
                      settings.preset ===
                      preset;

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          updatePreset(
                            preset as FastingPreset
                          )
                        }
                        className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "bg-[#D96536] text-white"
                            : "border border-[#E2D9CF] bg-[#FBF8F3] text-[#6F675F]"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-2xl border border-[#E2D9CF] bg-[#FBF8F3] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#39362F]">
                        Personalizado
                      </p>

                      <p className="mt-1 text-xs text-[#92877D]">
                        Elige las horas de ayuno.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateCustomHours(
                            (settings.preset ===
                            "custom"
                              ? settings.customHours
                              : fastingHours) - 1
                          )
                        }
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#DED5CA] bg-white text-lg text-[#5E574F]"
                      >
                        −
                      </button>

                      <div className="min-w-14 text-center">
                        <span className="font-serif text-[24px] font-semibold text-[#2D2A26]">
                          {settings.preset ===
                          "custom"
                            ? settings.customHours
                            : fastingHours}
                        </span>

                        <span className="ml-1 text-xs text-[#92877D]">
                          h
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateCustomHours(
                            (settings.preset ===
                            "custom"
                              ? settings.customHours
                              : fastingHours) + 1
                          )
                        }
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#DED5CA] bg-white text-lg text-[#5E574F]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-[24px] bg-[#2F312B] p-5 text-white shadow-[0_14px_35px_rgba(47,49,43,0.15)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Inicio rápido
                </p>

                <h2 className="mt-2 font-serif text-[27px] font-semibold">
                  Empieza cuando tú quieras
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Menuly guardará la hora exacta de inicio y calculará automáticamente cuándo termina tu ayuno.
                </p>

                <button
                  type="button"
                  onClick={
                    handleStartFast
                  }
                  className="mt-5 w-full rounded-2xl bg-[#D96536] px-4 py-4 text-sm font-bold text-white transition active:scale-[0.99]"
                >
                  Empezar a ayunar ahora
                </button>

                <p className="mt-3 text-center text-xs text-white/50">
                  Ayuno seleccionado: {fastingHours} horas
                </p>
              </section>
            </>
          ) : (
            <>
              <section
                className={`rounded-[28px] border p-5 shadow-[0_12px_35px_rgba(80,60,42,0.07)] ${
                  completed
                    ? "border-[#C9D4BC] bg-[#F6F9F2]"
                    : "border-[#E3D9CE] bg-[#FFFDFC]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        completed
                          ? "text-[#6F845A]"
                          : "text-[#D96536]"
                      }`}
                    >
                      {completed
                        ? "Ayuno completado"
                        : "Ayunando"}
                    </p>

                    <h2 className="mt-2 font-serif text-[31px] font-semibold tracking-[-0.03em] text-[#25251F]">
                      {activeFast.fastingHours} horas
                    </h2>
                  </div>

                  <div
                    className={`grid h-12 w-12 place-items-center rounded-full text-lg ${
                      completed
                        ? "bg-[#DCE6D2] text-[#60764C]"
                        : "bg-[#F4E5DD] text-[#D96536]"
                    }`}
                  >
                    {completed
                      ? "✓"
                      : "⏱"}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EAE3DA]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        completed
                          ? "bg-[#7A8B65]"
                          : "bg-[#D96536]"
                      }`}
                      style={{
                        width: `${progress * 100}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-[#938A82]">
                    <span>
                      Inicio
                    </span>

                    <span>
                      {Math.round(
                        progress * 100
                      )}
                      %
                    </span>

                    <span>
                      Fin
                    </span>
                  </div>
                </div>

                {!completed ? (
                  <div className="mt-7 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A19589]">
                      Tiempo restante
                    </p>

                    <p className="mt-2 font-serif text-[46px] font-semibold leading-none tracking-[-0.04em] text-[#25251F]">
                      {remaining.hours}
                      <span className="text-[20px] text-[#8C837A]">
                        h
                      </span>{" "}
                      {remaining.minutes}
                      <span className="text-[20px] text-[#8C837A]">
                        m
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-7 rounded-2xl bg-[#E7EFE0] px-4 py-4 text-center">
                    <p className="font-serif text-[23px] font-semibold text-[#536647]">
                      Ya puedes comer
                    </p>

                    <p className="mt-1 text-sm text-[#708064]">
                      Has completado tu objetivo.
                    </p>
                  </div>
                )}

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F5F0E9] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B9085]">
                      Empezaste
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#3A3732]">
                      {formatDateTime(
                        activeFast.startAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F0E9] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B9085]">
                      Objetivo
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#3A3732]">
                      {formatDateTime(
                        activeFast.targetEndAt
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <button
                type="button"
                onClick={
                  handleStopFast
                }
                className={`mt-5 w-full rounded-2xl px-4 py-4 text-sm font-semibold transition ${
                  completed
                    ? "bg-[#7A8B65] text-white"
                    : "border border-[#E6CFC5] bg-[#FFF9F6] text-[#A34F34]"
                }`}
              >
                {completed
                  ? "Finalizar ayuno"
                  : "Terminar ayuno antes"}
              </button>
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
}