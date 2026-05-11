"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { OnboardingValues } from "./types";
import type { GiteConfig, GiteConfigErrors } from "./steps/StepConfig";
import StepWelcome from "./steps/StepWelcome";
import StepPlan from "./steps/StepPlan";
import StepGiteCount from "./steps/StepGiteCount";
import StepGiteNames from "./steps/StepGiteNames";
import StepProperty from "./steps/StepProperty";
import StepManager from "./steps/StepManager";
import StepConfig from "./steps/StepConfig";
import StepSuccess from "./steps/StepSuccess";

type Plan = "essential" | "multi";
type StepId = "welcome" | "plan" | "gite-count" | "gite-names" | "property" | "contact" | "config" | "success";

const ESSENTIAL_STEPS: StepId[] = ["welcome", "plan", "property", "contact", "config", "success"];
const MULTI_STEPS: StepId[] = ["welcome", "plan", "gite-count", "gite-names", "contact", "config", "success"];

const STEP_FIELDS: Partial<Record<StepId, (keyof OnboardingValues)[]>> = {
  property: ["giteName"],
  contact: ["email"],
  config: ["capacity", "cleaningFee", "touristTax", "cguAccepted"],
};

const EMPTY_CONFIG: GiteConfig = { capacity: "", cleaningFee: "", touristTax: "" };

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};
const transition = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const };

