"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LocalQuestion, ActionResult } from "@/types";

// ──────────────────────────────────────────────
// Form CRUD Actions
// ──────────────────────────────────────────────

/**
 * Create a new blank draft form and redirect to its edit page.
 */
export async function createForm(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      title: "Untitled Form",
      description: "",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createForm error:", error);
    return;
  }

  redirect(`/dashboard/forms/${data.id}/edit`);
}

/**
 * Delete a form (and its questions are cascade-deleted in DB).
 */
export async function deleteForm(formId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("forms")
    .delete()
    .eq("id", formId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/forms");
  return { success: true };
}

/**
 * Toggle form status between 'draft' and 'published'.
 */
export async function toggleFormStatus(
  formId: string,
  currentStatus: "draft" | "published"
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const newStatus = currentStatus === "draft" ? "published" : "draft";

  const { error } = await supabase
    .from("forms")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return { success: true };
}

/**
 * Save form (upsert title/description + handle questions).
 * - UPSERTs the form record
 * - Deletes questions no longer in the array
 * - Upserts remaining questions
 */
export async function saveForm(
  formId: string,
  title: string,
  description: string,
  questions: LocalQuestion[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Update form metadata
  const { error: formError } = await supabase
    .from("forms")
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("user_id", user.id);

  if (formError) return { success: false, error: formError.message };

  // 2. Fetch existing question IDs
  const { data: existingQuestions } = await supabase
    .from("questions")
    .select("id")
    .eq("form_id", formId);

  const existingIds = (existingQuestions ?? []).map((q) => q.id);
  const incomingIds = questions
    .filter((q) => !q.isNew)
    .map((q) => q.id);

  // 3. Delete removed questions
  const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
  if (toDelete.length > 0) {
    await supabase.from("questions").delete().in("id", toDelete);
  }

  // 4. Upsert all questions
  if (questions.length > 0) {
    const rows = questions.map((q) => ({
      // For new questions, don't include id (let DB generate)
      ...(q.isNew ? {} : { id: q.id }),
      form_id: formId,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ?? [],
      is_required: q.is_required,
      order_index: q.order_index,
    }));

    const { error: qError } = await supabase
      .from("questions")
      .upsert(rows, { onConflict: "id" });

    if (qError) return { success: false, error: qError.message };
  }

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return { success: true };
}

// ──────────────────────────────────────────────
// Public Submission Action
// ──────────────────────────────────────────────

/**
 * Submit a chatbot form response.
 */
export async function submitResponse(
  formId: string,
  answers: Record<string, string>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("submissions").insert({
    form_id: formId,
    answers,
    submitted_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };

  return { success: true };
}
