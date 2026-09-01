import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-[580px] rounded-xl bg-[#2F312B] px-4 py-3 text-center text-xs font-semibold text-white shadow-xl"
    >
      Sin conexión · puedes seguir consultando lo guardado
    </div>
  );
}
