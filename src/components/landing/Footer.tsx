import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">

          <div className="footer-brand">
            <img src="/logotype_KORDIA.svg" alt="Kordia" style={{ height: 32, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }} />
            <p>La gestion administrative de votre gîte, enfin simple. Contrats, signatures, suivi — tout au même endroit.</p>
          </div>

          <div className="footer-col">
            <h4>Produit</h4>
            <ul>
              <li><a href="/#fonctionnalites">Fonctionnalités</a></li>
              <li><a href="/#tarifs">Tarifs</a></li>
              <li><a href="/#fonctionnalites">Sécurité &amp; eIDAS</a></li>
              <li><a href="/#fonctionnalites">Nouveautés</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Société</h4>
            <ul>
              <li><Link href="/a-propos">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><Link href="/legal/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/legal/cgu">CGU</Link></li>
              <li><Link href="/legal/cgv">CGV</Link></li>
              <li><Link href="/legal/confidentialite">Confidentialité</Link></li>
            </ul>
          </div>

        </div>
        <div className="footer-bottom">
          <span>© 2026 Kordia. Tous droits réservés.</span>
          <span>Fait avec soin en France</span>
        </div>
      </div>
    </footer>
  );
}
