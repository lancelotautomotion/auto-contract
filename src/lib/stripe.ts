import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  // Fail loud in dev, soft at import-time in prod build
  if (process.env.NODE_ENV !== "production") {
    console.warn("[stripe] STRIPE_SECRET_KEY is not set — subscription routes will fail at runtime.");
  }
}

export const stripe = new Stripe(secret ?? "sk_test_unset", {
  typescript: true,
});

// TODO STRIPE — coller ici (via Vercel env vars) les nouveaux Price IDs du
// passage aux prix ronds (juin 2026). Voir bloc commenté plus bas pour les
// montants à configurer dans le dashboard Stripe.
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const STRIPE_PRICE_ID_MULTI = process.env.STRIPE_PRICE_ID_MULTI ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Plan Essentiel : facturation par paliers (volume tiers) selon le nombre
// d'hébergements. Le prix Stripe `STRIPE_PRICE_ID` doit être configuré en
// `billing_scheme=tiered`, `tiers_mode=volume` :
//   palier 1 (up_to 1)  → 10 €/mois  (flat_amount 1000)
//   palier 2 (up_to 5)  → 20 €/mois  (flat_amount 2000)
// La quantité de l'abonnement = nombre d'hébergements (borné entre 1 et 5).
//
// Plans à venir (à créer plus tard côté Stripe quand activés) :
//   Maison d'Hôtes  → 20 €/mois  (flat_amount 2000)
//   Kordia Étape    → 25 €/mois  (flat_amount 2500)
export const MAX_GITES = 5;

export function clampGiteQuantity(count: number): number {
  return Math.min(Math.max(count, 1), MAX_GITES);
}

export function appUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

// Aligne la quantité de l'abonnement Essentiel sur le nombre d'hébergements.
// Best-effort : silencieux si l'abonnement n'existe pas ou si la quantité est
// déjà correcte. Déclenche une proration Stripe en cas de changement de palier.
export async function syncEssentialSubscriptionQuantity(
  subscriptionId: string | null | undefined,
  giteCount: number,
): Promise<void> {
  if (!subscriptionId) return;
  const quantity = clampGiteQuantity(giteCount);
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.status === "canceled" || sub.status === "incomplete_expired") return;
    const item = sub.items.data[0];
    if (!item || item.quantity === quantity) return;
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: item.id, quantity }],
      proration_behavior: "create_prorations",
    });
  } catch (err) {
    console.error("[stripe] syncEssentialSubscriptionQuantity error", err);
  }
}
