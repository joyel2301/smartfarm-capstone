import { createClient } from "@supabase/supabase-js";

// 백엔드 .env 이름(SUPABASE_URL, SUPABASE_KEY)에 맞춰 읽고,
// Vite 노출용 접두사(VITE_*)도 함께 시도합니다.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase 환경변수가 없습니다. (SUPABASE_URL/SUPABASE_KEY 또는 VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY를 .env에 추가하세요.)"
  );
}

// 현재 로그인 세션의 access_token을 Authorization 헤더로 반환
// 백엔드 호출 시 RLS를 통과하려면 이 헤더를 함께 넘겨주세요.
export async function getAuthHeader() {
  if (!supabase) return {};
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
