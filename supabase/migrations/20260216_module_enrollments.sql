-- Module enrollments table for per-module purchases
CREATE TABLE module_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    module_id INTEGER NOT NULL,
    module_title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_type payment_type NOT NULL DEFAULT 'one_time',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Indexes
CREATE INDEX idx_module_enrollments_user ON module_enrollments(user_id);
CREATE INDEX idx_module_enrollments_course ON module_enrollments(course_id);
CREATE INDEX idx_module_enrollments_module ON module_enrollments(user_id, course_id, module_id);

-- Enable RLS
ALTER TABLE module_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own module enrollments"
    ON module_enrollments FOR SELECT
    USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own module enrollments"
    ON module_enrollments FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
