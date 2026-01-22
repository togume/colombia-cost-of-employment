"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import { useYear } from "@/hooks/use-year";
import { getYearlyRates } from "@/lib/rates";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/format";

interface DailyBreakdown {
  baseWage: number;
  transport: number;
  contributions: {
    pension: number;
    arl: number;
    caja: number;
    salud: number;
    sena: number;
    icbf: number;
    totalWithExoneration: number;
    totalWithoutExoneration: number;
  };
  accruals: {
    prima: number;
    cesantias: number;
    interesesCesantias: number;
    vacaciones: number;
    total: number;
  };
  totalWithExoneration: number;
  totalWithoutExoneration: number;
  markupPercent: number;
}

function calculateDailyBreakdown(
  rates: ReturnType<typeof getYearlyRates>,
  customMonthlyWage?: number | null
): DailyBreakdown {
  const monthlyBase = customMonthlyWage ?? rates.SMMLV;
  const baseWage = Math.round(monthlyBase / 30);
  // Transport is only included if salary <= 2x SMMLV
  const includesTransport = monthlyBase <= rates.SMMLV * 2;
  const transport = includesTransport ? Math.round(rates.aux_transporte / 30) : 0;
  const accrualBase = baseWage + transport;

  // Contributions (on base wage only)
  const pension = Math.round(baseWage * rates.contrib.pension_employer);
  const arl = Math.round(baseWage * rates.contrib.arl.I);
  const caja = Math.round(baseWage * rates.contrib.caja);
  const salud = Math.round(baseWage * rates.contrib.salud_employer);
  const sena = Math.round(baseWage * rates.contrib.sena);
  const icbf = Math.round(baseWage * rates.contrib.icbf);

  const totalWithExoneration = pension + arl + caja;
  const totalWithoutExoneration = pension + arl + caja + salud + sena + icbf;

  // Accruals
  const prima = Math.round(accrualBase * rates.accruals.prima);
  const cesantias = Math.round(accrualBase * rates.accruals.cesantias);
  const interesesCesantias = Math.round(cesantias * rates.accruals.intereses_cesantias);
  const vacaciones = Math.round(baseWage * rates.accruals.vacaciones);
  const totalAccruals = prima + cesantias + interesesCesantias + vacaciones;

  const allInWithExoneration = baseWage + transport + totalWithExoneration + totalAccruals;
  const allInWithoutExoneration = baseWage + transport + totalWithoutExoneration + totalAccruals;

  const markupPercent = Math.round(((allInWithExoneration - baseWage) / baseWage) * 100);

  return {
    baseWage,
    transport,
    contributions: {
      pension,
      arl,
      caja,
      salud,
      sena,
      icbf,
      totalWithExoneration,
      totalWithoutExoneration,
    },
    accruals: {
      prima,
      cesantias,
      interesesCesantias,
      vacaciones,
      total: totalAccruals,
    },
    totalWithExoneration: allInWithExoneration,
    totalWithoutExoneration: allInWithoutExoneration,
    markupPercent,
  };
}

