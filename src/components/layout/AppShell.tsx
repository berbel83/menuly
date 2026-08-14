interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#DDE5DB] px-0 py-0 text-[#1F211D] sm:px-5 sm:py-5">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#EEF2EC] sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#CAD6C7] sm:shadow-[0_22px_60px_rgba(52,74,47,0.14)]">
        {children}
      </div>
    </main>
  );
}