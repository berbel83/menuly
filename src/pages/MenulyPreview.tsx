const week = [
  {
    day: "Lun",
    fullDay: "Lunes",
    meal: "Pollo al horno con patatas",
    meta: "40 min",
  },
  {
    day: "Mar",
    fullDay: "Martes",
    meal: "Salmón a la plancha",
    meta: "25 min",
  },
  {
    day: "Mié",
    fullDay: "Miércoles",
    meal: "Fajitas de pollo",
    meta: "20 min",
  },
  {
    day: "Jue",
    fullDay: "Jueves",
    meal: "Berenjenas rellenas",
    meta: "45 min",
  },
  {
    day: "Vie",
    fullDay: "Viernes",
    meal: "Arroz con pollo",
    meta: "35 min",
  },
  {
    day: "Sáb",
    fullDay: "Sábado",
    meal: "Hamburguesa casera",
    meta: "30 min",
  },
  {
    day: "Dom",
    fullDay: "Domingo",
    meal: null,
    meta: null,
  },
];

export default function MenulyPreview() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] text-zinc-950">
      <div className="mx-auto min-h-screen w-full max-w-xl bg-white sm:my-6 sm:min-h-0 sm:rounded-3xl sm:border sm:border-zinc-200 sm:shadow-xl">
        {/* HEADER */}
        <header className="border-b border-zinc-200 px-5 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Planificador semanal
              </p>

              <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
                Menuly
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-lg transition hover:bg-zinc-50"
                aria-label="Lista de la compra"
              >
                🛒
              </button>

              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-lg transition hover:bg-zinc-50"
                aria-label="Ajustes"
              >
                ⋯
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Esta semana
              </p>

              <p className="mt-0.5 text-sm text-zinc-400">
                10 – 16 agosto
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">6 / 7</p>
              <p className="text-xs text-zinc-400">planificadas</p>
            </div>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-[86%] rounded-full bg-zinc-900" />
          </div>
        </header>

        {/* WEEK */}
        <section className="px-5 py-3">
          {week.map((item, index) => (
            <button
              type="button"
              key={item.fullDay}
              className={`group flex w-full items-center gap-4 py-3.5 text-left transition hover:bg-zinc-50 ${
                index !== week.length - 1
                  ? "border-b border-zinc-100"
                  : ""
              }`}
            >
              <div className="w-10 shrink-0">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400">
                  {item.day}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {item.meal ? (
                  <>
                    <p className="truncate text-[15px] font-semibold text-zinc-900">
                      {item.meal}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-400">
                      {item.meta}
                    </p>
                  </>
                ) : (
                  <p className="text-[15px] font-medium text-zinc-400">
                    + Elegir comida
                  </p>
                )}
              </div>

              <span className="text-xl font-light text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500">
                ›
              </span>
            </button>
          ))}
        </section>

        {/* SHOPPING SUMMARY */}
        <section className="border-t border-zinc-200 px-5 py-5">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-left text-white transition hover:bg-zinc-800"
          >
            <div>
              <p className="text-sm font-semibold">
                Lista de la compra
              </p>

              <p className="mt-0.5 text-xs text-zinc-400">
                18 productos esta semana
              </p>
            </div>

            <span className="text-xl">›</span>
          </button>
        </section>

        {/* QUICK ACTION */}
        <section className="px-5 pb-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-sm font-semibold text-zinc-900">
              ¿No sabéis qué comer?
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-zinc-500">
                Menuly puede elegir entre vuestros platos.
              </p>

              <button
                type="button"
                className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Sugerir
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}