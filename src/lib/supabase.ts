import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 검증 및 정리
const cleanUrl = supabaseUrl?.trim();
const cleanKey = supabaseAnonKey?.trim();

// 환경 변수 디버깅
console.log('🔍 Supabase 환경 변수:', {
  url: cleanUrl ? 'OK' : 'MISSING',
  urlLength: cleanUrl?.length,
  key: cleanKey ? `${cleanKey.substring(0, 20)}...` : 'MISSING',
  keyLength: cleanKey?.length,
  keyType: typeof cleanKey
});

if (!cleanUrl || !cleanKey) {
  throw new Error('Missing Supabase environment variables');
}

// 유효성 검증
if (cleanKey.includes('\n') || cleanKey.includes('\r') || cleanKey.includes('\t')) {
  console.error('❌ Supabase anon key contains invalid characters');
  throw new Error('Invalid Supabase anon key format');
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
