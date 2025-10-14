# 🇨🇴 Colombia Employee Cost Calculator — PRD

**Version:** 2.0
**Last Updated:** January 2025
**Product Type:** Public Web Application

---

## 1. Overview

A sophisticated, single-page calculator that solves the critical budgeting problem for Colombian employers: understanding the **true cost** of employment and avoiding budget surprises from lumpy payments.

The tool offers **dual-mode calculations** (salary-to-cost and budget-to-salary), **transparent cost breakdowns** (monthly out-of-pocket vs. annualized), and **comprehensive annual projections** with payment frequency indicators. Designed mobile-first with elegant, responsive UI featuring Colombian color accents.

### Core Value Propositions

1. **Prevent Budget Surprises:** Clearly distinguish monthly out-of-pocket payments from annualized costs (accruals paid semi-annually/annually)
2. **Reverse Budget Planning:** Start with a budget and calculate the salary you can afford
3. **Complete Transparency:** See every cost component with monthly, annual, and payment timing
4. **Instant Calculations:** Real-time updates as you adjust inputs
5. **Bilingual:** Full English and Spanish support

---

## 2. Objectives

- **Transparency:** Demystify contributions, benefits, and payment due dates
- **Budget Management:** Prevent surprises from lumpy payments (Prima, Cesantías, Vacaciones)
- **Reverse Planning:** Enable budget-first hiring decisions
- **Computation:** Deliver instant results with clear, detailed breakdowns
- **Education:** Provide concise explainers with high-level legal foundations
- **Maintainability:** Centralize yearly constants (SMMLV, rates) for easy updates

---

## 3. Target Users

- **Startup founders and entrepreneurs** — Budget-constrained, need to understand true employment costs
- **HR and operations professionals** — Managing headcount planning and budget forecasting
- **Finance managers and accountants** — Reconciling monthly payments with annual budgets
- **Small business owners** — First-time employers navigating Colombian labor laws
- **Contractors comparing arrangements** — Employee vs. contractor cost analysis

### User Scenarios

1. **"I have 3M COP/month budget, what salary can I offer?"** → Reverse calculator mode
2. **"Why did my employment costs spike in June?"** → Out-of-pocket vs. annualized view
3. **"What will this employee cost me annually?"** → Annual breakdown tables
4. **"When do I pay each component?"** → Payment frequency indicators

---

## 4. Key Features

### A. Dual-Mode Calculator

**Mode Toggle:** User can switch between:
1. **Forward Mode:** "Calculate from salary" — Input salary → Output total cost
2. **Reverse Mode:** "Calculate from budget" — Input budget → Output affordable salary

#### Forward Mode Inputs

- **Base salary** (COP) — Hero-sized input, defaults to SMMLV, formatted with thousands separators
- **Reset to SMMLV button** — Quick reset to minimum wage
- **Advanced Settings** (collapsible):
  - **SMMLV** — Auto-populated for current year; user-editable
  - **ARL risk class** (I–V) — Dropdown selection
  - **Exoneration eligibility** (Art. 114-1 ET) — Toggle switch
  - **"Use Salario Integral?"** — Toggle with validation rules (≥ 13× SMMLV)
  - **Integral salary amount** (if enabled)

#### Reverse Mode Inputs

- **Total monthly budget** (COP) — Hero-sized input
- **Advanced Settings** (same as forward mode, except salary-related)

#### Outputs (Both Modes)

**Cost Comparison Card:**
- **Monthly Out-of-Pocket** (Amber card) — What actually leaves the bank account each month
  - Salary + monthly contributions + transport
  - Badge: "Actual"
- **True Monthly Cost** (Blue card) — Including annualized accruals
  - Full cost when spreading annual payments across 12 months
  - Badge: "Annualized"

**Reverse Mode Additional Output:**
- **Employee Receives** (Green card) — Calculated take-home salary from budget

**Educational Warning** (when accruals present):
- ⚠️ "Budget for lumpy payments!"
- Explains difference accumulates monthly for lump-sum payments
- Shows monthly accumulation and annual total
- Specifies when payments occur (Prima: June & Dec, Cesantías: Feb, Vacaciones: when taken)

**Quick Context Cards:**
- Contribution base (IBC)
- Auxilio de transporte amount
- Exoneration status

