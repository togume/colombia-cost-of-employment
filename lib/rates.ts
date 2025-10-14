import rates from "@/config/rates.json";

const DEFAULT_YEAR_VALUE = "2025" as const;

type RatesRecord = typeof rates;

export type AvailableYear = keyof RatesRecord;

type DefaultYear = typeof DEFAULT_YEAR_VALUE;

type SampleYear = RatesRecord[DefaultYear];

export type RiskClass = keyof SampleYear["contrib"]["arl"];

export interface EmployerContribRates {
  salud_employer: number;
  pension_employer: number;
  caja: number;
  sena: number;
  icbf: number;
  arl: Record<RiskClass, number>;
}

export interface AccrualRates {
  prima: number;
  cesantias: number;
  intereses_cesantias: number;
  vacaciones: number;
}

export interface IntegralRules {
  min_smmlv: number;
  factor_prestacional: number;
}

export interface YearlyRates {
  SMMLV: number;
  aux_transporte: number;
  contrib: EmployerContribRates;
  accruals: AccrualRates;
  integral: IntegralRules;
}

export const DEFAULT_YEAR: AvailableYear = DEFAULT_YEAR_VALUE;

export function getYearlyRates(year: AvailableYear = DEFAULT_YEAR): YearlyRates {
  return rates[year];
}

export function listAvailableYears(): AvailableYear[] {
  return Object.keys(rates) as AvailableYear[];
}
