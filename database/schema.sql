-- SmartAssign LMS Database Schema
-- PostgreSQL

BEGIN;

-- Drop existing types if they exist
DO $$ BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
    DROP TYPE IF EXISTS assignment_type CASCADE;
    DROP TYPE IF EXISTS submission_status CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'administrator');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE assignment_type AS ENUM ('homework', 'classwork', 'project', 'quiz', 'other');
CREATE TYPE submission_status AS ENUM ('not_submitted', 'submitted', 'under_review', 'graded', 'returned_for_revision', 'rejected');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    status user_status NOT NULL DEFAULT 'active',
    phone_number VARCHAR(50),
    profile_picture VARCHAR(500),

    -- Student fields
    roll_number VARCHAR(50),
    registration_number VARCHAR(50),
    class_id INTEGER,
    section_id INTEGER,

    -- Teacher fields
    employee_id VARCHAR(50),
    department VARCHAR(255),

    -- Admin fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sections table
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Assignments table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type assignment_type NOT NULL DEFAULT 'homework',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks NUMERIC(10,2) NOT NULL DEFAULT 100,
    allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'docx', 'zip'],
    max_attempts INTEGER DEFAULT 3,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Assignment targets (classes or individual students)
CREATE TABLE assignment_targets (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('class', 'student')),
    target_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignment attachment files
CREATE TABLE assignment_attachments (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    status submission_status NOT NULL DEFAULT 'submitted',
    version INTEGER NOT NULL DEFAULT 1,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, student_id, version)
);

-- Submission files
CREATE TABLE submission_files (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submission reviews (grading)
CREATE TABLE submission_reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id),
    marks NUMERIC(10,2),
    grade VARCHAR(5),
    feedback TEXT,
    review_notes TEXT,
    status submission_status NOT NULL DEFAULT 'under_review',
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id INTEGER,
    before_value JSONB,
    after_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity log
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_class_id ON users(class_id);
CREATE INDEX idx_users_section_id ON users(section_id);
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_type ON assignments(assignment_type);
CREATE INDEX idx_assignment_targets_assignment_id ON assignment_targets(assignment_id);
CREATE INDEX idx_assignment_targets_target ON assignment_targets(target_type, target_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX idx_submission_reviews_submission_id ON submission_reviews(submission_id);
CREATE INDEX idx_system_logs_actor_id ON system_logs(actor_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
    ('max_file_size', '5242880', 'Maximum upload file size in bytes'),
    ('allowed_file_types', 'pdf,docx,zip', 'Comma-separated list of allowed file extensions'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes'),
    ('max_login_attempts', '5', 'Maximum failed login attempts before lockout'),
    ('audit_log_retention_days', '180', 'Number of days to retain audit logs'),
    ('default_page_size', '20', 'Default pagination page size'),
    ('institution_name', 'SmartAssign Institution', 'Name of the institution'),
    ('grade_scale', '{"A+": [90, 100], "A": [80, 89], "B": [70, 79], "C": [60, 69], "F": [0, 59]}', 'Grade scale mapping');

COMMIT;
