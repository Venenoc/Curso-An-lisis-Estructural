-- Add catalog columns to quizzes so they can be linked to the static course catalog
-- instead of requiring DB lessons to be pre-created

ALTER TABLE quizzes ADD COLUMN course_slug TEXT;
ALTER TABLE quizzes ADD COLUMN catalog_lesson_id INTEGER;
ALTER TABLE quizzes ALTER COLUMN lesson_id DROP NOT NULL;

CREATE INDEX idx_quizzes_course_slug ON quizzes(course_slug);
CREATE INDEX idx_quizzes_catalog_lesson ON quizzes(course_slug, catalog_lesson_id);

-- RLS policies for quizzes (read open for authenticated, write via admin client only)
CREATE POLICY "Authenticated users can view quizzes"
    ON quizzes FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- RLS policies for quiz_questions
CREATE POLICY "Authenticated users can view quiz questions"
    ON quiz_questions FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- RLS policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own quiz attempts"
    ON quiz_attempts FOR INSERT
    WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
