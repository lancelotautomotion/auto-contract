import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContratGîte — Automatisez vos contrats de location",
  description: "Générez et envoyez vos contrats de location en un clic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-gray-50">{children}</body>
      </html>
    </ClerkProvider>
  );
}
