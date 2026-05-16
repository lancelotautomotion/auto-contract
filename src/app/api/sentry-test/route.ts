import { NextResponse } from "next/server";
import { Sentry } from "@/lib/sentry";

export async function GET() {
  try {
    Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");
    throw new Error("Test Sentry : cette erreur est intentionnelle");
  } catch (err) {
    Sentry.captureException(err);
    const flushed = await Sentry.flush(3000);
    return NextResponse.json({ client_present: !!Sentry.getClient(), flushed }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
