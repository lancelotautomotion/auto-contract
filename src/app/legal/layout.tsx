import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const tk = {
    ink: '#2C2C2A', inkSoft: '#71716E', inkMuted: '#A3A3A0',
    white: '#FFFFFF', surface: '#F3F2EE', cream: '#FCFFF2',
    border: '#E8E6E1', violet: '#7F77DD', violetLight: '#EFEEF9',
    violetDark: '#5B52B5', green: '#689D71', greenLight: '#EEF5EF',
    greenDark: '#4A7353',
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        /* PAGE HEADER */
        .ph-wrap { padding: 64px 40px 48px; background: ${tk.cream}; border-bottom: 1px solid ${tk.border}; }
        .ph-inner { max-width: 760px; margin: 0 auto; }
        .ph-tag { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 16px; }
        .ph-tag::before { content: ''; width: 16px; height: 2px; border-radius: 1px; background: currentColor; }
        .ph-tag.violet { color: ${tk.violetDark}; }
        .ph-tag.green { color: ${tk.greenDark}; }
        .ph-title { font-weight: 800; font-size: clamp(30px, 4vw, 44px); letter-spacing: -0.035em; line-height: 1.1; margin: 0 0 12px; color: ${tk.ink}; }
        .ph-title .v { color: ${tk.violet}; }
        .ph-title .g { color: ${tk.green}; }
        .ph-subtitle { font-size: 15px; color: ${tk.inkSoft}; line-height: 1.7; margin: 0 0 16px; }
        .ph-meta { display: flex; gap: 20px; font-size: 12px; color: ${tk.inkMuted}; flex-wrap: wrap; }

        /* LEGAL LAYOUT (2-col grid) */
        .legal-layout { max-width: 1140px; margin: 0 auto; padding: 56px 40px 96px; display: grid; grid-template-columns: 220px 1fr; gap: 56px; align-items: start; }

        /* SIDEBAR */
        .legal-sidebar { position: sticky; top: 72px; }
        .legal-sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: ${tk.inkMuted}; margin-bottom: 14px; }
        .legal-sidebar ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
        .legal-sidebar a { display: block; font-size: 13px; font-weight: 500; color: ${tk.inkSoft}; text-decoration: none; padding: 7px 12px; border-radius: 8px; border-left: 2px solid transparent; transition: color .2s, background .2s, border-color .2s; }
        .legal-sidebar a:hover { color: ${tk.ink}; background: ${tk.surface}; border-left-color: ${tk.border}; }
        .legal-sidebar a.active { color: ${tk.violet}; background: ${tk.violetLight}; border-left-color: ${tk.violet}; font-weight: 600; }

        /* CONTENT */
        .legal-content { max-width: 720px; }
        .legal-content h2 { font-weight: 700; font-size: 20px; letter-spacing: -0.02em; margin-top: 48px; margin-bottom: 16px; padding-top: 24px; border-top: 1px solid ${tk.border}; color: ${tk.ink}; scroll-margin-top: 72px; }
        .legal-content h2:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
        .legal-content h2 .num { color: ${tk.violet}; margin-right: 8px; }
        .legal-content h2 .num-g { color: ${tk.green}; margin-right: 8px; }
        .legal-content h3 { font-weight: 600; font-size: 15px; margin-top: 24px; margin-bottom: 8px; color: ${tk.ink}; }
        .legal-content p { font-size: 14px; color: ${tk.inkSoft}; line-height: 1.8; margin-bottom: 14px; }
        .legal-content strong { color: ${tk.ink}; font-weight: 600; }
        .legal-content a { color: ${tk.violet}; text-decoration: none; font-weight: 500; }
        .legal-content a:hover { text-decoration: underline; }

        /* CALLOUT */
        .legal-callout { border-left: 3px solid ${tk.violet}; background: ${tk.violetLight}; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 13px; color: ${tk.violetDark}; line-height: 1.7; }
        .legal-callout.green { border-left-color: ${tk.green}; background: ${tk.greenLight}; color: ${tk.greenDark}; }

        /* INFO TABLE */
        .info-table { width: 100%; border-collapse: collapse; margin: 16px 0 20px; font-size: 14px; }
        .info-table tr { border-bottom: 1px solid ${tk.surface}; }
        .info-table tr:last-child { border: none; }
        .info-table td { padding: 10px 0; vertical-align: top; }
        .info-table td:first-child { font-weight: 600; color: ${tk.ink}; width: 200px; padding-right: 20px; }
        .info-table td:last-child { color: ${tk.inkSoft}; }

        /* DATA TABLE */
        .data-table { width: 100%; border-collapse: collapse; margin: 16px 0 20px; font-size: 13px; border: 1px solid ${tk.border}; border-radius: 10px; overflow: hidden; }
        .data-table thead { background: ${tk.cream}; }
        .data-table th { text-align: left; font-weight: 600; color: ${tk.ink}; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid ${tk.border}; }
        .data-table td { padding: 10px 14px; color: ${tk.inkSoft}; border-bottom: 1px solid ${tk.surface}; vertical-align: top; line-height: 1.6; }
        .data-table tr:last-child td { border: none; }

        /* NARROW WRAPPER (legacy CGV page) */
        .legal-narrow { max-width: 720px; margin: 0 auto; padding: 56px 40px 96px; }

        /* FOOTER */
        .legal-footer-links { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
        .legal-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

        @media (max-width: 900px) {
          .legal-layout { grid-template-columns: 1fr; gap: 32px; padding: 40px 24px 64px; }
          .legal-sidebar { position: static; border-bottom: 1px solid ${tk.border}; padding-bottom: 20px; }
          .legal-sidebar ul { flex-direction: row; flex-wrap: wrap; gap: 4px; }
          .legal-sidebar a { font-size: 12px; padding: 5px 10px; border-left: none; border-bottom: 2px solid transparent; }
          .ph-wrap { padding: 40px 24px 32px; }
          .ph-meta { flex-direction: column; gap: 6px; }
          .info-table td:first-child { width: 140px; }
          .data-table { font-size: 12px; }
          .data-table th, .data-table td { padding: 8px 10px; }
          .legal-footer-inner { flex-direction: column; align-items: flex-start; }
          .legal-narrow { padding: 40px 24px 64px; }
        }
        @media (max-width: 600px) {
          .ph-wrap { padding: 32px 20px 24px; }
          .legal-narrow { padding: 32px 20px 48px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: tk.white, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: tk.ink, display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <nav style={{ padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tk.border}`, position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logotype_prysme.png" alt="Prysme" height={24} style={{ display: 'block' }} />
          </Link>
          <Link href="/" style={{ fontSize: '13px', color: tk.inkSoft, textDecoration: 'none', fontWeight: 400 }}>
            ← Retour
          </Link>
        </nav>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${tk.border}`, padding: '20px 40px' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div className="legal-footer-inner">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logotype_prysme.png" alt="Prysme" height={20} style={{ display: 'block' }} />
              </Link>
              <div className="legal-footer-links">
                <Link href="/legal/mentions-legales" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Mentions légales</Link>
                <Link href="/legal/confidentialite" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Confidentialité</Link>
                <Link href="/legal/cgu" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>CGU</Link>
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
