import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");
    throw new Error("Test Sentry : cette erreur est intentionnelle");
  } catch (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return NextResponse.json({ error: "Test Sentry déclenché" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

