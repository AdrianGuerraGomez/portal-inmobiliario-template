// Cuota de hipoteca con el sistema francés (cuota fija).

export type MortgageInput = {
  price: number;
  downPaymentPct: number; // % del precio que se paga de entrada
  years: number;
  annualRatePct: number; // TIN
};

// Impuestos y gastos de compraventa, aprox. 10 % del precio. Solo orientativo.
export const PURCHASE_COSTS_PCT = 10;

export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function simulateMortgage({ price, downPaymentPct, years, annualRatePct }: MortgageInput) {
  const loan = Math.max(0, price * (1 - downPaymentPct / 100));
  const monthly = monthlyPayment(loan, annualRatePct, years);
  const totalPaid = monthly * years * 12;
  return {
    loan,
    monthly,
    totalInterest: Math.max(0, totalPaid - loan),
    savingsNeeded: price - loan + (price * PURCHASE_COSTS_PCT) / 100,
  };
}
