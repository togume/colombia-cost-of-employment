"use client";

import { CalculatorCard } from "@/components/calculator/calculator-card";
import { ExplainerAccordion } from "@/components/explainer-accordion";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslations } from "@/hooks/use-translations";

export default function Home() {
  const heroT = useTranslations("hero");
  const footerT = useTranslations("footer");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white/90 py-10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                {heroT("badge")}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                {heroT("title")}
              </h1>
              <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
                {heroT("subtitle")}
              </p>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <CalculatorCard />
        <ExplainerAccordion />
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{footerT("disclaimer")}</p>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{footerT("contact")}</p>
        </div>
      </footer>
    </div>
  );
}
