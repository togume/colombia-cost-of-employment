"use client";

import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";

interface UseCaseCardProps {
  title: string;
  description: string;
  linkTo: string;
  colorScheme: "blue" | "purple" | "teal";
}

function UseCaseCard({ title, description, linkTo, colorScheme }: UseCaseCardProps) {
  const scrollToSection = () => {
    const element = document.getElementById(linkTo);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30",
      border: "border-blue-200 hover:border-blue-300 dark:border-blue-900 dark:hover:border-blue-800",
      title: "text-blue-900 dark:text-blue-100",
      description: "text-blue-700 dark:text-blue-300",
      icon: "bg-blue-500",
    },
    purple: {
      bg: "from-purple-50 to-indigo-50/50 dark:from-purple-950/40 dark:to-indigo-950/30",
      border: "border-purple-200 hover:border-purple-300 dark:border-purple-900 dark:hover:border-purple-800",
      title: "text-purple-900 dark:text-purple-100",
      description: "text-purple-700 dark:text-purple-300",
      icon: "bg-purple-500",
    },
    teal: {
      bg: "from-teal-50 to-cyan-50/50 dark:from-teal-950/40 dark:to-cyan-950/30",
      border: "border-teal-200 hover:border-teal-300 dark:border-teal-900 dark:hover:border-teal-800",
      title: "text-teal-900 dark:text-teal-100",
      description: "text-teal-700 dark:text-teal-300",
      icon: "bg-teal-500",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <button
      type="button"
      onClick={scrollToSection}
      className={cn(
        "group flex flex-col rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm transition-all hover:shadow-md",
        "min-h-[120px]", // Consistent height
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        colors.bg,
        colors.border,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 size-2.5 flex-shrink-0 rounded-full", colors.icon)} />
        <div className="flex-1">
          <h3 className={cn("text-base font-semibold", colors.title)}>
            {title}
          </h3>
          <p className={cn("mt-1.5 text-sm leading-relaxed", colors.description)}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function IntroSection() {
  const t = useTranslations("intro");

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="text-center">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <UseCaseCard
          title={t("hiring.title")}
          description={t("hiring.description")}
          linkTo="employer"
          colorScheme="blue"
        />
        <UseCaseCard
          title={t("termination.title")}
          description={t("termination.description")}
          linkTo="liquidation"
          colorScheme="purple"
        />
        <UseCaseCard
          title={t("dayWorker.title")}
          description={t("dayWorker.description")}
          linkTo="dayworker"
          colorScheme="teal"
        />
      </div>
    </section>
  );
}
