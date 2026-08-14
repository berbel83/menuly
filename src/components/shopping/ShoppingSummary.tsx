interface ShoppingSummaryProps {
  itemCount: number;
  onClick: () => void;
}

export default function ShoppingSummary({
  itemCount,
  onClick,
}: ShoppingSummaryProps) {
  return (
    <section className="px-4 pb-5 pt-1">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-[18px] bg-[#FF6B2C] px-4 py-3.5 text-left shadow-[0_8px_20px_rgba(255,107,44,0.22)]"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18l-2 13H5L3 6Z" />
            <path d="M8 6a4 4 0 0 1 8 0" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/70">
            Compra
          </p>

          <h3 className="font-serif text-[19px] font-semibold text-white">
            Lista de la compra
          </h3>

          <p className="text-[10px] text-white/75">
            {itemCount === 0
              ? "Sin productos todavía"
              : `${itemCount} productos`}
          </p>
        </div>

        <div className="grid h-10 min-w-10 place-items-center rounded-full bg-[#F3C84B] px-2 text-sm font-bold text-[#554108]">
          {itemCount}
        </div>
      </button>
    </section>
  );
}