import { Inter } from "next/font/google";

// Fuentes de marca. next/font exige llamadas estáticas,
// así que para otro cliente cambia los imports aquí.
// Los nombres de variable (--font-brand-*) no se tocan.

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-brand-sans",
  display: "swap",
});

// Títulos con la misma fuente. Para usar otra, declárala aquí con
// variable "--font-brand-heading" y añádela a fontVariables.
export const fontVariables = fontSans.variable;
