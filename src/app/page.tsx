import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/landing.css';

import ScrollReveal from './ScrollReveal';
import ScrollToTop from '@/components/landing/ScrollToTop';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Frictions from '@/components/landing/Frictions';
import FeatureContracts from '@/components/landing/FeatureContracts';
import FeatureCalendar from '@/components/landing/FeatureCalendar';
import Compare from '@/components/landing/Compare';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Kordia — Contrats de location pour gîtes, automatisés',
  description: 'Automatisez vos contrats de location saisonnière en 2 minutes. Génération PDF, envoi email, suivi acompte. 30 jours gratuits, sans CB.',
  verification: {
    google: 's8tzRANeIeeYGfzPyfBWYA8XmqXBZP6A_clfEpNRKIA',
  },
};

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://kordia.fr/#website",
      "url": "https://kordia.fr",
      "name": "Kordia",
      "description": "Automatisez vos contrats de location saisonnière en 2 minutes.",
      "inLanguage": "fr-FR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kordia.fr/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://kordia.fr/#organization",
      "name": "Kordia",
      "url": "https://kordia.fr",
      "logo": "https://kordia.fr/logotype_KORDIA.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@kordia.fr",
        "contactType": "customer support",
        "availableLanguage": "French",
      },
      "sameAs": [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://kordia.fr/#app",
      "name": "Kordia",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "1 mois gratuit, sans carte bancaire",
      },
      "description": "Logiciel de gestion de contrats de location saisonnière pour gîtes. Génération PDF, signature eIDAS, envoi email automatisé.",
      "url": "https://kordia.fr",
      "publisher": { "@id": "https://kordia.fr/#organization" },
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Que se passe-t-il après le mois gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Vous choisissez le plan qui vous convient et renseignez votre carte bancaire. Si vous ne faites rien, votre compte passe en lecture seule — vos données restent accessibles.",
          },
        },
        {
          "@type": "Question",
          "name": "La signature électronique est-elle légalement valide ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui. Kordia utilise la signature eIDAS (règlement européen n°910/2014), légalement valide en France pour les contrats de location saisonnière. Chaque signature est horodatée, l'IP est tracée, le PDF est inaltérable.",
          },
        },
        {
          "@type": "Question",
          "name": "Mes locataires doivent-ils créer un compte pour signer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non. Ils reçoivent un lien par email, cliquent, et signent en 30 secondes depuis leur mobile ou PC. Aucune installation, aucun compte.",
          },
        },
        {
          "@type": "Question",
          "name": "Puis-je résilier à tout moment ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, sans engagement et sans frais. Vous gérez votre abonnement directement depuis votre espace, rubrique Compte & Facturation.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className={font.className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <Hero />
      <Frictions />
      <FeatureContracts />
      <FeatureCalendar />
      <Compare />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
      <ScrollReveal />
      <ScrollToTop />
    </div>
  );
}
