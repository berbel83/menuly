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
      <div className="flex items-center gap-3 rounded-[18px] bg-[#F3C84B] px-3 py-3 shadow-[0_6px_18px_rgba(214,172,50,0.18)]">
        <button
          type="button"
          onClick={onPrevious}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#355B30] text-[22px] text-white"
        >
          ‹
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#7A5B08]">
            Plan semanal
          </p>

          <p className="truncate font-serif text-[18px] font-semibold text-[#423409]">
            {label}
          </p>

          <p className="text-[10px] font-bold text-[#7A5B08]">
            {plannedCount}/{totalCount} comidas
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#355B30] text-[22px] text-white"
        >
          ›
        </button>
      </div>

      {!isCurrentWeek && (
        <button
          type="button"
          onClick={onToday}
          className="mt-2 w-full text-center text-[10px] font-bold text-[#FF6B2C]"
        >
          Volver a esta semana
        </button>
      )}
    </section>
  );
}