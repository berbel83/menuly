interface ProgressCardProps {
  plannedCount: number;
  totalCount?: number;
}

export default function ProgressCard({
  plannedCount,
  totalCount = 7,
}: ProgressCardProps) {
  const progress = Math.round(
    (plannedCount / totalCount) * 100
  );

  const remaining = totalCount - plannedCount;

  let message = `${remaining} días por planificar`;

  if (remaining === 1) {
    message = "Solo falta un día";
  }

  if (remaining === 0) {
    message = "Semana completa";
  }

  return (
    <section className="px-6 pb-5">
      <div className="rounded-[22px] border border-[#E3D9CE] bg-[#FFF9F3] px-4 py-4 shadow-[0_6px_18px_rgba(91,67,48,0.04)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A08E80]">
              Planificación
            </p>

            <p className="mt-1 font-serif text-[21px] font-semibold text-[#292923]">
              {plannedCount} de {totalCount} comidas
            </p>

            <p className="mt-1 text-[13px] text-[#887D73]">
              {message}
            </p>
          </div>

          <div className="text-right">
            <span className="font-serif text-[28px] font-semibold text-[#D96536]">
              {progress}%
            </span>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E8DED4]">
          <div
            className="h-full rounded-full bg-[#D96536] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}