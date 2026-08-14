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

function formatTime(value: string) {
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

export default function FastingSummary() {
  const [
    activeFast,
    setActiveFast,
  ] =
    useState<ActiveFast | null>(
      () => loadActiveFast()
    );

  const [
    now,
    setNow,
  ] =
    useState(
      () => new Date()
    );

  const [
    actionError,
    setActionError,
  ] =
    useState<string | null>(
      null
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const settings =
    useMemo(
      () =>
        loadFastingSettings(),
      [activeFast]
    );

  useEffect(() => {
    if (!activeFast) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setNow(
          new Date()
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [activeFast]);

  const fastingHours =
    activeFast
      ? activeFast.fastingHours
      : getFastingHours(
          settings
        );

  const progress =
    activeFast
      ? getFastProgress(
          activeFast,
          now
        )
      : 0;

  const remaining =
    activeFast
      ? formatRemaining(
          getRemainingMilliseconds(
            activeFast,
            now
          )
        )
      : null;

  const completed =
    activeFast !== null &&
    new Date(
      activeFast.targetEndAt
    ).getTime() <=
      now.getTime();

  async function handleStartNow() {
    try {
      setActionLoading(
        true
      );

      setActionError(
        null
      );

      const fast =
        startFast(
          fastingHours
        );

      setActiveFast(
        fast
      );

      setNow(
        new Date()
      );

      try {
        await scheduleFastCompletedNotification(
          fast
        );
      } catch (error) {
        console.error(
          "No se pudo programar la notificación de fin de ayuno:",
          error
        );

        setActionError(
          "El ayuno ha empezado, pero no se pudo programar el aviso de finalización."
        );
      }
    } finally {
      setActionLoading(
        false
      );
    }
  }

  async function handleStopFast() {
    if (!activeFast) {
      return;
    }

    const confirmed =
      window.confirm(
        completed
          ? "¿Quieres finalizar este ayuno?"
          : "¿Quieres terminar el ayuno antes de tiempo?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        true
      );

      setActionError(
        null
      );

      const endedAt =
        new Date();

      try {
        await saveFastingHistory(
          activeFast,
          endedAt
        );
      } catch (error) {
        console.error(
          "No se pudo guardar el historial de ayuno:",
          error
        );

        setActionError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar este ayuno en el historial."
        );

        return;
      }

      window.dispatchEvent(
        new Event(
          "fasting-history-updated"
        )
      );

      try {
        await cancelFastCompletedNotification();
      } catch (error) {
        console.error(
          "No se pudo cancelar la notificación pendiente:",
          error
        );
      }

      stopFast();

      setActiveFast(
        null
      );

      setNow(
        new Date()
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  if (!activeFast) {
    return (
      <section className="mx-5 mb-5 overflow-hidden rounded-[26px] bg-[#F5E5DC] shadow-[0_12px_30px_rgba(84,65,48,0.08)]">
        <div className="px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/fasting"
              className="min-w-0 flex-1"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E86632] text-white">
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
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B85B36]">
                  Ayuno
                </span>
              </div>

              <p className="mt-3 font-serif text-[23px] font-semibold tracking-[-0.03em] text-[#2F332C]">
                Hoy todavía no has empezado
              </p>

              <p className="mt-1 text-sm leading-6 text-[#85776C]">
                Tu objetivo actual es de{" "}
                <strong className="text-[#536B4A]">
                  {fastingHours} horas
                </strong>
                .
              </p>
            </Link>

            <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#536B4A] shadow-sm">
              {fastingHours} h
            </span>
          </div>

          <button
            type="button"
            onClick={
              handleStartNow
            }
            disabled={
              actionLoading
            }
            className="mt-5 w-full rounded-2xl bg-[#E86632] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,102,50,0.22)] transition active:scale-[0.99] disabled:opacity-50"
          >
            {actionLoading
              ? "Empezando..."
              : "Empezar ayuno ahora"}
          </button>

          {actionError && (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-5 text-red-600">
              {actionError}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`mx-5 mb-5 overflow-hidden rounded-[28px] shadow-[0_14px_34px_rgba(52,67,45,0.18)] ${
        completed
          ? "bg-[#536B4A]"
          : "bg-[#3F5738]"
      }`}
    >
      <div className="relative px-5 py-5">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-[#E86632]/10" />

        <Link
          to="/fasting"
          className="relative block"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[#F6DFD2]">
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
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>

                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#EBDCCF]">
                  {completed
                    ? "Ayuno completado"
                    : "Ayuno en curso"}
                </p>
              </div>

              {completed ? (
                <>
                  <p className="mt-4 font-serif text-[32px] font-semibold leading-none tracking-[-0.04em] text-white">
                    Objetivo cumplido
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    Ya puedes finalizar y guardar tu sesión.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Tiempo restante
                  </p>

                  <div className="mt-1 flex items-end gap-2 text-white">
                    <span className="font-serif text-[48px] font-semibold leading-none tracking-[-0.05em]">
                      {remaining?.hours ?? 0}
                    </span>

                    <span className="mb-1 text-[18px] font-semibold text-white/75">
                      h
                    </span>

                    <span className="font-serif text-[48px] font-semibold leading-none tracking-[-0.05em]">
                      {remaining?.minutes ?? 0}
                    </span>

                    <span className="mb-1 text-[18px] font-semibold text-white/75">
                      min
                    </span>
                  </div>
                </>
              )}
            </div>

            <span className="rounded-full bg-[#E86632] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_5px_14px_rgba(232,102,50,0.25)]">
              {completed
                ? "✓"
                : `${Math.round(
                    progress * 100
                  )}%`}
            </span>
          </div>

          <div className="mt-6">
            <div className="h-2.5 overflow-hidden rounded-full bg-black/15">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  completed
                    ? "bg-[#F3C969]"
                    : "bg-[#E86632]"
                }`}
                style={{
                  width: `${progress * 100}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Objetivo
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {fastingHours} h
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  {completed
                    ? "Estado"
                    : "Finalización"}
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {completed
                    ? "Completado"
                    : formatTime(
                        activeFast.targetEndAt
                      )}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="relative mt-5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={
              handleStopFast
            }
            disabled={
              actionLoading
            }
            className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.99] disabled:opacity-50 ${
              completed
                ? "bg-[#F3C969] text-[#34412E]"
                : "bg-white/10 text-white ring-1 ring-white/15"
            }`}
          >
            {actionLoading
              ? "Guardando..."
              : completed
              ? "Finalizar y guardar ayuno"
              : "Terminar ayuno antes"}
          </button>

          {actionError && (
            <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs leading-5 text-[#FFD9CC]">
              {actionError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}