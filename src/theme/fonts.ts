import { DM_Sans, Fraunces } from "next/font/google";

// Fuentes de marca. next/font exige llamadas estáticas,
// así que para otro cliente cambia los imports aquí.
// Los nombres de variable (--font-brand-*) no se tocan.

export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-brand-sans",
  display: "swap",
});

export const fontHeading = Fraunces({
  subsets: ["latin"],
  variable: "--font-brand-heading",
  display: "swap",
});

export const fontVariables = `${fontSans.variable} ${fontHeading.variable}`;
