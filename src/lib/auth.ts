import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getUserId(): Promise<string | null> {
  const access = cookies().get("sb-access-token")?.value;
  if (!access) return null;
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.getUser(access);
  if (error) return null;
  return data.user?.id ?? null;
}
