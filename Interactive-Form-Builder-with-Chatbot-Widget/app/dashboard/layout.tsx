import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — FormCraft",
  description: "Manage your forms and view submissions in the FormCraft dashboard.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      <DashboardSidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "240px",
          minWidth: 0,
        }}
      >
        <DashboardHeader userEmail={user.email ?? ""} />
        <main
          style={{
            flex: 1,
            padding: "32px",
            maxWidth: "1200px",
            width: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