export default function OnboardingContainer({ firstName, defaultEmail }: { firstName: string; defaultEmail: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [committedPlan, setCommittedPlan] = useState<Plan | null>(null);
  const [giteCount, setGiteCount] = useState<number | null>(null);
  const [giteNames, setGiteNames] = useState<string[]>(["", "", ""]);
  const [giteNameErrors, setGiteNameErrors] = useState<string[]>([]);
  const [giteConfigs, setGiteConfigs] = useState<GiteConfig[]>([EMPTY_CONFIG, EMPTY_CONFIG, EMPTY_CONFIG]);
  const [configErrors, setConfigErrors] = useState<GiteConfigErrors[]>([{}, {}, {}]);

  const { register, trigger, getValues, formState: { errors } } = useForm<OnboardingValues>({
    defaultValues: {
      giteName: "", address: "", city: "", zipCode: "",
      email: defaultEmail, phone: "",
      capacity: 12, cleaningFee: 90, touristTax: 1.32,
      cguAccepted: false,
    },
    mode: "onTouched",
  });

  const steps = committedPlan === "multi" ? MULTI_STEPS : ESSENTIAL_STEPS;
  const currentStep = steps[stepIndex];

  const formSteps = steps.filter(s => s !== "welcome" && s !== "success");
  const dotIndex = formSteps.indexOf(currentStep);

  const advance = () => { setDirection(1); setStepIndex(i => i + 1); };
  const goBack = () => { setDirection(-1); setStepIndex(i => i - 1); };

  const handleGiteNameChange = (index: number, value: string) => {
    setGiteNames(prev => { const n = [...prev]; n[index] = value; return n; });
    setGiteNameErrors(prev => { const e = [...prev]; e[index] = ""; return e; });
  };

  const handleGiteConfigChange = (index: number, field: keyof GiteConfig, value: string) => {
    setGiteConfigs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setConfigErrors(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: undefined };
      return next;
    });
  };

  const validateGiteNames = (): boolean => {
    const count = giteCount ?? 1;
    const errs = Array.from({ length: count }, (_, i) =>
      giteNames[i]?.trim() ? "" : "Le nom est requis"
    );
    setGiteNameErrors(errs);
    return errs.every(e => !e);
  };

  const validateGiteConfigs = (): boolean => {
    const count = giteCount ?? 1;
    const errs: GiteConfigErrors[] = Array.from({ length: count }, (_, i) => {
      const c = giteConfigs[i] ?? EMPTY_CONFIG;
      return {
        capacity: !c.capacity.trim() ? "Requis" : Number(c.capacity) < 1 ? "Minimum 1" : undefined,
        cleaningFee: !c.cleaningFee.trim() ? "Requis" : Number(c.cleaningFee) < 0 ? "Invalide" : undefined,
        touristTax: !c.touristTax.trim() ? "Requis" : Number(c.touristTax) < 0 ? "Invalide" : undefined,
      };
    });
    setConfigErrors(prev => {
      const next = [...prev];
      errs.forEach((e, i) => { next[i] = e; });
      return next;
    });
    return errs.every(e => !e.capacity && !e.cleaningFee && !e.touristTax);
  };

  const goNext = async () => {
    if (currentStep === "plan") {
      if (!selectedPlan) return;
      setCommittedPlan(selectedPlan);
      if (selectedPlan !== "multi") { setGiteCount(null); setGiteNames(["", "", ""]); }
      advance();
      return;
    }

    if (currentStep === "gite-count") {
      if (!giteCount) return;
      advance();
      return;
    }

    if (currentStep === "gite-names") {
      if (!validateGiteNames()) return;
      advance();
      return;
    }

    if (currentStep === "config") {
      if (committedPlan === "multi") {
        if (!validateGiteConfigs()) return;
        const cguValid = await trigger(["cguAccepted"]);
        if (!cguValid) return;
      } else {
        const fields = STEP_FIELDS["config"]!;
        const valid = await trigger(fields);
        if (!valid) return;
      }
      await handleSubmit();
      return;
    }

    const fields = STEP_FIELDS[currentStep];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }

    advance();
  };

  const handleSubmit = async () => {
    const v = getValues();
    setSubmitting(true);
    setSubmitError(null);

    const primaryName = committedPlan === "multi" ? (giteNames[0] || v.giteName) : v.giteName;

    const slug = primaryName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const primaryConfig = committedPlan === "multi" ? giteConfigs[0] : null;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giteName: primaryName,
          email: v.email,
          phone: v.phone || "",
          address: v.address || "",
          city: v.city || "",
          zipCode: v.zipCode || "",
          capacity: primaryConfig ? Number(primaryConfig.capacity) : Number(v.capacity),
          cleaningFee: primaryConfig ? Number(primaryConfig.cleaningFee) : Number(v.cleaningFee),
          touristTax: primaryConfig ? Number(primaryConfig.touristTax) : Number(v.touristTax),
          slug,
          planTier: committedPlan ?? "essential",
          extraGites: committedPlan === "multi" && giteCount
            ? giteNames.slice(1, giteCount).map((name, i) => ({
                name: name.trim(),
                capacity: Number(giteConfigs[i + 1]?.capacity || 0),
                cleaningFee: Number(giteConfigs[i + 1]?.cleaningFee || 0),
                touristTax: Number(giteConfigs[i + 1]?.touristTax || 0),
              })).filter(g => g.name)
            : [],
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

  const showNav = currentStep !== "welcome" && currentStep !== "success";
  const isSubmitStep = currentStep === "config";

  const isNextDisabled =
    submitting ||
    (currentStep === "plan" && !selectedPlan) ||
    (currentStep === "gite-count" && !giteCount);

  return (
    <div className="ob-stepped">
      <div className={`ob-dots${showNav ? " ob-dots--show" : ""}`} aria-hidden="true">
        {formSteps.map((_, i) => (
          <div
            key={i}
            className={`ob-dot${i === dotIndex ? " ob-dot--active" : i < dotIndex ? " ob-dot--done" : ""}`}
          />
        ))}
      </div>

      <div className="ob-card">
        <div className="ob-card-bar" />
        <div className="ob-slide-outer">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${currentStep}-${giteCount}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="ob-card-inner"
            >
              {currentStep === "welcome" && (
                <StepWelcome firstName={firstName} onStart={advance} />
              )}
              {currentStep === "plan" && (
                <StepPlan selected={selectedPlan} onSelect={(p) => {
                  setSelectedPlan(p as Plan);
                }} />
              )}
              {currentStep === "gite-count" && (
                <StepGiteCount selected={giteCount} onSelect={setGiteCount} />
              )}
              {currentStep === "gite-names" && (
                <StepGiteNames
                  count={giteCount ?? 1}
                  names={giteNames}
                  onChange={handleGiteNameChange}
                  errors={giteNameErrors}
                />
              )}
              {currentStep === "property" && (
                <StepProperty register={register} errors={errors} />
              )}
              {currentStep === "contact" && (
                <StepManager register={register} errors={errors} />
              )}
              {currentStep === "config" && (
                <StepConfig
                  register={register}
                  errors={errors}
                  isMulti={committedPlan === "multi"}
                  giteNames={giteNames}
                  giteCount={giteCount ?? 1}
                  giteConfigs={giteConfigs}
                  configErrors={configErrors}
                  onConfigChange={handleGiteConfigChange}
                />
              )}
              {currentStep === "success" && (
                <StepSuccess
                  giteName={committedPlan === "multi" ? giteNames[0] : getValues("giteName")}
                  onDashboard={() => router.push("/dashboard")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showNav && (
        <div className="ob-nav">
          {stepIndex > 1 && (
            <button type="button" className="ob-nav-back" onClick={goBack} disabled={submitting}>
              ← Retour
            </button>
          )}
          <button
            type="button"
            className="ob-submit ob-nav-next"
            onClick={goNext}
            disabled={isNextDisabled}
          >
            {isSubmitStep
              ? submitting ? <span className="ob-spinner" /> : <>Commencer mon essai gratuit →</>
              : <>Continuer →</>}
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
