-- Complete RLS Policies Setup for Learning Platform

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert profiles" 
    ON profiles FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- COURSES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON courses;

CREATE POLICY "Published courses are viewable by everyone" 
    ON courses FOR SELECT 
    USING (status = 'published' OR instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can create courses" 
    ON courses FOR INSERT 
    WITH CHECK (instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'instructor'
    ));

CREATE POLICY "Instructors can update their courses" 
    ON courses FOR UPDATE 
    USING (instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can delete their courses" 
    ON courses FOR DELETE 
    USING (instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- LESSONS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Lessons viewable if enrolled or is instructor" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage lesson lessons" ON lessons;

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

CREATE POLICY "Instructors can manage their lessons" 
    ON lessons FOR ALL 
    USING (course_id IN (
        SELECT id FROM courses WHERE instructor_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ));

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view enrollments in their courses" ON enrollments;

CREATE POLICY "Users can view own enrollments" 
    ON enrollments FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create own enrollments" 
    ON enrollments FOR INSERT 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can view enrollments in their courses" 
    ON enrollments FOR SELECT 
    USING (course_id IN (
        SELECT id FROM courses WHERE instructor_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ));

-- ============================================
-- PROGRESS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own progress" ON progress;
DROP POLICY IF EXISTS "Users can update own progress" ON progress;

CREATE POLICY "Users can view own progress" 
    ON progress FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update own progress" 
    ON progress FOR INSERT, UPDATE 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- TOOLS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Published tools are viewable by everyone" ON tools;
DROP POLICY IF EXISTS "Instructors can manage tools" ON tools;

CREATE POLICY "Published tools are viewable by everyone" 
    ON tools FOR SELECT 
    USING (is_published = true OR created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can create tools" 
    ON tools FOR INSERT 
    WITH CHECK (created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'instructor'
    ));

CREATE POLICY "Creators can manage their tools" 
    ON tools FOR UPDATE, DELETE 
    USING (created_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- FORUM TABLES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Forum threads in published courses are viewable" ON forum_threads;
DROP POLICY IF EXISTS "Enrolled users can create threads" ON forum_threads;
DROP POLICY IF EXISTS "Users can view forum replies" ON forum_replies;
DROP POLICY IF EXISTS "Enrolled users can reply" ON forum_replies;

CREATE POLICY "Forum threads in published courses are viewable" 
    ON forum_threads FOR SELECT 
    USING (true);

CREATE POLICY "Enrolled users can create threads" 
    ON forum_threads FOR INSERT 
    WITH CHECK (author_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view forum replies" 
    ON forum_replies FOR SELECT 
    USING (true);

CREATE POLICY "Users can create replies" 
    ON forum_replies FOR INSERT 
    WITH CHECK (author_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- QUIZ POLICIES
-- ============================================
DROP POLICY IF EXISTS "Quizzes visible to enrolled users" ON quizzes;
DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can create quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;

CREATE POLICY "Quizzes visible to enrolled users" 
    ON quizzes FOR SELECT 
    USING (lesson_id IN (
        SELECT id FROM lessons WHERE course_id IN (
            SELECT course_id FROM enrollments WHERE user_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    ));

CREATE POLICY "Users can view quiz questions" 
    ON quiz_questions FOR SELECT 
    USING (true);

CREATE POLICY "Users can create quiz attempts" 
    ON quiz_attempts FOR INSERT 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view own attempts" 
    ON quiz_attempts FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions" 
    ON subscriptions FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create subscriptions" 
    ON subscriptions FOR INSERT 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;

CREATE POLICY "Users can view own payments" 
    ON payments FOR SELECT 
    USING (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create payments" 
    ON payments FOR INSERT 
    WITH CHECK (user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- CONSULTATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can create consultations" ON consultations;
DROP POLICY IF EXISTS "Instructors can view consultations for them" ON consultations;

CREATE POLICY "Users can view own consultations" 
    ON consultations FOR SELECT 
    USING (student_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Instructors can view their consultations" 
    ON consultations FOR SELECT 
    USING (instructor_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Students can create consultations" 
    ON consultations FOR INSERT 
    WITH CHECK (student_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));

-- ============================================
-- CHAT MESSAGES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view messages in their consultations" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;

CREATE POLICY "Users can view messages in their consultations" 
    ON chat_messages FOR SELECT 
    USING (consultation_id IN (
        SELECT id FROM consultations WHERE student_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR instructor_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can send messages" 
    ON chat_messages FOR INSERT 
    WITH CHECK (sender_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
    ));
