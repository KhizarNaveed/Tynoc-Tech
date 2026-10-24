import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Chatbot from "@/components/Chatbot";
import type { Form, Question } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { formId: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("forms")
    .select("title, description")
    .eq("id", params.formId)
    .single();

  return {
    title: form ? `${form.title} — FormCraft` : "Form — FormCraft",
    description: form?.description ?? "Answer a few questions in this interactive chatbot form.",
  };
}

export default async function PublicFormPage({
  params,
}: {
  params: { formId: string };
}) {
  const supabase = await createClient();

  // Only serve published forms
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", params.formId)
    .eq("status", "published")
    .single();

  if (!form) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("form_id", params.formId)
    .order("order_index", { ascending: true });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8faf8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            Powered by{" "}
            <span style={{ fontWeight: 800, color: "#166534" }}>
              FormCraft
            </span>
          </div>
        </div>

        <Chatbot
          form={form as Form}
          questions={(questions ?? []) as Question[]}
        />
      </div>
    </main>
  );
}
