import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const createSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL 환경변수가 설정되지 않았습니다. .env.local에 SUPABASE_URL을 설정하세요."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local에 SUPABASE_ANON_KEY를 설정하세요."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};
