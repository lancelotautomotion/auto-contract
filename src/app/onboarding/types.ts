import type { UseFormRegister, FieldErrors } from "react-hook-form";

export type OnboardingValues = {
  giteName: string;
  address: string;
  city: string;
  zipCode: string;
  email: string;
  phone: string;
  capacity: number;
  cleaningFee: number;
  touristTax: number;
  cguAccepted: boolean;
};

export type StepFormProps = {
  register: UseFormRegister<OnboardingValues>;
  errors: FieldErrors<OnboardingValues>;
};
