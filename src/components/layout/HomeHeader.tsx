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
    <header className="px-5 pb-5 pt-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-white shadow-[0_8px_25px_rgba(65,55,45,0.10)] ring-1 ring-[#E9E1D8]">
            <img
              src="/pwa-192x192.png"
              alt="Compausa"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-serif text-[26px] font-semibold leading-none tracking-[-0.04em] text-[#273126]">
              Compausa
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E86632]" />

              <p className="truncate text-[12px] font-semibold text-[#8A7E73]">
                {houseName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenShopping}
            className="relative grid h-11 w-11 place-items-center rounded-[15px] bg-white text-[#536B4A] shadow-[0_6px_20px_rgba(70,60,50,0.08)] ring-1 ring-[#E9E1D8] transition active:scale-95"
            aria-label="Lista de la compra"
            title="Lista de la compra"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="19" cy="20" r="1" />
              <path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>

            {shoppingCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#E86632] px-1 text-[10px] font-bold text-white shadow-sm">
                {shoppingCount > 99
                  ? "99+"
                  : shoppingCount}
              </span>
            )}
          </button>

          <Link
            to="/settings"
            className="grid h-11 w-11 place-items-center rounded-[15px] bg-white text-[#536B4A] shadow-[0_6px_20px_rgba(70,60,50,0.08)] ring-1 ring-[#E9E1D8] transition active:scale-95"
            aria-label="Ajustes"
            title="Ajustes"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
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