export function money(amount, currency = "USD", digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
  }).format(amount ?? 0);
}

export function number(n) {
  return new Intl.NumberFormat("en-US").format(n ?? 0);
}
