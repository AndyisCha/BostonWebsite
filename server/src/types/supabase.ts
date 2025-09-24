// Supabase 데이터베이스 타입 정의
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          username: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'student' | 'teacher' | 'admin' | 'super_master'
          current_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          experience: number
          total_study_time: number
          current_streak: number
          longest_streak: number
          last_active: string
          preferences: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          username: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin' | 'super_master'
          current_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          experience?: number
          total_study_time?: number
          current_streak?: number
          longest_streak?: number
          last_active?: string
          preferences?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          username?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin' | 'super_master'
          current_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          experience?: number
          total_study_time?: number
          current_streak?: number
          longest_streak?: number
          last_active?: string
          preferences?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          thumbnail_url: string | null
          total_lessons: number
          estimated_hours: number | null
          tags: string[] | null
          prerequisites: string[] | null
          learning_objectives: string[] | null
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          thumbnail_url?: string | null
          total_lessons?: number
          estimated_hours?: number | null
          tags?: string[] | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          thumbnail_url?: string | null
          total_lessons?: number
          estimated_hours?: number | null
          tags?: string[] | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: Json
          lesson_order: number
          estimated_minutes: number
          video_url: string | null
          audio_url: string | null
          transcript: string | null
          vocabulary: Json
          grammar_points: Json
          exercises: Json
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content: Json
          lesson_order: number
          estimated_minutes?: number
          video_url?: string | null
          audio_url?: string | null
          transcript?: string | null
          vocabulary?: Json
          grammar_points?: Json
          exercises?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: Json
          lesson_order?: number
          estimated_minutes?: number
          video_url?: string | null
          audio_url?: string | null
          transcript?: string | null
          vocabulary?: Json
          grammar_points?: Json
          exercises?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ebooks: {
        Row: {
          id: string
          title: string
          author: string | null
          description: string | null
          cover_image_url: string | null
          file_url: string
          file_size: number | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          word_count: number | null
          estimated_reading_time: number | null
          genres: string[] | null
          language: string
          isbn: string | null
          publication_date: string | null
          has_audio: boolean
          audio_url: string | null
          chapters: Json
          vocabulary: Json
          comprehension_questions: Json
          is_published: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author?: string | null
          description?: string | null
          cover_image_url?: string | null
          file_url: string
          file_size?: number | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          word_count?: number | null
          estimated_reading_time?: number | null
          genres?: string[] | null
          language?: string
          isbn?: string | null
          publication_date?: string | null
          has_audio?: boolean
          audio_url?: string | null
          chapters?: Json
          vocabulary?: Json
          comprehension_questions?: Json
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string | null
          description?: string | null
          cover_image_url?: string | null
          file_url?: string
          file_size?: number | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          word_count?: number | null
          estimated_reading_time?: number | null
          genres?: string[] | null
          language?: string
          isbn?: string | null
          publication_date?: string | null
          has_audio?: boolean
          audio_url?: string | null
          chapters?: Json
          vocabulary?: Json
          comprehension_questions?: Json
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_lessons: number
          total_lessons: number
          progress_percentage: number
          current_lesson_id: string | null
          time_spent: number
          last_accessed: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completed_lessons?: number
          total_lessons?: number
          progress_percentage?: number
          current_lesson_id?: string | null
          time_spent?: number
          last_accessed?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completed_lessons?: number
          total_lessons?: number
          progress_percentage?: number
          current_lesson_id?: string | null
          time_spent?: number
          last_accessed?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          user_id: string
          test_id: string
          answers: Json
          score: number
          total_questions: number
          correct_answers: number
          time_spent: number | null
          is_passed: boolean | null
          cefr_result: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          detailed_results: Json | null
          started_at: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_id: string
          answers: Json
          score: number
          total_questions: number
          correct_answers: number
          time_spent?: number | null
          is_passed?: boolean | null
          cefr_result?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          detailed_results?: Json | null
          started_at?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_id?: string
          answers?: Json
          score?: number
          total_questions?: number
          correct_answers?: number
          time_spent?: number | null
          is_passed?: boolean | null
          cefr_result?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          detailed_results?: Json | null
          started_at?: string | null
          completed_at?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          criteria: Json
          points: number
          badge_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          criteria: Json
          points?: number
          badge_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          criteria?: Json
          points?: number
          badge_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_streak: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'student' | 'teacher' | 'admin' | 'super_master'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      content_type: 'lesson' | 'ebook' | 'video' | 'audio' | 'test'
      test_type: 'level_test' | 'lesson_test' | 'practice_test'
      achievement_rarity: 'common' | 'rare' | 'epic' | 'legendary'
    }
  }
}