"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PlanIntentSetter() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("plan") === "multi") {
      document.cookie = "kordia_plan_intent=multi; path=/; max-age=3600; SameSite=Lax";
    }
  }, [params]);
  return null;
}
