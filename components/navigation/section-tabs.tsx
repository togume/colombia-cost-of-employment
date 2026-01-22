"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";

interface SectionTab {
  id: string;
  labelKey: string;
}

const SECTION_TABS: SectionTab[] = [
  { id: "employer", labelKey: "employer" },
  { id: "liquidation", labelKey: "liquidation" },
  { id: "dayworker", labelKey: "dayworker" },
  { id: "explainer", labelKey: "explainer" },
];

export function SectionTabs() {
  const t = useTranslations("navigation");
  const [activeSection, setActiveSection] = useState<string>("employer");

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for sticky header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -70% 0%",
        threshold: 0,
      }
    );

    SECTION_TABS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="sticky top-0 z-40 -mx-4 overflow-x-auto bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80 sm:mx-0 sm:overflow-visible"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex min-w-max gap-2 border-b border-neutral-200/50 py-3 dark:border-neutral-800/50 sm:justify-center">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
              "min-h-[44px]", // Touch target
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
              activeSection === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
            )}
            aria-current={activeSection === tab.id ? "true" : undefined}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>
    </nav>
  );
}
