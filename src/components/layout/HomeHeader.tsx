import { Link } from "react-router-dom";

interface HomeHeaderProps {
  houseName: string;
  shoppingCount: number;
  onOpenShopping: () => void;
}

export default function HomeHeader({
  houseName,
  shoppingCount,
  onOpenShopping,
}: HomeHeaderProps) {
  return (
    <header className="px-5 pb-3 pt-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D96536] font-serif text-lg font-semibold text-white">
              M
            </div>

            <div className="min-w-0">
              <p className="font-serif text-[21px] font-semibold leading-none tracking-[-0.03em] text-[#25251F]">
                menuly
              </p>

              <p className="mt-1 truncate text-[11px] font-medium text-[#92877D]">
                {houseName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenShopping}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-[#E2D9CF] bg-[#FFFDFC] text-[#655E57] transition active:scale-95"
            aria-label="Lista de la compra"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="19" cy="20" r="1" />
              <path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>

            {shoppingCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#D96536] px-1 text-[10px] font-bold text-white">
                {shoppingCount > 99 ? "99+" : shoppingCount}
              </span>
            )}
          </button>

          <Link
            to="/settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#E2D9CF] bg-[#FFFDFC] text-[#655E57] transition active:scale-95"
            aria-label="Ajustes"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.35.71.6 1 .3.31.7.5 1.1.5H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}