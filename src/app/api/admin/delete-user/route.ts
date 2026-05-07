import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

async function deleteSupabaseFiles(fileUrls: string[]) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || fileUrls.length === 0) return;

  const paths = fileUrls
    .map(url => { const m = url.match(/\/object\/public\/uploads\/(.+)$/); return m?.[1] ?? null; })
    .filter(Boolean) as string[];

  if (paths.length === 0) return;

  await fetch(`${supabaseUrl}/storage/v1/object/uploads`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
}

export async function DELETE(req: Request) {
  const [, err] = await requireAdmin();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "userId requis" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { gites: { include: { documents: true } } },
  });
  if (!user)
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // 1. Fichiers Supabase Storage
  const fileUrls = user.gites.flatMap(g => g.documents.map(d => d.fileUrl));
  await deleteSupabaseFiles(fileUrls);

  // 2. Abonnement Stripe
  if (user.stripeSubscriptionId) {
    try { await stripe.subscriptions.cancel(user.stripeSubscriptionId); } catch {}
  }

  // 3. Prisma (cascade sur Gite → Reservation → Contract…)
  await prisma.user.delete({ where: { id: userId } });

  // 4. Compte Clerk
  const client = await clerkClient();
  try { await client.users.deleteUser(user.clerkId); } catch {}

  return NextResponse.json({ ok: true });
}
