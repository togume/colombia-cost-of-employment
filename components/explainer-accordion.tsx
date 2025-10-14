"use client";

import { useTranslations } from "@/hooks/use-translations";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: "contributions" | "accruals" | "integral";
}

const SECTIONS: Section[] = [
  { id: "contributions" },
  { id: "accruals" },
  { id: "integral" },
];

export function ExplainerAccordion() {
  const t = useTranslations("explainer.sections");
  const titleT = useTranslations("explainer");
  const [openSection, setOpenSection] = useState<Section["id"] | null>("contributions");

  return (
    <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50/50 p-5 shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50 sm:p-6 md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {titleT("title")}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Learn more about Colombian employment costs
        </p>
      </div>
      <div className="space-y-3">
        {SECTIONS.map(({ id }) => {
          const isOpen = openSection === id;
          return (
            <article
              key={id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all duration-300",
                isOpen
                  ? "border-blue-200 bg-blue-50/50 shadow-md dark:border-blue-900 dark:bg-blue-950/30"
                  : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-neutral-600",
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 p-5 text-left transition"
                onClick={() => setOpenSection(isOpen ? null : id)}
                aria-expanded={isOpen}
              >
                <span
                  className={cn(
                    "text-base font-semibold transition",
                    isOpen
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-neutral-800 dark:text-neutral-200",
                  )}
                >
                  {t(`${id}.title`)}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 transition-transform duration-300",
                    isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : "text-neutral-400",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {t(`${id}.body`)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
