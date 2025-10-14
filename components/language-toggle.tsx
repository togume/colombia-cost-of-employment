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
    <div className="flex items-center gap-3" aria-live="polite">
      <span id={labelId} className="text-sm font-medium text-neutral-600">
        {t("label")}
      </span>
      <div
        className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900/60"
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
              "rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
              locale === code
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white",
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
