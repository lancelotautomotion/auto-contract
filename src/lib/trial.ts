import { PlanStatus } from "@prisma/client";

export const TRIAL_DAYS = 30;

export interface TrialInfo {
  planStatus: PlanStatus;
  daysLeft: number;       // negative = expired
  isExpired: boolean;
  isActive: boolean;      // paid plan
  isTrial: boolean;
  trialEndsAt: Date | null;
}

export function getTrialInfo(user: {
  planStatus: PlanStatus;
  trialEndsAt: Date | null;
  createdAt: Date;
}): TrialInfo {
  const isTrial = user.planStatus === "TRIAL";
  const isActive = user.planStatus === "ACTIVE";

  const trialEndsAt = user.trialEndsAt ?? addDays(user.createdAt, TRIAL_DAYS);
  const now = new Date();
  const msLeft = trialEndsAt.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isExpired = isTrial && daysLeft <= 0;

  return { planStatus: user.planStatus, daysLeft, isExpired, isActive, isTrial, trialEndsAt };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
