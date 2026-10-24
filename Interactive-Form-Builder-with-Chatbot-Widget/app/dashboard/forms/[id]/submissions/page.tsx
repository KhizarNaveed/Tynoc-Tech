import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import type { Form, Question, Submission } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submissions — FormCraft",
};

export default async function SubmissionsPage({
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

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("form_id", params.id)
    .order("order_index", { ascending: true });

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("form_id", params.id)
    .order("submitted_at", { ascending: false });

  const questionMap = new Map(
    (questions ?? []).map((q: Question) => [q.id, q.question_text])
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <Link
            href="/dashboard/forms"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            ← Forms
          </Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            {(form as Form).title}
          </Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: 600 }}>
            Submissions
          </span>
        </div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "6px",
          }}
        >
          Submissions
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          {submissions?.length ?? 0} response{(submissions?.length ?? 0) !== 1 ? "s" : ""} for &ldquo;{(form as Form).title}&rdquo;
        </p>
      </div>

      {/* No submissions state */}
      {(!submissions || submissions.length === 0) ? (
        <div
          className="glass-card"
          style={{ padding: "80px 24px", textAlign: "center", background: "#ffffff" }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#166534",
              marginBottom: "16px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            No submissions yet
          </h2>
          <p
            style={{
              color: "#64748b",
              marginBottom: "28px",
              maxWidth: "420px",
              margin: "0 auto 28px",
              fontSize: "0.92rem",
            }}
          >
            {(form as Form).status === "draft"
              ? "Publish your form first so respondents can access and complete it."
              : "Share the public form link or embed the widget to begin collecting responses."}
          </p>
          {(form as Form).status === "published" && (
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "8px",
                background: "#f8faf8",
                border: "1px solid #e2e8f0",
                maxWidth: "440px",
                margin: "0 auto",
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>
                Public form URL:
              </p>
              <code style={{ fontSize: "0.85rem", color: "#166534", wordBreak: "break-all", fontWeight: 600 }}>
                {origin}/f/{form.id}
              </code>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(submissions as Submission[]).map((submission, i) => (
            <div
              key={submission.id}
              className="glass-card"
              style={{ padding: "24px", background: "#ffffff" }}
            >
              {/* Submission header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#166534",
                    }}
                  >
                    #{(submissions?.length ?? 0) - i}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                      Submission #{(submissions?.length ?? 0) - i}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {new Date(submission.submitted_at).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {Object.entries(submission.answers).map(([qId, answer]) => {
                  const questionText =
                    questionMap.get(qId) ?? `Question (${qId.slice(0, 8)}...)`;
                  return (
                    <div key={qId}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#64748b",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {questionText}
                      </div>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "#f8faf8",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                          fontSize: "0.9rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {String(answer)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
