'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function NavPages() {
  const pathname = usePathname();

  return (
    <nav className="nav-pages">
      <div className="nav-pages-inner">
        <Link className="nav-pages-logo" href="/">
          <Image src="/logotype_KORDIA.svg" alt="Kordia" width={160} height={40} priority style={{ height: 34, width: 'auto' }} />
        </Link>
        <ul className="nav-pages-links">
          <li><a href="/#fonctionnalites">Fonctionnalités</a></li>
          <li><a href="/#tarifs">Tarifs</a></li>
          <li>
            <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>
              Contact
            </Link>
          </li>
          <li>
            <Link href="/a-propos" className={pathname === '/a-propos' ? 'active' : ''}>
              À propos
            </Link>
          </li>
        </ul>
        <div className="nav-pages-cta">
          <Link className="btn btn-ghost" href="/sign-in">Se connecter</Link>
          <Link className="btn btn-violet" href="/sign-up">Essai gratuit</Link>
        </div>
      </div>
    </nav>
  );
}
