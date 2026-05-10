import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_ID, STRIPE_PRICE_ID_MULTI, appUrl, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan: "essential" | "multi" = body.plan === "multi" ? "multi" : "essential";

  const priceId = plan === "multi" ? STRIPE_PRICE_ID_MULTI : STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: `Configuration Stripe manquante (${plan === "multi" ? "STRIPE_PRICE_ID_MULTI" : "STRIPE_PRICE_ID"}).` }, { status: 500 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  const clerkUser = await currentUser();
  const customerEmail = dbUser.email || clerkUser?.emailAddresses[0]?.emailAddress;

  // Multi trial: 30 days without CC, only if user has never paid (not ACTIVE)
  const eligibleForMultiTrial = plan === "multi" && dbUser.planStatus !== "ACTIVE";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: dbUser.id,
      customer: dbUser.stripeCustomerId ?? undefined,
      customer_email: dbUser.stripeCustomerId ? undefined : customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      ...(eligibleForMultiTrial && {
        payment_method_collection: "if_required",
        subscription_data: {
          trial_period_days: 30,
          metadata: { userId: dbUser.id, clerkId },
        },
      }),
      ...(!eligibleForMultiTrial && {
        subscription_data: {
          metadata: { userId: dbUser.id, clerkId },
        },
      }),
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
