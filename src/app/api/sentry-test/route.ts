import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const { sessionClaims } = await auth();
  const isAdmin = (sessionClaims?.metadata as { role?: string })?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  Sentry.captureMessage("Test Sentry — configuration Kordia OK", "info");

  // Erreur serveur volontaire pour valider la capture d'exception
  throw new Error("Test Sentry : cette erreur est intentionnelle");
}
