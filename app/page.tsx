"use client";

import { CalculatorCard } from "@/components/calculator/calculator-card";
import { ExplainerAccordion } from "@/components/explainer-accordion";
import { LanguageToggle } from "@/components/language-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useTranslations } from "@/hooks/use-translations";
import { LiquidationCard } from "@/components/liquidation/liquidation-card";

export default function Home() {
  const heroT = useTranslations("hero");
  const footerT = useTranslations("footer");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-white via-blue-50/30 to-yellow-50/20 pb-8 pt-5 backdrop-blur dark:border-neutral-800 dark:from-neutral-900 dark:via-blue-950/20 dark:to-yellow-950/10 sm:pb-10 sm:pt-6 md:pb-12 md:pt-7 lg:pb-14 lg:pt-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015] dark:opacity-[0.02]" />
        <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:space-y-8 sm:px-6 md:space-y-10 lg:px-8">
          <div className="flex items-center justify-between">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex items-center gap-3">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300 dark:ring-blue-400/30">
                      {heroT("badge")}
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <LanguageToggle />
          </div>
          <div className="mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {heroT("title")}
            </h1>
            <p className="mx-auto max-w-3xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg md:text-xl">
              {heroT("subtitle")}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 md:gap-10 md:py-12 lg:gap-12 lg:px-8">
        <CalculatorCard />
        <div className="mx-auto w-full max-w-4xl">
          <ExplainerAccordion />
        </div>
        <LiquidationCard />
      </main>

      <footer className="border-t border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100/50 py-12 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
        <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{footerT("disclaimer")}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">{footerT("contact")}</p>
        </div>
      </footer>
    </div>
  );
}