**Annual Total:** Shows total annual employment cost

#### Detailed Breakdown Tables

**Enhanced Table Format** (replaces simple lists):
- **Columns:**
  1. Item name
  2. Monthly cost
  3. Annual cost
  4. Payment frequency
- **Totals row** at bottom
- **Color-coded:**
  - **Blue gradient:** Employer contributions (Salud, Pensión, ARL, Caja, SENA, ICBF)
  - **Green gradient:** Mandatory accruals (Prima, Cesantías, Intereses, Vacaciones)

**Payment Frequency Indicators:**
- **Monthly:** Contributions paid every month
- **Jun & Dec:** Prima (semi-annual)
- **February:** Cesantías and Intereses (annual)
- **When taken:** Vacaciones (variable)

**Conditional Display:**
- Accruals table hidden when "Use Salario Integral" is enabled
- Transport eligibility auto-calculated (salary ≤ 2× SMMLV)

### B. Design & User Experience

#### Visual Design System

**Color Palette:**
- **Primary:** Blue (contributions, primary actions)
- **Secondary:** Green (accruals, employee salary)
- **Warning:** Amber/Orange (out-of-pocket, lumpy payment warnings)
- **Colombian accent:** Subtle blue/yellow gradient hints

**Layout Architecture:**
1. **Hero Section**
   - Gradient background (white → blue/yellow tints)
   - Large, bold typography (4xl-6xl)
   - Centered, generous spacing
   - Language toggle (top-right, floating pill)

2. **Mode Toggle**
   - Centered pill-style toggle
   - Active state: Blue with shadow
   - Smooth transitions

3. **Calculator Flow** (single-column, progressive disclosure)
   - Hero input (salary or budget) — Massive, center-stage
   - Results card — Immediate, prominent
   - Quick context — 3-column grid
   - Advanced settings — Collapsed by default
   - Breakdown tables — Full-width, color-coded

4. **Explainer Accordion**
   - Animated expand/collapse
   - ChevronDown icons with rotation
   - Active state highlighting (blue border)

5. **Footer**
   - Gradient background
   - Legal disclaimer
   - Contact information

#### Responsive Design

- **Mobile:** Single column, sticky elements, touch-optimized
- **Tablet:** 2-column grids where appropriate
- **Desktop:** Centered max-width (4xl-7xl), generous spacing

#### Animations & Transitions

- Smooth mode switching
- Number formatting updates
- Accordion expand/collapse (300ms)
- Hover states on tables
- Scale on hover (1.01x for cards)

### C. Explainer Content

**Collapsible sections:**
1. **Contributions** (paid monthly)
   - What each contribution covers
   - Percentage rates
   - Exoneration rules

2. **Mandatory Accruals**
   - Payment schedules (when lumpy payments occur)
   - Calculation methodology
   - Why they're annualized

3. **Salario Integral**
   - Legal minimum (13× SMMLV)
   - Factor prestacional (30%)
   - What changes (no separate accruals)

**Design:**
- Animated accordion
- Color-coded active states
- Center-aligned, max-width constrained
- Enhanced typography

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **UI Components** | TailwindCSS 4 with custom design system |
| **Icons** | lucide-react |
| **State Management** | React hooks (local state) |
| **Calculations** | Pure TypeScript functions (forward & reverse) |
| **Configuration** | `/config/rates.json` with year keys |
| **Internationalization** | `next-intl` client provider wrapper (ADR 008) |
| **Deployment** | Vercel |

---

## 6. Data & Configuration

### Configuration File Structure

```json
// /config/rates.json
{
  "2025": {
    "SMMLV": 1423500,
    "aux_transporte": 200000,
    "contrib": {
      "salud_employer": 0.085,
      "pension_employer": 0.12,
      "caja": 0.04,
      "sena": 0.02,
      "icbf": 0.03,
      "arl": {
        "I": 0.00522,
        "II": 0.01044,
        "III": 0.02436,
        "IV": 0.0435,
        "V": 0.0696
      }
    },
    "accruals": {
      "prima": 0.0833,
      "cesantias": 0.0833,
      "intereses_cesantias": 0.01,
      "vacaciones": 0.0417
    },
    "integral": {
      "min_smmlv": 13,
      "factor_prestacional": 0.30
    }
  }
}
```

