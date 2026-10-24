import Link from "next/link";
import DemoChatbotClient from "@/components/DemoChatbotClient";
import { createClient } from "@/utils/supabase/server";
import {
  LogoIcon,
  FormBuilderIcon,
  BotIcon,
  EmbedIcon,
  AnalyticsIcon,
} from "@/components/Icons";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ minHeight: "100vh", background: "#f8faf8" }}>
      <style>{`
        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        .footer-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: #166534 !important;
        }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <LogoIcon size={18} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Form<span style={{ color: "#166534" }}>Craft</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          paddingTop: "130px",
          paddingBottom: "80px",
          background: "#f8faf8",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          {/* Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              marginBottom: "24px",
              fontSize: "0.85rem",
              color: "#166534",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#166534",
                display: "inline-block",
              }}
            />
            Interactive Form Builder &amp; Conversational Widget
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "20px",
              color: "#0f172a",
              letterSpacing: "-0.03em",
            }}
          >
            Build Forms That Feel Like{" "}
            <span style={{ color: "#166534" }}>Conversations</span>
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "#475569",
              maxWidth: "620px",
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            Create interactive chatbot-style forms in minutes. Embed them
            anywhere with a simple snippet. Collect clean responses without the friction.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="btn-primary"
              style={{ padding: "13px 30px", fontSize: "0.98rem" }}
            >
              {user ? "Go to Dashboard →" : "Start Building for Free →"}
            </Link>
            <a
              href="#demo"
              className="btn-secondary"
              style={{ padding: "13px 26px", fontSize: "0.98rem" }}
            >
              Try Live Demo ↓
            </a>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "36px",
              marginTop: "56px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "Under 5 min", label: "To build a form" },
              { value: "1-Click", label: "Instant publishing" },
              { value: "100% Solid", label: "No messy bloat" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "16px 24px",
                  borderRadius: "10px",
                  minWidth: "150px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: "#166534",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: "90px 0",
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "2.3rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "12px",
                letterSpacing: "-0.025em",
              }}
            >
              Everything You Need
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "1.05rem",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              A focused platform to create, publish, and collect conversational responses.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: <FormBuilderIcon size={24} />,
                title: "Drag & Drop Builder",
                description:
                  "Build text, email, multiple-choice, and yes/no questions with instant live previews.",
              },
              {
                icon: <BotIcon size={24} />,
                title: "Conversational Widget",
                description:
                  "Deliver questions conversationally one at a time to maximize response completion.",
              },
              {
                icon: <EmbedIcon size={24} />,
                title: "Embed Anywhere",
                description:
                  "Integrate your form on any website or share the hosted public URL with a single click.",
              },
              {
                icon: <AnalyticsIcon size={24} />,
                title: "Submissions Dashboard",
                description:
                  "Track real-time answers, view complete submission history, and export responses effortlessly.",
              },
            ].map((feature) => (
              <div key={feature.title} className="feature-card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#166534",
                    marginBottom: "18px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.6,
                    fontSize: "0.92rem",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: "90px 0", background: "#f8faf8" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "2.3rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "12px",
                letterSpacing: "-0.025em",
              }}
            >
              How It Works
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem" }}>
              Three simple steps from form draft to incoming submissions.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                step: "01",
                title: "Design Questions",
                description:
                  "Add your questions in the clean builder. Set types, options, and required parameters.",
              },
              {
                step: "02",
                title: "Publish & Share",
                description:
                  "Hit Publish to generate your public link or embed script for your website.",
              },
              {
                step: "03",
                title: "Collect Answers",
                description:
                  "Visitors complete questions in the interactive chat widget. View all data in your dashboard.",
              },
            ].map((step) => (
              <div
                key={step.step}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "28px 24px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#166534",
                    marginBottom: "16px",
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.6,
                    fontSize: "0.92rem",
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section
        id="demo"
        style={{
          padding: "90px 0",
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "2.3rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "12px",
                letterSpacing: "-0.025em",
              }}
            >
              Try the Chatbot Widget
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "1.05rem",
                maxWidth: "520px",
                margin: "0 auto",
              }}
            >
              Interact with this live demo below to experience how your respondents will complete forms.
            </p>
          </div>

          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <DemoChatbotClient />
          </div>
        </div>
      </section>

      {/* Solid Dark Green CTA Banner */}
      <section
        style={{
          padding: "80px 0",
          background: "#166534",
          color: "#ffffff",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "14px",
              letterSpacing: "-0.025em",
            }}
          >
            Ready to Build Your First Form?
          </h2>
          <p
            style={{
              color: "#e2f2e7",
              fontSize: "1.1rem",
              marginBottom: "36px",
              maxWidth: "500px",
              margin: "0 auto 36px",
            }}
          >
            Create conversational forms and embed them anywhere in minutes.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 34px",
              background: "#ffffff",
              color: "#166534",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: "8px",
              textDecoration: "none",
              border: "1px solid #ffffff",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
          >
            {user ? "Open Dashboard →" : "Get Started Free →"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 0",
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <LogoIcon size={16} />
            </div>
            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
              Form<span style={{ color: "#166534" }}>Craft</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "28px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Live Demo", href: "#demo" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Sign In", href: "/login" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
            © {new Date().getFullYear()} FormCraft. Solid Dark Green &amp; White Theme.
          </p>
        </div>
      </footer>
    </main>
  );
}
