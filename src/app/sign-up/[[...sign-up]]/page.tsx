import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

const clerkAppearance = {
  variables: {
    colorBackground: "#F7F4F0",
    colorInputBackground: "#EDE8E1",
    colorInputText: "#1C1C1A",
    colorText: "#1C1C1A",
    colorTextSecondary: "#7A7570",
    colorPrimary: "#1C1C1A",
    colorDanger: "#c0392b",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
  },
  elements: {
    card: {
      boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
      border: "1px solid #CEC8BF",
      borderRadius: "16px",
      padding: "40px",
    },
    headerTitle: {
      fontFamily: "Cormorant Garamond, Georgia, serif",
      fontSize: "26px",
      fontWeight: "300",
      color: "#1C1C1A",
    },
    headerSubtitle: {
      color: "#7A7570",
      fontSize: "13px",
    },
    formFieldLabel: {
      color: "#7A7570",
      fontSize: "11px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    formFieldInput: {
      border: "1px solid #CEC8BF",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "14px",
      color: "#1C1C1A",
    },
    formButtonPrimary: {
      backgroundColor: "#1C1C1A",
      borderRadius: "100px",
      fontSize: "11px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "14px 24px",
      fontFamily: "Inter, sans-serif",
    },
    footerActionLink: {
      color: "#1C1C1A",
      fontWeight: "500",
    },
    footerActionText: {
      color: "#7A7570",
    },
    dividerLine: {
      backgroundColor: "#CEC8BF",
    },
    dividerText: {
      color: "#7A7570",
      fontSize: "12px",
    },
    identityPreviewText: {
      color: "#1C1C1A",
    },
    formResendCodeLink: {
      color: "#1C1C1A",
    },
  },
};

export default function SignUpPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EDE8E1", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontSize: "15px", fontFamily: "Cormorant Garamond, Georgia, serif", fontWeight: 500, color: "#1C1C1A", textDecoration: "none", letterSpacing: "0.02em" }}>
          ContratGîte
        </Link>
        <Link href="/sign-in" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A7570", textDecoration: "none" }}>
          Déjà un compte ? Se connecter →
        </Link>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <SignUp appearance={clerkAppearance} />
      </div>

    </div>
  );
}
