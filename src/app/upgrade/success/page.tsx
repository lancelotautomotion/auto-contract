import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

/**
 * Fallback if the webhook is slower than the browser redirect — we read the
 * Checkout session directly and upgrade the user synchronously. The webhook
 * will then no-op on repeat.
 */
async function reconcileFromSession(sessionId: string, clerkId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") return;

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!customerId || !subscriptionId) return;

    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) return;

    if (dbUser.planStatus !== "ACTIVE" || dbUser.stripeSubscriptionId !== subscriptionId) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          planStatus: "ACTIVE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      });
    }
  } catch (err) {
    console.error("[upgrade/success] reconcile failed", err);
  }
}

export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { session_id } = await searchParams;
  if (session_id) await reconcileFromSession(session_id, clerkId);

  return (
    <div className={font.className} style={{ minHeight: "100vh", backgroundColor: "#F3F2EE", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E8E6E1", backgroundColor: "#FFFFFF" }}>
        <span style={{ fontSize: "15px", fontWeight: 800, color: "#2C2C2A", letterSpacing: "-0.02em" }}>Prysme</span>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E8E6E1", overflow: "hidden", maxWidth: "480px", width: "100%" }}>
          <div style={{ height: "4px", backgroundColor: "#689D71" }} />
          <div style={{ padding: "40px 40px 36px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(104,157,113,.15)", color: "#689D71", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px", fontWeight: 800 }}>
              ✓
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2C2C2A", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
              Bienvenue à bord<span style={{ color: "#7F77DD" }}>.</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#71716E", lineHeight: 1.6, margin: "0 0 28px" }}>
              Votre abonnement Prysme est actif. Un reçu vient de vous être envoyé par email.
            </p>
            <a
              href="/dashboard"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#689D71",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: "11px",
                boxSizing: "border-box",
              }}
            >
              Aller au tableau de bord →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
