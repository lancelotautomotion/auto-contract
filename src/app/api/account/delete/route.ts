import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function DELETE() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Cancel Stripe subscription immediately (no future billing)
  if (dbUser.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(dbUser.stripeSubscriptionId);
    } catch (err) {
      console.error("[delete-account] Stripe cancel error:", err);
    }
  }

  // Delete from DB — cascades to Gite, Reservation, Contract, etc.
  await prisma.user.delete({ where: { id: dbUser.id } });

  // Delete Clerk account
  const clerk = await clerkClient();
  await clerk.users.deleteUser(clerkId);

  return NextResponse.json({ success: true });
}
