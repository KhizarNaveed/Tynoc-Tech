"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteForm, toggleFormStatus } from "@/app/actions";
import type { Form } from "@/types";

interface FormsListClientProps {
  forms: Form[];
}

export default function FormsListClient({ forms: initialForms }: FormsListClientProps) {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoadingId(id);
    await deleteForm(id);
    setForms((prev) => prev.filter((f) => f.id !== id));
    setLoadingId(null);
  };

  const handleToggleStatus = async (id: string, status: "draft" | "published") => {
    setLoadingId(id);
    const result = await toggleFormStatus(id, status);
    if (result.success) {
      setForms((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: status === "draft" ? "published" : "draft" }
            : f
        )
      );
    }
    setLoadingId(null);
  };

  if (forms.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "#ffffff",
        }}
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
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
          No forms yet
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
          Create your first form using the &ldquo;New Form&rdquo; button above. It starts as a draft so you can customize and preview it before publishing.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: "hidden", background: "#ffffff" }}>
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 150px 280px",
          gap: "16px",
          padding: "14px 24px",
          borderBottom: "1px solid #e2e8f0",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "#f8faf8",
        }}
      >
        <span>Form Name</span>
        <span>Status</span>
        <span>Created</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {forms.map((form, i) => (
        <div
          key={form.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 150px 280px",
            gap: "16px",
            padding: "18px 24px",
            borderBottom:
              i < forms.length - 1 ? "1px solid #e2e8f0" : "none",
            alignItems: "center",
            transition: "background 0.15s ease",
            background: "#ffffff",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "#f8faf8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "#ffffff";
          }}
        >
          {/* Title */}
          <div>
            <Link
              href={`/dashboard/forms/${form.id}/edit`}
              style={{
                fontWeight: 600,
                color: "#0f172a",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#166534")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#0f172a")
              }
            >
              {form.title}
            </Link>
            {form.description && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  marginTop: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "300px",
                }}
              >
                {form.description}
              </div>
            )}
          </div>

          {/* Status */}
          <span className={`badge badge-${form.status}`}>{form.status}</span>

          {/* Created */}
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
            {new Date(form.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link
              href={`/dashboard/forms/${form.id}/edit`}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
            >
              Edit
            </Link>

            <Link
              href={`/dashboard/forms/${form.id}/submissions`}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
            >
              Submissions
            </Link>

            <button
              onClick={() => handleToggleStatus(form.id, form.status)}
              disabled={loadingId === form.id}
              style={{
                padding: "6px 12px",
                fontSize: "0.82rem",
                borderRadius: "8px",
                border: form.status === "draft" ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                background: form.status === "draft" ? "#f0fdf4" : "#f8fafc",
                color: form.status === "draft" ? "#166534" : "#475569",
                cursor: loadingId === form.id ? "not-allowed" : "pointer",
                opacity: loadingId === form.id ? 0.6 : 1,
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              {loadingId === form.id
                ? "..."
                : form.status === "draft"
                ? "Publish"
                : "Unpublish"}
            </button>

            <button
              onClick={() => handleDelete(form.id, form.title)}
              disabled={loadingId === form.id}
              className="btn-danger"
              style={{
                padding: "6px 12px",
                fontSize: "0.82rem",
                opacity: loadingId === form.id ? 0.6 : 1,
                cursor: loadingId === form.id ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
