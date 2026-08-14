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

import {
  cancelFastCompletedNotification,
  scheduleFastCompletedNotification,
} from "../../services/fastingNotificationService";

import {
  saveFastingHistory,
} from "../../services/fastingHistoryService";

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(
    0,
    Math.ceil(milliseconds / 1000 / 60)
  );

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
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

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const settings = useMemo(
    () => loadFastingSettings(),
    [activeFast]
  );

  useEffect(() => {
    if (!activeFast) return;

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

  async function handleStartNow() {
    try {
      setActionLoading(true);
      setActionError(null);

      const fast = startFast(fastingHours);

      setActiveFast(fast);
      setNow(new Date());

      try {
        await scheduleFastCompletedNotification(fast);
      } catch (error) {
        console.error(error);

        setActionError(
          "El ayuno ha empezado, pero no se pudo programar el aviso."
        );
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStopFast() {
    if (!activeFast) return;

    const confirmed = window.confirm(
      completed
        ? "¿Quieres finalizar este ayuno?"
        : "¿Quieres terminar el ayuno antes de tiempo?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionError(null);

      try {
        await saveFastingHistory(
          activeFast,
          new Date()
        );
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar este ayuno."
        );

        return;
      }

      window.dispatchEvent(
        new Event("fasting-history-updated")
      );

      try {
        await cancelFastCompletedNotification();
      } catch (error) {
        console.error(error);
      }

      stopFast();
      setActiveFast(null);
      setNow(new Date());
    } finally {
      setActionLoading(false);
    }
  }

  if (!activeFast) {
    return (
      <section className="mx-4 mb-3 overflow-hidden rounded-[20px] bg-[#FF8A62] shadow-[0_8px_22px_rgba(255,107,44,0.20)]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Link
            to="/fasting"
            className="min-w-0 flex-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              Ayuno
            </p>

            <p className="mt-0.5 font-serif text-[20px] font-semibold text-white">
              Hoy aún no has empezado
            </p>

            <p className="mt-0.5 text-xs text-white/75">
              Objetivo · {fastingHours} horas
            </p>
          </Link>

          <button
            type="button"
            onClick={handleStartNow}
            disabled={actionLoading}
            className="shrink-0 rounded-xl bg-[#2F542C] px-4 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
          >
            {actionLoading
              ? "..."
              : "Empezar"}
          </button>
        </div>

        {actionError && (
          <p className="bg-white/15 px-4 py-2 text-xs text-white">
            {actionError}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mx-4 mb-3 overflow-hidden rounded-[20px] bg-[#355B30] shadow-[0_10px_24px_rgba(47,84,44,0.24)]">
      <Link
        to="/fasting"
        className="block px-4 pb-3 pt-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#DDEFD4]">
              {completed
                ? "Ayuno completado"
                : "Ayuno en curso"}
            </p>

            {completed ? (
              <p className="mt-1 font-serif text-[27px] font-semibold text-white">
                Objetivo cumplido ✓
              </p>
            ) : (
              <p className="mt-1 font-serif text-[30px] font-semibold leading-none text-white">
                {remaining?.hours ?? 0}
                <span className="text-[16px] text-white/70"> h </span>
                {remaining?.minutes ?? 0}
                <span className="text-[16px] text-white/70"> min</span>
              </p>
            )}
          </div>

          <span className="rounded-full bg-[#FF6B2C] px-3 py-1.5 text-[11px] font-bold text-white">
            {completed
              ? "100%"
              : `${Math.round(progress * 100)}%`}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-[#F3C84B] transition-all duration-1000"
            style={{
              width: `${progress * 100}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[10px] font-semibold text-white/65">
          <span>
            Objetivo {fastingHours} h
          </span>

          <span>
            {completed
              ? "Completado"
              : `Hasta ${formatTime(activeFast.targetEndAt)}`}
          </span>
        </div>
      </Link>

      <div className="border-t border-white/10 px-4 py-2.5">
        <button
          type="button"
          onClick={handleStopFast}
          disabled={actionLoading}
          className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold disabled:opacity-50 ${
            completed
              ? "bg-[#F3C84B] text-[#304129]"
              : "bg-white/12 text-white"
          }`}
        >
          {actionLoading
            ? "Guardando..."
            : completed
            ? "Finalizar y guardar"
            : "Terminar antes"}
        </button>

        {actionError && (
          <p className="mt-2 text-xs text-[#FFD9CC]">
            {actionError}
          </p>
        )}
      </div>
    </section>
  );
}