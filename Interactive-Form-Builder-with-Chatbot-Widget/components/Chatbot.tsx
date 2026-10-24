"use client";

import { useState, useEffect, useRef } from "react";
import { submitResponse } from "@/app/actions";
import type { Form, Question, ChatMessage } from "@/types";
import { BotIcon, ChatIcon, SendIcon } from "@/components/Icons";

interface ChatbotProps {
  form: Form;
  questions: Question[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Chatbot({ form, questions }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = welcome state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hasQuestions] = useState(questions.length > 0);

  // Initialize with welcome message
  useEffect(() => {
    const welcome: ChatMessage[] = [
      {
        role: "bot",
        text: `Hi! Welcome to **${form.title}**. ${form.description ? form.description + " " : ""}I'll ask you a few questions.`,
      },
    ];

    if (questions.length === 0) {
      welcome.push({ role: "bot", text: "This form has no questions yet. Check back later!" });
      setMessages(welcome);
      setIsComplete(true); // complete but don't submit
      return;
    }

    welcome.push({ role: "bot", text: questions[0].question_text });
    setMessages(welcome);
    setCurrentIndex(0);
  }, [form, questions]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentQuestion = questions[currentIndex];

  const processAnswer = async (answer: string) => {
    if (!answer.trim()) {
      setError("Please provide an answer.");
      return;
    }

    // Email validation
    if (currentQuestion?.question_type === "email" && !EMAIL_REGEX.test(answer.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");

    // Record user answer in messages
    const newAnswers = { ...answers, [currentQuestion.id]: answer.trim() };
    setAnswers(newAnswers);

    const userMsg: ChatMessage = { role: "user", text: answer.trim() };
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      const botMsg: ChatMessage = { role: "bot", text: nextQuestion.question_text };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setCurrentIndex(nextIndex);
    } else {
      // Completed all questions — only submit if there are actual questions
      const finalMsg: ChatMessage = {
        role: "bot",
        text: "Thank you! Your response has been submitted.",
      };
      setMessages((prev) => [...prev, userMsg, finalMsg]);
      setIsComplete(true);
      setCurrentIndex(nextIndex);

      if (hasQuestions) {
        setIsSubmitting(true);
        const result = await submitResponse(form.id, newAnswers);
        setIsSubmitting(false);

        if (!result.success) {
          setSubmitError(result.error ?? "Failed to save response. Please try again.");
        }
      }
    }

    setInputValue("");
  };

  const showTextInput =
    !isComplete &&
    currentQuestion &&
    (currentQuestion.question_type === "text" || currentQuestion.question_type === "email");

  const showChoices =
    !isComplete &&
    currentQuestion &&
    currentQuestion.question_type === "multiple_choice" &&
    currentQuestion.options &&
    currentQuestion.options.length > 0;

  const showYesNo =
    !isComplete &&
    currentQuestion &&
    currentQuestion.question_type === "yes_no";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Header - Solid Forest Green */}
      <div
        style={{
          padding: "18px 22px",
          background: "#166534",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
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
          <ChatIcon size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: "#ffffff",
              fontSize: "1rem",
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {form.title}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "3px",
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
            Online · {questions.length} question{questions.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Progress indicator */}
        {!isComplete && currentIndex >= 0 && questions.length > 0 && (
          <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.85)",
                marginBottom: "4px",
                fontWeight: 600,
              }}
            >
              {Math.min(currentIndex + 1, questions.length)} / {questions.length}
            </div>
            <div
              style={{
                width: "70px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255, 255, 255, 0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "2px",
                  background: "#ffffff",
                  width: `${(Math.min(currentIndex + 1, questions.length) / questions.length) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          padding: "20px",
          minHeight: "360px",
          maxHeight: "460px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
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
                padding: "11px 15px",
                borderRadius:
                  msg.role === "bot"
                    ? "4px 14px 14px 14px"
                    : "14px 4px 14px 14px",
                background: msg.role === "bot" ? "#ffffff" : "#166534",
                color: msg.role === "bot" ? "#0f172a" : "#ffffff",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                border: msg.role === "bot" ? "1px solid #e2e8f0" : "1px solid #14532d",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {msg.text.split(/\*\*(.*?)\*\*/g).map((part, pi) =>
                pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "16px 20px 20px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "0.82rem",
              marginBottom: "10px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {submitError && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "0.82rem",
              marginBottom: "10px",
              fontWeight: 500,
            }}
          >
            {submitError}
          </div>
        )}

        {showTextInput && (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type={currentQuestion.question_type === "email" ? "email" : "text"}
              className="input"
              style={{ flex: 1 }}
              placeholder={
                currentQuestion.question_type === "email"
                  ? "your@email.com"
                  : "Type your answer..."
              }
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") processAnswer(inputValue);
              }}
              autoFocus
            />
            <button
              className="btn-primary"
              style={{ padding: "10px 18px", flexShrink: 0 }}
              onClick={() => processAnswer(inputValue)}
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
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => processAnswer(opt)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                  lineHeight: 1.4,
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
            <button
              onClick={() => processAnswer("Yes")}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Yes
            </button>
            <button
              onClick={() => processAnswer("No")}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              No
            </button>
          </div>
        )}

        {isComplete && !isSubmitting && hasQuestions && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "8px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Your response has been recorded. Thank you!
            </div>
          </div>
        )}

        {isSubmitting && (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            Saving your response...
          </div>
        )}
      </div>
    </div>
  );
}
