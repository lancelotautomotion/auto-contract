import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");

  // Erreur serveur volontaire pour valider la capture d'exception
  throw new Error("Test Sentry : cette erreur est intentionnelle");
}

export const dynamic = "force-dynamic";
