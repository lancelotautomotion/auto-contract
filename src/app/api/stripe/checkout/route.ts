import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_ID, STRIPE_PRICE_ID_HOTE, appUrl, clampGiteQuantity, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan = body?.plan === "hote" ? "hote" : "essential";

  const priceId = plan === "hote" ? STRIPE_PRICE_ID_HOTE : STRIPE_PRICE_ID;
  if (!priceId) {
    const missing = plan === "hote" ? "STRIPE_PRICE_ID_HOTE" : "STRIPE_PRICE_ID";
    return NextResponse.json({ error: `Configuration Stripe manquante (${missing}).` }, { status: 500 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  // Essentiel : quantité = nombre de gîtes (paliers tiered 10 €/20 €).
  // Maison d'Hôtes : prix fixe (20 €/mois), quantité = 1.
  let quantity = 1;
  if (plan === "essential") {
    const giteCount = await prisma.gite.count({ where: { userId: dbUser.id, deletedAt: null } });
    quantity = clampGiteQuantity(giteCount);
  }

  const clerkUser = await currentUser();
  const customerEmail = dbUser.email || clerkUser?.emailAddresses[0]?.emailAddress;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity }],
      client_reference_id: dbUser.id,
      customer: dbUser.stripeCustomerId ?? undefined,
      customer_email: dbUser.stripeCustomerId ? undefined : customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: { userId: dbUser.id, clerkId, plan },
      },
      metadata: { userId: dbUser.id, clerkId, plan },
      success_url: appUrl("/upgrade/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: appUrl("/upgrade?canceled=1"),
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe n'a pas renvoyé d'URL de paiement." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/checkout] Erreur:", message, err);
    return NextResponse.json({ error: `Stripe: ${message}` }, { status: 500 });
  }
}
