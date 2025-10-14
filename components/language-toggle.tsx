"use client";

import { useTranslations } from "@/hooks/use-translations";
import { useLocale, type SupportedLocale } from "@/hooks/use-locale";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const t = useTranslations("language");
  const { locale, availableLocales, setLocale, isLoading } = useLocale();

  const labelId = "language-toggle-label";

  const getLabel = (code: SupportedLocale) => {
    switch (code) {
      case "es":
        return t("spanish");
      case "en":
      default:
        return t("english");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-full border border-neutral-200/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-neutral-700/60 dark:bg-neutral-900/80" aria-live="polite">
      <span id={labelId} className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {t("label")}
      </span>
      <div
        className="inline-flex gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800"
        role="group"
        aria-labelledby={labelId}
      >
        {availableLocales.map((code) => (
          <button
            key={code}
            type="button"
            disabled={isLoading}
            onClick={() => setLocale(code)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
              locale === code
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white",
            )}
            aria-pressed={locale === code}
          >
            {getLabel(code)}
          </button>
        ))}
      </div>
    </div>
  );
}
