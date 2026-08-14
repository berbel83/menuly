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
    <section className="px-5 pb-5">
      <div className="overflow-hidden rounded-[26px] bg-[#EAF0E5] shadow-[0_10px_28px_rgba(67,80,60,0.08)] ring-1 ring-[#DCE6D5]">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrevious}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#536B4A] text-[25px] font-light text-white shadow-[0_5px_14px_rgba(83,107,74,0.18)] transition active:scale-95"
              aria-label="Semana anterior"
            >
              ‹
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#738465]">
                Plan semanal
              </p>

              <h2 className="mt-1 truncate font-serif text-[23px] font-semibold tracking-[-0.03em] text-[#2D352B]">
                {label}
              </h2>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#536B4A] text-[25px] font-light text-white shadow-[0_5px_14px_rgba(83,107,74,0.18)] transition active:scale-95"
              aria-label="Semana siguiente"
            >
              ›
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-white/75 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B9682]">
                  Menús preparados
                </p>

                <p className="mt-1 font-serif text-[22px] font-semibold text-[#2F372D]">
                  {plannedCount} de {totalCount}
                </p>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F6E5DC] text-sm font-bold text-[#C45A32]">
                {progress}%
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#DCE4D7]">
              <div
                className="h-full rounded-full bg-[#E86632] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {!isCurrentWeek && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onToday}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#536B4A] shadow-sm transition active:scale-[0.98]"
              >
                Volver a esta semana
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}