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
  "compausa_active_fast";

const FASTING_SETTINGS_KEY =
  "compausa_fasting_settings";

const LEGACY_ACTIVE_FAST_KEY = "menuly_active_fast";
const LEGACY_SETTINGS_KEY = "menuly_fasting_settings";

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
    const stored = localStorage.getItem(FASTING_SETTINGS_KEY) ?? localStorage.getItem(LEGACY_SETTINGS_KEY);

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
  void syncFastingStateToCloud(settings, loadActiveFast());
}

export function loadActiveFast(): ActiveFast | null {
  try {
    const stored = localStorage.getItem(ACTIVE_FAST_KEY) ?? localStorage.getItem(LEGACY_ACTIVE_FAST_KEY);

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
  void syncFastingStateToCloud(loadFastingSettings(), activeFast);

  return activeFast;
}

export function adjustActiveFastStart(
  fast: ActiveFast,
  startedAt: Date
): ActiveFast {
  const targetEnd = new Date(
    startedAt.getTime() + fast.fastingHours * 60 * 60 * 1000
  );

  const adjustedFast: ActiveFast = {
    ...fast,
    startAt: startedAt.toISOString(),
    targetEndAt: targetEnd.toISOString(),
  };

  localStorage.setItem(ACTIVE_FAST_KEY, JSON.stringify(adjustedFast));
  localStorage.removeItem(LEGACY_ACTIVE_FAST_KEY);
  void syncFastingStateToCloud(loadFastingSettings(), adjustedFast);

  return adjustedFast;
}

export function stopFast() {
  localStorage.removeItem(
    ACTIVE_FAST_KEY
  );
  localStorage.removeItem(LEGACY_ACTIVE_FAST_KEY);
  void syncFastingStateToCloud(loadFastingSettings(), null);
}

async function syncFastingStateToCloud(settings: FastingSettings, activeFast: ActiveFast | null) {
  try {
    const { supabase } = await import("../lib/supabase");
    const { getAuthenticatedUserId } = await import("./authService");
    const userId = await getAuthenticatedUserId();
    await supabase.from("user_fasting_state").upsert({
      user_id: userId, settings, active_fast: activeFast,
      updated_at: new Date().toISOString(),
    });
  } catch { /* El estado local sigue siendo la copia inmediata. */ }
}

export async function hydrateFastingStateFromCloud() {
  try {
    const { supabase } = await import("../lib/supabase");
    const { getAuthenticatedUserId } = await import("./authService");
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase.from("user_fasting_state")
      .select("settings,active_fast").eq("user_id", userId).maybeSingle();
    if (error) return;
    if (data?.settings) localStorage.setItem(FASTING_SETTINGS_KEY, JSON.stringify(data.settings));
    if (data?.active_fast) localStorage.setItem(ACTIVE_FAST_KEY, JSON.stringify(data.active_fast));
    else if (data) localStorage.removeItem(ACTIVE_FAST_KEY);
    if (!data) await syncFastingStateToCloud(loadFastingSettings(), loadActiveFast());
  } catch { /* Sin conexión: se conserva el estado local. */ }
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
