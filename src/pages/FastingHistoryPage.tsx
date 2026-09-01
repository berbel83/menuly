import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import {
  getMonday,
  loadFastingHistory,
  updateFastingHistoryEntry,
  type FastingHistoryEntry,
} from "../services/fastingProgressService";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours} h` : `${hours} h ${remaining} min`;
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "short",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit",
  });
}

function toDateTimeInput(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface HistoryWeek {
  key: string;
  monday: Date;
  entries: FastingHistoryEntry[];
  averageMinutes: number;
  completed: number;
}

function groupByWeek(history: FastingHistoryEntry[]): HistoryWeek[] {
  const groups = new Map<string, { monday: Date; entries: FastingHistoryEntry[] }>();

  for (const entry of history) {
    const monday = getMonday(new Date(entry.endedAt));
    const key = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
    const group = groups.get(key) ?? { monday, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      key,
      monday: group.monday,
      entries: group.entries.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()),
      averageMinutes: Math.round(group.entries.reduce((sum, entry) => sum + entry.actualMinutes, 0) / group.entries.length),
      completed: group.entries.filter((entry) => entry.completedTarget).length,
    }))
    .sort((a, b) => b.monday.getTime() - a.monday.getTime());
}

function weekTitle(monday: Date, index: number) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const currentMonday = getMonday(new Date());
  if (monday.getTime() === currentMonday.getTime()) return "Esta semana";

  const range = `${monday.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
  return index > 3 ? `${range} · ${sunday.getFullYear()}` : range;
}

export default function FastingHistoryPage() {
  const [history, setHistory] = useState<FastingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<FastingHistoryEntry | null>(null);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftTarget, setDraftTarget] = useState("16");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadFastingHistory()
      .then(setHistory)
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el historial."))
      .finally(() => setLoading(false));
  }, []);

  const weeks = useMemo(() => groupByWeek(history), [history]);

  function openEditor(entry: FastingHistoryEntry) {
    setEditing(entry);
    setDraftStart(toDateTimeInput(entry.startedAt));
    setDraftEnd(toDateTimeInput(entry.endedAt));
    setDraftTarget(String(entry.targetHours));
    setEditError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const startedAt = new Date(draftStart);
    const endedAt = new Date(draftEnd);
    const targetHours = Number(draftTarget);

    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
      setEditError("Indica fechas y horas válidas.");
      return;
    }
    if (endedAt <= startedAt) {
      setEditError("La finalización debe ser posterior al inicio.");
      return;
    }
    if (endedAt > new Date()) {
      setEditError("La finalización no puede estar en el futuro.");
      return;
    }
    if (!Number.isFinite(targetHours) || targetHours < 1 || targetHours > 48) {
      setEditError("El objetivo debe estar entre 1 y 48 horas.");
      return;
    }

    try {
      setSaving(true);
      setEditError(null);
      const updated = await updateFastingHistoryEntry(editing, startedAt, endedAt, targetHours);
      setHistory((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setEditing(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[var(--canvas)] pb-24 sm:min-h-[760px]">
        <header className="brand-hero px-5 pb-6 pt-5 text-white">
          <div className="flex items-center gap-3">
            <Link to="/fasting" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-[24px] font-light" aria-label="Volver">‹</Link>
            <div>
              <p className="eyebrow text-white/60">Tu progreso</p>
              <h1 className="font-serif text-[27px] font-semibold">Historial de ayuno</h1>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">Revisa cada semana y corrige cualquier hora que olvidaras registrar.</p>
        </header>

        <main className="px-4 py-5 sm:px-5">
          {loading ? (
            <div className="py-10 text-center text-sm text-[var(--muted)]">Cargando historial...</div>
          ) : errorMessage ? (
            <div className="alert-error">{errorMessage}</div>
          ) : weeks.length === 0 ? (
            <section className="surface-card p-5 text-center">
              <p className="font-serif text-xl font-semibold">Aún no hay ayunos registrados</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Cuando termines un ayuno aparecerá aquí.</p>
            </section>
          ) : (
            <div className="space-y-4">
              {weeks.map((week, index) => (
                <details key={week.key} open={index === 0} className="group overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_10px_28px_rgba(28,52,39,.06)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className="font-serif text-[19px] font-semibold text-[var(--ink)]">{weekTitle(week.monday, index)}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{week.entries.length} {week.entries.length === 1 ? "ayuno" : "ayunos"} · media {formatDuration(week.averageMinutes)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--sage-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--forest)]">{week.completed}/{week.entries.length} objetivos</span>
                      <span className="text-xl text-[var(--muted)] transition group-open:rotate-180">⌄</span>
                    </div>
                  </summary>

                  <div className="border-t border-[var(--line)]">
                    {week.entries.map((entry) => (
                      <article key={entry.id} className="border-b border-[var(--line)] px-4 py-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-serif text-[17px] font-semibold capitalize text-[var(--ink)]">{formatDay(entry.endedAt)}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">{formatTime(entry.startedAt)} → {formatTime(entry.endedAt)}</p>
                          </div>
                          <button type="button" onClick={() => openEditor(entry)} className="flex items-center gap-1.5 rounded-xl bg-[var(--sage-soft)] px-3 py-2 text-[11px] font-bold text-[var(--forest)]">
                            <span aria-hidden="true">✎</span> Editar
                          </button>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <p className="font-serif text-2xl font-semibold text-[var(--ink)]">{formatDuration(entry.actualMinutes)}</p>
                          <p className="text-xs text-[var(--muted)]">Objetivo {entry.targetHours} h {entry.completedTarget && <strong className="ml-1 text-[#60764C]">✓</strong>}</p>
                        </div>
                        {entry.pendingSync && <p className="mt-2 text-[11px] font-semibold text-[#A66A39]">Pendiente de sincronizar</p>}
                      </article>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </main>

        {editing && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="edit-fast-title" className="w-full max-w-md rounded-[26px] bg-[var(--surface)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div><p className="eyebrow text-[var(--coral)]">Corregir registro</p><h2 id="edit-fast-title" className="mt-1 font-serif text-2xl font-semibold">Editar ayuno</h2></div>
                <button type="button" onClick={() => setEditing(null)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--sage-soft)]">✕</button>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="text-xs font-bold text-[var(--ink-soft)]">Inicio<input type="datetime-local" value={draftStart} max={toDateTimeInput(new Date())} onChange={(event) => { setDraftStart(event.target.value); setEditError(null); }} className="mt-2 w-full rounded-2xl border border-[var(--line-strong)] bg-white px-4 py-3 text-base font-medium" /></label>
                <label className="text-xs font-bold text-[var(--ink-soft)]">Finalización<input type="datetime-local" value={draftEnd} max={toDateTimeInput(new Date())} onChange={(event) => { setDraftEnd(event.target.value); setEditError(null); }} className="mt-2 w-full rounded-2xl border border-[var(--line-strong)] bg-white px-4 py-3 text-base font-medium" /></label>
                <label className="text-xs font-bold text-[var(--ink-soft)]">Objetivo en horas<input type="number" min="1" max="48" step="0.5" value={draftTarget} onChange={(event) => { setDraftTarget(event.target.value); setEditError(null); }} className="mt-2 w-full rounded-2xl border border-[var(--line-strong)] bg-white px-4 py-3 text-base font-medium" /></label>
              </div>

              {editError && <p className="mt-3 text-sm font-medium text-[#A34F34]">{editError}</p>}
              <button type="button" onClick={() => void saveEdit()} disabled={saving} className="mt-5 w-full rounded-2xl bg-[var(--forest)] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
