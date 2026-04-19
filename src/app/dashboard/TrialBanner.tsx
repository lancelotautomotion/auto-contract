"use client";

import Link from "next/link";

export default function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 3;
  const label = daysLeft <= 0
    ? "Votre période d'essai est terminée."
    : daysLeft === 1
      ? "Il reste 1 jour dans votre période d'essai."
      : `Il reste ${daysLeft} jours dans votre période d'essai.`;

  return (
    <div
      className="trial-banner"
      style={{ borderColor: urgent ? 'rgba(217,119,6,.3)' : 'rgba(127,119,221,.2)' }}
    >
      <div className="trial-banner-left">
        <div className="trial-banner-dot" style={{ backgroundColor: urgent ? '#D97706' : '#7F77DD' }} />
        <span className="trial-banner-text">{label}</span>
      </div>
      <Link href="/upgrade" className="trial-banner-cta">
        Passer à la version complète →
      </Link>
    </div>
  );
}
