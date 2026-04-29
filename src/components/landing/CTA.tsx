import Link from 'next/link';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-inner reveal">
        <h2>Louez l&apos;esprit libre.</h2>
        <p>Essayez Kordia gratuitement pendant 1 mois. Contrats, signatures, suivi — tout est inclus.</p>
        <Link className="btn-white" href="/sign-up">
          Démarrer l&apos;essai gratuit
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ verticalAlign: 'middle', marginLeft: '4px' }}>
            <path d="M3 8h10m-4-4l4 4-4 4" stroke="#5B52B5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="cta-note">Sans carte bancaire · Résiliable à tout moment</div>
      </div>
    </section>
  );
}
