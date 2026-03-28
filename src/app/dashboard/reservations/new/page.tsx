import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewReservationForm from "./NewReservationForm";

export default async function NewReservationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id },
    include: { options: { orderBy: { position: 'asc' } } },
  });
  if (!gite) redirect("/onboarding");

  return (
    <NewReservationForm
      defaultCleaningFee={gite.cleaningFee.toString()}
      defaultTouristTax={gite.touristTax.toString()}
      availableOptions={gite.options.map(o => ({ id: o.id, label: o.label, price: o.price }))}
    />
  );
}
