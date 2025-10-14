// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Missing Supabase environment variables. Please configure your .env file.');
  console.warn('⚠️  Server will start but database operations will fail.');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Service role client (서버사이드 전용)
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Anon client (클라이언트에서 사용할 설정)
export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Database helper functions
export const db = {
  // Users
  users: supabaseAdmin.from('users'),

  // Courses & Lessons
  courses: supabaseAdmin.from('courses'),
  lessons: supabaseAdmin.from('lessons'),

  // E-books
  ebooks: supabaseAdmin.from('ebooks'),

  // Progress tracking
  userProgress: supabaseAdmin.from('user_progress'),
  lessonProgress: supabaseAdmin.from('lesson_progress'),
  ebookProgress: supabaseAdmin.from('ebook_progress'),

  // Tests
  tests: supabaseAdmin.from('tests'),
  testResults: supabaseAdmin.from('test_results'),

  // Vocabulary
  vocabulary: supabaseAdmin.from('vocabulary'),
  userVocabulary: supabaseAdmin.from('user_vocabulary'),

  // Achievements
  achievements: supabaseAdmin.from('achievements'),
  userAchievements: supabaseAdmin.from('user_achievements'),

  // Study sessions
  studySessions: supabaseAdmin.from('study_sessions'),

  // Social
  friendships: supabaseAdmin.from('friendships'),

  // Notifications
  notifications: supabaseAdmin.from('notifications'),

  // File uploads
  fileUploads: supabaseAdmin.from('file_uploads')
};

// Storage buckets
export const storage = {
  ebooks: supabaseAdmin.storage.from('ebooks'),
  audio: supabaseAdmin.storage.from('audio'),
  images: supabaseAdmin.storage.from('images'),
  avatars: supabaseAdmin.storage.from('avatars'),
  documents: supabaseAdmin.storage.from('documents')
};

export default supabaseAdmin;