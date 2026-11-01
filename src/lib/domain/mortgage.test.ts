import { describe, expect, it } from "vitest";
import { monthlyPayment, simulateMortgage } from "./mortgage";

describe("hipoteca", () => {
  it("coincide con la tabla orientativa de CB Hipotecas (30 años, 3 %)", () => {
    expect(Math.round(monthlyPayment(100_000, 3, 30))).toBe(422);
    expect(Math.round(monthlyPayment(150_000, 3, 30))).toBe(632);
  });

  it("sin interés reparte el capital", () => {
    expect(monthlyPayment(120_000, 0, 10)).toBe(1000);
  });

  it("calcula préstamo y ahorro necesario", () => {
    const s = simulateMortgage({ price: 200_000, downPaymentPct: 20, years: 30, annualRatePct: 3 });
    expect(s.loan).toBe(160_000);
    expect(s.savingsNeeded).toBe(60_000);
    expect(s.totalInterest).toBeGreaterThan(0);
  });
});
