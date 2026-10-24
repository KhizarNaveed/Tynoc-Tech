"use client";

import { useState } from "react";
import { BotIcon, ChatIcon, SendIcon } from "@/components/Icons";

const DEMO_QUESTIONS = [
  {
    id: "q1",
    text: "Hi! Welcome to FormCraft. What is your name?",
    type: "text" as const,
    placeholder: "Type your name...",
  },
  {
    id: "q2",
    text: "Great to meet you! What is your email address?",
    type: "email" as const,
    placeholder: "your@email.com",
  },
  {
    id: "q3",
    text: "How did you hear about FormCraft?",
    type: "choice" as const,
    options: ["Social Media", "Search Engine", "Colleague Recommendation", "Other"],
  },
  {
    id: "q4",
    text: "Would you like to subscribe to product updates?",
    type: "yesno" as const,
  },
];

interface Message {
  role: "bot" | "user";
  text: string;
}

export default function DemoChatbotClient() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: DEMO_QUESTIONS[0].text },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  const handleAnswer = (answer: string) => {
    const question = DEMO_QUESTIONS[currentIndex];

    // Validate email
    if (question.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (!answer.trim()) {
      setError("Please provide an answer.");
      return;
    }

    setError("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", text: answer },
    ];

    const nextIndex = currentIndex + 1;

    if (nextIndex < DEMO_QUESTIONS.length) {
      newMessages.push({ role: "bot", text: DEMO_QUESTIONS[nextIndex].text });
      setCurrentIndex(nextIndex);
    } else {
      newMessages.push({
        role: "bot",
        text: "Thank you! This is how FormCraft collects responses in a friendly, interactive conversation.",
      });
      setIsComplete(true);
    }

    setMessages(newMessages);
    setInputValue("");
  };

  const handleReset = () => {
    setMessages([{ role: "bot", text: DEMO_QUESTIONS[0].text }]);
    setCurrentIndex(0);
    setInputValue("");
    setIsComplete(false);
    setError("");
  };

  const currentQuestion = DEMO_QUESTIONS[currentIndex];
  const showInput =
    !isComplete &&
    (currentQuestion.type === "text" || currentQuestion.type === "email");
  const showChoices =
    !isComplete && currentQuestion.type === "choice";
  const showYesNo =
    !isComplete && currentQuestion.type === "yesno";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Chat header - Solid Forest Green */}
      <div
        style={{
          padding: "16px 20px",
          background: "#166534",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.16)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          <ChatIcon size={18} />
        </div>
        <div>
          <div
            style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.95rem", lineHeight: 1.2 }}
          >
            FormCraft Demo
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "2px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
              }}
            />
            Online · Live Preview
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#ffffff",
            background: "rgba(255, 255, 255, 0.18)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            padding: "3px 10px",
            borderRadius: "12px",
          }}
        >
          DEMO
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          padding: "20px",
          minHeight: "320px",
          maxHeight: "390px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "#fafafa",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            {msg.role === "bot" && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                <BotIcon size={14} />
              </div>
            )}
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius:
                  msg.role === "bot"
                    ? "4px 14px 14px 14px"
                    : "14px 4px 14px 14px",
                background: msg.role === "bot" ? "#ffffff" : "#166534",
                color: msg.role === "bot" ? "#0f172a" : "#ffffff",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                border: msg.role === "bot" ? "1px solid #e2e8f0" : "1px solid #14532d",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        {error && (
          <p
            style={{
              color: "#b91c1c",
              fontSize: "0.82rem",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            {error}
          </p>
        )}

        {showInput && (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type={currentQuestion.type === "email" ? "email" : "text"}
              className="input"
              style={{ flex: 1 }}
              placeholder={currentQuestion.placeholder ?? "Type your answer..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnswer(inputValue);
              }}
            />
            <button
              className="btn-primary"
              style={{ padding: "10px 16px", flexShrink: 0 }}
              onClick={() => handleAnswer(inputValue)}
            >
              <SendIcon size={16} />
              <span>Send</span>
            </button>
          </div>
        )}

        {showChoices && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px",
            }}
          >
            {currentQuestion.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#166534";
                  (e.currentTarget as HTMLButtonElement).style.color = "#166534";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
                  (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {showYesNo && (
          <div style={{ display: "flex", gap: "12px" }}>
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={opt === "Yes" ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, padding: "10px 16px" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {isComplete && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href="/signup"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
            >
              Build Your Own Form →
            </a>
            <button
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "0.82rem",
                cursor: "pointer",
                padding: "4px",
                textDecoration: "underline",
              }}
            >
              Restart Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
