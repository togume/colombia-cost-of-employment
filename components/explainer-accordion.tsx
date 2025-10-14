"use client";

import { useTranslations } from "@/hooks/use-translations";
import { useState } from "react";

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
  const [openSection, setOpenSection] = useState<Section["id"]>("contributions");

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
        {titleT("title")}
      </h2>
      <div className="mt-4 space-y-3">
        {SECTIONS.map(({ id }) => {
          const isOpen = openSection === id;
          return (
            <article key={id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setOpenSection(isOpen ? "contributions" : id)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {t(`${id}.title`)}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {t(`${id}.body`)}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
