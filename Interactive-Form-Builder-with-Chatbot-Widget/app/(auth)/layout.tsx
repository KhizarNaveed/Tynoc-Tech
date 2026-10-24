import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — FormCraft",
  description: "Sign in to your FormCraft account to manage your forms and view submissions.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faf8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      {children}
    </div>
  );
}
