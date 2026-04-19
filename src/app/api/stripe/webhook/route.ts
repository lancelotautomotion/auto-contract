import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { STRIPE_WEBHOOK_SECRET, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function setPlanActive(params: {
  userId: string;
  customerId: string;
  subscriptionId: string;
}) {
  await prisma.user.update({
    where: { id: params.userId },
    data: {
      planStatus: "ACTIVE",
      stripeCustomerId: params.customerId,
      stripeSubscriptionId: params.subscriptionId,
    },
  });
}

async function setPlanExpiredByCustomer(customerId: string) {
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { planStatus: "EXPIRED" },
  });
}

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid payload";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.metadata?.userId as string | undefined) ??
          (session.client_reference_id as string | undefined);
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (userId && customerId && subscriptionId) {
          await setPlanActive({ userId, customerId, subscriptionId });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = (sub.metadata?.userId as string | undefined) ?? null;

        const active = sub.status === "active" || sub.status === "trialing";
        const ended = sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired";

        if (active) {
          if (userId) {
            await setPlanActive({ userId, customerId, subscriptionId: sub.id });
          } else {
            const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
            if (user) await setPlanActive({ userId: user.id, customerId, subscriptionId: sub.id });
          }
        } else if (ended) {
          await setPlanExpiredByCustomer(customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setPlanExpiredByCustomer(customerId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
