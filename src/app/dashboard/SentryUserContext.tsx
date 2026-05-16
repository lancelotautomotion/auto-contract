"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryUserContext() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.fullName ?? undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user, isLoaded]);

  return null;
}
