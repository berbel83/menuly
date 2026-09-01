import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-[580px] rounded-[20px] border border-[#DCE4DA] bg-[#FFFDFC] p-4 text-[#263129] shadow-[0_16px_45px_rgba(20,34,24,0.24)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EDF3EB] text-xl">
          ↻
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-serif text-[18px] font-semibold">
            Compausa se ha actualizado
          </p>
          <p className="mt-1 text-xs leading-5 text-[#7D837B]">
            Instala la nueva versión sin perder el menú ni el ayuno activo.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="rounded-xl border border-[#DED5CA] px-3 py-2.5 text-xs font-bold text-[#71685F]"
        >
          Más tarde
        </button>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="rounded-xl bg-[#E97857] px-4 py-2.5 text-xs font-bold text-white"
        >
          Actualizar ahora
        </button>
      </div>
    </aside>
  );
}
