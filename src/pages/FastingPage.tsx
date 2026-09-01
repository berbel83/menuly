import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

import {
  getFastProgress,
  getFastingHours,
  getRemainingMilliseconds,
  adjustActiveFastStart,
  loadActiveFast,
  loadFastingSettings,
  saveFastingSettings,
  startFast,
  stopFast,
  type ActiveFast,
  type FastingPreset,
  type FastingSettings,
} from "../services/fastingService";

import {
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  subscribeToPush,
} from "../services/notificationService";

import {
  cancelFastCompletedNotification,
  scheduleFastCompletedNotification,
} from "../services/fastingNotificationService";

import {
  saveFastingHistory,
} from "../services/fastingHistoryService";

import {
  cancelStartReminder,
  scheduleStartReminder,
} from "../services/startReminderService";

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

function toDateTimeInput(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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

function calculateEstimatedEnd(
  startTime: string,
  fastingHours: number
) {
  const [hours, minutes] =
    startTime.split(":").map(Number);

  const start = new Date();

  start.setHours(
    hours,
    minutes,
    0,
    0
  );

  const end = new Date(
    start.getTime() +
      fastingHours * 60 * 60 * 1000
  );

  const isNextDay =
    end.getDate() !==
    start.getDate();

  return {
    time: formatClock(end),
    isNextDay,
  };
}

type NotificationState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export default function FastingPage() {
  const [settings, setSettings] =
    useState<FastingSettings>(
      () => loadFastingSettings()
    );

  const [activeFast, setActiveFast] =
    useState<ActiveFast | null>(
      () => loadActiveFast()
    );

  const [now, setNow] =
    useState(new Date());

  const [
    notificationPermission,
    setNotificationPermission,
  ] = useState<NotificationState>(
    () => getNotificationPermission()
  );

  const [
    requestingNotifications,
    setRequestingNotifications,
  ] = useState(false);

  const [
    notificationError,
    setNotificationError,
  ] = useState<string | null>(
    null
  );

  const [
    fastingActionLoading,
    setFastingActionLoading,
  ] = useState(false);

  const [
    fastingActionError,
    setFastingActionError,
  ] = useState<string | null>(
    null
  );

  const [timeEditMode, setTimeEditMode] = useState<"start" | "finish" | null>(null);
  const [timeEditValue, setTimeEditValue] = useState("");
  const [timeEditError, setTimeEditError] = useState<string | null>(null);

  const [
    reminderActionLoading,
    setReminderActionLoading,
  ] = useState(false);

  const [
    reminderActionError,
    setReminderActionError,
  ] = useState<string | null>(
    null
  );

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

  const estimatedEnd =
    useMemo(
      () =>
        calculateEstimatedEnd(
          settings.startReminderTime,
          fastingHours
        ),
      [
        settings.startReminderTime,
        fastingHours,
      ]
    );

  const progress =
    useMemo(() => {
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

  function persistSettings(
    next: FastingSettings
  ) {
    setSettings(next);
    saveFastingSettings(next);
  }

  async function syncStartReminder(
    next: FastingSettings
  ) {
    if (
      !next.startReminderEnabled
    ) {
      return;
    }

    if (
      notificationPermission !==
      "granted"
    ) {
      setReminderActionError(
        "Activa primero las notificaciones para poder programar el aviso diario."
      );

      return;
    }

    try {
      setReminderActionLoading(
        true
      );

      setReminderActionError(
        null
      );

      await scheduleStartReminder(
        next.startReminderTime,
        getFastingHours(next)
      );
    } catch (error) {
      setReminderActionError(
        error instanceof Error
          ? error.message
          : "No se pudo programar el recordatorio."
      );
    } finally {
      setReminderActionLoading(
        false
      );
    }
  }

  async function updatePreset(
    preset: FastingPreset
  ) {
    const next: FastingSettings = {
      ...settings,
      preset,
    };

    persistSettings(next);

    if (
      next.startReminderEnabled
    ) {
      await syncStartReminder(
        next
      );
    }
  }

  async function updateCustomHours(
    hours: number
  ) {
    const safeHours =
      Math.min(
        Math.max(hours, 1),
        48
      );

    const next: FastingSettings = {
      ...settings,
      preset: "custom",
      customHours: safeHours,
    };

    persistSettings(next);

    if (
      next.startReminderEnabled
    ) {
      await syncStartReminder(
        next
      );
    }
  }

  async function updateReminderTime(
    value: string
  ) {
    const next: FastingSettings = {
      ...settings,
      startReminderTime: value,
    };

    persistSettings(next);

    if (
      next.startReminderEnabled
    ) {
      await syncStartReminder(
        next
      );
    }
  }

  async function toggleStartReminder() {
    setReminderActionError(
      null
    );

    if (
      settings.startReminderEnabled
    ) {
      const next: FastingSettings = {
        ...settings,
        startReminderEnabled:
          false,
      };

      persistSettings(next);

      try {
        setReminderActionLoading(
          true
        );

        await cancelStartReminder();
      } catch (error) {
        setReminderActionError(
          error instanceof Error
            ? error.message
            : "No se pudo cancelar el recordatorio."
        );
      } finally {
        setReminderActionLoading(
          false
        );
      }

      return;
    }

    if (
      notificationPermission !==
      "granted"
    ) {
      setReminderActionError(
        "Antes debes activar las notificaciones de Compausa."
      );

      return;
    }

    const next: FastingSettings = {
      ...settings,
      startReminderEnabled:
        true,
    };

    persistSettings(next);

    try {
      setReminderActionLoading(
        true
      );

      await scheduleStartReminder(
        next.startReminderTime,
        getFastingHours(next)
      );
    } catch (error) {
      const rollback: FastingSettings = {
        ...next,
        startReminderEnabled:
          false,
      };

      persistSettings(
        rollback
      );

      setReminderActionError(
        error instanceof Error
          ? error.message
          : "No se pudo activar el recordatorio."
      );
    } finally {
      setReminderActionLoading(
        false
      );
    }
  }

  async function handleEnableNotifications() {
    if (!notificationsSupported()) {
      setNotificationPermission(
        "unsupported"
      );

      return;
    }

    try {
      setRequestingNotifications(
        true
      );

      setNotificationError(null);

      const permission =
        await requestNotificationPermission();

      setNotificationPermission(
        permission
      );

      if (
        permission !== "granted"
      ) {
        return;
      }

      await subscribeToPush();
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "No se pudo activar las notificaciones."
      );
    } finally {
      setRequestingNotifications(
        false
      );
    }
  }

  async function handleStartFast() {
    try {
      setFastingActionLoading(
        true
      );

      setFastingActionError(
        null
      );

      const fast =
        startFast(
          fastingHours
        );

      setActiveFast(fast);
      setNow(new Date());

      try {
        await scheduleFastCompletedNotification(
          fast
        );
      } catch (error) {
        console.error(
          "No se pudo programar la notificación de finalización:",
          error
        );

        setFastingActionError(
          "El ayuno ha empezado, pero no se pudo programar el aviso de finalización."
        );
      }
    } finally {
      setFastingActionLoading(
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

    await finishFastAt(new Date());
  }

  async function finishFastAt(endedAt: Date) {
    if (!activeFast) return;

    try {
      setFastingActionLoading(
        true
      );

      setFastingActionError(
        null
      );

      try {
        const historyResult = await saveFastingHistory(
          activeFast,
          endedAt
        );

        if (!historyResult.synced) {
          setFastingActionError(
            "Ayuno guardado en este dispositivo. Se sincronizará cuando vuelva la conexión."
          );
        }
      } catch (error) {
        console.error(
          "No se pudo guardar el historial de ayuno:",
          error
        );

        setFastingActionError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar este ayuno en el historial."
        );

        return;
      }

      try {
        await cancelFastCompletedNotification();
      } catch (error) {
        console.error(
          "No se pudo cancelar la notificación pendiente:",
          error
        );
      }

      stopFast();
      setActiveFast(null);
      setNow(new Date());
      setTimeEditMode(null);
    } finally {
      setFastingActionLoading(
        false
      );
    }
  }

  function openTimeEditor(mode: "start" | "finish") {
    if (!activeFast) return;
    setTimeEditMode(mode);
    setTimeEditError(null);
    setTimeEditValue(
      toDateTimeInput(mode === "start" ? activeFast.startAt : new Date())
    );
  }

  async function saveAdjustedTime() {
    if (!activeFast) return;
    const selected = new Date(timeEditValue);
    const current = new Date();

    if (Number.isNaN(selected.getTime()) || selected > current) {
      setTimeEditError("Elige una fecha y hora válidas que no estén en el futuro.");
      return;
    }

    if (timeEditMode === "start") {
      const adjusted = adjustActiveFastStart(activeFast, selected);
      setActiveFast(adjusted);
      setNow(current);
      setTimeEditMode(null);
      try {
        await cancelFastCompletedNotification();
        await scheduleFastCompletedNotification(adjusted);
      } catch {
        setFastingActionError("La hora se corrigió, pero no se pudo actualizar el aviso de finalización.");
      }
      return;
    }

    if (selected <= new Date(activeFast.startAt)) {
      setTimeEditError("La finalización debe ser posterior al inicio del ayuno.");
      return;
    }

    await finishFastAt(selected);
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FBF8F3] pb-24 sm:min-h-[760px]">
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
              Compausa
            </p>

            <h1 className="font-serif text-[28px] font-semibold text-[#25251F]">
              Ayuno
            </h1>
          </div>
        </header>

        <main className="px-5 py-5">
          {notificationPermission !==
            "granted" && (
            <section className="mb-5 rounded-[22px] border border-[#DDE3D6] bg-[#F6F8F3] p-4">
              <p className="font-serif text-[18px] font-semibold text-[#30342D]">
                Avisos de ayuno
              </p>

              {notificationPermission ===
              "default" ? (
                <>
                  <p className="mt-1 text-xs leading-5 text-[#81766D]">
                    Activa las
                    notificaciones para
                    recibir los avisos de
                    inicio y fin del ayuno.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleEnableNotifications
                    }
                    disabled={
                      requestingNotifications
                    }
                    className="mt-3 rounded-xl bg-[#3F543E] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {requestingNotifications
                      ? "Activando..."
                      : "Activar notificaciones"}
                  </button>
                </>
              ) : (
                <p className="mt-1 text-xs text-[#81766D]">
                  Las notificaciones no
                  están disponibles o
                  están bloqueadas.
                </p>
              )}

              {notificationError && (
                <p className="mt-3 text-xs text-red-600">
                  {notificationError}
                </p>
              )}
            </section>
          )}

          {notificationPermission ===
            "granted" && (
            <div className="mb-5 rounded-xl bg-[#EEF3E9] px-3 py-2.5 text-xs font-semibold text-[#667956]">
              ✓ Notificaciones activadas
            </div>
          )}

          {!activeFast ? (
            <>
              <section className="rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A19589]">
                  Tu protocolo
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-semibold">
                  ¿Cuánto quieres ayunar?
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    "14:10",
                    "16:8",
                    "18:6",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        updatePreset(
                          preset as FastingPreset
                        )
                      }
                      className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
                        settings.preset ===
                        preset
                          ? "bg-[#E86632] text-white"
                          : "border border-[#E2D9CF] bg-[#FBF8F3] text-[#6F675F]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-[#E2D9CF] bg-[#FBF8F3] p-4">
                  <p className="text-sm font-semibold">
                    Duración personalizada
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateCustomHours(
                          fastingHours - 1
                        )
                      }
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#DED5CA] bg-white text-xl text-[#5E574F]"
                    >
                      −
                    </button>

                    <div className="text-center">
                      <span className="font-serif text-[30px] font-semibold">
                        {fastingHours}
                      </span>

                      <span className="ml-1 text-sm text-[#92877D]">
                        horas
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateCustomHours(
                          fastingHours + 1
                        )
                      }
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#DED5CA] bg-white text-xl text-[#5E574F]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-[24px] border border-[#DDE3D6] bg-[#F6F8F3] p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A8B65]">
                    Recordatorio diario
                  </p>

                  <h3 className="mt-1 font-serif text-[22px] font-semibold text-[#30342D]">
                    ¿A qué hora sueles empezar?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#92877D]">
                    Elige primero tu hora habitual.
                    Después puedes activar el aviso diario.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-[#FFFDFC] px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#39362F]">
                        Hora habitual
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#92877D]">
                        Esta hora no inicia el ayuno automáticamente.
                      </p>
                    </div>

                    <input
                      type="time"
                      value={
                        settings.startReminderTime
                      }
                      onChange={(event) =>
                        updateReminderTime(
                          event.target.value
                        )
                      }
                      disabled={
                        reminderActionLoading
                      }
                      className="shrink-0 rounded-xl border border-[#DED5CA] bg-white px-3 py-2 text-[17px] font-semibold text-[#2D2A26] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#EAF0E5] px-4 py-4">
                  <p className="text-xs leading-5 text-[#728064]">
                    Si empezaras a las{" "}
                    <strong>
                      {
                        settings.startReminderTime
                      }
                    </strong>{" "}
                    y haces{" "}
                    <strong>
                      {fastingHours} h
                    </strong>
                    , terminarías aproximadamente{" "}
                    {estimatedEnd.isNextDay &&
                      "mañana "}
                    a las{" "}
                    <strong>
                      {
                        estimatedEnd.time
                      }
                    </strong>
                    .
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#DDE3D6] bg-white px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#39362F]">
                      Avísame cada día a esta hora
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#92877D]">
                      {settings.startReminderEnabled
                        ? `Recordatorio activo a las ${settings.startReminderTime}.`
                        : "Recibirás una notificación para decidir si empiezas."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      toggleStartReminder
                    }
                    disabled={
                      reminderActionLoading
                    }
                    aria-label={
                      settings.startReminderEnabled
                        ? "Desactivar recordatorio diario"
                        : "Activar recordatorio diario"
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
                      settings.startReminderEnabled
                        ? "bg-[#7A8B65]"
                        : "bg-[#D6D0C8]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        settings.startReminderEnabled
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {settings.startReminderEnabled &&
                  !reminderActionLoading &&
                  !reminderActionError && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#E7EFE0] px-3 py-2.5 text-xs font-semibold text-[#60764C]">
                      <span>✓</span>

                      <span>
                        Recordatorio diario activo ·{" "}
                        {settings.startReminderTime}
                      </span>
                    </div>
                  )}

                {reminderActionLoading && (
                  <p className="mt-3 text-xs font-medium text-[#728064]">
                    Guardando recordatorio...
                  </p>
                )}

                {reminderActionError && (
                  <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-600">
                    {reminderActionError}
                  </p>
                )}
              </section>

              <section className="mt-5 rounded-[24px] bg-[#2F312B] p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Inicio real
                </p>

                <h2 className="mt-2 font-serif text-[27px] font-semibold">
                  Empieza cuando estés listo
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  La hora programada solo
                  sirve como recordatorio.
                  El contador comenzará
                  cuando pulses este botón.
                </p>

                <button
                  type="button"
                  onClick={
                    handleStartFast
                  }
                  disabled={
                    fastingActionLoading
                  }
                  className="mt-5 w-full rounded-2xl bg-[#E86632] px-4 py-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  {fastingActionLoading
                    ? "Empezando..."
                    : "Empezar a ayunar ahora"}
                </button>

                {fastingActionError && (
                  <p className="mt-3 text-xs text-[#FFD8CC]">
                    {fastingActionError}
                  </p>
                )}
              </section>
            </>
          ) : (
            <>
              <section
                className={`rounded-[28px] border p-5 ${
                  completed
                    ? "border-[#C9D4BC] bg-[#F6F9F2]"
                    : "border-[#E3D9CE] bg-[#FFFDFC]"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                    completed
                      ? "text-[#6F845A]"
                      : "text-[#E86632]"
                  }`}
                >
                  {completed
                    ? "Ayuno completado"
                    : "Ayunando"}
                </p>

                <h2 className="mt-2 font-serif text-[31px] font-semibold">
                  {activeFast.fastingHours} horas
                </h2>

                <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#EAE3DA]">
                  <div
                    className={`h-full rounded-full ${
                      completed
                        ? "bg-[#7A8B65]"
                        : "bg-[#E86632]"
                    }`}
                    style={{
                      width: `${progress * 100}%`,
                    }}
                  />
                </div>

                {!completed ? (
                  <div className="mt-7 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A19589]">
                      Tiempo restante
                    </p>

                    <p className="mt-2 font-serif text-[46px] font-semibold">
                      {remaining.hours}
                      <span className="text-[20px]">
                        h
                      </span>{" "}
                      {remaining.minutes}
                      <span className="text-[20px]">
                        m
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-7 rounded-2xl bg-[#E7EFE0] px-4 py-4 text-center">
                    <p className="font-serif text-[23px] font-semibold text-[#536647]">
                      Ya puedes comer
                    </p>
                  </div>
                )}

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F5F0E9] px-4 py-4">
                    <p className="text-[10px] uppercase text-[#9B9085]">
                      Empezaste
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatDateTime(
                        activeFast.startAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F0E9] px-4 py-4">
                    <p className="text-[10px] uppercase text-[#9B9085]">
                      Objetivo
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatDateTime(
                        activeFast.targetEndAt
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openTimeEditor("start")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8DED4] bg-white/70 px-3 py-2.5 text-xs font-bold text-[var(--forest)]"
                >
                  <span aria-hidden="true">✎</span>
                  Corregir hora de inicio
                </button>
              </section>

              <button
                type="button"
                onClick={
                  handleStopFast
                }
                disabled={
                  fastingActionLoading
                }
                className={`mt-5 w-full rounded-2xl px-4 py-4 text-sm font-semibold disabled:opacity-50 ${
                  completed
                    ? "bg-[#7A8B65] text-white"
                    : "border border-[#E6CFC5] bg-[#FFF9F6] text-[#A34F34]"
                }`}
              >
                {fastingActionLoading
                  ? "Procesando..."
                  : completed
                  ? "Finalizar ayuno"
                  : "Terminar ayuno antes"}
              </button>

              <button
                type="button"
                onClick={() => openTimeEditor("finish")}
                disabled={fastingActionLoading}
                className="mt-2 w-full rounded-2xl px-4 py-3 text-xs font-bold text-[#776D64] underline decoration-[#C9BCAF] underline-offset-4 disabled:opacity-50"
              >
                Se me olvidó pararlo: indicar otra hora
              </button>
            </>
          )}
        </main>

        {timeEditMode && activeFast && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setTimeEditMode(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="fast-time-title" className="w-full max-w-md rounded-[26px] bg-[var(--surface)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--coral)]">Corregir ayuno</p>
                  <h2 id="fast-time-title" className="mt-1 font-serif text-2xl font-semibold text-[var(--ink)]">
                    {timeEditMode === "start" ? "¿Cuándo empezaste?" : "¿Cuándo terminaste?"}
                  </h2>
                </div>
                <button type="button" onClick={() => setTimeEditMode(null)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--sage-soft)] text-[var(--forest)]">✕</button>
              </div>

              <label className="mt-5 block text-xs font-bold text-[var(--ink-soft)]">
                Día y hora
                <input
                  type="datetime-local"
                  value={timeEditValue}
                  max={toDateTimeInput(new Date())}
                  onChange={(event) => { setTimeEditValue(event.target.value); setTimeEditError(null); }}
                  className="mt-2 w-full rounded-2xl border border-[var(--line-strong)] bg-white px-4 py-3 text-base text-[var(--ink)] outline-none focus:border-[var(--coral)]"
                />
              </label>

              {timeEditError && <p className="mt-3 text-sm font-medium text-[#A34F34]">{timeEditError}</p>}

              <button type="button" onClick={() => void saveAdjustedTime()} disabled={fastingActionLoading} className="mt-5 w-full rounded-2xl bg-[var(--forest)] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50">
                {timeEditMode === "start" ? "Guardar hora de inicio" : "Finalizar ayuno a esta hora"}
              </button>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
