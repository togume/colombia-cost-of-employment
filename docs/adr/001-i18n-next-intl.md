## 008 — i18n with next-intl + client IntlProvider wrapper

Status: accepted
Date: 2025-09-12

### Context
We need lightweight internationalization that works with the Next.js App Router, allows client‑side locale switching, and lazy‑loads translation bundles.

### Decision
- Library: `next-intl`.
- Provider: a client wrapper `IntlProviderWrapper` that:
  - Detects locale on mount via localStorage → browser language → default (`en`).
  - Loads messages dynamically per locale (`apps/web/messages/*.json`).
  - Exposes `useTranslations` from `next-intl` for component‑level lookup.
  - Exposes `useLocale` for reading/changing locale; persists to localStorage and notifies other tabs via storage events.
- Integration: `Providers` includes `IntlProviderWrapper` at the app root.

### Options considered
- next-intl (chosen): small surface, app-router‑friendly, dynamic message loading.
- next-i18next: SSR‑heavy, file‑system coupling, more boilerplate.
- Custom i18n: more work, fewer features.

### Consequences
- Positive: simple API (`useTranslations`), per‑locale bundles, client switching.
- Negative: translations live in client bundles; SSR extraction not used yet (acceptable at this stage).

### References
- Code: `apps/web/contexts/IntlContext.tsx`, `apps/web/hooks/useTranslations.ts`, `apps/web/lib/i18n.ts`, `apps/web/components/providers.tsx`
- Messages: `apps/web/messages/{en,es}.json`

