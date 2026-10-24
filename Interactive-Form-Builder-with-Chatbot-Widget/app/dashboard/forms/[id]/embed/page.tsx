import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import EmbedSnippetClient from "./EmbedSnippetClient";
import type { Form } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed Widget — FormCraft",
};

export default async function EmbedPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${proto}://${host}`;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!form) notFound();

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <Link href="/dashboard/forms" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>
            ← Forms
          </Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <Link href={`/dashboard/forms/${form.id}/edit`} style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>
            {(form as Form).title}
          </Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: 600 }}>Embed</span>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          Embed Widget
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          Add the FormCraft chatbot widget to any website.
        </p>
      </div>

      {(form as Form).status === "draft" && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: "0.9rem",
            marginBottom: "28px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            This form is currently a <strong>draft</strong>. You must{" "}
            <Link
              href={`/dashboard/forms/${form.id}/edit`}
              style={{ color: "#92400e", textDecoration: "underline", fontWeight: 600 }}
            >
              publish it
            </Link>{" "}
            before the embed widget will respond to visitors.
          </span>
        </div>
      )}

      <EmbedSnippetClient form={form as Form} origin={origin} />
    </div>
  );
}
