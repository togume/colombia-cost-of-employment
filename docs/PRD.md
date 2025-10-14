# 🇨🇴 Colombia Employee Cost Calculator — PRD

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Product Type:** Public Web Application

---

## 1. Overview

A single-page, public calculator that explains and computes total monthly and annual employer costs in Colombia. The tool provides live breakdowns with educational context, designed mobile-first for accessibility.

---

## 2. Objectives

- **Transparency:** Demystify contributions, benefits, and payment due dates
- **Computation:** Deliver instant results with clear, detailed breakdowns
- **Education:** Provide concise explainers with high-level legal foundations
- **Maintainability:** Centralize yearly constants (SMMLV, rates) for easy updates

---

## 3. Target Users

- Startup founders and entrepreneurs
- HR and operations professionals
- Finance managers and accountants
- Contractors comparing employee vs. contractor arrangements

---

## 4. Key Features

### A. Calculator (Real-time)

- **Bilingual language toggle** (English ↔ Español) powered by `next-intl`, remembering the user’s last selection per ADR 008

#### Inputs

- **Base salary** (COP)
- **ARL risk class** (I–V)
- **Exoneration eligibility** (Art. 114-1 ET) — checkbox
- **SMMLV** — auto-populated for current year; user-editable
- **"Use Salario Integral?"** — toggle with validation rules

#### Outputs

- Monthly total employer cost
- Annual total employer cost
- **Detailed breakdown table:**
  - **Employer contributions:** Salud*, Pensión, ARL, Caja, SENA*, ICBF*  
    _(*zeroed if exoneration applies)_
  - **Mandatory accruals:** Prima, Cesantías, Intereses a las Cesantías, Vacaciones
  - **Auxilio de transporte** (if base salary ≤ 2× SMMLV)
- **"Show formulas"** accordion
- **Action buttons:** "Copy breakdown" / "Export CSV"

### B. Explainer (Collapsible)

Educational sections covering:

- **Contribution & accrual items:** What each is, typical due dates, monthly vs. lump-sum payment schedules
- **Exoneration rules:** When Salud/SENA/ICBF are waived for employers
- **Salario Integral:**
  - Legal minimum: ≥ 13 SMMLV (10× base + 30% "factor prestacional")
  - Factor prestacional (30%) internalizes most prestaciones (prima/cesantías/intereses/vacaciones)
  - Still requires: Pensión, ARL, Caja (plus Salud/SENA/ICBF subject to exoneration rules)
  - Calculator automatically adapts logic when toggle is ON
- **SMMLV & Auxilio de transporte:** Current values with quick-update capability for future years

---

## 5. Design & UX

### Page Structure

1. **Hero section** — Title + one-line value proposition
2. **Calculator card** — Sticky positioning on desktop
3. **Explainer accordion** — Expandable educational content

### Design Principles

- Currency formatting (COP with thousands separators)
- Clear tooltips on each line item
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 AA)

---

## 6. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js (App Router) |
| **UI Components** | shadcn/ui + TailwindCSS |
| **Icons** | lucide-react |
| **State Management** | React hooks (local state) |
| **Configuration** | `/config/rates.json` with year keys |
| **Internationalization** | `next-intl` client provider wrapper (ADR 008) |
| **Deployment** | Vercel |

---

## 7. Data & Configuration

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

Edit the configuration file to update for a new year. The UI exposes SMMLV and Auxilio as override fields for user flexibility.

---

## 8. Core Logic (Formulas)

### Variables

- `salary` = base salary
- `transport` = aux. transporte (if `salary ≤ 2×SMMLV`, else 0)
- `IBC` (contribution base) = salary _(transport not included)_

### Standard (Non-Integral) Contract

**Monthly Contributions:**
- **Salud** = 8.5% × salary _(0% if exoneration applies and salary < 10×SMMLV)_
- **Pensión** = 12% × salary
- **ARL** = rate[riskClass] × salary
- **Caja** = 4% × salary
- **SENA** = 2% × salary _(0% if exoneration applies)_
- **ICBF** = 3% × salary _(0% if exoneration applies)_

**Monthly Accruals:**
- **Prima** = 8.33% × (salary + transport)
- **Cesantías** = 8.33% × (salary + transport)
- **Intereses cesantías** = 1% × (salary + transport)
- **Vacaciones** = 4.17% × salary

**Totals:**
- **Monthly total** = sum of all monthly items + salary + transport
- **Annual total** = monthly_total × 12

### Salario Integral

**Eligibility:** `salary_integral ≥ 13 × SMMLV`

