interface HeaderProps {
  plannedCount: number;
  totalCount?: number;
  dateLabel?: string;
  onOpenShopping?: () => void;
}

export default function Header({
  plannedCount,
  totalCount = 7,
  dateLabel = "Semana del 10 al 16 agosto",
  onOpenShopping,
}: HeaderProps) {
  const progress = Math.round((plannedCount / totalCount) * 100);

  return (
    <header className="px-6 pb-4 pt-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#D96536] text-[28px] font-medium text-white">
            M
          </div>

          <h1 className="font-serif text-[34px] font-semibold tracking-[-0.03em] text-[#20251F]">
            menuly
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenShopping}
          className="grid h-12 w-12 place-items-center rounded-full border border-[#DED5CA] bg-[#FFFDFC] text-xl text-[#2E332C] shadow-[0_3px_10px_rgba(70,55,40,0.05)] transition hover:bg-[#F5F0EA]"
          aria-label="Abrir lista de la compra"
        >
          🛒
        </button>
      </div>

      <div className="mt-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#9A8B7F]">
          Semana actual
        </p>

        <h2 className="mt-1 font-serif text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#22231F]">
          {dateLabel}
        </h2>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E9E1D7]">
          <div
            className="h-full rounded-full bg-[#D96536] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <p className="font-serif text-[26px] leading-none text-[#272822]">
            <span className="text-[40px] font-medium text-[#D96536]">
              {plannedCount}
            </span>{" "}
            de {totalCount} comidas listas
          </p>

          <span className="text-[16px] font-medium text-[#9A8D82]">
            {progress}%
          </span>
        </div>
      </div>
    </header>
  );
}