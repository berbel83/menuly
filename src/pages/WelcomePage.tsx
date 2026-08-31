import { useState } from "react";

import AppShell from "../components/layout/AppShell";
import { useHouse } from "../context/useHouse";
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
      <div className="flex min-h-screen flex-col justify-center px-5 py-8 sm:min-h-[720px]">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-white p-1.5 shadow-[0_12px_30px_rgba(20,34,24,0.24)]">
              <img
                src="/pwa-192x192.png"
                alt="Compausa"
                className="h-full w-full rounded-[19px] object-cover"
              />
            </div>

            <h1 className="mt-5 text-[30px] font-bold uppercase tracking-[0.08em] text-[#FFF9F3]">
              Compausa
            </h1>

            <p className="mt-2 font-serif text-[21px] font-semibold text-white">
              Organiza tu casa, cuida tu ritmo.
            </p>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/68">
              Menús, compra, ayuno y hábitos diarios,
              todo en un mismo lugar.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-[16px] bg-white/10 p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("create");
                setErrorMessage(null);
              }}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                mode === "create"
                  ? "bg-white text-[#3F6248] shadow-sm"
                  : "text-white/70"
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
                  ? "bg-white text-[#3F6248] shadow-sm"
                  : "text-white/70"
              }`}
            >
              Unirme
            </button>
          </div>

          <div className="mt-4 rounded-[22px] bg-white p-5 shadow-[0_12px_30px_rgba(20,34,24,0.18)]">
            {mode === "create" ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E97857]">
                  Nuevo hogar
                </p>

                <h2 className="mt-2 font-serif text-[23px] font-semibold text-[#263129]">
                  Ponle un nombre
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#7D837B]">
                  Después te daremos un código para
                  compartirlo con quien quieras.
                </p>

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-[#5F695F]">
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
                    className="mt-2 w-full rounded-2xl border border-[#DDE5DB] bg-[#F4F7F2] px-4 py-3.5 text-sm text-[#263129] outline-none transition placeholder:text-[#A4ABA3] focus:border-[#E97857] focus:ring-4 focus:ring-[#E97857]/10"
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
                  className="mt-5 w-full rounded-2xl bg-[#E97857] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(233,120,87,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creando..."
                    : "Crear mi hogar"}
                </button>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3F6248]">
                  Unirme a un hogar
                </p>

                <h2 className="mt-2 font-serif text-[23px] font-semibold text-[#263129]">
                  Introduce el código
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#7D837B]">
                  Pide el código a la persona que
                  creó el hogar en Compausa.
                </p>

                <label className="mt-5 block">
                  <span className="text-xs font-semibold text-[#5F695F]">
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
                    className="mt-2 w-full rounded-2xl border border-[#DDE5DB] bg-[#F4F7F2] px-4 py-4 text-center font-mono text-[24px] font-bold uppercase tracking-[0.22em] text-[#263129] outline-none transition placeholder:text-[#B8BEB7] focus:border-[#3F6248] focus:ring-4 focus:ring-[#3F6248]/10"
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
                  className="mt-5 w-full rounded-2xl bg-[#3F6248] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(63,98,72,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
