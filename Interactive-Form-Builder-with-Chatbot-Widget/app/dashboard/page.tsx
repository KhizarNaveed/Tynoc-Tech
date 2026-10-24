import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Overview — FormCraft",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch aggregate stats
  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, status, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const formIds = (forms ?? []).map((f) => f.id);

  let totalSubmissions = 0;
  if (formIds.length > 0) {
    const { count } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds);
    totalSubmissions = count ?? 0;
  }

  const totalForms = forms?.length ?? 0;
  const publishedForms = forms?.filter((f) => f.status === "published").length ?? 0;
  const recentForms = forms?.slice(0, 5) ?? [];

  return (
    <div>
      <style>{`
        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          Overview
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          Welcome back. Here is a summary of your form performance and submissions.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {[
          {
            label: "Total Forms",
            value: totalForms,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M7 8h10" />
                <path d="M7 12h5" />
              </svg>
            ),
            href: "/dashboard/forms",
          },
          {
            label: "Published Forms",
            value: publishedForms,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ),
            href: "/dashboard/forms",
          },
          {
            label: "Total Submissions",
            value: totalSubmissions,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            ),
            href: "/dashboard/forms",
          },
          {
            label: "Draft Forms",
            value: totalForms - publishedForms,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ),
            href: "/dashboard/forms",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{ textDecoration: "none" }}
          >
            <div className="stat-card">
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#166534",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    marginTop: "6px",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Forms */}
      <div className="glass-card" style={{ padding: "28px", background: "#ffffff" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
            Recent Forms
          </h2>
          <Link href="/dashboard/forms" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            View All Forms
          </Link>
        </div>

        {recentForms.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#64748b",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#166534",
                marginBottom: "14px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, color: "#0f172a", marginBottom: "6px" }}>No forms created yet</p>
            <p style={{ fontSize: "0.9rem", marginBottom: "20px" }}>
              Build your first form to start collecting responses.
            </p>
            <Link href="/dashboard/forms" className="btn-primary">
              Create a Form
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentForms.map((form) => (
              <div
                key={form.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  background: "#f8faf8",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                    {form.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`badge badge-${form.status}`}>
                    {form.status}
                  </span>
                  <Link
                    href={`/dashboard/forms/${form.id}/edit`}
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
