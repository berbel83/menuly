interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#2F4A36] px-0 py-0 text-[#263129] sm:px-5 sm:py-5">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#3F6248] sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#58755F] sm:shadow-[0_22px_60px_rgba(24,39,28,0.28)]">
        {children}
      </div>
    </main>
  );
}