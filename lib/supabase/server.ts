import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// Server Component Client
export const createServerSupabaseClient = async () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};

// Helper function to get user session
export const getServerSession = async () => {
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error in getServerSession:", error);
    return null;
  }
};

// Helper function to get user profile
export const getServerProfile = async () => {
  const supabase = await createServerSupabaseClient();
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error getting profile:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in getServerProfile:", error);
    return null;
  }
};
