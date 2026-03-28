import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const gite = await prisma.gite.findUnique({
    where: { slug },
    include: { options: { orderBy: { position: 'asc' } } },
  });

  if (!gite) notFound();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', fontWeight: 500, color: '#1C1C1A' }}>
          {gite.name}
        </span>
        <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570' }}>
          Formulaire de réservation
        </span>
      </nav>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 32px' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>
            — Demande de réservation
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '40px', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.2, marginBottom: '12px' }}>
            {gite.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.7 }}>
            Renseignez vos informations ci-dessous. Le gérant vous contactera pour confirmer votre réservation et vous transmettre le contrat.
          </p>
        </div>

        <BookingForm
          giteSlug={slug}
          giteName={gite.name}
          options={gite.options.map(o => ({ id: o.id, label: o.label, price: o.price }))}
        />

      </main>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid #CEC8BF', textAlign: 'center', marginTop: '40px' }}>
        <span style={{ fontSize: '11px', color: '#7A7570' }}>Propulsé par </span>
        <span style={{ fontSize: '11px', fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1C1C1A' }}>ContratGîte</span>
      </footer>
    </div>
  );
}
