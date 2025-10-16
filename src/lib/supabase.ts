import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 검증 및 정리 (줄바꿈 제거)
const cleanUrl = supabaseUrl?.trim().replace(/[\n\r\t]/g, '');
const cleanKey = supabaseAnonKey?.trim().replace(/[\n\r\t\s]/g, '');

// 환경 변수 디버깅
console.log('🔍 Supabase 환경 변수:', {
  url: cleanUrl ? 'OK' : 'MISSING',
  urlLength: cleanUrl?.length,
  key: cleanKey ? `${cleanKey.substring(0, 20)}...` : 'MISSING',
  keyLength: cleanKey?.length,
  keyType: typeof cleanKey,
  originalKeyLength: supabaseAnonKey?.length
});

if (!cleanUrl || !cleanKey) {
  throw new Error('Missing Supabase environment variables');
}

// Supabase 클라이언트 생성 (명시적 옵션)
export const supabase = createClient(cleanUrl, cleanKey, {
  auth: {
    persistSession: false, // 세션 저장 안 함 (AuthContext 사용)
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': cleanKey
    }
  }
});

console.log('✅ Supabase 클라이언트 생성 완료');
