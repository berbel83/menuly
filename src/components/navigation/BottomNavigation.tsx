import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Hoy", icon: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-7h5v7"/></>, end: true },
  { to: "/menu", label: "Menú", icon: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/></> },
  { to: "/fasting", label: "Ayuno", icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  { to: "/shopping", label: "Compra", icon: <><path d="M4 7h16l-1.5 13h-13z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></> },
  { to: "/settings", label: "Ajustes", icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.51-1H3v-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.51V3h4v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.51 1H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></> },
];

export default function BottomNavigation() {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[620px] border-t border-[var(--line)] bg-[rgba(255,254,251,.96)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_32px_rgba(24,52,37,0.10)] backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label}
          className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition ${isActive ? "bg-[var(--sage-soft)] text-[var(--forest)]" : "text-[var(--muted)]"}`}>
          {({ isActive }) => <><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-[var(--coral)]" : ""}>{item.icon}</svg><span>{item.label}</span></>}
        </NavLink>)}
      </div>
    </nav>
  );
}
