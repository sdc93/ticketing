import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";

export async function requireAdmin(): Promise<{ userId: string }> {
  const userId = await getUserId();
  if (!userId) throw new Error("UNAUTHORIZED");
  const supabase = supabaseAdmin();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  if (!profile?.is_admin) throw new Error("FORBIDDEN");
  return { userId };
}
