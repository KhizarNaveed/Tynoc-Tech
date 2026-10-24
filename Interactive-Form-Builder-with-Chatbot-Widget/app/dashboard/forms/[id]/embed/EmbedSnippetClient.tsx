"use client";

import { useState } from "react";
import type { Form } from "@/types";

interface EmbedSnippetClientProps {
  form: Form;
  origin: string;
}

export default function EmbedSnippetClient({ form, origin }: EmbedSnippetClientProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const iframeSrc = `${origin}/f/${form.id}`;

  const iframeSnippet = `<iframe
  src="${iframeSrc}"
  style="position:fixed;bottom:24px;right:24px;width:400px;height:600px;border:none;border-radius:20px;z-index:9999;box-shadow:0 12px 36px rgba(0,0,0,0.25);"
  allow="clipboard-write"
></iframe>`;

  const scriptSnippet = `<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${iframeSrc}';
    iframe.style.cssText = 'position:fixed;bottom:24px;right:24px;width:400px;height:600px;border:none;border-radius:20px;z-index:9999;box-shadow:0 12px 36px rgba(0,0,0,0.25);';
    iframe.allow = 'clipboard-write';
    document.body.appendChild(iframe);
  })();
</script>`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const cards = [
    {
      key: "direct-link",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      title: "Direct Public Link",
      description: "Share this link directly with respondents on social media, email, or chat.",
      code: iframeSrc,
    },
    {
      key: "iframe",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </svg>
      ),
      title: "HTML iframe Embed",
      description: "Paste this iframe into your HTML to show the form as a floating widget on your site.",
      code: iframeSnippet,
    },
    {
      key: "script",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: "JavaScript Snippet",
      description: "Drop this script tag before your closing </body> tag to dynamically inject the floating chatbot widget.",
      code: scriptSnippet,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {cards.map((card) => (
        <div
          key={card.key}
          className="glass-card"
          style={{ padding: "24px", background: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
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
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", marginBottom: "4px" }}>
                  {card.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {card.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(card.code, card.key)}
              style={{
                flexShrink: 0,
                padding: "8px 16px",
                borderRadius: "8px",
                border: copied === card.key ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                background: copied === card.key ? "#f0fdf4" : "#ffffff",
                color: copied === card.key ? "#166534" : "#0f172a",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {copied === card.key ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#f8faf8",
              border: "1px solid #e2e8f0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.82rem",
              color: "#166534",
              lineHeight: 1.6,
              overflowX: "auto",
              whiteSpace: "pre",
              cursor: "pointer",
            }}
            onClick={() => handleCopy(card.code, card.key)}
            title="Click to copy"
          >
            {card.code}
          </div>
        </div>
      ))}

      {/* Note box */}
      <div
        style={{
          padding: "18px 20px",
          borderRadius: "10px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong style={{ color: "#166534", fontSize: "0.9rem" }}>Tip:</strong>{" "}
          <span style={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.55 }}>
            The widget displays a conversational chat form that respondents can complete directly on your site.
            It works seamlessly on all modern desktop and mobile browsers.
          </span>
        </div>
      </div>
    </div>
  );
}
