import type { Metadata } from "next";
import "./globals.css";
import { fontMono, fontSans } from "./fonts";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Meliora",
  description:
    "Infraestructura de deliberación cívica e inteligencia colectiva.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
