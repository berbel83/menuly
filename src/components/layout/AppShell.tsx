interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#E3E9E1] px-0 py-0 text-[#263129] sm:px-5 sm:py-5">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#F2F5F0] sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#D7E0D5] sm:shadow-[0_22px_60px_rgba(52,75,56,0.12)]">
        {children}
      </div>
    </main>
  );
}