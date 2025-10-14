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
