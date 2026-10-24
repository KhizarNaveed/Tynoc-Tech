"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DashboardHeaderProps {
  userEmail: string;
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      style={{
        height: "64px",
        borderBottom: "1px solid #e2e8f0",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 32px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "#166534",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span style={{ color: "#334155", fontSize: "0.88rem", fontWeight: 500 }}>
          {userEmail}
        </span>
      </div>

      <div style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />

      <button
        onClick={handleSignOut}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          color: "#475569",
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.15s ease",
          fontWeight: 500,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#b91c1c";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#fecaca";
          (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#475569";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
          (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </header>
  );
}
