import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  const client = Sentry.getClient();

  console.log("[sentry-test] DSN present:", !!dsn);
  console.log("[sentry-test] DSN prefix:", dsn?.slice(0, 20));
  console.log("[sentry-test] Sentry client:", !!client);

  try {
    Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");
    throw new Error("Test Sentry : cette erreur est intentionnelle");
  } catch (err) {
    Sentry.captureException(err);
    const flushed = await Sentry.flush(3000);
    console.log("[sentry-test] flush result:", flushed);
    return NextResponse.json({ dsn_present: !!dsn, client_present: !!client, flushed }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

