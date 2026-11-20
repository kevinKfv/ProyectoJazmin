import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { PWAInstaller } from "@/components/pwa/pwa-installer";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export const metadata: Metadata = {
  title: "SewStudio - Diseño, Moldería & Taller",
  description: "Plataforma integral para modistas, diseñadores y talleres textiles. Asistente de IA para diseño de modas, moldería y catálogo con seña online.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SewStudio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PWAInstaller />
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
