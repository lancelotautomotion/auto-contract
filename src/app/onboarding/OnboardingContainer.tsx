"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { OnboardingValues } from "./types";
import StepWelcome from "./steps/StepWelcome";
import StepProperty from "./steps/StepProperty";
import StepManager from "./steps/StepManager";
import StepConfig from "./steps/StepConfig";
import StepSuccess from "./steps/StepSuccess";

const STEP_FIELDS: Record<number, (keyof OnboardingValues)[]> = {
  1: ["giteName"],
  2: ["email"],
  3: ["capacity", "cleaningFee", "touristTax", "cguAccepted"],
};

const TOTAL_FORM_STEPS = 3;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const transition = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const };

export default function OnboardingContainer({
  firstName,
  defaultEmail,
}: {
  firstName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, trigger, getValues, formState: { errors } } = useForm<OnboardingValues>({
    defaultValues: {
      giteName: "",
      address: "",
      city: "",
      zipCode: "",
      email: defaultEmail,
      phone: "",
      capacity: 12,
      cleaningFee: 90,
      touristTax: 1.32,
      cguAccepted: false,
    },
    mode: "onTouched",
  });

  const advance = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (step === 3) {
      await handleSubmit();
    } else {
      advance();
    }
  };

  const handleSubmit = async () => {
    const v = getValues();
    setSubmitting(true);
    setSubmitError(null);

    const slug = v.giteName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giteName: v.giteName,
          email: v.email,
          phone: v.phone || "",
          address: v.address || "",
          city: v.city || "",
          zipCode: v.zipCode || "",
          capacity: Number(v.capacity),
          cleaningFee: Number(v.cleaningFee),
          touristTax: Number(v.touristTax),
          slug,
        }),
      });

      if (res.ok) {
        advance();
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setSubmitError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  const showDots = step >= 1 && step <= 3;
  const showNav = step >= 1 && step <= 3;

  return (
    <div className="ob-stepped">
      <div className={`ob-dots${showDots ? " ob-dots--show" : ""}`} aria-hidden="true">
        {Array.from({ length: TOTAL_FORM_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`ob-dot${
              i + 1 === step
                ? " ob-dot--active"
                : i + 1 < step
                ? " ob-dot--done"
                : ""
            }`}
          />
        ))}
      </div>

      <div className="ob-card">
        <div className="ob-card-bar" />
        <div className="ob-slide-outer">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="ob-card-inner"
            >
              {step === 0 && (
                <StepWelcome firstName={firstName} onStart={advance} />
              )}
              {step === 1 && (
                <StepProperty register={register} errors={errors} />
              )}
              {step === 2 && (
                <StepManager register={register} errors={errors} />
              )}
              {step === 3 && (
                <StepConfig register={register} errors={errors} />
              )}
              {step === 4 && (
                <StepSuccess
                  giteName={getValues("giteName")}
                  onDashboard={() => router.push("/dashboard")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showNav && (
        <div className="ob-nav">
          {step > 1 && (
            <button
              type="button"
              className="ob-nav-back"
              onClick={goBack}
              disabled={submitting}
            >
              ← Retour
            </button>
          )}
          <button
            type="button"
            className="ob-submit ob-nav-next"
            onClick={goNext}
            disabled={submitting}
          >
            {step === 3 ? (
              submitting ? (
                <span className="ob-spinner" />
              ) : (
                <>Créer mon espace →</>
              )
            ) : (
              <>Continuer →</>
            )}
          </button>
        </div>
      )}

      {submitError && (
        <div className="ob-error" style={{ marginTop: 12 }}>
          <p>{submitError}</p>
        </div>
      )}
    </div>
  );
}
