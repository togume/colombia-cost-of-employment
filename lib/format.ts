export function formatCurrency(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  const normalizedLocale = locale.startsWith("es") ? "es-CO" : "en-US";
  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    useGrouping = true,
  } = options;

  const amount = new Intl.NumberFormat(normalizedLocale, {
    maximumFractionDigits,
    minimumFractionDigits,
    useGrouping,
  }).format(value);

  return `$ ${amount}`;
}

export function parseCurrencyInput(value: string): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) {
    return null;
  }

  return Number.parseInt(cleaned, 10);
}

export function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) {
    return "";
  }

  const number = Number.parseInt(cleaned, 10);
  return `$ ${number.toLocaleString("es-CO")}`;
}

export function formatPercent(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    ...options,
  }).format(value);
}