### Admin Experience

Edit the configuration file to update for a new year. The UI exposes SMMLV and Auxilio as override fields in Advanced Settings for user flexibility.

---

## 7. Core Logic (Formulas)

### Variables

- `salary` = base salary
- `transport` = aux. transporte (if `salary ≤ 2×SMMLV`, else 0)
- `IBC` (contribution base) = salary _(transport not included)_

### Forward Calculation (Standard Contract)

**Monthly Contributions:**
- **Salud** = 8.5% × salary _(0% if exoneration applies and salary < 10×SMMLV)_
- **Pensión** = 12% × salary
- **ARL** = rate[riskClass] × salary
- **Caja** = 4% × salary
- **SENA** = 2% × salary _(0% if exoneration applies)_
- **ICBF** = 3% × salary _(0% if exoneration applies)_

**Monthly Accruals (annualized):**
- **Prima** = 8.33% × (salary + transport)
- **Cesantías** = 8.33% × (salary + transport)
- **Intereses cesantías** = 1% × (salary + transport)
- **Vacaciones** = 4.17% × salary

**Totals:**
- **Monthly out-of-pocket** = salary + transport + contributions
- **Monthly total (annualized)** = monthly out-of-pocket + accruals
- **Annual total** = monthly_total × 12

### Reverse Calculation (Budget to Salary)

**Given:** Target monthly cost (budget)

**Solve for:** Salary

**Method:** Algebraic solution considering two scenarios:

1. **With transport** (salary ≤ 2×SMMLV):
   ```
   budget = salary × (1 + contrib_rate + accrual_rate) + transport × (1 + accrual_rate)
   salary = (budget - transport × (1 + accrual_rate)) / (1 + contrib_rate + accrual_rate)
   ```

2. **Without transport** (salary > 2×SMMLV):
   ```
   budget = salary × (1 + contrib_rate + accrual_rate)
   salary = budget / (1 + contrib_rate + accrual_rate)
   ```

**Validation:** Pick solution that respects transport threshold; verify against exoneration rules

**Implementation:** `lib/calculator.ts:computeSalaryFromBudget()`

### Salario Integral

**Eligibility:** `salary_integral ≥ 13 × SMMLV`

**Structure:**
`salary_integral = base_integral + factor_prestacional (30%)`

**Key Differences:**
- Prestaciones (prima/cesantías/intereses/vacaciones) are embedded in the 30% factor → **do not add standard accrual lines**
- Still compute employer contributions: Pensión, ARL, Caja
- Salud/SENA/ICBF subject to exoneration rules
- IBC uses `base_integral` for contribution calculations

**Monthly out-of-pocket (integral):**
`salary_integral + contributions (monthly only)`

**Monthly total (integral):**
Same as out-of-pocket (no separate accruals)

### Engineering Notes

- Maintain separate pure functions for forward and reverse calculations
- Forward: `computeEmployerCosts()`
- Reverse: `computeSalaryFromBudget()`
- Both return same `CalculationResult` interface for consistency

---

## 8. Component Architecture

### File Structure

```
/app
  layout.tsx         — Root layout with IntlProvider
  page.tsx           — Main page with hero, calculator, explainer
  globals.css        — TailwindCSS config, design tokens

/components
  /calculator
    calculator-card.tsx    — Main calculator logic & UI
  explainer-accordion.tsx  — Educational content
  language-toggle.tsx      — Bilingual switcher
  /providers
    intl-provider.tsx      — i18n wrapper

/lib
  calculator.ts      — Pure calculation functions (forward & reverse)
  rates.ts           — Rate configuration loader
  format.ts          — Currency/percentage formatting
  utils.ts           — Utility functions (cn)

/messages
  en.json            — English translations
  es.json            — Spanish translations

/config
  rates.json         — Yearly rate data
```

### `<CalculatorCard />` (Primary Component)

**State Management:**
- `mode`: "forward" | "reverse"
- `salaryInput`, `budgetInput`: String inputs
- `smmlvInput`, `arlClass`, `exoneration`, `useIntegral`, `integralInput`
- `showAdvanced`: Boolean for collapsible section

**Calculations:**
- `useMemo` hooks for parsing money inputs
- `useMemo` for calculation result (switches between forward/reverse based on mode)
- Maps for contribution/accrual lookups

