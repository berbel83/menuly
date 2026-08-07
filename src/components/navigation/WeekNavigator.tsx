interface WeekNavigatorProps {
  label: string;
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNavigator({
  label,
  isCurrentWeek,
  onPrevious,
  onNext,
  onToday,
}: WeekNavigatorProps) {
  return (
    <section className="px-6 pb-4">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevious}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#DED5CA] bg-[#FFFDFC] text-[24px] font-light text-[#4A463F] transition hover:bg-[#F4EFE9]"
          aria-label="Semana anterior"
        >
          ‹
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9A8B7F]">
            Semana
          </p>

          <h2 className="mt-1 font-serif text-[21px] font-semibold leading-tight text-[#25251F]">
            {label}
          </h2>

          {!isCurrentWeek && (
            <button
              type="button"
              onClick={onToday}
              className="mt-2 text-xs font-semibold text-[#D96536] transition hover:text-[#B95029]"
            >
              Volver a esta semana
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#DED5CA] bg-[#FFFDFC] text-[24px] font-light text-[#4A463F] transition hover:bg-[#F4EFE9]"
          aria-label="Semana siguiente"
        >
          ›
        </button>
      </div>
    </section>
  );
}