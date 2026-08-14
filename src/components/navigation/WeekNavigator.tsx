interface WeekNavigatorProps {
  label: string;
  plannedCount: number;
  totalCount?: number;
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNavigator({
  label,
  plannedCount,
  totalCount = 7,
  isCurrentWeek,
  onPrevious,
  onNext,
  onToday,
}: WeekNavigatorProps) {
  return (
    <section className="px-4 pb-3">
      <div className="flex items-center gap-3 rounded-[16px] bg-white px-3 py-3 shadow-[0_6px_18px_rgba(42,60,44,0.06)] ring-1 ring-[#DCE4D8]">
        <button type="button" onClick={onPrevious} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3F6248] text-[22px] text-white" aria-label="Semana anterior">‹</button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#EF704B]">Plan semanal</p>
          <p className="truncate font-serif text-[18px] font-semibold text-[#243025]">{label}</p>
          <p className="text-[10px] font-bold text-[#7B8278]">{plannedCount}/{totalCount} comidas</p>
        </div>

        <button type="button" onClick={onNext} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3F6248] text-[22px] text-white" aria-label="Semana siguiente">›</button>
      </div>

      {!isCurrentWeek && (
        <button type="button" onClick={onToday} className="mt-2 w-full text-center text-[10px] font-bold text-[#EF704B]">
          Volver a esta semana
        </button>
      )}
    </section>
  );
}
