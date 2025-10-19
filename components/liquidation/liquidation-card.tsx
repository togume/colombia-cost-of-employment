"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import { DEFAULT_YEAR, getYearlyRates } from "@/lib/rates";
import { computeLiquidation, type LiquidationItemId } from "@/lib/liquidation";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const rates = getYearlyRates(DEFAULT_YEAR);

type LiquidationFieldKey = "salary" | "smmlv" | "startDate" | "endDate";

const ITEM_ORDER: LiquidationItemId[] = [
  "outstanding_salary",
  "prima",
  "cesantias",
  "intereses_cesantias",
  "vacaciones",
];

function parseISODate(value: string): Date | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) {
    return null;
  }

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate;
}

export function LiquidationCard() {
  const t = useTranslations("liquidation");
  const validationT = useTranslations("liquidation.validation");
  const { locale } = useLocale();

  const [salaryInput, setSalaryInput] = useState<string>(String(rates.SMMLV));
  const [smmlvInput, setSmmlvInput] = useState<string>(String(rates.SMMLV));
  const [startDateInput, setStartDateInput] = useState<string>("");
  const [endDateInput, setEndDateInput] = useState<string>("");

  const salaryValue = useMemo(() => parseCurrencyInput(salaryInput), [salaryInput]);
  const smmlvValue = useMemo(() => parseCurrencyInput(smmlvInput), [smmlvInput]);
  const startDateValue = useMemo(() => parseISODate(startDateInput), [startDateInput]);
  const endDateValue = useMemo(() => parseISODate(endDateInput), [endDateInput]);

  const calculation = useMemo(() => {
    return computeLiquidation(
      {
        salary: salaryValue ?? Number.NaN,
        smmlv: smmlvValue ?? Number.NaN,
        startDate: startDateValue ?? new Date("Invalid"),
        endDate: endDateValue ?? new Date("Invalid"),
      },
      rates,
    );
  }, [salaryValue, smmlvValue, startDateValue, endDateValue]);

  const isValid = calculation.status === "valid";

  const formatMoney = (value: number) => formatCurrency(value, locale, { maximumFractionDigits: 0 });

  const renderFieldError = (field: LiquidationFieldKey) => {
    const error = calculation.errors[field];
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
        {validationT(error)}
      </p>
    );
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50/40 p-6 shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/40 sm:p-8 md:p-10">
      <header className="space-y-2 text-center sm:space-y-3">
        <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-200">
          {t("badge")}
        </span>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="liquidation-salary"
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              {t("fields.salary.label")}
            </label>
            <input
              id="liquidation-salary"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-lg font-semibold shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              value={formatCurrencyInput(salaryInput)}
              placeholder={formatCurrencyInput(String(rates.SMMLV))}
              onChange={(event) => setSalaryInput(event.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t("fields.salary.helper")}
            </p>
            {renderFieldError("salary")}
          </div>
          <div>
            <label
              htmlFor="liquidation-smmlv"
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              {t("fields.smmlv.label")}
            </label>
            <input
              id="liquidation-smmlv"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-lg font-semibold shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              value={formatCurrencyInput(smmlvInput)}
              placeholder={formatCurrencyInput(String(rates.SMMLV))}
              onChange={(event) => setSmmlvInput(event.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t("fields.smmlv.helper")}
            </p>
            {renderFieldError("smmlv")}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="liquidation-start"
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              {t("fields.startDate.label")}
            </label>
            <input
              id="liquidation-start"
              type="date"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-base font-medium shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              value={startDateInput}
              onChange={(event) => setStartDateInput(event.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t("fields.startDate.helper")}
            </p>
            {renderFieldError("startDate")}
          </div>
          <div>
            <label
              htmlFor="liquidation-end"
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              {t("fields.endDate.label")}
            </label>
            <input
              id="liquidation-end"
              type="date"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 text-base font-medium shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              value={endDateInput}
              onChange={(event) => setEndDateInput(event.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t("fields.endDate.helper")}
            </p>
            {renderFieldError("endDate")}
          </div>
        </div>
      </div>

      <p className="rounded-2xl bg-amber-100/70 px-4 py-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/30">
        {t("assumptions")}
      </p>

      {isValid ? (
        <div className="space-y-6">
          <div className="rounded-3xl bg-blue-600 px-6 py-8 text-white shadow-lg sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              {t("results.total.label")}
            </p>
            <p className="mt-3 text-3xl font-bold sm:text-4xl">
              {formatMoney(calculation.totals.total)}
            </p>
            <div className="mt-4 grid gap-3 text-sm text-blue-100 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white">{t("results.context.tenureDays")}</p>
                <p>{t("results.context.daysValue", { count: calculation.context.tenureDays })}</p>
              </div>
              <div>
                <p className="font-semibold text-white">{t("results.context.finalPeriod")}</p>
                <p>
                  {t("results.context.daysValue", {
                    count: calculation.context.daysInFinalPeriod,
                  })}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">{t("results.context.transport")}</p>
                <p>
                  {calculation.context.transportIncluded
                    ? t("results.context.transportIncluded", {
                        amount: formatMoney(calculation.context.transportAmount),
                      })
                    : t("results.context.transportExcluded")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/70 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("results.breakdown.title")}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {t("results.breakdown.subtitle")}
              </p>
            </div>
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {ITEM_ORDER.map((itemId) => {
                const entry = calculation.breakdown.find((item) => item.id === itemId);
                const amount = entry?.amount ?? 0;
                return (
                  <li
                    key={itemId}
                    className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {t(`results.breakdown.items.${itemId}.label`)}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        itemId === "outstanding_salary"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-neutral-900 dark:text-neutral-100",
                      )}
                    >
                      {formatMoney(amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-red-200 bg-red-50/80 px-6 py-5 text-sm text-red-800 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {t("errors.blocker")}
        </div>
      )}
    </section>
  );
}
