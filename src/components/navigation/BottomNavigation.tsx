import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Hoy", icon: "⌂", end: true },
  { to: "/menu", label: "Menú", icon: "▦" },
  { to: "/fasting", label: "Ayuno", icon: "◷" },
  { to: "/shopping", label: "Compra", icon: "✓" },
  { to: "/settings", label: "Ajustes", icon: "⚙" },
];

export default function BottomNavigation() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[620px] border-t border-[#DCE4DA] bg-[#FFFDFC]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(29,45,33,0.10)] backdrop-blur"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
                isActive
                  ? "bg-[#EDF3EB] text-[#3F6248]"
                  : "text-[#8B9188]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 place-items-center text-[18px] leading-none ${
                    isActive ? "text-[#E97857]" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
