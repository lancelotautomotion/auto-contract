import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrialInfo } from "@/lib/trial";
import { sendTrialReminder, type ReminderDay } from "@/lib/trialEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const trialUsers = await prisma.user.findMany({
    where: { planStatus: "TRIAL" },
  });

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const user of trialUsers) {
    const { daysLeft, isExpired } = getTrialInfo(user);

    let day: ReminderDay | null = null;
    let field: "trialEmailSent7" | "trialEmailSent3" | "trialEmailSent1" | "trialEmailSent0" | null = null;

    if (daysLeft === 7 && !user.trialEmailSent7) {
      day = 7; field = "trialEmailSent7";
    } else if (daysLeft === 3 && !user.trialEmailSent3) {
      day = 3; field = "trialEmailSent3";
    } else if (daysLeft === 1 && !user.trialEmailSent1) {
      day = 1; field = "trialEmailSent1";
    } else if ((isExpired || daysLeft <= 0) && !user.trialEmailSent0) {
      day = 0; field = "trialEmailSent0";
    }

    if (day === null || field === null) {
      results.skipped++;
      continue;
    }

    try {
      await sendTrialReminder({ to: user.email, name: user.name, daysLeft: day });
      await prisma.user.update({ where: { id: user.id }, data: { [field]: true } });
      results.sent++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
