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
        onClick={
          onClick
        }
        className="flex w-full items-center gap-3 rounded-[16px] bg-[#3F6248] px-4 py-3.5 text-left shadow-[0_8px_20px_rgba(63,98,72,0.18)] transition active:scale-[0.995]"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18l-2 13H5L3 6Z" />
            <path d="M8 6a4 4 0 0 1 8 0" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/60">
            Compra
          </p>

          <h3 className="font-serif text-[19px] font-semibold text-white">
            Lista de la compra
          </h3>

          <p className="text-[10px] text-white/70">
            {itemCount === 0
              ? "Sin productos todavía"
              : `${itemCount} ${
                  itemCount === 1
                    ? "producto"
                    : "productos"
                }`}
          </p>
        </div>

        <div className="grid h-10 min-w-10 place-items-center rounded-full bg-[#E97857] px-2 text-sm font-bold text-white">
          {itemCount}
        </div>
      </button>
    </section>
  );
}