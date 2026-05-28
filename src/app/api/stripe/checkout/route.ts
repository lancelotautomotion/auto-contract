import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_ID, appUrl, clampGiteQuantity, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Offre unique : Essentiel, facturée par paliers selon le nombre d'hébergements.
  const priceId = STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Configuration Stripe manquante (STRIPE_PRICE_ID)." }, { status: 500 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  // La quantité de l'abonnement reflète le nombre d'hébergements (1 → 9,99 €,
  // 2 à 5 → 19,99 € via les paliers volume du prix Stripe).
  const giteCount = await prisma.gite.count({ where: { userId: dbUser.id, deletedAt: null } });
  const quantity = clampGiteQuantity(giteCount);

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
        metadata: { userId: dbUser.id, clerkId },
      },
      metadata: { userId: dbUser.id, clerkId },
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
