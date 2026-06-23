import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import ThemeProvider from "@/providers/ThemeProvider";
import "./globals.css";

const localization = {
  ...frFR,
  formFieldInputPlaceholder__password: "Créez un mot de passe",
  formFieldInputPlaceholder__newPassword: "Créez un mot de passe",
};

export const metadata: Metadata = {
  title: {
    default: "Kordia — Contrats de location pour gîtes, automatisés",
    template: "%s — Kordia",
  },
  description: "Automatisez vos contrats de location saisonnière en 2 minutes. Génération PDF, envoi email, suivi acompte. 30 jours gratuits, sans CB.",
  icons: {
    icon: '/KORDIA.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kordia',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={localization} signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding">
      <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/svg+xml" href="/KORDIA.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#689D71" />
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
