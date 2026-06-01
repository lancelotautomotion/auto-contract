"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Check, Copy } from "lucide-react";

export default function CopyBookingUrlButton({ slug }: { slug: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <Link
        href="/dashboard/etablissement"
        className="btn btn-outline-green"
        title="Configurer votre page de réservation publique"
      >
        <Info size={14} strokeWidth={1.4} />
        Configurer le lien public
      </Link>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://kordia.fr"}/book/${slug}`;

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
          <Check size={14} strokeWidth={1.5} />
          Lien copié !
        </>
      ) : (
        <>
          <Copy size={14} strokeWidth={1.4} />
          Lien de réservation
        </>
      )}
    </button>
  );
}
