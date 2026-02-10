import { createClient } from "@supabase/supabase-js";
import { clientEnv, supabaseServerEnv } from "@/lib/env";

export const supabaseAdmin = () => {
  if (!supabaseServerEnv.success) throw new Error("Missing server env: SUPABASE_SERVICE_ROLE_KEY");
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, supabaseServerEnv.data.SUPABASE_SERVICE_ROLE_KEY);
};
