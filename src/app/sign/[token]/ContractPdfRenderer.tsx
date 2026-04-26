'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function ContractPdfViewer({ token }: { token: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(560);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setPageWidth(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="sign-pdf-viewer">
      <Document
        file={`/api/contract-preview/${token}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="sign-pdf-loading">
            <span className="sign-pdf-spinner"/>
            Chargement du contrat…
          </div>
        }
        error={
          <div className="sign-pdf-error">
            Impossible de charger le contrat. Veuillez rafraîchir la page.
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="sign-pdf-page-wrap">
            <Page
              pageNumber={i + 1}
              width={pageWidth || undefined}
              renderTextLayer
              renderAnnotationLayer={false}
            />
            {numPages > 1 && (
              <p className="sign-pdf-page-num">{i + 1} / {numPages}</p>
            )}
          </div>
        ))}
      </Document>
    </div>
  );
}
