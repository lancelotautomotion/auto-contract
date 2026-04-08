import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prysme — Automatisez vos contrats de location saisonnière",
  description: "Prysme génère, envoie et fait signer vos contrats de location en quelques clics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/onboarding">
      <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
        <head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
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