**Structure:**  
`salary_integral = base_integral + factor_prestacional (30%)`

**Key Differences:**
- Prestaciones (prima/cesantías/intereses/vacaciones) are embedded in the 30% factor → **do not add standard accrual lines**
- Still compute employer contributions: Pensión, ARL, Caja
- Salud/SENA/ICBF subject to exoneration rules
- IBC uses `base_integral` for contribution calculations

**Monthly total (integral):**  
`salary_integral + contributions (pensión, arl, caja, salud/sena/icbf per exoneration)`

### Engineering Note

Maintain separate pure functions for standard and integral calculations, selected by toggle state.

---

## 9. Component Architecture

### `<CalculatorCard />`

**Input Components:**
- `<BaseSalaryInput />`
- `<ARLRiskSelect />`
- `<ExonerationSwitch />`
- `<SMMVLInput />` — editable with current year default
- `<AuxTransporte />` — auto-calculated display
- `<IntegralModeSwitch />` → reveals:
  - `<IntegralAmountField />`
  - Rule badge: "≥ 13 SMMLV"

**Output Components:**
- `<MonthlyTotal />`
- `<AnnualTotal />`
- `<BreakdownTable />`
- `<ShowFormulas />` — collapsible accordion

**Action Components:**
- `<CopyBreakdownButton />`
- `<ExportCSVButton />`

### `<ExplainerAccordion />`

**Sections:**
- Contributions overview
- Accruals & payment due dates
- Exoneration rules (Art. 114-1 ET)
- Salario Integral explained
- SMMLV & annual updates

### `<Header />` & `<Footer />`

- Header: Title, subtitle, brief description
- Footer: Links, legal disclaimer, contact info

---

## 10. Validation & Edge Cases

| Scenario | Behavior |
|----------|----------|
| Integral ON but amount < 13×SMMLV | Show error message; disable results display |
| Salary > 2×SMMLV | Set `transport = 0` |
| Exoneration checkbox selected | Zero out Salud/SENA/ICBF only if `salary < 10×SMMLV` |
| Invalid salary input | Show inline validation error |
| Missing required fields | Disable calculation until complete |

**Output Formatting:**
- All monetary values formatted as COP with thousands separators
- Percentages displayed to 2 decimal places

---

## 11. Success Metrics

### User Engagement
- ≥80% of users complete a calculation
- Average time on page: 2-5 minutes

### Performance
- Time to Interactive (TTI) < 1s on typical 4G connection
- Cumulative Layout Shift (CLS) < 0.1
- No blocking network calls for core functionality

### Accuracy
- Calculation results validated against accountant test cases
- Zero critical bugs in production (P0/P1)

---

## 12. Deliverables

### Code & Infrastructure
- ✅ Next.js repository with shadcn/ui setup
- ✅ TailwindCSS configuration
- ✅ `/config/rates.json` data structure
- ✅ Deployed preview on Vercel

### Testing & Documentation
- ✅ Unit tests for core calculation functions (standard vs. integral)
- ✅ Integration tests for user flows
- ✅ README with instructions for updating SMMLV/rates annually
- ✅ Component documentation (Storybook optional)
- ✅ English & Spanish message bundles aligned with ADR 008

### Handoff Materials
- Design system documentation
- API documentation (if backend added later)
- Deployment runbook

---

## 13. Future Considerations

### Phase 2 Features (Not in MVP)
- Multi-year comparison view
- PDF report export
- Historical SMMLV data visualization
- Email/link sharing of calculations
- Employee-side calculator (take-home pay)

### Internationalization
- Additional locales beyond English/Spanish
- Support for other LATAM countries

### Admin Panel
- Web-based rate management (replace JSON editing)
- Audit log for rate changes
- Notification system for SMMLV updates

---

## Appendix A: Legal References

- **Estatuto Tributario Art. 114-1** — Exoneration rules
- **Código Sustantivo del Trabajo** — Salario Integral provisions
- **Decreto SMMLV 2025** — Current minimum wage decree

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **SMMLV** | Salario Mínimo Mensual Legal Vigente (Monthly Minimum Legal Wage) |
| **ARL** | Administradora de Riesgos Laborales (Occupational Risk Insurance) |
| **IBC** | Ingreso Base de Cotización (Contribution Base Income) |
| **Prima** | Mid-year and end-year bonus (legally required) |
| **Cesantías** | Severance fund (annual accrual) |
| **Factor Prestacional** | 30% premium in Salario Integral covering benefits |

---

**Document Control:**  
This PRD is a living document. Major changes require stakeholder approval. Minor updates (typos, clarifications) can be made by the product owner.
