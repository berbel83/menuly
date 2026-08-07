interface ShoppingSummaryProps {
  itemCount: number;
  onClick: () => void;
}

export default function ShoppingSummary({
  itemCount,
  onClick,
}: ShoppingSummaryProps) {
  return (
    <section className="px-6 pb-6 pt-4">
      <button
        type="button"
        onClick={onClick}
        className="
          flex
          w-full
          items-center
          gap-4
          rounded-[22px]
          border
          border-[#E3D8CD]
          bg-[#FFF8F1]
          px-4
          py-4
          text-left
          shadow-[0_8px_24px_rgba(95,67,43,0.05)]
          transition
          hover:-translate-y-[1px]
          hover:shadow-[0_12px_28px_rgba(95,67,43,0.08)]
        "
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#D96536] shadow-[0_3px_10px_rgba(95,67,43,0.06)]">
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18l-2 13H5L3 6Z" />
            <path d="M8 6a4 4 0 0 1 8 0" />
            <path d="M8 10v5" />
            <path d="M12 10v5" />
            <path d="M16 10v5" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D96536]">
            Compra
          </p>

          <h3 className="mt-0.5 font-serif text-[21px] font-semibold leading-tight text-[#25251F]">
            Lista de la compra
          </h3>

          <p className="mt-1 text-[13px] text-[#81766D]">
            {itemCount === 0
              ? "Sin productos todavía"
              : `${itemCount} productos esta semana`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="grid h-11 min-w-11 place-items-center rounded-full bg-[#D96536] px-3 text-[16px] font-semibold text-white">
            {itemCount}
          </div>

          <span className="text-[30px] font-light leading-none text-[#B56A48]">
            ›
          </span>
        </div>
      </button>
    </section>
  );
}