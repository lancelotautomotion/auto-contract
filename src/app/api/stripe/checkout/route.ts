import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_ID, appUrl, stripe } from "@/lib/stripe";

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Configuration Stripe manquante (STRIPE_PRICE_ID)." }, { status: 500 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  const clerkUser = await currentUser();
  const customerEmail = dbUser.email || clerkUser?.emailAddresses[0]?.emailAddress;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
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
