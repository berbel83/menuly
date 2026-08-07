interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#EFE9E1] px-0 py-0 text-[#1F211D] sm:px-5 sm:py-5">
      <div className="mx-auto min-h-screen w-full max-w-[620px] bg-[#FBF8F3] sm:min-h-0 sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-[#D8D0C6] sm:shadow-[0_22px_60px_rgba(82,65,48,0.10)]">
        {children}
      </div>
    </main>
  );
}