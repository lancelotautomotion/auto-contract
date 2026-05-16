import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  const clientBefore = Sentry.getClient();

  // Force init si le client n'est pas présent
  if (!clientBefore) {
    console.log("[sentry-test] no client, force-initializing");
    Sentry.init({ dsn, tracesSampleRate: 0 });
  }

  const clientAfter = Sentry.getClient();
  console.log("[sentry-test] client before:", !!clientBefore, "after:", !!clientAfter);

  try {
    Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");
    throw new Error("Test Sentry : cette erreur est intentionnelle");
  } catch (err) {
    Sentry.captureException(err);
    const flushed = await Sentry.flush(3000);
    console.log("[sentry-test] flush result:", flushed);
    return NextResponse.json({ dsn_present: !!dsn, client_before: !!clientBefore, client_after: !!clientAfter, flushed }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

