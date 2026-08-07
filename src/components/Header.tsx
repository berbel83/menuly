export default function Header() {
  return (
    <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 p-6 text-white shadow-xl shadow-orange-200/50">
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black tracking-[0.22em] text-white/85">
            MENÚ PARA DOS
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Menuly
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
            Planificad juntos la semana y preparad la compra sin darle más
            vueltas.
          </p>
        </div>

        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/20 text-3xl shadow-lg backdrop-blur-sm">
          🍽️
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
          2 personas
        </span>

        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
          Menú semanal
        </span>

        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
          Compra automática
        </span>
      </div>
    </header>
  );
}