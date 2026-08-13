import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getFastProgress,
  getFastingHours,
  getRemainingMilliseconds,
  loadActiveFast,
  loadFastingSettings,
  startFast,
  stopFast,
  type ActiveFast,
} from "../../services/fastingService";

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(
    0,
    Math.ceil(milliseconds / 1000 / 60)
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FastingSummary() {
  const [activeFast, setActiveFast] =
    useState<ActiveFast | null>(() => loadActiveFast());

  const [now, setNow] =
    useState(() => new Date());

  const settings = useMemo(
    () => loadFastingSettings(),
    [activeFast]
  );

  useEffect(() => {
    if (!activeFast) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeFast]);

  const fastingHours = activeFast
    ? activeFast.fastingHours
    : getFastingHours(settings);

  const progress = activeFast
    ? getFastProgress(activeFast, now)
    : 0;

  const remaining = activeFast
    ? formatRemaining(
        getRemainingMilliseconds(activeFast, now)
      )
    : null;

  const completed =
    activeFast !== null &&
    new Date(activeFast.targetEndAt).getTime() <= now.getTime();

  function handleStartNow() {
    const fast = startFast(fastingHours);

    setActiveFast(fast);
    setNow(new Date());
  }

  function handleStopFast() {
    const confirmed = window.confirm(
      completed
        ? "¿Quieres finalizar este ayuno?"
        : "¿Quieres terminar el ayuno antes de tiempo?"
    );

    if (!confirmed) {
      return;
    }

    stopFast();
    setActiveFast(null);
    setNow(new Date());
  }

  if (!activeFast) {
    return (
      <section className="mx-5 mb-4 rounded-[22px] border border-[#E3D9CE] bg-[#FFFDFC] px-4 py-4 shadow-[0_6px_20px_rgba(80,60,42,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/fasting"
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#7A8B65]">
                Ayuno
              </span>

              <span className="rounded-full bg-[#EEF1E9] px-2 py-0.5 text-[10px] font-bold text-[#70805F]">
                {fastingHours} h
              </span>
            </div>

            <p className="mt-1 font-serif text-[18px] font-semibold text-[#292923]">
              No estás ayunando
            </p>

            <p className="mt-0.5 text-xs text-[#92877D]">
              Toca para cambiar tu protocolo
            </p>
          </Link>

          <button
            type="button"
            onClick={handleStartNow}
            className="shrink-0 rounded-xl bg-[#D96536] px-4 py-2.5 text-xs font-bold text-white transition active:scale-[0.97]"
          >
            Empezar ahora
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`mx-5 mb-4 rounded-[22px] border px-4 py-4 shadow-[0_6px_20px_rgba(80,60,42,0.04)] ${
        completed
          ? "border-[#CDD8C2] bg-[#F6F9F2]"
          : "border-[#E3D9CE] bg-[#FFFDFC]"
      }`}
    >
      <Link
        to="/fasting"
        className="block"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.17em] ${
                completed
                  ? "text-[#70845E]"
                  : "text-[#D96536]"
              }`}
            >
              {completed
                ? "Ayuno completado"
                : "Ayuno en curso"}
            </p>

            {completed ? (
              <p className="mt-1 font-serif text-[21px] font-semibold text-[#536647]">
                Ya puedes comer
              </p>
            ) : (
              <p className="mt-1 font-serif text-[21px] font-semibold text-[#292923]">
                Faltan {remaining?.hours ?? 0} h{" "}
                {remaining?.minutes ?? 0} min
              </p>
            )}
          </div>

          <span className="text-xl font-light text-[#A89E94]">
            ›
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EAE3DA]">
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

        <div className="mt-2 flex items-center justify-between text-[11px] text-[#91877D]">
          <span>
            {fastingHours} h
          </span>

          <span>
            {completed
              ? "Objetivo alcanzado"
              : `Termina a las ${formatTime(
                  activeFast.targetEndAt
                )}`}
          </span>
        </div>
      </Link>

      <div className="mt-3 border-t border-[#EAE3DA] pt-3">
        <button
          type="button"
          onClick={handleStopFast}
          className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold transition active:scale-[0.99] ${
            completed
              ? "bg-[#7A8B65] text-white"
              : "border border-[#E6CFC5] bg-[#FFF9F6] text-[#A34F34]"
          }`}
        >
          {completed
            ? "Finalizar ayuno"
            : "Terminar ayuno"}
        </button>
      </div>
    </section>
  );
}