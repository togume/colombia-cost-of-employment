import { type YearlyRates } from "@/lib/rates";

export type OvertimeType =
  | "extra_diurna"
  | "extra_nocturna"
  | "dominical_diurna"
  | "dominical_nocturna";

export interface OvertimeInput {
  monthlySalary: number;
  hours: Record<OvertimeType, number>;
}

export interface OvertimeBreakdownItem {
  type: OvertimeType;
  hours: number;
  ratePerHour: number;
  multiplier: number;
  total: number;
}

export interface OvertimeResult {
  hourlyBaseRate: number;
  breakdown: OvertimeBreakdownItem[];
  totalHours: number;
  totalAmount: number;
}

export function calculateHourlyRate(
  monthlySalary: number,
  hoursPerMonth: number
): number {
  return monthlySalary / hoursPerMonth;
}

export function calculateOvertime(
  input: OvertimeInput,
  rates: YearlyRates
): OvertimeResult {
  const hourlyBaseRate = calculateHourlyRate(
    input.monthlySalary,
    rates.overtime.hours_per_month
  );

  const overtimeTypes: OvertimeType[] = [
    "extra_diurna",
    "extra_nocturna",
    "dominical_diurna",
    "dominical_nocturna",
  ];

  const breakdown: OvertimeBreakdownItem[] = overtimeTypes.map((type) => {
    const hours = input.hours[type] || 0;
    const multiplier = rates.overtime[type];
    const ratePerHour = hourlyBaseRate * multiplier;
    const total = hours * ratePerHour;

    return {
      type,
      hours,
      ratePerHour,
      multiplier,
      total,
    };
  });

  const totalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);
  const totalAmount = breakdown.reduce((sum, item) => sum + item.total, 0);

  return {
    hourlyBaseRate,
    breakdown,
    totalHours,
    totalAmount,
  };
}

export function getEmptyOvertimeHours(): Record<OvertimeType, number> {
  return {
    extra_diurna: 0,
    extra_nocturna: 0,
    dominical_diurna: 0,
    dominical_nocturna: 0,
  };
}
