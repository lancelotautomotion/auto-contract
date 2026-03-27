import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewReservationForm from "./NewReservationForm";

export default async function NewReservationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
  if (!gite) redirect("/onboarding");

  // Ne passer que les options que le gîte propose
  const availableOptions = [
    gite.offerNordicBath && {
      key: 'nordicBath' as const,
      label: gite.nordicBathPrice > 0 ? `Bain nordique (${gite.nordicBathPrice} €)` : 'Bain nordique',
    },
    gite.offerSheet160 && {
      key: 'sheet160' as const,
      label: gite.sheet160Price > 0 ? `Draps 160x200 (${gite.sheet160Price} €)` : 'Draps 160x200',
    },
    gite.offerSheet90 && {
      key: 'sheet90' as const,
      label: gite.sheet90Price > 0 ? `Draps 90x190 (${gite.sheet90Price} €)` : 'Draps 90x190',
    },
    gite.offerTowels && {
      key: 'towels' as const,
      label: gite.towelsPrice > 0 ? `Linge de toilette (${gite.towelsPrice} €)` : 'Linge de toilette',
    },
  ].filter(Boolean) as { key: 'nordicBath' | 'sheet160' | 'sheet90' | 'towels'; label: string }[];

  return (
    <NewReservationForm
      defaultCleaningFee={gite.cleaningFee.toString()}
      defaultTouristTax={gite.touristTax.toString()}
      availableOptions={availableOptions}
    />
  );
}
