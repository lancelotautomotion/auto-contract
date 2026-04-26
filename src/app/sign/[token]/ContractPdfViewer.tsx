'use client';

import dynamic from 'next/dynamic';

// Dynamically load the actual react-pdf renderer client-side only.
// pdfjs-dist references DOMMatrix (browser API) at module evaluation —
// importing it server-side crashes SSR with ReferenceError.
const ContractPdfRenderer = dynamic(() => import('./ContractPdfRenderer'), {
  ssr: false,
  loading: () => (
    <div className="sign-pdf-loading">
      <span className="sign-pdf-spinner"/>
      Chargement du contrat…
    </div>
  ),
});

export default function ContractPdfViewer({ token }: { token: string }) {
  return <ContractPdfRenderer token={token} />;
}
