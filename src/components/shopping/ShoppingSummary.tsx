interface ShoppingSummaryProps {
  itemCount: number;
  onClick: () => void;
}

export default function ShoppingSummary({
  itemCount,
  onClick,
}: ShoppingSummaryProps) {
  const hasItems =
    itemCount > 0;

  return (
    <section className="px-5 pb-6 pt-1">
      <button
        type="button"
        onClick={onClick}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-[26px]
          bg-[#536B4A]
          px-5
          py-5
          text-left
          shadow-[0_14px_32px_rgba(73,91,64,0.18)]
          transition
          active:scale-[0.99]
        "
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/5" />

        <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-[#E86632]/10" />

        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white/12 text-[#F8E8DF] ring-1 ring-white/10">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D8E6D2]">
              Compra
            </p>

            <h3 className="mt-1 font-serif text-[23px] font-semibold leading-tight tracking-[-0.03em] text-white">
              Lista de la compra
            </h3>

            <p className="mt-1.5 text-[13px] leading-5 text-white/65">
              {hasItems
                ? `${itemCount} ${
                    itemCount === 1
                      ? "producto preparado"
                      : "productos preparados"
                  } esta semana`
                : "Cuando planifiques comidas, aparecerán aquí los ingredientes."}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2">
            <div
              className={`grid h-12 min-w-12 place-items-center rounded-full px-3 text-[17px] font-bold shadow-[0_6px_16px_rgba(0,0,0,0.12)] ${
                hasItems
                  ? "bg-[#E86632] text-white"
                  : "bg-white/12 text-white/65"
              }`}
            >
              {itemCount}
            </div>

            <span className="text-[25px] font-light leading-none text-white/55 transition group-active:translate-x-0.5">
              ›
            </span>
          </div>
        </div>

        {hasItems && (
          <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F3C969]" />

              <span className="text-[11px] font-semibold text-white/70">
                Lista lista para revisar
              </span>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/80">
              Ver compra
            </span>
          </div>
        )}
      </button>
    </section>
  );
}