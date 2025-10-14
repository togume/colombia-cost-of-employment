"use client";

import { useMemo, useState, useId } from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import {
  computeEmployerCosts,
  type ContributionId,
  type AccrualId,
} from "@/lib/calculator";
import { DEFAULT_YEAR, getYearlyRates, type RiskClass } from "@/lib/rates";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const rates = getYearlyRates(DEFAULT_YEAR);

const DEFAULT_SALARY = "4000000";

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

export function CalculatorCard() {
  const formT = useTranslations("form");
  const resultT = useTranslations("results");
  const breakdownT = useTranslations("breakdown");
  const validationT = useTranslations("validation");
  const integralT = useTranslations("integral");
  const contextT = useTranslations("context");
  const { locale } = useLocale();

  const [salaryInput, setSalaryInput] = useState<string>(DEFAULT_SALARY);
  const [smmlvInput, setSmmlvInput] = useState<string>(String(rates.SMMLV));
  const [arlClass, setArlClass] = useState<RiskClass>("I");
  const [exoneration, setExoneration] = useState(false);
  const [useIntegral, setUseIntegral] = useState(false);
  const [integralInput, setIntegralInput] = useState<string>("");

  const salaryValue = useMemo(() => parseMoney(salaryInput), [salaryInput]);
  const smmlvValue = useMemo(() => parseMoney(smmlvInput), [smmlvInput]);
  const integralValue = useMemo(() => parseMoney(integralInput), [integralInput]);

  const calculation = useMemo(
    () =>
      computeEmployerCosts(
        {
          salary: salaryValue ?? Number.NaN,
          smmlv: smmlvValue ?? Number.NaN,
          arlClass,
          exoneration,
          useIntegral,
          integralSalary: useIntegral ? integralValue ?? Number.NaN : undefined,
        },
        rates,
      ),
    [salaryValue, smmlvValue, arlClass, exoneration, useIntegral, integralValue],
  );

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

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12">
      <div className="grid gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <header>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {formT("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{resultT("contributionBase")}</p>
        </header>
        <div className="grid gap-5">
          <Field
            label={formT("baseSalary.label")}
            helper={formT("baseSalary.helper")}
            error={calculation.errors.salary ? validationT(calculation.errors.salary) : undefined}
          >
            <CurrencyInput
              value={salaryInput}
              onChange={setSalaryInput}
              placeholder={formT("baseSalary.placeholder")}
              disabled={useIntegral}
            />
          </Field>
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
              className="block w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-base font-medium text-neutral-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
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
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {resultT("title")}
            </h2>
          </header>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StatBlock
              label={resultT("monthly")}
              value={isValid ? formatMoney(calculation.totals.monthly) : "—"}
            />
            <StatBlock
              label={resultT("annual")}
              value={isValid ? formatMoney(calculation.totals.annual) : "—"}
            />
          </div>
          <dl className="mt-6 grid gap-3 text-sm text-neutral-500">
            <div className="flex items-center justify-between">
              <dt className="font-medium text-neutral-600 dark:text-neutral-300">
                {resultT("contributionBase")}
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-50">
                {isValid ? formatMoney(calculation.context.contributionBase) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-neutral-600 dark:text-neutral-300">
                {contextT("arlRate")}
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-50">
                {isValid ? formatPercent(calculation.context.arlRate, locale) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-neutral-600 dark:text-neutral-300">
                {contextT("transport")}
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-50">
                {isValid
                  ? formatMoney(
                      calculation.context.transportIncluded
                        ? calculation.context.transportAmount
                        : 0,
                    )
                  : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-neutral-600 dark:text-neutral-300">
                {contextT("exoneration")}
              </dt>
              <dd className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
                {isValid && calculation.context.exonerationApplied
                  ? contextT("exonerationApplied")
                  : contextT("exonerationNotApplied")}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-neutral-500">
            {isValid
              ? calculation.context.transportIncluded
                ? resultT("transportIncluded")
                : resultT("transportExcluded")
              : ""}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {isValid
              ? calculation.context.exonerationApplied
                ? resultT("exonerationApplied")
                : resultT("exonerationNotApplied")
              : ""}
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {breakdownT("contributions.title")}
          </h3>
          <BreakdownList
            ids={CONTRIBUTION_IDS}
            map={contributionMap}
            translate={(id) => breakdownT(`contributions.${id}`)}
            format={formatMoney}
            isValid={isValid}
            emptyLabel={breakdownT("empty")}
          />
        </div>

        {!useIntegral && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {breakdownT("accruals.title")}
            </h3>
            <BreakdownList
              ids={ACCRUAL_IDS}
              map={accrualMap}
              translate={(id) => breakdownT(`accruals.${id}`)}
              format={formatMoney}
              isValid={isValid && hasAccruals}
              emptyLabel={breakdownT("empty")}
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
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-base font-semibold text-neutral-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-600",
        disabled ? "opacity-60" : "",
      )}
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:border-neutral-700">
      <input
        id={generatedId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
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
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
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
          checked ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700",
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{value}</dd>
    </div>
  );
}

function BreakdownList<T extends string>({
  ids,
  map,
  translate,
  format,
  isValid,
  emptyLabel,
}: {
  ids: T[];
  map: Map<T, number>;
  translate: (id: T) => string;
  format: (value: number) => string;
  isValid: boolean;
  emptyLabel: string;
}) {
  if (!isValid) {
    return <p className="mt-3 text-sm text-neutral-500">{emptyLabel}</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {ids.map((id) => (
        <li
          key={id}
          className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200"
        >
          <span>{translate(id)}</span>
          <span>{format(map.get(id) ?? 0)}</span>
        </li>
      ))}
    </ul>
  );
}
