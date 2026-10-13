/** Indicative USD rates for reporting only — not treasury rates. */
export const FX_RATES = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  CAD: 0.73,
  AUD: 0.66,
  SGD: 0.74,
  JPY: 0.0067,
  BRL: 0.18,
  MXN: 0.055,
  PLN: 0.25,
  PHP: 0.017,
  ZAR: 0.055,
  AED: 0.27,
  CHF: 1.12,
  SEK: 0.095,
};

export function toUsd(amount, currency) {
  const rate = FX_RATES[currency];
  if (rate == null) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  return amount * rate;
}
