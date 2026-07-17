-- SmartAssign LMS Seed Data
BEGIN;

-- Clear existing data
TRUNCATE TABLE activity_log, system_logs, refresh_tokens, submission_reviews, submission_files, submissions, assignment_attachments, assignment_targets, assignments, sections, classes, users RESTART IDENTITY CASCADE;

-- Classes
INSERT INTO classes (id, name, description) VALUES
    (1, 'Grade 10', 'Grade 10 - Secondary Education'),
    (2, 'Grade 11', 'Grade 11 - Higher Secondary Education'),
    (3, 'Grade 12', 'Grade 12 - Higher Secondary Education');

-- Sections
INSERT INTO sections (id, class_id, name, description) VALUES
    (1, 1, 'Section A', 'Grade 10 - Section A'),
    (2, 1, 'Section B', 'Grade 10 - Section B'),
    (3, 2, 'Science', 'Grade 11 - Science Stream'),
    (4, 2, 'Commerce', 'Grade 11 - Commerce Stream'),
    (5, 3, 'Science', 'Grade 12 - Science Stream'),
    (6, 3, 'Commerce', 'Grade 12 - Commerce Stream');

-- Passwords are hashed with bcrypt
-- Password for all accounts: Password1

-- Admin account
INSERT INTO users (id, full_name, email, password_hash, role, status, employee_id) VALUES
    (1, 'System Administrator', 'admin@smartassign.com', '$2a$10$ntaLGB2MJwzd/QGnjrMEYeJpD1uO1HViK849clgmPbDDdkOdteNwm', 'administrator', 'active', 'ADM001');

-- Teacher account
INSERT INTO users (id, full_name, email, password_hash, role, status, employee_id, department) VALUES
    (2, 'John Teacher', 'teacher@smartassign.com', '$2a$10$ntaLGB2MJwzd/QGnjrMEYeJpD1uO1HViK849clgmPbDDdkOdteNwm', 'teacher', 'active', 'TCH001', 'Science');

-- Student accounts
INSERT INTO users (id, full_name, email, password_hash, role, status, roll_number, registration_number, class_id, section_id, phone_number) VALUES
    (3, 'Alice Student', 'student1@smartassign.com', '$2a$10$ntaLGB2MJwzd/QGnjrMEYeJpD1uO1HViK849clgmPbDDdkOdteNwm', 'student', 'active', 'STU001', 'REG001', 1, 1, '+1234567890'),
    (4, 'Bob Student', 'student2@smartassign.com', '$2a$10$ntaLGB2MJwzd/QGnjrMEYeJpD1uO1HViK849clgmPbDDdkOdteNwm', 'student', 'active', 'STU002', 'REG002', 1, 1, '+1234567891');

COMMIT;
