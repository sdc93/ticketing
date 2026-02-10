import { createClient } from "@supabase/supabase-js";
import { clientEnv, serverEnv } from "@/lib/env";

export const supabaseAdmin = () => {
  if (!serverEnv.success) throw new Error("Missing server env");
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.data.SUPABASE_SERVICE_ROLE_KEY);
};
