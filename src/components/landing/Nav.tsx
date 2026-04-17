import Link from 'next/link';
import Image from 'next/image';

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-logo" href="/">
          <Image src="/logotype_prysme.png" alt="Prysme" width={120} height={28} />
        </Link>
        <ul className="nav-links">
          <li><a href="#problemes">Problèmes résolus</a></li>
          <li><a href="#fonctionnalites">Fonctionnalités</a></li>
          <li><a href="#tarifs">Tarifs</a></li>
          <li><a href="#temoignages">Avis</a></li>
        </ul>
        <div className="nav-cta">
          <Link className="btn btn-ghost" href="/sign-in">Se connecter</Link>
          <Link className="btn btn-violet" href="/sign-up">Essai gratuit</Link>
        </div>
      </div>
    </nav>
  );
}
