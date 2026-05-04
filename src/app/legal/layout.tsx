import '@/styles/landing.css';
import './legal.css';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/landing/ScrollToTop';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="legal-main">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
