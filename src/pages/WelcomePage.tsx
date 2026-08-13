import { useState } from "react";

import AppShell from "../components/layout/AppShell";
import { useHouse } from "../context/HouseContext";
import {
  createHouse,
  findHouseByCode,
} from "../services/houseService";

export default function WelcomePage() {
  const { setHouse } = useHouse();

  const [mode, setMode] =
    useState<"create" | "join">("create");

  const [houseName, setHouseName] =
    useState("");

  const [houseCode, setHouseCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleCreateHouse() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const house =
        await createHouse(houseName);

      setHouse(house);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear el hogar."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinHouse() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const house =
        await findHouseByCode(houseCode);

      if (!house) {
        setErrorMessage(
          "No encontramos ningún hogar con ese código."
        );
        return;
      }

      setHouse(house);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo entrar al hogar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col justify-center px-6 py-10 sm:min-h-[720px]">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-[#FBF8F3] shadow-[0_12px_35px_rgba(63,84,62,0.10)] ring-1 ring-[#E3D9CE]">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-[6px] border-[#3F543E]" />

                <div className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 bg-[#FBF8F3]" />

                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
                  <span className="block h-4 w-1.5 rounded-full bg-[#E86632]" />
                  <span className="block h-4 w-1.5 rounded-full bg-[#E86632]" />
                </div>
              </div>
            </div>

            <h1 className="mt-5 font-serif text-[38px] font-semibold tracking-[-0.04em] text-[#3F543E]">
              compausa
            </h1>

            <p className="mt-2 text-sm font-medium text-[#E86632]">
              Tu comida. Tu tiempo.
            </p>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#81766D]">
              Organizad juntos las comidas de casa,
              la compra y vuestro ritmo de alimentación.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-2 rounded-2xl bg-[#EEE7DE] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("create");
                setErrorMessage(null);
              }}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "create"
                  ? "bg-[#FFFDFC] text-[#2D2A26] shadow-sm"
                  : "text-[#887D73]"
              }`}
            >
              Crear hogar
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("join");
                setErrorMessage(null);
              }}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "join"
                  ? "bg-[#FFFDFC] text-[#2D2A26] shadow-sm"
                  : "text-[#887D73]"
              }`}
            >
              Unirme
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5 shadow-[0_10px_35px_rgba(80,60,42,0.06)]">
            {mode === "create" ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E86632]">
                  Nuevo hogar
                </p>

                <h2 className="mt-2 font-serif text-[24px] font-semibold text-[#292923]">
                  Ponle un nombre
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#81766D]">
                  Después te daremos un código para
                  compartirlo con quien quieras.
                </p>

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-[#71685F]">
                    Nombre del hogar
                  </span>

                  <input
                    type="text"
                    value={houseName}
                    onChange={(event) =>
                      setHouseName(
                        event.target.value
                      )
                    }
                    placeholder="Ej. Nuestra casa"
                    maxLength={50}
                    className="mt-2 w-full rounded-2xl border border-[#DED5CA] bg-[#FBF8F3] px-4 py-3.5 text-sm text-[#2D2A26] outline-none transition placeholder:text-[#AAA197] focus:border-[#E86632] focus:ring-4 focus:ring-[#E86632]/10"
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    loading ||
                    !houseName.trim()
                  }
                  onClick={
                    handleCreateHouse
                  }
                  className="mt-5 w-full rounded-2xl bg-[#E86632] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D85B29] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creando..."
                    : "Crear mi hogar"}
                </button>
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3F543E]">
                  Unirme a un hogar
                </p>

                <h2 className="mt-2 font-serif text-[24px] font-semibold text-[#292923]">
                  Introduce el código
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#81766D]">
                  Pide el código a la persona que
                  creó el hogar en Compausa.
                </p>

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-[#71685F]">
                    Código del hogar
                  </span>

                  <input
                    type="text"
                    value={houseCode}
                    onChange={(event) =>
                      setHouseCode(
                        event.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z0-9]/g,
                            ""
                          )
                          .slice(0, 6)
                      )
                    }
                    placeholder="HX82KP"
                    className="mt-2 w-full rounded-2xl border border-[#DED5CA] bg-[#FBF8F3] px-4 py-4 text-center font-mono text-[24px] font-bold uppercase tracking-[0.22em] text-[#2D2A26] outline-none transition placeholder:text-[#C3BBB2] focus:border-[#3F543E] focus:ring-4 focus:ring-[#3F543E]/10"
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    loading ||
                    houseCode.length !== 6
                  }
                  onClick={
                    handleJoinHouse
                  }
                  className="mt-5 w-full rounded-2xl bg-[#3F543E] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#334531] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Buscando..."
                    : "Entrar al hogar"}
                </button>
              </>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}