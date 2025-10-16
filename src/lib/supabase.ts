import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 디버깅
console.log('🔍 Supabase 환경 변수:', {
  url: supabaseUrl ? 'OK' : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Supabase 클라이언트 생성 (명시적 옵션)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 세션 저장 안 함 (AuthContext 사용)
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      // 헤더 명시적 설정 (undefined 방지)
    }
  }
});
