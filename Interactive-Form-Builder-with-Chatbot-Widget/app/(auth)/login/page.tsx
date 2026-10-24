import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { LogoIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Sign In — FormCraft",
  description: "Sign in to your FormCraft account.",
};

export default function LoginPage() {
  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "9px",
              background: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <LogoIcon size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0f172a" }}>
            Form<span style={{ color: "#166534" }}>Craft</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div
        className="glass-card"
        style={{ padding: "36px", background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.92rem" }}>
            Sign in to your account to manage your forms.
          </p>
        </div>

        <LoginForm />
      </div>

      <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "0.9rem" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#166534", fontWeight: 600, textDecoration: "none" }}>
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