**Sub-components:**
- `Field()` — Label/input/helper/error wrapper
- `CurrencyInput()` — Formatted number input with thousands separators
- `CheckboxField()` — Checkbox with label and helper
- `ToggleField()` — Toggle switch with badge
- `ColorCodedBreakdownList()` — Table with monthly/annual/frequency columns

**Conditional Rendering:**
- Mode toggle always visible
- Input changes based on mode (salary vs. budget)
- Reverse mode shows additional "Employee receives" card
- Advanced settings collapsible
- Integral salary input only when toggle enabled
- Accruals table hidden when integral mode active

### `<ExplainerAccordion />`

**Sections:**
- Contributions overview
- Accruals & payment timing
- Salario Integral explained

**Features:**
- Animated expand/collapse
- ChevronDown icon with rotation
- Active state highlighting
- One section open at a time

### `<LanguageToggle />`

**Design:**
- Floating pill with backdrop blur
- Active state: Blue background
- Smooth transitions
- Persists to localStorage

---

## 9. Validation & Edge Cases

| Scenario | Behavior |
|----------|----------|
| Integral ON but amount < 13×SMMLV | Show error message; disable results display |
| Salary > 2×SMMLV | Set `transport = 0` automatically |
| Exoneration checkbox selected | Zero out Salud/SENA/ICBF only if `salary < 10×SMMLV` |
| Invalid salary/budget input | Show inline validation error |
| Missing required fields | Disable calculation until complete |
| Reverse mode: no valid solution | Show error (budget too low) |

**Output Formatting:**
- All monetary values formatted as COP with thousands separators (es-CO locale)
- Percentages displayed to 2 decimal places
- Tabular numbers for alignment

---

## 10. Success Metrics

### User Engagement
- ≥80% of users complete a calculation
- ≥30% of users try reverse calculator mode
- Average time on page: 2-5 minutes
- ≥50% scroll to see breakdown tables

### Educational Impact
- ≥60% expand explainer accordion
- ≥40% notice out-of-pocket vs. annualized distinction
- Reduced support inquiries about "unexpected payments"

### Performance
- Time to Interactive (TTI) < 1s on typical 4G connection
- Cumulative Layout Shift (CLS) < 0.1
- No blocking network calls for core functionality
- Build size: ~15KB main page (+ 140KB shared JS)

### Accuracy
- Calculation results validated against accountant test cases
- Reverse calculations match forward calculations within rounding
- Zero critical bugs in production (P0/P1)

---

## 11. Deliverables

### Code & Infrastructure
- ✅ Next.js 15 repository with TailwindCSS 4
- ✅ `/config/rates.json` data structure
- ✅ Dual-mode calculator (forward & reverse)
- ✅ Out-of-pocket vs. annualized cost display
- ✅ Annual breakdown tables with payment frequency
- ✅ Enhanced UI/UX with animations
- ✅ Deployed on Vercel

### Calculations
- ✅ `computeEmployerCosts()` — Forward calculation
- ✅ `computeSalaryFromBudget()` — Reverse calculation
- ✅ Integral salary support
- ✅ Exoneration logic
- ✅ Transport eligibility

### Testing & Documentation
- ✅ English & Spanish message bundles
- ✅ README with update instructions
- ✅ This PRD (v2.0)
- ⏳ Unit tests for calculation functions
- ⏳ Integration tests for user flows

### Design Assets
- ✅ Color system (blue, green, amber)
- ✅ Typography scale
- ✅ Component design patterns
- ✅ Responsive layouts
- ✅ Animation system

---

## 12. Future Considerations

### Phase 3 Features (Beyond Current Implementation)

**User Enhancements:**
- PDF report export with full breakdown
- Email/link sharing of calculations
- Save/load calculation presets
- Multi-employee scenario comparison

**Data Visualization:**
- Historical SMMLV trends
- Multi-year cost projections
- Pie charts for cost distribution
- Timeline view of lumpy payments

**Employee Perspective:**
- Employee-side calculator (take-home pay after deductions)
- Net vs. gross salary comparison
- Contribution breakout from employee perspective

### Internationalization
- Additional locales beyond English/Spanish
- Support for other LATAM countries (Argentina, Chile, Peru)
- Regional rate variations

