import type { Meal } from "../../types/meal";

interface MealRowProps {
  dayShort: string;
  dayNumber: string;
  meal?: Meal;
  accentColor?: string;
  onClick: () => void;
}

function hexToRgba(
  hex: string,
  alpha: number
) {
  const normalized =
    hex.replace("#", "");

  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map(
            (char) =>
              char + char
          )
          .join("")
      : normalized;

  const number =
    Number.parseInt(
      value,
      16
    );

  const red =
    (number >> 16) & 255;

  const green =
    (number >> 8) & 255;

  const blue =
    number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function MealRow({
  dayShort,
  dayNumber,
  meal,
  accentColor = "#E86632",
  onClick,
}: MealRowProps) {
  const softBackground =
    hexToRgba(
      accentColor,
      0.08
    );

  const strongerBackground =
    hexToRgba(
      accentColor,
      0.14
    );

  const subtleBorder =
    hexToRgba(
      accentColor,
      0.18
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        flex
        w-full
        items-center
        gap-3
        overflow-hidden
        rounded-[22px]
        bg-white
        px-3
        py-3
        text-left
        shadow-[0_7px_20px_rgba(73,62,51,0.06)]
        ring-1
        ring-[#ECE5DD]
        transition
        active:scale-[0.99]
      "
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{
          backgroundColor:
            accentColor,
        }}
      />

      <div
        className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[18px]"
        style={{
          backgroundColor:
            softBackground,
          boxShadow: `inset 0 0 0 1px ${subtleBorder}`,
        }}
      >
        <p
          className="font-serif text-[24px] font-semibold leading-none"
          style={{
            color:
              accentColor,
          }}
        >
          {dayNumber}
        </p>

        <p
          className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{
            color:
              accentColor,
          }}
        >
          {dayShort}
        </p>
      </div>

      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px]"
        style={{
          backgroundColor:
            strongerBackground,
        }}
      >
        {meal ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 3v7" />
            <path d="M10 3v7" />
            <path d="M7 7h3" />
            <path d="M8.5 10v11" />
            <path d="M16 3c-1.7 2.6-2.2 5.2-1.7 7.8.3 1.5 1.4 2.2 2.7 2.2h.5V21" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {meal ? (
          <>
            <p className="truncate font-serif text-[17px] font-semibold leading-tight text-[#293027]">
              {meal.name}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  backgroundColor:
                    softBackground,
                  color:
                    accentColor,
                }}
              >
                {meal.cookingTime} min
              </span>

              <span className="text-[10px] font-medium text-[#9B9187]">
                Comida planificada
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="font-serif text-[17px] font-semibold text-[#5E5A54]">
              Elegir comida
            </p>

            <p className="mt-1 text-[11px] text-[#A0968C]">
              Este día está libre
            </p>
          </>
        )}
      </div>

      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition group-active:translate-x-0.5"
        style={{
          backgroundColor:
            softBackground,
          color:
            accentColor,
        }}
      >
        <span className="text-[22px] font-light leading-none">
          ›
        </span>
      </div>
    </button>
  );
}