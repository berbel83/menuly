import { useState } from "react";
import { Link } from "react-router-dom";

import { useHouse } from "../../context/useHouse";

export default function SettingsPage() {
  const { house, logout } = useHouse();

  const [copied, setCopied] = useState(false);

  if (!house) {
    return null;
  }

  const houseCode = house.code;
  const houseName = house.name;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(houseCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  function changeHouse() {
    const confirmed = window.confirm(
      "¿Quieres salir de este hogar en este dispositivo?"
    );

    if (confirmed) {
      logout();
    }
  }

  return (
    <div className="min-h-screen bg-[#F3EFE8] px-0 py-0 text-[#292923] sm:px-5 sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#FBF8F3] pb-24 sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#D8D0C6] sm:shadow-[0_22px_60px_rgba(82,65,48,0.10)]">
        <header className="flex items-center gap-4 border-b border-[#E5DDD3] px-6 py-5">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DED5CA] bg-[#FFFDFC] text-[24px] font-light text-[#4A463F] transition hover:bg-[#F4EFE9]"
            aria-label="Volver"
          >
            ‹
          </Link>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3F543E]">
              Compausa
            </p>

            <h1 className="mt-0.5 font-serif text-[28px] font-semibold tracking-[-0.03em]">
              Ajustes
            </h1>
          </div>
        </header>

        <div className="px-6 py-6">
          <section className="rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5 shadow-[0_8px_25px_rgba(80,60,42,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E86632]">
              Tu hogar
            </p>

            <h2 className="mt-2 font-serif text-[26px] font-semibold text-[#292923]">
              {houseName}
            </h2>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A08E80]">
              Código para compartir
            </p>

            <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl bg-[#F5F0E9] px-4 py-4">
              <span className="font-mono text-[24px] font-bold tracking-[0.18em] text-[#2D2A26]">
                {houseCode}
              </span>

              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 rounded-xl bg-[#E86632] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#D85B29]"
              >
                {copied ? "Copiado ✓" : "Copiar"}
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#81766D]">
              Comparte este código para que otra persona
              entre en el mismo hogar y vea el mismo menú.
            </p>
          </section>

          <section className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A08E80]">
              Cuenta local
            </p>

            <h3 className="mt-2 font-serif text-[21px] font-semibold">
              Cambiar de hogar
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#81766D]">
              Compausa olvidará este hogar en este dispositivo
              y volverá a mostrar la pantalla para crear uno
              o introducir otro código.
            </p>

            <button
              type="button"
              onClick={changeHouse}
              className="mt-5 w-full rounded-2xl border border-[#E6CFC5] bg-[#FFF9F6] px-4 py-3.5 text-sm font-semibold text-[#A34F34] transition hover:bg-[#FCEFE9]"
            >
              Cambiar de hogar
            </button>
          </section>

          <section className="mt-5 px-1">
            <p className="text-center text-xs text-[#A49A90]">
              Compausa · versión 0.2.1
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
