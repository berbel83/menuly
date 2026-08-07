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
  const progress = Math.round(
    (plannedCount / totalCount) * 100
  );

  return (
    <section className="px-5 pb-4">
      <div className="rounded-[20px] border border-[#E4DBD1] bg-[#FFFDFC] px-4 py-4 shadow-[0_5px_18px_rgba(74,56,40,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevious}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4EEE7] text-[24px] font-light text-[#5E574F] transition active:scale-95"
            aria-label="Semana anterior"
          >
            ‹
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A19589]">
              Esta semana
            </p>

            <h2 className="mt-1 truncate font-serif text-[22px] font-semibold tracking-[-0.025em] text-[#272720]">
              {label}
            </h2>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4EEE7] text-[24px] font-light text-[#5E574F] transition active:scale-95"
            aria-label="Semana siguiente"
          >
            ›
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ECE5DC]">
            <div
              className="h-full rounded-full bg-[#D96536] transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span className="shrink-0 text-xs font-semibold text-[#6F675F]">
            {plannedCount}/{totalCount}
          </span>
        </div>

        {!isCurrentWeek && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onToday}
              className="text-xs font-semibold text-[#D96536] transition hover:text-[#B95029]"
            >
              Volver a esta semana
            </button>
          </div>
        )}
      </div>
    </section>
  );
}