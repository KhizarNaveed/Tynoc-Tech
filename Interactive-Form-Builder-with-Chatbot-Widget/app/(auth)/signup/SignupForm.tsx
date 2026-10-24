"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) {
      // Translate cryptic Supabase errors into friendly messages
      let friendlyMessage = authError.message;
      if (authError.message.toLowerCase().includes("rate limit")) {
        friendlyMessage =
          "Too many signup attempts. Please wait a few minutes and try again, or ask the admin to disable email confirmation in Supabase.";
      } else if (authError.message.toLowerCase().includes("already registered")) {
        friendlyMessage = "An account with this email already exists. Try signing in instead.";
      }
      setError(friendlyMessage);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // If email confirm is OFF, session is created immediately — redirect now.
    // If email confirm is ON, session will be null — show the "check email" message.
    if (data.session) {
      router.push("/dashboard");
    }
    // else: success state shown (check your email message below)
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ color: "var(--success)", fontWeight: 700, marginBottom: "8px" }}>
          Account created!
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Check your email for a confirmation link, then sign in.
          <br />
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            (If email confirmation is disabled, you&apos;ll be redirected automatically.)
          </span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label htmlFor="signup-email" className="label">Email address</label>
        <input
          id="signup-email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="label">Password</label>
        <input
          id="signup-password"
          type="password"
          className="input"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="signup-confirm" className="label">Confirm password</label>
        <input
          id="signup-confirm"
          type="password"
          className="input"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "var(--error)",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{
          width: "100%",
          justifyContent: "center",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating account..." : "Create Free Account →"}
      </button>
    </form>
  );
}
