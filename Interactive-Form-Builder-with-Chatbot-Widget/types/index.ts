// ============================================================
// Core Domain Types
// ============================================================

export type QuestionType = "text" | "email" | "multiple_choice" | "yes_no";
export type FormStatus = "draft" | "published";

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  question_text: string;
  question_type: QuestionType;
  /**
   * Array of option strings. Only used when question_type === 'multiple_choice'.
   * For 'yes_no' this will be ignored (Yes/No buttons are rendered by default).
   */
  options: string[];
  is_required: boolean;
  order_index: number;
}

export interface Submission {
  id: string;
  form_id: string;
  /**
   * Maps question UUID to answer string.
   * e.g. { "q-uuid-1": "John", "q-uuid-2": "Option 1" }
   */
  answers: Record<string, string>;
  submitted_at: string;
}

// ============================================================
// UI / Builder Helpers
// ============================================================

/**
 * Used by the Form Builder to track local (unsaved) question state.
 * `id` may be a temporary UUID (prefixed with "new-") until saved.
 */
export interface LocalQuestion {
  id: string;
  form_id?: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  is_required: boolean;
  order_index: number;
  isNew?: boolean;
}

// ============================================================
// Chatbot Widget
// ============================================================

export type MessageRole = "bot" | "user";

export interface ChatMessage {
  role: MessageRole;
  text: string;
}

// ============================================================
// API / Action Return Types
// ============================================================

export interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Dashboard Aggregate
// ============================================================

export interface DashboardStats {
  totalForms: number;
  totalSubmissions: number;
}
