-- Certificates table for course completion certificates

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_slug TEXT NOT NULL,
    course_title TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_slug)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their certificates"
    ON certificates FOR SELECT
    USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Insert handled via admin client (service role) only
