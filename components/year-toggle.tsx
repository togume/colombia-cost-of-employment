"use client";

import { useTranslations } from "@/hooks/use-translations";
import { useYear } from "@/hooks/use-year";
import { cn } from "@/lib/utils";

export function YearToggle() {
  const t = useTranslations("calculator");
  const { year, availableYears, setYear } = useYear();

  return (
    <div
      className="inline-flex gap-1 rounded-full border border-blue-200/60 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-blue-800/60 dark:bg-neutral-900/90"
      role="group"
      aria-label={t("yearSelector.label")}
    >
      {availableYears.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => setYear(y)}
          className={cn(
            "min-h-[36px] min-w-[52px] rounded-full px-3 py-1.5 text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
            year === y
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700/70 hover:bg-blue-100/50 dark:text-blue-300/70 dark:hover:bg-blue-900/30",
          )}
          aria-pressed={year === y}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
