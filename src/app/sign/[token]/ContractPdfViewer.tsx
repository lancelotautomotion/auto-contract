'use client';

import { useState, useEffect } from 'react';

type RendererProps = { pdfBase64: string };

export default function ContractPdfViewer({ pdfBase64 }: RendererProps) {
  const [Renderer, setRenderer] = useState<React.ComponentType<RendererProps> | null>(null);

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

  return <Renderer pdfBase64={pdfBase64} />;
}
