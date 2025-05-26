import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types";

export const createClientSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

export const supabase = createClientSupabaseClient();
