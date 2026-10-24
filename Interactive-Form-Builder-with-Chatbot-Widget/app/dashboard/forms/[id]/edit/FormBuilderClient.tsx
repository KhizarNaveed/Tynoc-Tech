"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { saveForm, toggleFormStatus } from "@/app/actions";
import type { Form, Question, LocalQuestion, QuestionType } from "@/types";
import { BotIcon, ChatIcon } from "@/components/Icons";

interface FormBuilderClientProps {
  form: Form;
  initialQuestions: Question[];
}

const TYPE_META: Record<QuestionType, { label: string; icon: string; color: string }> = {
  text:             { label: "Short Text",       icon: "T",  color: "#6366f1" },
  email:            { label: "Email",            icon: "@",  color: "#06b6d4" },
  multiple_choice:  { label: "Multiple Choice",  icon: "≡",  color: "#f59e0b" },
  yes_no:           { label: "Yes / No",         icon: "?",  color: "#10b981" },
};

function uid() {
  return "new-" + Math.random().toString(36).slice(2, 10);
}

export default function FormBuilderClient({
  form: initialForm,
  initialQuestions,
}: FormBuilderClientProps) {
  const [title, setTitle]           = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description ?? "");
  const [formStatus, setFormStatus] = useState<"draft" | "published">(initialForm.status);
  const [questions, setQuestions]   = useState<LocalQuestion[]>(
    initialQuestions.map((q) => ({ ...q, options: q.options ?? [] }))
  );
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [newType, setNewType]       = useState<QuestionType>("text");
  const [activeTab, setActiveTab]   = useState<"build" | "preview">("build");

  /* ── Actions ─────────────────────────────────── */

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const r = await saveForm(initialForm.id, title, description, questions);
    setSaveMsg(r.success
      ? { ok: true,  text: "Changes saved" }
      : { ok: false, text: r.error ?? "Save failed" });
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleTogglePublish = async () => {
    const r = await toggleFormStatus(initialForm.id, formStatus);
    if (r.success) setFormStatus((s) => (s === "draft" ? "published" : "draft"));
  };

  const addQuestion = useCallback(() => {
    const q: LocalQuestion = {
      id: uid(), form_id: initialForm.id,
      question_text: "", question_type: newType,
      options: [], is_required: false, order_index: questions.length,
      isNew: true,
    };
    setQuestions((p) => [...p, q]);
  }, [newType, questions.length, initialForm.id]);

  const updateQ = (id: string, patch: Partial<LocalQuestion>) =>
    setQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const removeQ = (id: string) =>
    setQuestions((p) => p.filter((q) => q.id !== id));

  const moveQ = (i: number, dir: "up" | "down") => {
    setQuestions((p) => {
      const n = [...p];
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  const addOpt   = (id: string) =>
    updateQ(id, { options: [...(questions.find((q) => q.id === id)?.options ?? []), "Option"] });
  const removeOpt = (id: string, i: number) =>
    updateQ(id, { options: (questions.find((q) => q.id === id)?.options ?? []).filter((_, j) => j !== i) });
  const updateOpt = (id: string, i: number, v: string) =>
    updateQ(id, { options: (questions.find((q) => q.id === id)?.options ?? []).map((o, j) => j === i ? v : o) });

  /* ── Render ──────────────────────────────────── */

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <style>{`
        .fb-tab { padding:8px 20px; border-radius:8px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; transition:all 0.15s; background:transparent; color:var(--text-muted); }
        .fb-tab.active { background:var(--surface-2); color:var(--foreground); box-shadow:0 1px 4px rgba(0,0,0,0.3); }
        .fb-tab:hover:not(.active) { color:var(--foreground); }
        .q-card { background:var(--surface); border:1.5px solid var(--border-subtle); border-radius:14px; padding:20px; transition:border-color 0.18s,box-shadow 0.18s; }
        .q-card:hover { border-color:rgba(22,101,52,0.4); box-shadow:0 2px 12px rgba(22,101,52,0.06); }
        .q-type-badge { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; font-size:0.75rem; font-weight:800; letter-spacing:-0.02em; }
        .icon-btn { width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; border-radius:7px; border:none; cursor:pointer; font-size:0.8rem; transition:all 0.15s; }
        .icon-btn:hover { background:rgba(255,255,255,0.08); }
        .icon-btn.danger:hover { background:rgba(239,68,68,0.12); color:#f87171; }
        .opt-row { display:flex; align-items:center; gap:8px; }
        .opt-input { flex:1; background:var(--surface-2); border:1px solid var(--border-subtle); border-radius:7px; padding:6px 10px; color:var(--foreground); font-size:0.85rem; outline:none; }
        .opt-input:focus { border-color:#166534; }
        .toggle-track { width:38px; height:22px; border-radius:11px; border:none; cursor:pointer; transition:background 0.2s; position:relative; flex-shrink:0; }
        .toggle-thumb { position:absolute; top:3px; width:16px; height:16px; border-radius:50%; background:white; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.3); }
        .type-select { background:var(--surface-2); border:1px solid var(--border-subtle); border-radius:8px; padding:7px 10px; color:var(--foreground); font-size:0.85rem; cursor:pointer; outline:none; }
        .type-select:focus { border-color:#166534; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0 20px", gap: "12px", flexShrink: 0,
      }}>
        {/* Breadcrumb + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <Link href="/dashboard/forms" style={{
            color: "var(--text-muted)", textDecoration: "none", fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: "4px", flexShrink: 0,
          }}>
            ← Forms
          </Link>
          <span style={{ color: "var(--border-subtle)", flexShrink: 0 }}>/</span>
          <span style={{
            fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px",
          }}>
            {title || "Untitled"}
          </span>
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, padding: "2px 9px", borderRadius: "20px",
            background: formStatus === "published" ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.1)",
            color: formStatus === "published" ? "var(--success)" : "var(--text-muted)",
            border: `1px solid ${formStatus === "published" ? "rgba(16,185,129,0.25)" : "rgba(107,114,128,0.2)"}`,
            textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0,
          }}>
            {formStatus}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {saveMsg && (
            <span style={{
              fontSize: "0.82rem", fontWeight: 500,
              color: saveMsg.ok ? "var(--success)" : "var(--error)",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {saveMsg.ok ? "✓" : "✗"} {saveMsg.text}
            </span>
          )}

          {formStatus === "published" && (
            <Link
              href={`/f/${initialForm.id}`}
              target="_blank"
              style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
                fontWeight: 600, textDecoration: "none", color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)", background: "var(--surface-2)",
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              ↗ View Live
            </Link>
          )}

          <Link
            href={`/dashboard/forms/${initialForm.id}/submissions`}
            style={{
              padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
              fontWeight: 600, textDecoration: "none", color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)", background: "var(--surface-2)",
            }}
          >
            Responses
          </Link>

          <button
            onClick={handleTogglePublish}
            style={{
              padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem",
              fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              border: formStatus === "draft" ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(107,114,128,0.3)",
              background: formStatus === "draft" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.08)",
              color: formStatus === "draft" ? "var(--success)" : "var(--text-muted)",
            }}
          >
            {formStatus === "draft" ? "Publish" : "Unpublish"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px", borderRadius: "8px", fontSize: "0.82rem",
              fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              background: "var(--primary)", color: "#0f2010", border: "none",
              opacity: saving ? 0.7 : 1, transition: "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Mobile Tabs (visible on narrow screens) ── */}
      <div style={{
        display: "flex", gap: "4px", padding: "4px",
        background: "var(--surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "10px", marginBottom: "16px", width: "fit-content", flexShrink: 0,
      }}>
        <button className={`fb-tab${activeTab === "build" ? " active" : ""}`} onClick={() => setActiveTab("build")}>
          Build
        </button>
        <button className={`fb-tab${activeTab === "preview" ? " active" : ""}`} onClick={() => setActiveTab("preview")}>
          Preview
        </button>
      </div>

      {/* ── Split Layout ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: activeTab === "build" ? "1fr 360px" : "0 1fr",
        gap: "20px", flex: 1, minHeight: 0, overflow: "hidden",
      }}>

        {/* LEFT: Builder Panel */}
        <div style={{
          flexDirection: "column", gap: "16px",
          overflowY: "auto", paddingRight: "4px",
          display: activeTab === "preview" ? "none" : "flex",
        } as React.CSSProperties}>

          {/* Form info card */}
          <div style={{
            background: "var(--surface)", border: "1.5px solid var(--border-subtle)",
            borderRadius: "14px", padding: "20px 24px",
          }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
              Form Details
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: 500 }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Customer Feedback Survey"
                  style={{
                    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                    borderRadius: "8px", padding: "9px 12px", color: "var(--foreground)",
                    fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: 500 }}>
                  Description <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell respondents what this form is about."
                  rows={2}
                  style={{
                    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                    borderRadius: "8px", padding: "9px 12px", color: "var(--foreground)",
                    fontSize: "0.88rem", outline: "none", resize: "vertical", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onUpdate={(patch) => updateQ(q.id, patch)}
              onRemove={() => removeQ(q.id)}
              onMoveUp={() => moveQ(i, "up")}
              onMoveDown={() => moveQ(i, "down")}
              onAddOption={() => addOpt(q.id)}
              onRemoveOption={(j) => removeOpt(q.id, j)}
              onUpdateOption={(j, v) => updateOpt(q.id, j, v)}
            />
          ))}

          {/* Add question */}
          <div style={{
            background: "var(--surface)", border: "1.5px dashed var(--border-subtle)",
            borderRadius: "14px", padding: "16px 20px",
            display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
              Add question
            </span>
            <select
              className="type-select"
              value={newType}
              onChange={(e) => setNewType(e.target.value as QuestionType)}
              style={{ flex: 1, minWidth: "160px" }}
            >
              {(Object.entries(TYPE_META) as [QuestionType, typeof TYPE_META[QuestionType]][]).map(([t, m]) => (
                <option key={t} value={t}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={addQuestion}
              style={{
                padding: "8px 18px", borderRadius: "8px", fontSize: "0.85rem",
                fontWeight: 700, cursor: "pointer", background: "var(--primary)",
                color: "#0f2010", border: "none", whiteSpace: "nowrap",
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* RIGHT: Preview Panel */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          <FormPreview
            title={title}
            description={description}
            questions={questions}
            formId={initialForm.id}
            formStatus={formStatus}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Question Card
══════════════════════════════════════════════ */

interface QuestionCardProps {
  question: LocalQuestion;
  index: number;
  total: number;
  onUpdate: (patch: Partial<LocalQuestion>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddOption: () => void;
  onRemoveOption: (i: number) => void;
  onUpdateOption: (i: number, v: string) => void;
}

function QuestionCard({
  question, index, total,
  onUpdate, onRemove, onMoveUp, onMoveDown,
  onAddOption, onRemoveOption, onUpdateOption,
}: QuestionCardProps) {
  const meta = TYPE_META[question.question_type];

  return (
    <div className="q-card">
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
        <span
          className="q-type-badge"
          style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
        >
          {meta.icon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
            Q{index + 1} · {meta.label}
          </div>
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => onUpdate({ question_text: e.target.value })}
            placeholder="Type your question here…"
            style={{
              width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--border-subtle)",
              color: "var(--foreground)", fontSize: "0.95rem", fontWeight: 500,
              padding: "4px 0", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          <button className="icon-btn" onClick={onMoveUp} disabled={index === 0} title="Move up"
            style={{ opacity: index === 0 ? 0.3 : 1, background: "transparent", color: "var(--text-muted)" }}>
            ↑
          </button>
          <button className="icon-btn" onClick={onMoveDown} disabled={index === total - 1} title="Move down"
            style={{ opacity: index === total - 1 ? 0.3 : 1, background: "transparent", color: "var(--text-muted)" }}>
            ↓
          </button>
          <button className="icon-btn danger" onClick={onRemove} title="Delete"
            style={{ background: "transparent", color: "var(--text-muted)", marginLeft: "4px" }}>
            ×
          </button>
        </div>
      </div>

      {/* Type selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Type:</label>
        <select
          className="type-select"
          value={question.question_type}
          onChange={(e) => onUpdate({ question_type: e.target.value as QuestionType, options: [] })}
          style={{ flex: 1, maxWidth: "220px" }}
        >
          {(Object.entries(TYPE_META) as [QuestionType, typeof TYPE_META[QuestionType]][]).map(([t, m]) => (
            <option key={t} value={t}>{m.label}</option>
          ))}
        </select>

        {/* Required toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginLeft: "auto" }}>
          <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", cursor: "pointer" }}
            onClick={() => onUpdate({ is_required: !question.is_required })}>
            Required
          </label>
          <button
            className="toggle-track"
            onClick={() => onUpdate({ is_required: !question.is_required })}
            style={{ background: question.is_required ? "var(--primary)" : "rgba(255,255,255,0.1)" }}
          >
            <span className="toggle-thumb" style={{ left: question.is_required ? "19px" : "3px" }} />
          </button>
        </div>
      </div>

      {/* Multiple choice options */}
      {question.question_type === "multiple_choice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {question.options.map((opt, i) => (
            <div key={i} className="opt-row">
              <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1.5px solid var(--border-subtle)", flexShrink: 0 }} />
              <input
                className="opt-input"
                value={opt}
                onChange={(e) => onUpdateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              <button className="icon-btn danger" onClick={() => onRemoveOption(i)}
                style={{ background: "transparent", color: "var(--text-muted)" }}>
                ×
              </button>
            </div>
          ))}
          <button
            onClick={onAddOption}
            style={{
              alignSelf: "flex-start", marginTop: "4px", padding: "5px 12px",
              borderRadius: "7px", border: "1px dashed var(--border-subtle)",
              background: "transparent", color: "var(--text-muted)",
              fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            + Add option
          </button>
        </div>
      )}

      {/* Yes/No preview */}
      {question.question_type === "yes_no" && (
        <div style={{ display: "flex", gap: "8px" }}>
          {["Yes", "No"].map((label) => (
            <span key={label} style={{
              padding: "5px 18px", borderRadius: "8px", fontSize: "0.82rem",
              border: "1px solid var(--border-subtle)", color: "var(--text-muted)",
            }}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Live Preview
══════════════════════════════════════════════ */

interface FormPreviewProps {
  title: string;
  description: string;
  questions: LocalQuestion[];
  formId: string;
  formStatus: string;
}

function FormPreview({ title, description, questions, formId, formStatus }: FormPreviewProps) {
  const firstQ = questions[0];

  return (
    <div>
      <p style={{
        fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px",
      }}>
        Live Preview
      </p>

      {/* Chat mockup */}
      <div style={{
        background: "var(--surface)", border: "1.5px solid var(--border-subtle)",
        borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 32px rgba(22,101,52,0.10)",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 18px",
          background: "#166534",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "rgba(255,255,255,0.16)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)",
          }}>
            <ChatIcon size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.88rem", lineHeight: 1.2 }}>
              {title || "Your Form"}
            </div>
            {description && (
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>
                {description}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.85)" }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: "16px", minHeight: "180px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Bot welcome */}
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
              background: "#166534",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff",
            }}>
              <BotIcon size={13} />
            </div>
            <div style={{
              padding: "9px 13px", borderRadius: "4px 13px 13px 13px",
              background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
              fontSize: "0.82rem", color: "var(--foreground)", maxWidth: "85%",
            }}>
              {questions.length === 0
                ? "Hi! Add questions to get started."
                : `Hi! Welcome to ${title || "this form"}.`}
            </div>
          </div>

          {firstQ && (
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                background: "#166534",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff",
              }}>
                <BotIcon size={13} />
              </div>
              <div style={{
                padding: "9px 13px", borderRadius: "4px 13px 13px 13px",
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                fontSize: "0.82rem", color: "var(--foreground)", maxWidth: "85%",
              }}>
                {firstQ.question_text || <em style={{ color: "var(--text-muted)" }}>Your question text…</em>}
              </div>
            </div>
          )}
        </div>

        {/* Input area preview */}
        {firstQ && (
          <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--border-subtle)", background: "rgba(22,101,52,0.03)" }}>
            {(firstQ.question_type === "text" || firstQ.question_type === "email") && (
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{
                  flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                  borderRadius: "8px", padding: "8px 12px", fontSize: "0.8rem", color: "var(--text-muted)",
                }}>
                  {firstQ.question_type === "email" ? "your@email.com" : "Type your answer…"}
                </div>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", color: "#ffffff", flexShrink: 0,
                }}>
                  →
                </div>
              </div>
            )}
            {firstQ.question_type === "multiple_choice" && firstQ.options.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {firstQ.options.slice(0, 4).map((opt) => (
                  <div key={opt} style={{
                    padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)",
                    fontSize: "0.78rem", color: "var(--text-secondary)",
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {firstQ.question_type === "yes_no" && (
              <div style={{ display: "flex", gap: "8px" }}>
                {["Yes", "No"].map((l) => (
                  <div key={l} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem", color: "var(--text-secondary)", textAlign: "center",
                  }}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {questions.length > 0 && (
          <div style={{
            padding: "8px 16px 10px", background: "rgba(22,101,52,0.02)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              1 / {questions.length}
            </span>
            <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "rgba(0,0,0,0.08)" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: "#166534",
                width: `${(1 / questions.length) * 100}%`, transition: "width 0.3s",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Share / Embed box */}
      <div style={{
        marginTop: "16px", padding: "16px 18px",
        background: "var(--surface)", border: "1.5px solid var(--border-subtle)",
        borderRadius: "14px",
      }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          Share & Embed
        </p>

        {formStatus === "published" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "5px" }}>Public URL</p>
              <div style={{
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                borderRadius: "8px", padding: "7px 10px",
                fontFamily: "monospace", fontSize: "0.75rem", color: "var(--primary-light)",
                wordBreak: "break-all",
              }}>
                /f/{formId}
              </div>
            </div>
            <Link
              href={`/dashboard/forms/${formId}/embed`}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "0.82rem", color: "var(--primary-light)",
                textDecoration: "none", fontWeight: 600,
              }}
            >
              View embed instructions →
            </Link>
          </div>
        ) : (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Publish this form to get a shareable URL and embed snippet.
          </p>
        )}
      </div>
    </div>
  );
}
