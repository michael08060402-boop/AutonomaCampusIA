import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutShell } from "@/components/layout/layout-shell";

export default async function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "estudiante") redirect("/dashboard");

  const rawName = user.user_metadata?.full_name || user.user_metadata?.name || profile?.full_name || user.email || "Estudiante";
  const userName = rawName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const userAvatar = user.user_metadata?.avatar_url || profile?.avatar_url;

  return (
    <LayoutShell role="estudiante" userName={userName} userAvatar={userAvatar}>
      {children}
    </LayoutShell>
  );
}
