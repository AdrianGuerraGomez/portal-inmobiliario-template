import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { isDemo } from "@/config/runtime";
import { RepositoryProvider } from "@/lib/data/provider";
import { siteUrl } from "@/lib/site-url";
import { fontVariables } from "@/theme/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { siteName: brand.name, locale: "es_ES", type: "website" },
  // La demo no se indexa.
  robots: isDemo ? { index: false, follow: false } : undefined,
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <RepositoryProvider>{children}</RepositoryProvider>
      </body>
    </html>
  );
}
