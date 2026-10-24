import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import FormBuilderClient from "./FormBuilderClient";
import type { Form, Question } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Builder — FormCraft",
};

export default async function FormBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
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

  return (
    <FormBuilderClient
      form={form as Form}
      initialQuestions={(questions ?? []) as Question[]}
    />
  );
}
