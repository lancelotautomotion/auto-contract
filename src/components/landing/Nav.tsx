"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <Image src="/logotype_kordia.png" alt="Kordia" width={400} height={85} priority style={{ height: 28, width: 'auto' }} />
          </Link>
          <ul className="nav-links">
            <li><Link href="/comment-ca-marche">Comment ça marche</Link></li>
            <li><Link href="/#fonctionnalites">Fonctionnalités</Link></li>
            <li><Link href="/#tarifs">Tarifs</Link></li>
            <li><Link href="/a-propos">À propos</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <div className="nav-cta">
            <Link className="btn btn-ghost" href="/sign-in">Se connecter</Link>
            <Link className="btn btn-violet" href="/sign-up">Essai gratuit</Link>
          </div>
          <button
            type="button"
            className="nav-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path d="M4 6h12M4 10h12M4 14h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`nav-backdrop${open ? " open" : ""}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        className={`nav-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="nav-drawer-head">
          <Link className="nav-logo" href="/" onClick={close}>
            <Image src="/logotype_kordia.png" alt="Kordia" width={400} height={85} style={{ height: 24, width: 'auto' }} />
          </Link>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Fermer le menu"
            onClick={close}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="nav-drawer-links">
          <li><Link href="/comment-ca-marche" onClick={close}>Comment ça marche</Link></li>
          <li><Link href="/#fonctionnalites" onClick={close}>Fonctionnalités</Link></li>
          <li><Link href="/#tarifs" onClick={close}>Tarifs</Link></li>
          <li><Link href="/#temoignages" onClick={close}>Avis</Link></li>
          <li><Link href="/a-propos" onClick={close}>À propos</Link></li>
          <li><Link href="/contact" onClick={close}>Contact</Link></li>
        </ul>

        <div className="nav-drawer-cta">
          <Link className="btn btn-outline btn-lg" href="/sign-in" onClick={close} style={{ width: '100%' }}>
            Se connecter
          </Link>
          <Link className="btn btn-violet btn-lg" href="/sign-up" onClick={close} style={{ width: '100%' }}>
            Démarrer l&apos;essai gratuit
          </Link>
        </div>
      </aside>
    </>
  );
}
