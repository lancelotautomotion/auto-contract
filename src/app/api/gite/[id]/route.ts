import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { syncEssentialSubscriptionQuantity } from "@/lib/stripe";

// Soft delete d'un hébergement.
// Le gîte est marqué `deletedAt` : il disparaît du sélecteur et ne compte plus
// dans la facturation Stripe, mais ses réservations/contrats (archives) restent
// conservés en base. La suppression du dernier hébergement est interdite.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const { id } = await params;

  const gite = await prisma.gite.findFirst({
    where: { id, userId: ctx.userId, deletedAt: null },
    select: { id: true },
  });
  if (!gite) {
    return NextResponse.json({ error: "Hébergement introuvable" }, { status: 404 });
  }

  const activeCount = await prisma.gite.count({
    where: { userId: ctx.userId, deletedAt: null },
  });
  if (activeCount <= 1) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre dernier hébergement.", code: "LAST_GITE" },
      { status: 409 },
    );
  }

  await prisma.gite.update({
    where: { id: gite.id },
    data: { deletedAt: new Date() },
  });

  // Réaligne la facturation Stripe sur le nouveau nombre d'hébergements actifs.
  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { planStatus: true, stripeSubscriptionId: true },
  });
  if (user?.planStatus === "ACTIVE" && user.stripeSubscriptionId) {
    await syncEssentialSubscriptionQuantity(user.stripeSubscriptionId, activeCount - 1);
  }

  return NextResponse.json({ ok: true });
}
