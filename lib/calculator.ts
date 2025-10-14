import { type YearlyRates, type RiskClass } from "@/lib/rates";

export type ContributionId =
  | "salud"
  | "pension"
  | "arl"
  | "caja"
  | "sena"
  | "icbf";

export type AccrualId =
  | "prima"
  | "cesantias"
  | "intereses_cesantias"
  | "vacaciones";

export type BreakdownId = ContributionId | AccrualId;

export interface CalculatorInput {
  salary: number;
  smmlv: number;
  arlClass: RiskClass;
  exoneration: boolean;
  useIntegral: boolean;
  integralSalary?: number;
}

export type FieldErrorCode =
  | "salary-required"
  | "salary-positive"
  | "smmlv-required"
  | "smmlv-positive"
  | "integral-required"
  | "integral-positive"
  | "integral-min";

export type FieldErrorMap = Partial<Record<"salary" | "smmlv" | "integralSalary", FieldErrorCode>>;

export interface BreakdownItem {
  id: BreakdownId;
  amount: number;
}

export interface CalculationContext {
  exonerationApplied: boolean;
  transportIncluded: boolean;
  transportAmount: number;
  arlRate: number;
  contributionBase: number;
}

export interface CalculationResult {
  status: "invalid" | "valid";
  errors: FieldErrorMap;
  contributions: BreakdownItem[];
  accruals: BreakdownItem[];
  totals: {
    monthly: number;
    annual: number;
  };
  salaryBase: number;
  context: CalculationContext;
}

const FIELD_ORDER: Array<keyof FieldErrorMap> = ["salary", "smmlv", "integralSalary"];

export function computeEmployerCosts(
  input: CalculatorInput,
  rates: YearlyRates,
): CalculationResult {
  const errors: FieldErrorMap = {};

  if (!Number.isFinite(input.smmlv)) {
    errors.smmlv = "smmlv-required";
  } else if (input.smmlv <= 0) {
    errors.smmlv = "smmlv-positive";
  }

  if (input.useIntegral) {
    if (!Number.isFinite(input.integralSalary)) {
      errors.integralSalary = "integral-required";
    } else if ((input.integralSalary ?? 0) <= 0) {
      errors.integralSalary = "integral-positive";
    } else if (
      input.smmlv &&
      (input.integralSalary ?? 0) < rates.integral.min_smmlv * input.smmlv
    ) {
      errors.integralSalary = "integral-min";
    }
  } else {
    if (!Number.isFinite(input.salary)) {
      errors.salary = "salary-required";
    } else if (input.salary <= 0) {
      errors.salary = "salary-positive";
    }
  }

  if (FIELD_ORDER.some((field) => errors[field])) {
    return {
      status: "invalid",
      errors,
      contributions: [],
      accruals: [],
      totals: {
        monthly: 0,
        annual: 0,
      },
      salaryBase: 0,
      context: {
        exonerationApplied: false,
        transportIncluded: false,
        transportAmount: 0,
        arlRate: 0,
        contributionBase: 0,
      },
    };
  }

  const salary =
    input.useIntegral && input.integralSalary ? input.integralSalary : input.salary;

  const contributionBase = input.useIntegral
    ? (input.integralSalary ?? 0) / (1 + rates.integral.factor_prestacional)
    : input.salary;

  const transportEligible =
    !input.useIntegral && input.salary <= 2 * input.smmlv ? rates.aux_transporte : 0;

  const exonerationApplies =
    input.exoneration && contributionBase < 10 * input.smmlv;

  const contributions: BreakdownItem[] = [
    {
      id: "salud",
      amount: exonerationApplies
        ? 0
        : rates.contrib.salud_employer * contributionBase,
    },
    {
      id: "pension",
      amount: rates.contrib.pension_employer * contributionBase,
    },
    {
      id: "arl",
      amount: rates.contrib.arl[input.arlClass] * contributionBase,
    },
    {
      id: "caja",
      amount: rates.contrib.caja * contributionBase,
    },
    {
      id: "sena",
      amount: exonerationApplies ? 0 : rates.contrib.sena * contributionBase,
    },
    {
      id: "icbf",
      amount: exonerationApplies ? 0 : rates.contrib.icbf * contributionBase,
    },
  ];

  const accruals: BreakdownItem[] = input.useIntegral
    ? []
    : [
        {
          id: "prima",
          amount: rates.accruals.prima * (input.salary + transportEligible),
        },
        {
          id: "cesantias",
          amount: rates.accruals.cesantias * (input.salary + transportEligible),
        },
        {
          id: "intereses_cesantias",
          amount:
            rates.accruals.intereses_cesantias * (input.salary + transportEligible),
        },
        {
          id: "vacaciones",
          amount: rates.accruals.vacaciones * input.salary,
        },
      ];

  const contributionsTotal = contributions.reduce((sum, item) => sum + item.amount, 0);
  const accrualsTotal = accruals.reduce((sum, item) => sum + item.amount, 0);

  const monthlyTotal = salary + transportEligible + contributionsTotal + accrualsTotal;
  const annualTotal = monthlyTotal * 12;

  return {
    status: "valid",
    errors,
    contributions,
    accruals,
    totals: {
      monthly: monthlyTotal,
      annual: annualTotal,
    },
    salaryBase: salary,
    context: {
      exonerationApplied: exonerationApplies,
      transportIncluded: transportEligible > 0,
      transportAmount: transportEligible,
      arlRate: rates.contrib.arl[input.arlClass],
      contributionBase,
    },
  };
}
