export type FastingPreset =
  | "14:10"
  | "16:8"
  | "18:6"
  | "custom";

export interface ActiveFast {
  startAt: string;
  targetEndAt: string;
  fastingHours: number;
}

export interface FastingSettings {
  preset: FastingPreset;
  customHours: number;

  // Recordatorio habitual de inicio
  startReminderEnabled: boolean;
  startReminderTime: string;
}

const ACTIVE_FAST_KEY =
  "menuly_active_fast";

const FASTING_SETTINGS_KEY =
  "menuly_fasting_settings";

export const DEFAULT_FASTING_SETTINGS: FastingSettings = {
  preset: "16:8",
  customHours: 16,

  startReminderEnabled: false,
  startReminderTime: "20:30",
};

export function getFastingHours(
  settings: FastingSettings
) {
  switch (settings.preset) {
    case "14:10":
      return 14;

    case "16:8":
      return 16;

    case "18:6":
      return 18;

    case "custom":
      return settings.customHours;

    default:
      return 16;
  }
}

export function loadFastingSettings(): FastingSettings {
  try {
    const stored = localStorage.getItem(
      FASTING_SETTINGS_KEY
    );

    if (!stored) {
      return DEFAULT_FASTING_SETTINGS;
    }

    const parsed = JSON.parse(
      stored
    ) as Partial<FastingSettings>;

    return {
      preset:
        parsed.preset ??
        DEFAULT_FASTING_SETTINGS.preset,

      customHours:
        parsed.customHours ??
        DEFAULT_FASTING_SETTINGS.customHours,

      startReminderEnabled:
        parsed.startReminderEnabled ??
        DEFAULT_FASTING_SETTINGS.startReminderEnabled,

      startReminderTime:
        parsed.startReminderTime ??
        DEFAULT_FASTING_SETTINGS.startReminderTime,
    };
  } catch {
    return DEFAULT_FASTING_SETTINGS;
  }
}

export function saveFastingSettings(
  settings: FastingSettings
) {
  localStorage.setItem(
    FASTING_SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

export function loadActiveFast(): ActiveFast | null {
  try {
    const stored = localStorage.getItem(
      ACTIVE_FAST_KEY
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(
      stored
    ) as ActiveFast;
  } catch {
    return null;
  }
}

export function startFast(
  fastingHours: number
): ActiveFast {
  const start = new Date();

  const targetEnd = new Date(
    start.getTime() +
      fastingHours * 60 * 60 * 1000
  );

  const activeFast: ActiveFast = {
    startAt: start.toISOString(),
    targetEndAt:
      targetEnd.toISOString(),
    fastingHours,
  };

  localStorage.setItem(
    ACTIVE_FAST_KEY,
    JSON.stringify(activeFast)
  );

  return activeFast;
}

export function stopFast() {
  localStorage.removeItem(
    ACTIVE_FAST_KEY
  );
}

export function getFastProgress(
  fast: ActiveFast,
  now = new Date()
) {
  const start =
    new Date(fast.startAt).getTime();

  const end =
    new Date(
      fast.targetEndAt
    ).getTime();

  const current =
    now.getTime();

  const total =
    end - start;

  const elapsed =
    current - start;

  if (total <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(
      elapsed / total,
      0
    ),
    1
  );
}

export function getRemainingMilliseconds(
  fast: ActiveFast,
  now = new Date()
) {
  const end =
    new Date(
      fast.targetEndAt
    ).getTime();

  return Math.max(
    end - now.getTime(),
    0
  );
}