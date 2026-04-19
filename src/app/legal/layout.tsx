import Link from "next/link";

const tk = {
  ink:     '#2C2C2A',
  inkSoft: '#71716E',
  inkMuted:'#A3A3A0',
  white:   '#FFFFFF',
  surface: '#F3F2EE',
  border:  '#E8E6E1',
  blue:    '#7F77DD',
  font:    "'Plus Jakarta Sans', system-ui, sans-serif",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .legal-pad { padding-left: 40px; padding-right: 40px; }
        .legal-footer-links { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
        .legal-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 768px) {
          .legal-pad { padding-left: 24px !important; padding-right: 24px !important; }
          .legal-body { padding: 40px 24px 64px !important; }
          .legal-footer-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: tk.white, fontFamily: tk.font, color: tk.ink }}>

        {/* Nav */}
        <nav style={{ padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tk.border}` }} className="legal-pad">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logotype_prysme.png" alt="Prysme" height={24} style={{ display: 'block' }} />
          </Link>
          <Link href="/" style={{ fontSize: '13px', color: tk.inkSoft, textDecoration: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Retour
          </Link>
        </nav>

        {/* Content */}
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 40px 96px' }} className="legal-body">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${tk.border}`, padding: '20px 40px' }} className="legal-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="legal-footer-inner">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logotype_prysme.png" alt="Prysme" height={20} style={{ display: 'block' }} />
              </Link>
              <div className="legal-footer-links">
                <Link href="/legal/mentions-legales" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Mentions légales</Link>
                <Link href="/legal/confidentialite" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Confidentialité</Link>
                <Link href="/legal/cgv" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>CGV</Link>
                <span style={{ fontSize: '12px', color: tk.inkMuted }}>© 2026 Prysme</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
