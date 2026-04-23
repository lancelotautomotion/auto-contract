import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appUrl, stripe } from "@/lib/stripe";

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement associé à ce compte." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: appUrl("/dashboard/compte"),
  });

  return NextResponse.json({ url: session.url });
}