### Admin Panel
- Web-based rate management (replace JSON editing)
- Audit log for rate changes
- Notification system for SMMLV updates
- User analytics dashboard

### API & Integration
- REST API for programmatic access
- Zapier/Make.com integration
- Export to accounting software (Quickbooks, Xero)

---

## 13. Known Limitations & Assumptions

### Current Limitations

1. **Single employee calculation** — No bulk/multiple employee scenarios
2. **Static rates** — Manual update required for new year (not dynamic API)
3. **Simplified exoneration** — Assumes standard Art. 114-1 rules; doesn't cover all special cases
4. **No historical data** — Calculations based on current year only
5. **Client-side only** — No persistence, user accounts, or calculation history

### Assumptions

1. **Accurate rate data** — Assumes rates.json is correct and up-to-date
2. **Standard employment contracts** — Doesn't cover special arrangements (part-time, contractors)
3. **Colombian jurisdiction** — Not applicable to other countries
4. **COP currency** — No multi-currency support
5. **Monthly payment focus** — Assumes standard monthly salary cycles

---

## Appendix A: Legal References

- **Estatuto Tributario Art. 114-1** — Exoneration rules for Salud/SENA/ICBF
- **Código Sustantivo del Trabajo** — Salario Integral provisions, prestaciones
- **Decreto SMMLV 2025** — Current minimum wage decree (1,423,500 COP)
- **Law 50 of 1990** — Prima legal payments (June 30, December 20)
- **Law 52 of 1975** — Cesantías regulations (due February 14)

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **SMMLV** | Salario Mínimo Mensual Legal Vigente (Monthly Minimum Legal Wage) |
| **ARL** | Administradora de Riesgos Laborales (Occupational Risk Insurance) |
| **IBC** | Ingreso Base de Cotización (Contribution Base Income) |
| **Prima** | Mid-year and end-year bonus (legally required) — Paid June 30 & Dec 20 |
| **Cesantías** | Severance fund (annual accrual) — Paid February 14 |
| **Intereses a las Cesantías** | Interest on Cesantías (1% annual) — Paid February 14 |
| **Vacaciones** | Paid vacation (4.17% of salary) — Paid when employee takes leave |
| **Factor Prestacional** | 30% premium in Salario Integral covering benefits |
| **Auxilio de Transporte** | Transport allowance for low-wage employees (≤ 2× SMMLV) |
| **Exoneration** | Tax benefit waiving Salud/SENA/ICBF contributions (Art. 114-1) |
| **Out-of-Pocket** | Actual monthly cash payments (salary + monthly contributions + transport) |
| **Annualized Cost** | True monthly cost when spreading annual payments across 12 months |
| **Lumpy Payments** | Large semi-annual/annual payments (Prima, Cesantías) that surprise budgets |

---

## Appendix C: Payment Calendar

| Item | Frequency | Typical Due Date | Notes |
|------|-----------|------------------|-------|
| Salary | Monthly | End of month | Base compensation |
| Salud | Monthly | Within 10 days of month | 8.5% employer share |
| Pensión | Monthly | Within 10 days of month | 12% employer share |
| ARL | Monthly | Within 10 days of month | Risk-class dependent |
| Caja | Monthly | Within 10 days of month | 4% |
| SENA | Monthly | Within 10 days of month | 2% (if not exonerated) |
| ICBF | Monthly | Within 10 days of month | 3% (if not exonerated) |
| Prima (mid-year) | Semi-annual | June 30 | 50% of annual prima |
| Prima (end-year) | Semi-annual | December 20 | 50% of annual prima |
| Cesantías | Annual | February 14 | Full year accrual |
| Intereses Cesantías | Annual | January 31 | 1% interest on cesantías |
| Vacaciones | Variable | When taken | Paid when employee takes leave |
| Auxilio de Transporte | Monthly | With salary | If salary ≤ 2× SMMLV |

---

**Document Control:**
This PRD is a living document. Major changes require stakeholder approval. Minor updates (typos, clarifications) can be made by the product owner.

**Version History:**
- **v2.0 (Jan 2025):** Complete redesign — dual-mode calculator, out-of-pocket vs. annualized costs, annual breakdown tables, enhanced UI/UX
- **v1.0 (Oct 2025):** Initial MVP release — basic forward calculator, bilingual support
