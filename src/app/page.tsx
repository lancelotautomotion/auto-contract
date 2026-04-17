import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/landing.css';

import ScrollReveal from './ScrollReveal';
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
  title: 'Prysme — Contrats de location pour gîtes, automatisés',
  description: 'Automatisez vos contrats de location saisonnière en 2 minutes. Génération PDF, envoi email, suivi acompte. 30 jours gratuits, sans CB.',
};

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export default function Home() {
  return (
    <div className={font.className}>
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
    </div>
  );
}
