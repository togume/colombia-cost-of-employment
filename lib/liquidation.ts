import { type YearlyRates } from "@/lib/rates";

export type LiquidationItemId =
  | "outstanding_salary"
  | "prima"
  | "cesantias"
  | "intereses_cesantias"
  | "vacaciones";

export interface LiquidationInput {
  salary: number;
  smmlv: number;
  startDate: Date;
  endDate: Date;
}

export type LiquidationFieldError =
  | "salary-required"
  | "salary-positive"
  | "smmlv-required"
  | "smmlv-positive"
  | "start-required"
  | "end-required"
  | "date-order";

export type LiquidationField = "salary" | "smmlv" | "startDate" | "endDate";

export type LiquidationErrorMap = Partial<Record<LiquidationField, LiquidationFieldError>>;

export interface LiquidationBreakdownItem {
  id: LiquidationItemId;
  amount: number;
}

export interface LiquidationContext {
  tenureDays: number;
  tenureMonths: number;
  transportIncluded: boolean;
  transportAmount: number;
  daysInFinalPeriod: number;
}

export interface LiquidationResult {
  status: "invalid" | "valid";
  errors: LiquidationErrorMap;
  breakdown: LiquidationBreakdownItem[];
  totals: {
    total: number;
  };
  context: LiquidationContext;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDaysInclusive(start: Date, end: Date): number {
  const normalizedStart = startOfDay(start);
  const normalizedEnd = startOfDay(end);
  const diff = normalizedEnd.getTime() - normalizedStart.getTime();
  return Math.floor(diff / MS_PER_DAY) + 1;
}

function clampPositive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function computeLiquidation(
  input: LiquidationInput,
  rates: YearlyRates,
): LiquidationResult {
  const errors: LiquidationErrorMap = {};

  if (!Number.isFinite(input.salary)) {
    errors.salary = "salary-required";
  } else if (input.salary <= 0) {
    errors.salary = "salary-positive";
  }

  if (!Number.isFinite(input.smmlv)) {
    errors.smmlv = "smmlv-required";
  } else if (input.smmlv <= 0) {
    errors.smmlv = "smmlv-positive";
  }

  if (!(input.startDate instanceof Date) || Number.isNaN(input.startDate.getTime())) {
    errors.startDate = "start-required";
  }

  if (!(input.endDate instanceof Date) || Number.isNaN(input.endDate.getTime())) {
    errors.endDate = "end-required";
  }

  if (!errors.startDate && !errors.endDate) {
    const normalizedStart = startOfDay(input.startDate);
    const normalizedEnd = startOfDay(input.endDate);
    if (normalizedEnd.getTime() < normalizedStart.getTime()) {
      errors.endDate = "date-order";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "invalid",
      errors,
      breakdown: [],
      totals: {
        total: 0,
      },
      context: {
        tenureDays: 0,
        tenureMonths: 0,
        transportIncluded: false,
        transportAmount: 0,
        daysInFinalPeriod: 0,
      },
    };
  }

  const salary = input.salary;
  const startDate = startOfDay(input.startDate);
  const endDate = startOfDay(input.endDate);

  const tenureDays = diffInDaysInclusive(startDate, endDate);
  const tenureMonths = tenureDays / 30;

  const transportIncluded = salary <= 2 * input.smmlv;
  const transportAmount = transportIncluded ? rates.aux_transporte : 0;

  const benefitsBase = salary + transportAmount;

  const monthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const salaryPeriodStart = startDate > monthStart ? startDate : monthStart;
  const daysInFinalPeriod = clampPositive(diffInDaysInclusive(salaryPeriodStart, endDate));
  const dailySalary = salary / 30;
  const outstandingSalary = dailySalary * daysInFinalPeriod;

  const prima = benefitsBase * (tenureDays / 360);
  const cesantias = benefitsBase * (tenureDays / 360);
  const interesesCesantias = cesantias * (tenureDays / 360) * 0.12;
  const vacaciones = salary * (tenureDays / 720);

  const breakdown: LiquidationBreakdownItem[] = [
    { id: "outstanding_salary", amount: outstandingSalary },
    { id: "prima", amount: prima },
    { id: "cesantias", amount: cesantias },
    { id: "intereses_cesantias", amount: interesesCesantias },
    { id: "vacaciones", amount: vacaciones },
  ];

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    status: "valid",
    errors,
    breakdown,
    totals: {
      total,
    },
    context: {
      tenureDays,
      tenureMonths,
      transportIncluded,
      transportAmount,
      daysInFinalPeriod,
    },
  };
}
