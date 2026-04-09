import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .legal-nav { padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .legal-footer { padding: 28px 40px; border-top: 1px solid #CEC8BF; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .legal-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .legal-body { max-width: 760px; margin: 0 auto; padding: 48px 40px 80px; }
        @media (max-width: 768px) {
          .legal-nav { padding: 16px 20px; }
          .legal-body { padding: 32px 20px 60px; }
          .legal-footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
        <nav className="legal-nav">
          <Link href="/" style={{ fontSize: '15px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 500, color: '#1C1C1A', textDecoration: 'none', letterSpacing: '0.05em' }}>
            Prysme
          </Link>
          <Link href="/" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>
            ← Retour
          </Link>
        </nav>
        <hr style={{ borderTop: '1px solid #CEC8BF', margin: '0 40px' }} />
        <main className="legal-body">
          {children}
        </main>
        <footer className="legal-footer">
          <Link href="/" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '14px', color: '#1C1C1A', textDecoration: 'none' }}>Prysme</Link>
          <div className="legal-footer-links">
            <Link href="/legal/mentions-legales" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mentions légales</Link>
            <Link href="/legal/confidentialite" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Confidentialité</Link>
            <Link href="/legal/cgv" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CGV</Link>
            <span style={{ fontSize: '11px', color: '#7A7570' }}>© 2026 Prysme</span>
          </div>
        </footer>
      </div>
    </>
  );
}
