"use client";

import { useMemo, useState, useId } from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import {
  computeEmployerCosts,
  computeSalaryFromBudget,
  type ContributionId,
  type AccrualId,
} from "@/lib/calculator";
import { DEFAULT_YEAR, getYearlyRates, type RiskClass } from "@/lib/rates";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CalculatorMode = "forward" | "reverse";

const rates = getYearlyRates(DEFAULT_YEAR);

const DEFAULT_SALARY = String(rates.SMMLV);

const CONTRIBUTION_IDS: ContributionId[] = [
  "salud",
  "pension",
  "arl",
  "caja",
  "sena",
  "icbf",
];

const ACCRUAL_IDS: AccrualId[] = [
  "prima",
  "cesantias",
  "intereses_cesantias",
  "vacaciones",
];

function parseMoney(value: string): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) {
    return null;
  }
  return Number.parseInt(cleaned, 10);
}

function formatInputMoney(value: string): string {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) {
    return "";
  }
  const number = Number.parseInt(cleaned, 10);
  return `$ ${number.toLocaleString("es-CO")}`;
}

export function CalculatorCard() {
  const formT = useTranslations("form");
  const resultT = useTranslations("results");
  const breakdownT = useTranslations("breakdown");
  const calculatorT = useTranslations("calculator");
  const validationT = useTranslations("validation");
  const integralT = useTranslations("integral");
  const contextT = useTranslations("context");
  const { locale } = useLocale();

  const [mode, setMode] = useState<CalculatorMode>("forward");
  const [salaryInput, setSalaryInput] = useState<string>(DEFAULT_SALARY);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [smmlvInput, setSmmlvInput] = useState<string>(String(rates.SMMLV));
  const [arlClass, setArlClass] = useState<RiskClass>("I");
  const [exoneration, setExoneration] = useState(false);
  const [useIntegral, setUseIntegral] = useState(false);
  const [integralInput, setIntegralInput] = useState<string>("");

  const salaryValue = useMemo(() => parseMoney(salaryInput), [salaryInput]);
  const budgetValue = useMemo(() => parseMoney(budgetInput), [budgetInput]);
  const smmlvValue = useMemo(() => parseMoney(smmlvInput), [smmlvInput]);
  const integralValue = useMemo(() => parseMoney(integralInput), [integralInput]);

  const calculation = useMemo(() => {
    if (mode === "reverse") {
      return computeSalaryFromBudget(
        {
          targetMonthlyCost: budgetValue ?? Number.NaN,
          smmlv: smmlvValue ?? Number.NaN,
          arlClass,
          exoneration,
        },
        rates,
      );
    }

    return computeEmployerCosts(
      {
        salary: salaryValue ?? Number.NaN,
        smmlv: smmlvValue ?? Number.NaN,
        arlClass,
        exoneration,
        useIntegral,
        integralSalary: useIntegral ? integralValue ?? Number.NaN : undefined,
      },
      rates,
    );
  }, [mode, salaryValue, budgetValue, smmlvValue, arlClass, exoneration, useIntegral, integralValue]);

  const isValid = calculation.status === "valid";

  const contributionMap = useMemo(() => {
    const map = new Map<ContributionId, number>();
    calculation.contributions.forEach((item) => map.set(item.id as ContributionId, item.amount));
    return map;
  }, [calculation.contributions]);

  const accrualMap = useMemo(() => {
    const map = new Map<AccrualId, number>();
    calculation.accruals.forEach((item) => map.set(item.id as AccrualId, item.amount));
    return map;
  }, [calculation.accruals]);

  const formatMoney = (value: number) => formatCurrency(value, locale);

  const hasAccruals = useIntegral ? false : calculation.accruals.length > 0;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSalaryChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    setSalaryInput(cleaned);
  };

  const handleBudgetChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    setBudgetInput(cleaned);
  };

  const resetToMinimumWage = () => {
    setSalaryInput(String(rates.SMMLV));
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-neutral-300 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setMode("forward")}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold transition-all",
              mode === "forward"
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
            )}
          >
            {calculatorT("mode.forward")}
          </button>
          <button
            type="button"
            onClick={() => setMode("reverse")}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold transition-all",
              mode === "reverse"
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
            )}
          >
            {calculatorT("mode.reverse")}
          </button>
        </div>
      </div>

      {/* Hero Input (Salary or Budget based on mode) */}
      <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50/50 p-8 shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50 sm:p-12">
        <div className="space-y-6">
          <div className="text-center">
            {mode === "forward" ? (
              <>
                <div className="flex items-center justify-center gap-3">
                  <label className="block text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {formT("baseSalary.label")}
                  </label>
                  <button
                    type="button"
                    onClick={resetToMinimumWage}
                    disabled={useIntegral}
                    className={cn(
                      "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50",
                      useIntegral ? "opacity-50 cursor-not-allowed" : "",
                    )}
                    title={calculatorT("resetButton.title")}
                    aria-label={calculatorT("resetButton.title")}
                  >
                    {calculatorT("resetButton.label")}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={useIntegral}
                  className={cn(
                    "mt-4 w-full border-0 bg-transparent text-center text-5xl font-bold text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:text-blue-600 dark:text-neutral-50 dark:placeholder:text-neutral-700 dark:focus:text-blue-400 sm:text-6xl lg:text-7xl",
                    useIntegral ? "opacity-60" : "",
                  )}
                  value={formatInputMoney(salaryInput)}
                  onChange={(event) => handleSalaryChange(event.target.value)}
                  placeholder={formatInputMoney(String(rates.SMMLV))}
                />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {formT("baseSalary.helper")}
                </p>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {calculatorT("mode.budgetLabel")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="mt-4 w-full border-0 bg-transparent text-center text-5xl font-bold text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:text-blue-600 dark:text-neutral-50 dark:placeholder:text-neutral-700 dark:focus:text-blue-400 sm:text-6xl lg:text-7xl"
                  value={formatInputMoney(budgetInput)}
                  onChange={(event) => handleBudgetChange(event.target.value)}
                  placeholder={formatInputMoney("3000000")}
                />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {calculatorT("mode.budgetHelper")}
                </p>
              </>
            )}
            {calculation.errors.salary && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {validationT(calculation.errors.salary)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reverse Mode Result: Employee Salary */}
      {mode === "reverse" && isValid && (
        <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 p-8 shadow-xl dark:border-green-900 dark:from-green-950/50 dark:to-emerald-950/30 sm:p-12">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-green-700 dark:text-green-300">
              {calculatorT("mode.employeeSalary")}
            </h2>
            <div className="mt-4 text-5xl font-bold text-green-900 dark:text-green-100 sm:text-6xl lg:text-7xl">
              {formatMoney(calculation.salaryBase)}
            </div>
            <p className="mt-4 text-base text-green-700 dark:text-green-300">
              {calculatorT("mode.employeeSalaryDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Total Cost Display - Out-of-Pocket vs Annualized */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 shadow-xl dark:border-blue-900 dark:from-blue-950/50 dark:to-indigo-950/30 sm:p-10">
        <div className="space-y-6">
          {/* Two-column comparison */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Out-of-Pocket */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {calculatorT("costs.outOfPocket.label")}
                </h3>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                  {calculatorT("costs.outOfPocket.badge")}
                </span>
              </div>
              <div className="mt-3 text-4xl font-bold text-amber-900 dark:text-amber-100 sm:text-5xl">
                {isValid ? formatMoney(calculation.totals.monthlyOutOfPocket) : "—"}
              </div>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                {calculatorT("costs.outOfPocket.description")}
              </p>
            </div>

            {/* Monthly Annualized (True Cost) */}
            <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 dark:border-blue-800 dark:from-blue-950/40 dark:to-indigo-950/30">
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {calculatorT("costs.annualized.label")}
                </h3>
                <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-bold text-blue-900 dark:bg-blue-900/50 dark:text-blue-200">
                  {calculatorT("costs.annualized.badge")}
                </span>
              </div>
              <div className="mt-3 text-4xl font-bold text-blue-900 dark:text-blue-100 sm:text-5xl">
                {isValid ? formatMoney(calculation.totals.monthly) : "—"}
              </div>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                {calculatorT("costs.annualized.description")}
              </p>
            </div>
          </div>

          {/* Educational Warning */}
          {isValid && !useIntegral && calculation.accruals.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {calculatorT("costs.warning.title")}
                  </p>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {calculatorT("costs.warning.description")}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-lg bg-white/60 px-3 py-2 dark:bg-amber-950/30">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        {calculatorT("costs.warning.difference")}
                      </span>
                      <span className="ml-2 font-bold text-amber-900 dark:text-amber-100">
                        {formatMoney(calculation.totals.monthly - calculation.totals.monthlyOutOfPocket)}
                      </span>
                      <span className="ml-1 text-amber-700 dark:text-amber-400">
                        /month
                      </span>
                    </div>
                    <div className="rounded-lg bg-white/60 px-3 py-2 dark:bg-amber-950/30">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        {calculatorT("costs.warning.annual")}
                      </span>
                      <span className="ml-2 font-bold text-amber-900 dark:text-amber-100">
                        {formatMoney((calculation.totals.monthly - calculation.totals.monthlyOutOfPocket) * 12)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Annual Total */}
          <div className="rounded-2xl bg-white/60 px-6 py-4 text-center backdrop-blur dark:bg-neutral-900/40">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {resultT("annual")}
            </p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {isValid ? formatMoney(calculation.totals.annual) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Context */}
      {isValid && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {resultT("contributionBase")}
            </dt>
            <dd className="mt-2 text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatMoney(calculation.context.contributionBase)}
            </dd>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {contextT("transport")}
            </dt>
            <dd className="mt-2 text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatMoney(
                calculation.context.transportIncluded ? calculation.context.transportAmount : 0,
              )}
            </dd>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {contextT("exoneration")}
            </dt>
            <dd className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              {calculation.context.exonerationApplied
                ? contextT("exonerationApplied")
                : contextT("exonerationNotApplied")}
            </dd>
          </div>
        </div>
      )}

      {/* Advanced Settings - Collapsible */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {calculatorT("advanced.title")}
          </h3>
          <span className="text-2xl font-light text-blue-600 dark:text-blue-400">
            {showAdvanced ? "−" : "+"}
          </span>
        </button>
        {showAdvanced && (
          <div className="mt-6 grid gap-5">
            <Field
              label={formT("smmlv.label")}
              helper={formT("smmlv.helper")}
              error={calculation.errors.smmlv ? validationT(calculation.errors.smmlv) : undefined}
            >
              <CurrencyInput
                value={smmlvInput}
                onChange={setSmmlvInput}
                placeholder={formT("smmlv.placeholder")}
              />
            </Field>
            <Field label={formT("arl.label")} helper={formT("arl.helper")}>
              <select
                value={arlClass}
                onChange={(event) => setArlClass(event.target.value as RiskClass)}
                className="block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base font-medium text-neutral-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
              >
                {(["I", "II", "III", "IV", "V"] as RiskClass[]).map((option) => (
                  <option key={option} value={option}>
                    {formT(`arl.options.${option}`)}
                  </option>
                ))}
              </select>
            </Field>
            <CheckboxField
              checked={exoneration}
              onChange={setExoneration}
              label={formT("exoneration.label")}
              helper={formT("exoneration.helper")}
            />
            <ToggleField
              checked={useIntegral}
              onChange={setUseIntegral}
              label={formT("integral.label")}
              helper={formT("integral.helper")}
              badge={formT("integral.badge")}
            />
            {useIntegral && (
              <Field
                label={formT("integralAmount.label")}
                helper={integralT("note")}
                error={
                  calculation.errors.integralSalary
                    ? validationT(calculation.errors.integralSalary)
                    : undefined
                }
              >
                <CurrencyInput
                  value={integralInput}
                  onChange={setIntegralInput}
                  placeholder={formT("integralAmount.placeholder")}
                />
              </Field>
            )}
          </div>
        )}
      </div>

      {/* Breakdown Section - Color Coded */}
      <div className="grid gap-6">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-100/30 p-6 shadow-sm dark:border-blue-900 dark:from-blue-950/30 dark:to-blue-900/20">
          <h3 className="flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-100">
            <span className="inline-block size-3 rounded-full bg-blue-500"></span>
            {breakdownT("contributions.title")}
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {calculatorT("descriptions.contributions")}
          </p>
          <ColorCodedBreakdownList
            ids={CONTRIBUTION_IDS}
            map={contributionMap}
            translate={(id) => breakdownT(`contributions.${id}`)}
            format={formatMoney}
            isValid={isValid}
            emptyLabel={breakdownT("empty")}
            colorScheme="blue"
          />
        </div>

        {!useIntegral && (
          <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-100/30 p-6 shadow-sm dark:border-green-900 dark:from-green-950/30 dark:to-emerald-900/20">
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-900 dark:text-green-100">
              <span className="inline-block size-3 rounded-full bg-green-500"></span>
              {breakdownT("accruals.title")}
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {calculatorT("descriptions.accruals")}
            </p>
            <ColorCodedBreakdownList
              ids={ACCRUAL_IDS}
              map={accrualMap}
              translate={(id) => breakdownT(`accruals.${id}`)}
              format={formatMoney}
              isValid={isValid && hasAccruals}
              emptyLabel={breakdownT("empty")}
              colorScheme="green"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      {children}
      {helper && <span className="text-xs text-neutral-500">{helper}</span>}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const handleChange = (newValue: string) => {
    const cleaned = newValue.replace(/[^\d]/g, "");
    onChange(cleaned);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base font-semibold text-neutral-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-600",
        disabled ? "opacity-60" : "",
      )}
      value={formatInputMoney(value)}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helper?: string;
}) {
  const generatedId = useId();
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-neutral-700">
      <input
        id={generatedId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={generatedId} className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
        <span className="font-medium text-neutral-900 dark:text-white">{label}</span>
        {helper && <p className="mt-1 text-xs text-neutral-500">{helper}</p>}
      </label>
    </div>
  );
}

function ToggleField({
  checked,
  onChange,
  label,
  helper,
  badge,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helper?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700">
      <div className="flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          {label}
          {badge && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
              {badge}
            </span>
          )}
        </span>
        {helper && <p className="mt-1 text-xs text-neutral-500">{helper}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-14 items-center rounded-full border border-transparent transition",
          checked ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "size-6 translate-x-1 transform rounded-full bg-white shadow transition",
            checked && "translate-x-7",
          )}
        />
      </button>
    </div>
  );
}

function getPaymentFrequency(id: string, translateFn: (key: string) => string): string {
  // Contributions are monthly
  if (["salud", "pension", "arl", "caja", "sena", "icbf"].includes(id)) {
    return translateFn("frequency.monthly");
  }

  // Accruals have specific schedules
  if (id === "prima") return translateFn("frequency.semiAnnual");
  if (id === "cesantias") return translateFn("frequency.annual");
  if (id === "intereses_cesantias") return translateFn("frequency.annual");
  if (id === "vacaciones") return translateFn("frequency.whenTaken");

  return translateFn("frequency.monthly");
}

function ColorCodedBreakdownList<T extends string>({
  ids,
  map,
  translate,
  format,
  isValid,
  emptyLabel,
  colorScheme,
}: {
  ids: T[];
  map: Map<T, number>;
  translate: (id: T) => string;
  format: (value: number) => string;
  isValid: boolean;
  emptyLabel: string;
  colorScheme: "blue" | "green";
}) {
  const calculatorT = useTranslations("calculator");

  if (!isValid) {
    return <p className="mt-3 text-sm text-neutral-500">{emptyLabel}</p>;
  }

  const colorClasses = {
    blue: {
      bg: "bg-white/80 dark:bg-blue-900/20",
      text: "text-blue-900 dark:text-blue-100",
      border: "border-blue-100 dark:border-blue-900",
      headerBg: "bg-blue-100/50 dark:bg-blue-900/30",
    },
    green: {
      bg: "bg-white/80 dark:bg-green-900/20",
      text: "text-green-900 dark:text-green-100",
      border: "border-green-100 dark:border-green-900",
      headerBg: "bg-green-100/50 dark:bg-green-900/30",
    },
  };

  const colors = colorClasses[colorScheme];

  const monthlyTotal = ids.reduce((sum, id) => sum + (map.get(id) ?? 0), 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={cn("text-xs font-semibold uppercase tracking-wide", colors.text)}>
            <th className="pb-3 pr-3 text-left">{calculatorT("table.item")}</th>
            <th className="px-3 pb-3 text-right">{calculatorT("table.monthly")}</th>
            <th className="px-3 pb-3 text-right">{calculatorT("table.annual")}</th>
            <th className="pl-3 pb-3 text-left">{calculatorT("table.frequency")}</th>
          </tr>
        </thead>
        <tbody className="space-y-2">
          {ids.map((id) => {
            const monthlyAmount = map.get(id) ?? 0;
            const annualAmount = monthlyAmount * 12;
            return (
              <tr
                key={id}
                className={cn(
                  "rounded-xl border backdrop-blur transition hover:scale-[1.01]",
                  colors.bg,
                  colors.text,
                  colors.border,
                )}
              >
                <td className="rounded-l-xl border-r px-3 py-3 text-sm font-semibold border-inherit">
                  {translate(id)}
                </td>
                <td className="border-r px-3 py-3 text-right text-sm font-bold tabular-nums border-inherit">
                  {format(monthlyAmount)}
                </td>
                <td className="border-r px-3 py-3 text-right text-sm font-bold tabular-nums border-inherit">
                  {format(annualAmount)}
                </td>
                <td className="rounded-r-xl px-3 py-3 text-xs">
                  {getPaymentFrequency(id, (key) => calculatorT(key))}
                </td>
              </tr>
            );
          })}
          <tr className={cn("font-bold", colors.text, colors.headerBg)}>
            <td className="rounded-l-xl px-3 py-3 text-sm uppercase tracking-wide">
              {calculatorT("table.total")}
            </td>
            <td className="px-3 py-3 text-right text-sm tabular-nums">
              {format(monthlyTotal)}
            </td>
            <td className="px-3 py-3 text-right text-sm tabular-nums">
              {format(annualTotal)}
            </td>
            <td className="rounded-r-xl"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
