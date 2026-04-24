import '@/styles/landing.css';
import './legal.css';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="legal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
