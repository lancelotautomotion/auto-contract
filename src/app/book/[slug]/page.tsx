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
    <>
      <div className="book-hero">
        <div className="book-hero-inner">
          <h1>Réservez au <span className="g">{gite.name}</span></h1>
          <p>Renseignez vos informations ci-dessous. Le gérant vous contactera pour confirmer votre séjour et vous transmettre le contrat.</p>
        </div>
      </div>

      <div className="book-main">
        <BookingForm
          giteSlug={slug}
          giteName={gite.name}
          giteCity={gite.city}
          giteLogoUrl={gite.logoUrl}
          options={gite.options.map(o => ({ id: o.id, label: o.label, price: o.price }))}
        />
      </div>

      <footer className="pub-footer">
        Propulsé par <a href="https://prysme.app">Prysme</a>
      </footer>
    </>
  );
}
