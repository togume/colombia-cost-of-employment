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

export type EmployeeDeductionId = "salud_employee" | "pension_employee";

export interface CalculatorInput {
  salary: number;
  smmlv: number;
  arlClass: RiskClass;
  exoneration: boolean;
  useIntegral: boolean;
  integralSalary?: number;
  employeePensionContribution: boolean;
}

export interface BudgetCalculatorInput {
  targetMonthlyCost: number;
  smmlv: number;
  arlClass: RiskClass;
  exoneration: boolean;
  employeePensionContribution: boolean;
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
    monthlyOutOfPocket: number;
    monthly: number;
    annual: number;
  };
  salaryBase: number;
  context: CalculationContext;
  summary: {
    employeeNetMonthly: number;
    employeeGrossTransfer: number;
    employeeDeductions: Array<{ id: EmployeeDeductionId; amount: number }>;
    employerAgenciesMonthly: number;
    accrualsMonthly: number;
  };
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
        monthlyOutOfPocket: 0,
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
      summary: {
        employeeNetMonthly: 0,
        employeeGrossTransfer: 0,
        employeeDeductions: [
          { id: "salud_employee", amount: 0 },
          { id: "pension_employee", amount: 0 },
        ],
        employerAgenciesMonthly: 0,
        accrualsMonthly: 0,
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

  const employeeDeductionsRaw: Array<{ id: EmployeeDeductionId; amount: number }> = [
    {
      id: "salud_employee",
      amount: rates.employee.salud_employee * salary,
    },
  ];
  if (input.employeePensionContribution) {
    employeeDeductionsRaw.push({
      id: "pension_employee",
      amount: rates.employee.pension_employee * salary,
    });
  }

  const employeeDeductions = employeeDeductionsRaw.map((item) => ({
    ...item,
    amount: Math.max(0, item.amount),
  }));

  const employeeDeductionsTotal = employeeDeductions.reduce((sum, item) => sum + item.amount, 0);
  const employeeGrossTransfer = salary + transportEligible;
  const employeeNetMonthly = Math.max(0, employeeGrossTransfer - employeeDeductionsTotal);

  const monthlyOutOfPocket = salary + transportEligible + contributionsTotal;
  const monthlyTotal = monthlyOutOfPocket + accrualsTotal;
  const annualTotal = monthlyTotal * 12;

  return {
    status: "valid",
    errors,
    contributions,
    accruals,
    totals: {
      monthlyOutOfPocket,
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
    summary: {
      employeeNetMonthly,
      employeeGrossTransfer,
      employeeDeductions,
      employerAgenciesMonthly: contributionsTotal,
      accrualsMonthly: accrualsTotal,
    },
  };
}

/**
 * Reverse calculation: compute salary from a target monthly budget
 */
export function computeSalaryFromBudget(
  input: BudgetCalculatorInput,
  rates: YearlyRates,
): CalculationResult {
  const errors: FieldErrorMap = {};

  if (!Number.isFinite(input.targetMonthlyCost) || input.targetMonthlyCost <= 0) {
    errors.salary = "salary-required";
  }

  if (!Number.isFinite(input.smmlv) || input.smmlv <= 0) {
    errors.smmlv = "smmlv-required";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "invalid",
      errors,
      contributions: [],
      accruals: [],
      totals: {
        monthlyOutOfPocket: 0,
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
      summary: {
        employeeNetMonthly: 0,
        employeeGrossTransfer: 0,
        employeeDeductions: [
          { id: "salud_employee", amount: 0 },
          { id: "pension_employee", amount: 0 },
        ],
        employerAgenciesMonthly: 0,
        accrualsMonthly: 0,
      },
    };
  }

  const arlRate = rates.contrib.arl[input.arlClass];
  const transportAmount = rates.aux_transporte;

  const contribRateWithoutExoneration =
    rates.contrib.salud_employer +
    rates.contrib.pension_employer +
    rates.contrib.caja +
    rates.contrib.sena +
    rates.contrib.icbf +
    arlRate;

  const contribRateWithExoneration =
    rates.contrib.pension_employer + rates.contrib.caja + arlRate;

  const accrualSalaryRate =
    rates.accruals.prima +
    rates.accruals.cesantias +
    rates.accruals.intereses_cesantias +
    rates.accruals.vacaciones;

  const accrualTransportRate =
    rates.accruals.prima +
    rates.accruals.cesantias +
    rates.accruals.intereses_cesantias;

  type CandidateSolution = {
    salary: number;
  };

  const candidates: CandidateSolution[] = [];

  const addCandidate = (salary: number) => {
    if (!Number.isFinite(salary) || salary <= 0) {
      return;
    }
    candidates.push({ salary });
  };

  // Case 1: Salary qualifies for transport (salary ≤ 2×SMMLV)
  if (transportAmount > 0) {
    const contribRate =
      input.exoneration ? contribRateWithExoneration : contribRateWithoutExoneration;
    const denominator = 1 + contribRate + accrualSalaryRate;
    const numerator = input.targetMonthlyCost - transportAmount * (1 + accrualTransportRate);

    if (denominator > 0) {
      const salaryWithTransport = numerator / denominator;
      if (salaryWithTransport > 0 && salaryWithTransport <= 2 * input.smmlv) {
        addCandidate(salaryWithTransport);
      }
    }
  }

  // Case 2: Salary between transport threshold and exoneration threshold (if exoneration applies)
  if (input.exoneration) {
    const denominator = 1 + contribRateWithExoneration + accrualSalaryRate;
    if (denominator > 0) {
      const salaryWithExoneration = input.targetMonthlyCost / denominator;
      if (
        salaryWithExoneration > 2 * input.smmlv &&
        salaryWithExoneration < 10 * input.smmlv
      ) {
        addCandidate(salaryWithExoneration);
      }
    }
  }

  // Case 3: Salary above exoneration threshold OR exoneration disabled
  {
    const denominator = 1 + contribRateWithoutExoneration + accrualSalaryRate;
    if (denominator > 0) {
      const salaryWithoutExoneration = input.targetMonthlyCost / denominator;
      const lowerBound = input.exoneration ? 10 * input.smmlv : 0;
      if (salaryWithoutExoneration >= Math.max(2 * input.smmlv, lowerBound)) {
        addCandidate(salaryWithoutExoneration);
      }
    }
  }

  const evaluatedCandidates = candidates
    .map((candidate) => {
      const forwardResult = computeEmployerCosts(
        {
          salary: candidate.salary,
          smmlv: input.smmlv,
          arlClass: input.arlClass,
          exoneration: input.exoneration,
          useIntegral: false,
          integralSalary: undefined,
          employeePensionContribution: input.employeePensionContribution,
        },
        rates,
      );

      if (forwardResult.status !== "valid") {
        return null;
      }

      const diff = Math.abs(
        forwardResult.totals.monthly - input.targetMonthlyCost,
      );

      return { result: forwardResult, diff };
    })
    .filter((candidate): candidate is { result: CalculationResult; diff: number } => candidate !== null)
    .sort((a, b) => a.diff - b.diff);

  if (evaluatedCandidates.length > 0) {
    return evaluatedCandidates[0].result;
  }

  errors.salary = "salary-required";

  return {
    status: "invalid",
    errors,
    contributions: [],
    accruals: [],
    totals: {
      monthlyOutOfPocket: 0,
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
    summary: {
      employeeNetMonthly: 0,
      employeeGrossTransfer: 0,
      employeeDeductions: [
        { id: "salud_employee", amount: 0 },
        { id: "pension_employee", amount: 0 },
      ],
      employerAgenciesMonthly: 0,
      accrualsMonthly: 0,
    },
  };
}
