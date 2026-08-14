interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#E7ECE5] px-0 py-0 text-[#243025] sm:px-5 sm:py-5">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#F7F8F4] sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#D8E0D4] sm:shadow-[0_22px_60px_rgba(47,76,54,0.12)]">
        {children}
      </div>
    </main>
  );
}
