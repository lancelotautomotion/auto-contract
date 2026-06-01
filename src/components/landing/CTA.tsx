import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-inner reveal">
        <h2>Louez l&apos;esprit libre.</h2>
        <p>Essayez Kordia gratuitement pendant 1 mois. Contrats, signatures, suivi — tout est inclus.</p>
        <Link className="btn-white" href="/sign-up">
          Démarrer l&apos;essai gratuit
          <ArrowRight size={16} strokeWidth={1.5} color="#5B52B5" style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
        </Link>
        <div className="cta-note">Sans carte bancaire · Résiliable à tout moment</div>
      </div>
    </section>
  );
}
