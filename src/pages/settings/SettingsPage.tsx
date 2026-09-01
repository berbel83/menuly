import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useHouse } from "../../context/useHouse";
import {
  getAccountStatus,
  protectAccountWithEmail,
  type AccountStatus,
} from "../../services/authService";
import { restoreHiddenMeals } from "../../services/mealCatalogService";
import { leaveHouse, listUserHouses, rotateHouseCode } from "../../services/houseService";
import type { House } from "../../types/house";

export default function SettingsPage() {
  const { house, logout, setHouse } = useHouse();

  const [copied, setCopied] = useState(false);
  const [accountStatus, setAccountStatus] =
    useState<AccountStatus | null>(null);
  const [email, setEmail] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMessage, setAccountMessage] =
    useState<string | null>(null);
  const [accountError, setAccountError] =
    useState<string | null>(null);
  const [catalogMessage, setCatalogMessage] = useState<string | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [houseMessage, setHouseMessage] = useState<string | null>(null);

  useEffect(() => {
    void getAccountStatus()
      .then(setAccountStatus)
      .catch(() => setAccountStatus(null));
  }, []);

  useEffect(() => { void listUserHouses().then(setHouses).catch(() => setHouses([])); }, [house?.id]);

  if (!house) {
    return null;
  }

  const houseCode = house.code;
  const houseName = house.name;
  const houseId = house.id;

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
    logout();
  }

  async function renewCode() {
    if (!window.confirm("El código anterior dejará de funcionar. ¿Quieres renovarlo?")) return;
    try {
      const code = await rotateHouseCode(houseId);
      setHouseMessage(`Nuevo código: ${code}. Vuelve a entrar para verlo actualizado.`);
    } catch (error) { setHouseMessage(error instanceof Error ? error.message : "No se pudo renovar."); }
  }

  async function abandonHouse() {
    if (!window.confirm("¿Seguro que quieres abandonar este hogar? Los demás miembros conservarán sus datos.")) return;
    try { await leaveHouse(houseId); logout(); }
    catch (error) { setHouseMessage(error instanceof Error ? error.message : "No se pudo abandonar."); }
  }

  async function protectAccount() {
    try {
      setAccountLoading(true);
      setAccountError(null);
      setAccountMessage(null);

      await protectAccountWithEmail(email);
      setAccountMessage(
        "Te hemos enviado un correo. Ábrelo para confirmar y proteger tu hogar."
      );
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : "No se pudo proteger la cuenta."
      );
    } finally {
      setAccountLoading(false);
    }
  }

  async function restoreMeals() {
    if (!houseId) return;
    try {
      await restoreHiddenMeals(houseId);
      setCatalogMessage("Los platos ocultos vuelven a estar disponibles.");
    } catch (error) {
      setCatalogMessage(
        error instanceof Error ? error.message : "No se pudieron restaurar los platos.",
      );
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
            <button type="button" onClick={() => void renewCode()} className="mt-3 text-xs font-bold text-[#9B4C37]">
              Renovar código de invitación
            </button>
          </section>

          {houses.length > 1 && (
            <section className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3F543E]">Tus hogares</p>
              <h3 className="mt-2 font-serif text-[21px] font-semibold">Hogar activo</h3>
              <div className="mt-3 grid gap-2">
                {houses.map((item) => <button key={item.id} type="button" disabled={item.id === houseId} onClick={() => setHouse(item)} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${item.id === houseId ? "border-[#B9CCB7] bg-[#EDF3EB] text-[#31513A]" : "border-[#E3D9CE] bg-white text-[#4A463F]"}`}>
                  <span>{item.name}</span><span>{item.id === houseId ? "Activo" : "Cambiar"}</span>
                </button>)}
              </div>
            </section>
          )}

          <section className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3F543E]">
              Recuperación
            </p>

            <h3 className="mt-2 font-serif text-[21px] font-semibold">
              {accountStatus && !accountStatus.isAnonymous
                ? "Tu hogar está protegido"
                : "No pierdas tu hogar"}
            </h3>

            {accountStatus && !accountStatus.isAnonymous ? (
              <p className="mt-2 text-sm leading-6 text-[#81766D]">
                Puedes recuperar el acceso desde otro dispositivo con
                <span className="font-semibold text-[#4A463F]">
                  {` ${accountStatus.email ?? "tu correo"}`}
                </span>
                .
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm leading-6 text-[#81766D]">
                  Añade un correo para recuperar este hogar si cambias de
                  móvil o borras la aplicación. No necesitas contraseña.
                </p>

                <label className="mt-4 block">
                  <span className="text-xs font-semibold text-[#5F695F]">
                    Tu correo
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tu@correo.com"
                    className="mt-2 w-full rounded-2xl border border-[#DDE5DB] bg-[#F4F7F2] px-4 py-3.5 text-sm text-[#263129] outline-none transition placeholder:text-[#A4ABA3] focus:border-[#3F6248] focus:ring-4 focus:ring-[#3F6248]/10"
                  />
                </label>

                <button
                  type="button"
                  disabled={accountLoading || !email.trim()}
                  onClick={protectAccount}
                  className="mt-4 w-full rounded-2xl bg-[#3F6248] px-4 py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {accountLoading ? "Enviando..." : "Proteger con mi correo"}
                </button>
              </>
            )}

            {accountMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {accountMessage}
              </div>
            )}

            {accountError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {accountError}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A08E80]">
              Catálogo
            </p>
            <h3 className="mt-2 font-serif text-[21px] font-semibold">
              Platos ocultos
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#81766D]">
              Puedes recuperar de una vez todos los platos que hayáis ocultado al elegir el menú.
            </p>
            <button type="button" onClick={restoreMeals} className="mt-4 w-full rounded-2xl border border-[#D8D0C6] bg-[#FFFDFC] px-4 py-3.5 text-sm font-semibold text-[#5F5952]">
              Restaurar platos ocultos
            </button>
            {catalogMessage && (
              <p className="mt-3 text-sm leading-6 text-[#64705F]">{catalogMessage}</p>
            )}
          </section>

          <section className="mt-5 rounded-[24px] border border-[#E3D9CE] bg-[#FFFDFC] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A08E80]">
              Cuenta local
            </p>

            <h3 className="mt-2 font-serif text-[21px] font-semibold">
              Cambiar de hogar
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#81766D]">
              Elige otro hogar o entra con un código diferente. Esto no elimina tu pertenencia ni tus datos.
            </p>

            <button
              type="button"
              onClick={changeHouse}
              className="mt-5 w-full rounded-2xl border border-[#E6CFC5] bg-[#FFF9F6] px-4 py-3.5 text-sm font-semibold text-[#A34F34] transition hover:bg-[#FCEFE9]"
            >
              Cambiar de hogar
            </button>
            <button type="button" onClick={() => void abandonHouse()} className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[#8D4A3A]">
              Abandonar este hogar
            </button>
            {houseMessage && <p className="mt-3 text-sm leading-6 text-[#64705F]">{houseMessage}</p>}
          </section>

          <section className="mt-5 px-1">
            <p className="text-center text-xs text-[#A49A90]">
              Compausa · versión 0.3.0
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
