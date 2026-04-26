'use client';

import { useState, useEffect } from 'react';

// useEffect-based lazy import: ContractPdfRenderer (react-pdf / pdfjs-dist)
// uses DOMMatrix at module evaluation — must never run server-side.
// useEffect only runs in the browser, so the import is guaranteed client-only.

export default function ContractPdfViewer({ token }: { token: string }) {
  const [Renderer, setRenderer] = useState<React.ComponentType<{ token: string }> | null>(null);

  useEffect(() => {
    import('./ContractPdfRenderer').then(mod => {
      setRenderer(() => mod.default);
    });
  }, []);

  if (!Renderer) {
    return (
      <div className="sign-pdf-loading">
        <span className="sign-pdf-spinner"/>
        Chargement du contrat…
      </div>
    );
  }

  return <Renderer token={token} />;
}
