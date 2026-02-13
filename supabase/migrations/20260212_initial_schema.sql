-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE payment_type AS ENUM ('one_time', 'subscription');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false');
CREATE TYPE tool_type AS ENUM ('download', 'web');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'annual');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'incomplete');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role user_role DEFAULT 'student' NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subscription_only BOOLEAN DEFAULT FALSE,
    instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status course_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration INTEGER, -- duration in seconds
    "order" INTEGER NOT NULL DEFAULT 0,
    resources_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    payment_type payment_type NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- Progress table
CREATE TABLE progress (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    watched_duration INTEGER DEFAULT 0, -- in seconds
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    plan subscription_plan NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'course', 'subscription', 'consultation', 'tool'
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools table
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type tool_type NOT NULL,
    file_url TEXT,
    thumbnail TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    status consultation_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum threads table
CREATE TABLE forum_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum replies table
CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    passing_score INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    type question_type NOT NULL,
    options JSONB, -- Array of answer options
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_forum_threads_course ON forum_threads(course_id);
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_chat_messages_consultation ON chat_messages(consultation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Published courses are viewable by everyone" 
    ON courses FOR SELECT 
    USING (status = 'published' OR instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can manage their courses" 
    ON courses FOR ALL 
    USING (instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS Policies for lessons
CREATE POLICY "Lessons viewable if enrolled or is instructor" 
    ON lessons FOR SELECT 
    USING (
        course_id IN (
            SELECT course_id FROM enrollments WHERE user_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        ) OR course_id IN (
            SELECT id FROM courses WHERE instructor_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Instructors can manage lessons of their courses" 
    ON lessons FOR ALL 
    USING (
        course_id IN (
            SELECT id FROM courses WHERE instructor_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their enrollments" 
    ON enrollments FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can enroll themselves" 
    ON enrollments FOR INSERT 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS Policies for progress
CREATE POLICY "Users can view and update their progress" 
    ON progress FOR ALL 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their subscriptions" 
    ON subscriptions FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS Policies for payments
CREATE POLICY "Users can view their payments" 
    ON payments FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS Policies for forum_threads
CREATE POLICY "Enrolled users can view forum threads" 
    ON forum_threads FOR SELECT 
    USING (
        course_id IN (
            SELECT course_id FROM enrollments WHERE user_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Enrolled users can create forum threads" 
    ON forum_threads FOR INSERT 
    WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND course_id IN (
            SELECT course_id FROM enrollments WHERE user_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for forum_replies
CREATE POLICY "Users can view replies in accessible threads" 
    ON forum_replies FOR SELECT 
    USING (
        thread_id IN (
            SELECT id FROM forum_threads WHERE course_id IN (
                SELECT course_id FROM enrollments WHERE user_id IN (
                    SELECT id FROM profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can reply to accessible threads" 
    ON forum_replies FOR INSERT 
    WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- RLS Policies for chat_messages
CREATE POLICY "Participants can view consultation messages" 
    ON chat_messages FOR SELECT 
    USING (
        consultation_id IN (
            SELECT id FROM consultations 
            WHERE instructor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Participants can send messages" 
    ON chat_messages FOR INSERT 
    WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
