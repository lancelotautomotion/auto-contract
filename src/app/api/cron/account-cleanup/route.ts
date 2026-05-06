import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { sendDeletionWarning } from "@/lib/trialEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const WARNING_AFTER_MS = 30 * DAY_MS;  // J+30 : email d'avertissement
const DELETE_AFTER_MS  = 60 * DAY_MS;  // J+60 : suppression totale

// Retourne la date à partir de laquelle le compte est inactif
function inactiveSince(user: { planExpiredAt: Date | null; trialEndsAt: Date | null }): Date | null {
  return user.planExpiredAt ?? user.trialEndsAt ?? null;
}

async function deleteSupabaseFiles(fileUrls: string[]) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || fileUrls.length === 0) return;

  const bucket = "uploads";
  const paths  = fileUrls
    .map(url => {
      const match = url.match(/\/object\/public\/uploads\/(.+)$/);
      return match?.[1] ?? null;
    })
    .filter(Boolean) as string[];

  if (paths.length === 0) return;

  await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const results = { warned: 0, deleted: 0, errors: 0, skipped: 0 };

  const expiredUsers = await prisma.user.findMany({
    where: { planStatus: "EXPIRED" },
    include: {
      gites: {
        include: { documents: true },
      },
    },
  });

  const clerk = await clerkClient();

  for (const user of expiredUsers) {
    const since = inactiveSince(user);
    if (!since) { results.skipped++; continue; }

    const inactiveMs = now - since.getTime();

    try {
      if (inactiveMs >= DELETE_AFTER_MS && user.deletionWarningAt) {
        // ── Suppression totale ──────────────────────────────────────
        const fileUrls = user.gites.flatMap(g => g.documents.map(d => d.fileUrl));
        await deleteSupabaseFiles(fileUrls);

        if (user.stripeSubscriptionId) {
          try { await stripe.subscriptions.cancel(user.stripeSubscriptionId); } catch {}
        }

        await prisma.user.delete({ where: { id: user.id } });

        try { await clerk.users.deleteUser(user.clerkId); } catch {}

        results.deleted++;

      } else if (inactiveMs >= WARNING_AFTER_MS && !user.deletionWarningAt) {
        // ── Email d'avertissement ───────────────────────────────────
        await sendDeletionWarning({ to: user.email, name: user.name });
        await prisma.user.update({
          where: { id: user.id },
          data: { deletionWarningAt: new Date() },
        });
        results.warned++;

      } else {
        results.skipped++;
      }
    } catch (err) {
      console.error("[account-cleanup] error for user", user.id, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
