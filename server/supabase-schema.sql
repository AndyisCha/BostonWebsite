-- Boston English Learning Platform - Supabase Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'super_master');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE content_type AS ENUM ('lesson', 'ebook', 'video', 'audio', 'test');
CREATE TYPE test_type AS ENUM ('level_test', 'lesson_test', 'practice_test');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- 1. Users 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    current_level cefr_level DEFAULT 'A1',
    experience INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- minutes
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses 테이블
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty difficulty_level NOT NULL,
    cefr_level cefr_level NOT NULL,
    thumbnail_url TEXT,
    total_lessons INTEGER DEFAULT 0,
    estimated_hours INTEGER, -- estimated completion time
    tags TEXT[],
    prerequisites TEXT[],
    learning_objectives TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lessons 테이블
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL, -- lesson content structure
    lesson_order INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 30,
    video_url TEXT,
    audio_url TEXT,
    transcript TEXT,
    vocabulary JSONB DEFAULT '[]', -- array of words with definitions
    grammar_points JSONB DEFAULT '[]',
    exercises JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. E-books 테이블
CREATE TABLE ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_size BIGINT,
    difficulty difficulty_level,
    cefr_level cefr_level,
    word_count INTEGER,
    estimated_reading_time INTEGER, -- minutes
    genres TEXT[],
    language VARCHAR(10) DEFAULT 'en',
    isbn VARCHAR(20),
    publication_date DATE,
    has_audio BOOLEAN DEFAULT false,
    audio_url TEXT,
    chapters JSONB DEFAULT '[]',
    vocabulary JSONB DEFAULT '[]',
    comprehension_questions JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Progress 테이블
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_lesson_id UUID REFERENCES lessons(id),
    time_spent INTEGER DEFAULT 0, -- minutes
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 6. Lesson Progress 테이블
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0, -- minutes
    answers JSONB DEFAULT '{}', -- user's answers to exercises
    score DECIMAL(5,2),
    attempts INTEGER DEFAULT 0,
    first_attempt_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. E-book Reading Progress 테이블
CREATE TABLE ebook_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    reading_time INTEGER DEFAULT 0, -- minutes spent reading
    bookmarks JSONB DEFAULT '[]', -- array of bookmarked positions
    notes JSONB DEFAULT '[]', -- user's notes
    vocabulary_saved JSONB DEFAULT '[]', -- words user saved
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ebook_id)
);

-- 8. Tests 테이블
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type test_type NOT NULL,
    difficulty difficulty_level,
    cefr_level cefr_level,
    questions JSONB NOT NULL, -- array of questions
    time_limit INTEGER, -- minutes
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    instructions TEXT,
    course_id UUID REFERENCES courses(id), -- null for standalone tests
    lesson_id UUID REFERENCES lessons(id), -- null for course-wide tests
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Test Results 테이블
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- user's answers
    score DECIMAL(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent INTEGER, -- seconds
    is_passed BOOLEAN,
    cefr_result cefr_level, -- for level tests
    detailed_results JSONB, -- breakdown by categories
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Achievements 테이블
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- emoji or icon identifier
    rarity achievement_rarity DEFAULT 'common',
    criteria JSONB NOT NULL, -- conditions to unlock
    points INTEGER DEFAULT 0, -- experience points awarded
    badge_url TEXT, -- optional custom badge image
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. User Achievements 테이블
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 12. Study Sessions 테이블
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- minutes
    lessons_completed INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    session_type VARCHAR(50), -- 'lesson', 'reading', 'test', etc.
    metadata JSONB DEFAULT '{}' -- additional session data
);

-- 13. Vocabulary 테이블
CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    pronunciation VARCHAR(255),
    part_of_speech VARCHAR(50),
    difficulty difficulty_level,
    cefr_level cefr_level,
    example_sentences TEXT[],
    synonyms TEXT[],
    antonyms TEXT[],
    audio_url TEXT, -- pronunciation audio
    image_url TEXT,
    frequency_rank INTEGER, -- how common the word is
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(word)
);

-- 14. User Vocabulary 테이블 (개인 단어장)
CREATE TABLE user_vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0, -- 0-5 scale
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE, -- spaced repetition
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    learned_from VARCHAR(255), -- source: lesson, ebook, etc.
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vocabulary_id)
);

-- 15. Friends/Social 테이블
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (requester_id != addressee_id),
    UNIQUE(requester_id, addressee_id)
);

-- 16. Notifications 테이블
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- achievement, reminder, social, etc.
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. File Uploads 테이블 (메타데이터)
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    upload_type VARCHAR(50), -- 'ebook', 'audio', 'image', etc.
    metadata JSONB DEFAULT '{}',
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_cefr_level ON courses(cefr_level);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, lesson_order);
CREATE INDEX idx_ebooks_difficulty ON ebooks(difficulty);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON ebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebook_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Progress data policies
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can update their own progress" ON user_progress FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view their own lesson progress" ON lesson_progress FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can update their own lesson progress" ON lesson_progress FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Test results policies
CREATE POLICY "Users can view their own test results" ON test_results FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can create their own test results" ON test_results FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, rarity, criteria, points) VALUES
('First Steps', '첫 번째 레슨을 완료했습니다', '🎯', 'common', '{"lessons_completed": 1}', 10),
('Week Warrior', '7일 연속 학습을 완료했습니다', '🔥', 'rare', '{"streak_days": 7}', 50),
('Bookworm', '첫 번째 e-book을 완료했습니다', '📚', 'common', '{"ebooks_completed": 1}', 20),
('Scholar', '10개의 레슨을 완료했습니다', '🎓', 'rare', '{"lessons_completed": 10}', 100),
('Vocabulary Master', '100개의 단어를 학습했습니다', '📖', 'epic', '{"vocabulary_learned": 100}', 200),
('Perfect Score', '테스트에서 100점을 받았습니다', '💯', 'legendary', '{"perfect_test_score": 1}', 500);

-- Insert some initial vocabulary (sample)
INSERT INTO vocabulary (word, definition, pronunciation, part_of_speech, difficulty, cefr_level, example_sentences) VALUES
('hello', 'A greeting used when meeting someone', '/həˈloʊ/', 'interjection', 'beginner', 'A1', ARRAY['Hello, how are you?', 'She said hello to everyone.']),
('beautiful', 'Pleasing the senses or mind aesthetically', '/ˈbjuːtɪfəl/', 'adjective', 'beginner', 'A2', ARRAY['The sunset is beautiful.', 'She has beautiful eyes.']),
('important', 'Of great significance or value', '/ɪmˈpɔːrtənt/', 'adjective', 'intermediate', 'B1', ARRAY['This is an important decision.', 'Education is very important.']);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    last_session DATE;
    today DATE := CURRENT_DATE;
BEGIN
    -- Get the last study session date
    SELECT DATE(MAX(started_at)) INTO last_session
    FROM study_sessions
    WHERE user_id = user_uuid;

    IF last_session IS NULL THEN
        -- First session ever
        UPDATE users SET current_streak = 1, last_active = NOW() WHERE id = user_uuid;
    ELSIF last_session = today THEN
        -- Already studied today, don't change streak
        UPDATE users SET last_active = NOW() WHERE id = user_uuid;
    ELSIF last_session = today - INTERVAL '1 day' THEN
        -- Studied yesterday, increment streak
        UPDATE users
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_active = NOW()
        WHERE id = user_uuid;
    ELSE
        -- Streak broken, reset to 1
        UPDATE users SET current_streak = 1, last_active = NOW() WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;