"use client";

import { useState } from "react";
import Link from "next/link";

export default function CopyBookingUrlButton({ slug }: { slug: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <Link
        href="/dashboard/etablissement"
        className="btn btn-outline-green"
        title="Configurer votre page de réservation publique"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm.5 7.5h-1v-4h1v4zm0-5h-1V3.5h1V4.5z" fill="#689D71"/>
        </svg>
        Configurer le lien public
      </Link>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://prysme.app"}/book/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-green"
      title={`Copier le lien : ${url}`}
    >
      {copied ? (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M2.5 7l3 3 6-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Lien copié !
        </>
      ) : (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M8.5 1.5h-5A1.5 1.5 0 002 3v7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
            <rect x="4.5" y="4" width="7.5" height="8.5" rx="1.5" stroke="#fff" strokeWidth="1.2"/>
          </svg>
          Lien de réservation
        </>
      )}
    </button>
  );
}