export function DayWorkerCard() {
  const t = useTranslations("dayWorker");
  const { locale } = useLocale();
  const { rates } = useYear();

  const [monthlyWageInput, setMonthlyWageInput] = useState<string>("");
  const monthlyWageValue = useMemo(() => parseCurrencyInput(monthlyWageInput), [monthlyWageInput]);
  const breakdown = useMemo(
    () => calculateDailyBreakdown(rates, monthlyWageValue),
    [rates, monthlyWageValue]
  );
  const isUsingCustomWage = monthlyWageValue !== null && monthlyWageValue > 0;

  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);

  const formatMoney = (value: number) => formatCurrency(value, locale, { maximumFractionDigits: 0 });

  const handleWageInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    setMonthlyWageInput(cleaned);
  };

  const resetToMinimum = () => {
    setMonthlyWageInput("");
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50/40 p-6 shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/40 sm:p-8 md:p-10">
      <header className="space-y-2 text-center sm:space-y-3">
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-500/20 dark:from-teal-400/10 dark:to-cyan-400/10 dark:text-teal-300 dark:ring-teal-400/20">
          {t("badge")}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      {/* Custom Salary Input */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-white to-teal-50/30 p-5 dark:border-teal-900 dark:from-neutral-900 dark:to-teal-950/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              {t("customWage.label")}
            </label>
            {isUsingCustomWage && (
              <button
                type="button"
                onClick={resetToMinimum}
                className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
              >
                {t("customWage.reset")}
              </button>
            )}
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="w-full rounded-2xl border border-teal-200 bg-white/80 px-4 py-3 text-lg font-semibold text-neutral-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-teal-800 dark:bg-neutral-900/80 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
            value={formatCurrencyInput(monthlyWageInput)}
            placeholder={formatMoney(rates.SMMLV)}
            onChange={(e) => handleWageInputChange(e.target.value)}
          />
          <p className="text-xs text-teal-600 dark:text-teal-400">
            {t("customWage.helper")}
          </p>
        </div>
      </div>

      {/* Hero: All-in Daily Rate */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-6 py-8 text-white shadow-xl sm:px-10">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-100">
            {t("allInRate.label")}
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {formatMoney(breakdown.totalWithExoneration)}
            <span className="ml-2 text-lg font-medium text-teal-100">{t("allInRate.perDay")}</span>
          </p>
          <p className="mt-2 text-sm text-teal-100">
            {t("allInRate.description", { percent: breakdown.markupPercent })}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-100">{t("allInRate.withExoneration")}</p>
              <p className="mt-1 text-xl font-bold">{formatMoney(breakdown.totalWithExoneration)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-100">{t("allInRate.withoutExoneration")}</p>
              <p className="mt-1 text-xl font-bold">{formatMoney(breakdown.totalWithoutExoneration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t("breakdown.title")}
        </h3>

        {/* Base Pay */}
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t("breakdown.basePay.title")}
          </h4>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{t("breakdown.basePay.wage")}</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{formatMoney(breakdown.baseWage)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{t("breakdown.basePay.transport")}</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{formatMoney(breakdown.transport)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-sm dark:border-neutral-700">
              <span className="font-semibold text-neutral-900 dark:text-white">{t("breakdown.basePay.subtotal")}</span>
              <span className="font-bold text-neutral-900 dark:text-white">{formatMoney(breakdown.baseWage + breakdown.transport)}</span>
            </div>
          </div>
        </div>

        {/* Contributions */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {t("breakdown.contributions.title")}
          </h4>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{t("breakdown.contributions.note")}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-200">{t("breakdown.contributions.pension")}</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">{formatMoney(breakdown.contributions.pension)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-200">{t("breakdown.contributions.arl")}</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">{formatMoney(breakdown.contributions.arl)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-200">{t("breakdown.contributions.caja")}</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">{formatMoney(breakdown.contributions.caja)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-200 pt-2 text-sm dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">{t("breakdown.contributions.subtotalExonerated")}</span>
              <span className="font-bold text-blue-900 dark:text-blue-100">{formatMoney(breakdown.contributions.totalWithExoneration)}</span>
            </div>
            <div className="mt-2 rounded-xl bg-blue-100/50 p-3 dark:bg-blue-900/30">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{t("breakdown.contributions.nonExoneratedNote")}</p>
              <div className="mt-2 space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <div className="flex justify-between">
                  <span>{t("breakdown.contributions.salud")}</span>
                  <span>+{formatMoney(breakdown.contributions.salud)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("breakdown.contributions.sena")}</span>
                  <span>+{formatMoney(breakdown.contributions.sena)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("breakdown.contributions.icbf")}</span>
                  <span>+{formatMoney(breakdown.contributions.icbf)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accruals */}
        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
            {t("breakdown.accruals.title")}
          </h4>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t("breakdown.accruals.note")}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 dark:text-green-200">{t("breakdown.accruals.prima")}</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatMoney(breakdown.accruals.prima)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 dark:text-green-200">{t("breakdown.accruals.cesantias")}</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatMoney(breakdown.accruals.cesantias)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 dark:text-green-200">{t("breakdown.accruals.intereses")}</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatMoney(breakdown.accruals.interesesCesantias)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 dark:text-green-200">{t("breakdown.accruals.vacaciones")}</span>
              <span className="font-semibold text-green-900 dark:text-green-100">{formatMoney(breakdown.accruals.vacaciones)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-green-200 pt-2 text-sm dark:border-green-800">
              <span className="font-semibold text-green-900 dark:text-green-100">{t("breakdown.accruals.subtotal")}</span>
              <span className="font-bold text-green-900 dark:text-green-100">{formatMoney(breakdown.accruals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Way Section */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/50 p-5 dark:border-emerald-900 dark:from-emerald-950/40 dark:to-green-950/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">&#9989;</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              {t("legalWay.title")}
            </h3>
            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
              {t("legalWay.description")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">1.</span>
                <span>{t("legalWay.steps.register")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">2.</span>
                <span>{t("legalWay.steps.pila")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">3.</span>
                <span>{t("legalWay.steps.accruals")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">4.</span>
                <span>{t("legalWay.steps.pay")}</span>
              </li>
            </ul>
            <p className="mt-4 rounded-xl bg-emerald-100/50 p-3 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {t("legalWay.minimumNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Risk/Reality Analysis - Expandable */}
      <div className="rounded-2xl border border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/70">
        <button
          type="button"
          onClick={() => setShowRiskAnalysis(!showRiskAnalysis)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#9888;&#65039;</span>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("riskAnalysis.title")}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("riskAnalysis.subtitle")}
              </p>
            </div>
          </div>
          <span className="text-2xl font-light text-neutral-500 dark:text-neutral-400">
            {showRiskAnalysis ? "−" : "+"}
          </span>
        </button>

        {showRiskAnalysis && (
          <div className="border-t border-neutral-200 p-5 dark:border-neutral-800">
            {/* Legal Framework */}
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <h4 className="font-semibold text-red-900 dark:text-red-100">
                  {t("riskAnalysis.legal.title")}
                </h4>
                <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                  {t("riskAnalysis.legal.description")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-red-700 dark:text-red-300">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.legal.element1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.legal.element2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.legal.element3")}</span>
                  </li>
                </ul>
                <p className="mt-3 text-sm font-medium text-red-900 dark:text-red-100">
                  {t("riskAnalysis.legal.consequence")}
                </p>
              </div>

              {/* Risks Table */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                  {t("riskAnalysis.risks.title")}
                </h4>
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg bg-white/60 p-3 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{t("riskAnalysis.risks.workerClaim.title")}</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("riskAnalysis.risks.workerClaim.description")}</p>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{t("riskAnalysis.risks.ugpp.title")}</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("riskAnalysis.risks.ugpp.description")}</p>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{t("riskAnalysis.risks.injury.title")}</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("riskAnalysis.risks.injury.description")}</p>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{t("riskAnalysis.risks.inspection.title")}</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("riskAnalysis.risks.inspection.description")}</p>
                  </div>
                </div>
              </div>

              {/* Reality Check */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/30">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {t("riskAnalysis.reality.title")}
                </h4>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {t("riskAnalysis.reality.description")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.reality.point1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.reality.point2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t("riskAnalysis.reality.point3")}</span>
                  </li>
                </ul>
              </div>

              {/* Alternatives */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t("riskAnalysis.alternatives.title")}
                </h4>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("riskAnalysis.alternatives.contractor.title")}</p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{t("riskAnalysis.alternatives.contractor.description")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("riskAnalysis.alternatives.formal.title")}</p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{t("riskAnalysis.alternatives.formal.description")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("riskAnalysis.alternatives.platform.title")}</p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{t("riskAnalysis.alternatives.platform.description")}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="rounded-xl bg-gradient-to-r from-neutral-100 to-neutral-50 p-4 dark:from-neutral-800 dark:to-neutral-900">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {t("riskAnalysis.bottomLine.title")}
                </h4>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {t("riskAnalysis.bottomLine.description")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
