import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { createForm } from "@/app/actions";
import FormsListClient from "./FormsListClient";
import type { Form } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Forms — FormCraft",
};

export default async function FormsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            My Forms
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {forms?.length ?? 0} form{(forms?.length ?? 0) !== 1 ? "s" : ""} created
          </p>
        </div>

        <form action={createForm}>
          <button type="submit" className="btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Form
          </button>
        </form>
      </div>

      <FormsListClient forms={(forms ?? []) as Form[]} />
    </div>
  );
}
