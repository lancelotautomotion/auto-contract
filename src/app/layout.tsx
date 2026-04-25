import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import ThemeProvider from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prysme — Contrats de location pour gîtes, automatisés",
  description: "Automatisez vos contrats de location saisonnière en 2 minutes. Génération PDF, envoi email, suivi acompte. 30 jours gratuits, sans CB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`}} />
        </head>
        <body className="min-h-full">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
