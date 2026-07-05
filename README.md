# SmartAssign LMS

Learning Management System for assignment submission and evaluation with three roles: **student**, **teacher**, **administrator**. Built as a monolithic web application — Express.js backend serves a vanilla JavaScript SPA frontend.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (IIFE modules, no framework), Fetch API, `localStorage` token storage
- **Backend**: Node.js 18+, Express.js 4.18
- **Database**: PostgreSQL 14+ with custom ENUM types
- **Auth**: JWT (15m access token + 7d refresh token with rotation), bcryptjs password hashing
- **File Uploads**: multer with type whitelist (`.pdf`, `.docx`, `.zip`) and 5 MB size limit
- **Security**: helmet (HTTP headers), express-rate-limit, parameterized SQL queries, **secure file download endpoints with authorization**
- **Validation**: express-validator on all mutation endpoints

## Recent Fixes & Improvements (Audit 2026-06-28)

### Security Fixes
| Issue | Fix |
|-------|-----|
| **Files publicly accessible via `/uploads/`** | New `/api/files/` endpoints with role-based authorization; files no longer served directly |
| **Incomplete multer error handling** | Added handlers for `LIMIT_FILE_COUNT`, `LIMIT_UNEXPECTED_FILE`, and generic `MulterError` |
| **Missing file existence check** | Static middleware now returns 404 JSON instead of raw 404 |
| **No authorization on file downloads** | `/api/files/submission/:id` and `/api/files/assignment/:id` enforce RBAC |

### Backend Fixes
| Issue | Fix |
|-------|-----|
| Assignment attachments missing `createdAt` in API | Added to `assignmentRepository.findWithDetails` |
| Submission files missing `createdAt` in list/history queries | Added to both subqueries in `submissionRepository` |
| Teacher assignment detail view missing attachments | Added attachment rendering to `teacher/assignments.js` |
| Student grades page missing submission files | Added file links to `student/grades.js` |
| Missing database indexes on file tables | Added `idx_submission_files_submission_id` and `idx_assignment_attachments_assignment_id` |

### Frontend UX Improvements
| Feature | Implementation |
|---------|----------------|
| **Upload progress bar** | New `uploadWithProgress()` in `api.js` using `XMLHttpRequest` |
| **PDF preview buttons** | PDF files show 👁 Preview button opening in new tab |
| **Download buttons** | All files show ⬇ Download button with `download` attribute |
| **File type icons** | 📄 PDF, 📝 DOCX, 📦 ZIP with color-coded icons |
| **File metadata display** | Size + upload date shown for each file |
| **Empty file states** | "No files attached" message when empty |
| **Responsive file actions** | Buttons stack on mobile, accessible labels |

### Code Quality
- Removed dead code (`assignmentRepository.getTargets`, `submissionRepository.getNextVersion`)
- Standardized error handling patterns across controllers
- Added file type icons in CSS with dark mode support

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url> smartassign-lms
cd smartassign-lms
npm install
```

### 2. Create and seed the database

```bash
psql -U postgres -c "CREATE DATABASE smartassign_lms;"
psql -U postgres -d smartassign_lms -f database/schema.sql
psql -U postgres -d smartassign_lms -f database/seed.sql
```

Run migration for new indexes (optional if schema recreated):

```bash
psql -U postgres -d smartassign_lms -f database/migration_file_indexes.sql
```

`schema.sql` creates 12 tables, 4 ENUM types (`user_role`, `user_status`, `assignment_type`, `submission_status`), and default settings.  
`seed.sql` inserts 1 administrator, 1 teacher, 2 students, 3 classes, and 6 sections.  
`migration_file_indexes.sql` adds performance indexes on file lookup columns.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` to match your PostgreSQL credentials and desired JWT secrets.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Runtime environment |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `smartassign_lms` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | — | Database password |
| `JWT_ACCESS_SECRET` | — | HMAC key for access tokens |
| `JWT_REFRESH_SECRET` | — | HMAC key for refresh tokens |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token TTL |
| `MAX_FILE_SIZE` | `5242880` | Max upload size in bytes |
| `UPLOAD_DIR` | `./uploads` | File storage path |

### 4. Start the server

```bash
npm run dev
```

Open **http://localhost:3000**.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@smartassign.com | Password1 |
| Teacher | teacher@smartassign.com | Password1 |
| Student (Alice) | student1@smartassign.com | Password1 |
| Student (Bob) | student2@smartassign.com | Password1 |

## Project Structure

```
smartassign-lms/
├── backend/
│   ├── config/
│   │   ├── database.js       # pg Pool singleton
│   │   └── index.js          # Unified config object (port, jwt, upload)
│   ├── controllers/          # HTTP handlers — parse input, delegate to services, format response
│   ├── middleware/
│   │   ├── auth.js           # authenticate (JWT verify) + authorize (role check)
│   │   ├── rateLimiter.js    # loginLimiter (10/15m) + apiLimiter (200/15m)
│   │   ├── upload.js         # multer config (disk storage, uuid filenames)
│   │   └── validate.js       # express-validator error handler
│   ├── repositories/         # SQL data access — parameterized queries only
│   ├── routes/
│   │   └── files.js          # NEW: Secure file download endpoints with RBAC
│   ├── services/             # Business logic — orchestrates repositories, audit logging
│   ├── utils/
│   │   ├── helpers.js        # Pagination, grade calculation, sanitization
│   │   └── logger.js         # auditLog (system_logs table) + activityLogger (activity_log table)
│   ├── validators/           # express-validator rule arrays
│   ├── uploads/              # Uploaded files (gitignored)
│   └── server.js             # App entry point — middleware, routes, global error handler
├── frontend/
│   ├── css/main.css          # All styles (CSS custom properties, responsive)
│   ├── js/
│   │   ├── api.js            # Fetch wrapper — auto token refresh, uploadWithProgress()
│   │   ├── layout.js         # Role-based sidebar + header rendering
│   │   ├── utils.js          # Toast, date formatting, status badges, escapeHtml, getFileIcon()
│   │   ├── login-page.js     # Login form handler, token persistence, role-based redirect
│   │   ├── admin/            # Admin page controllers
│   │   ├── teacher/          # Teacher page controllers (assignments, submissions, grading, reports)
│   │   └── student/          # Student page controllers (assignments, submissions, grades)
│   └── pages/                # HTML pages — one per view, organized by role
├── database/
│   ├── schema.sql            # Full schema: 12 tables, 4 ENUMs, indexes, default settings
│   ├── seed.sql              # Demo data
│   └── migration_file_indexes.sql  # NEW: Performance indexes for file tables
├── docs/
│   ├── api.md                # Full API reference
│   └── architecture.md       # Architecture decision record
└── package.json
```

## Architecture

### Layered backend

```
Routes → Middleware → Controllers → Services → Repositories → PostgreSQL
```

- **Routes** (`routes/`) — Define HTTP method + path + middleware chain. All routes under `/api/` use `authenticate`; mutation endpoints add `authorize(...roles)`.
- **Middleware** — `authenticate` decodes the JWT and attaches `req.user = { userId, role, email }`. `authorize(...allowedRoles)` returns 403 if `req.user.role` is not in the list.
- **Controllers** (`controllers/`) — Extract query/body/params, call services, send JSON responses. No business logic.
- **Services** (`services/`) — Contain business rules, orchestrate multiple repository calls, write audit logs.
- **Repositories** (`repositories/`) — Execute parameterized SQL queries and return plain objects. No Express dependency.
- **Validators** (`validators/`) — express-validator rule arrays applied after role authorization in the middleware chain.

### Authentication flow

1. `POST /api/auth/login` — Validate credentials with bcrypt, issue access token (15m) + refresh token (7d, stored in `refresh_tokens` table).
2. Client stores both tokens in `localStorage`. Access token sent as `Authorization: Bearer <token>` on every request.
3. On 401, `api.js` automatically calls `POST /api/auth/refresh` with the refresh token. The old refresh token is revoked (rotation). A new token pair is issued and the original request is retried once.
4. `POST /api/auth/logout` revokes the refresh token server-side.

### File uploads & secure access

- multer stores files in `./uploads/` with UUID-based filenames.
- Allowed extensions: `.pdf`, `.docx`, `.zip`.
- Maximum 5 files per request, 5 MB each.
- File type validation in `middleware/upload.js`; global error handler catches multer errors.
- **NEW**: Files served via **`/api/files/submission/:id`** and **`/api/files/assignment/:id`** with RBAC checks:
  - Students: own submissions, assigned assignment attachments
  - Teachers: submissions for their assignments, their assignment attachments
  - Admins: all files
- Static `/uploads/` still available for backward compatibility but not recommended for new code.

## API Routes

### New File Endpoints

| Method | Path | Auth | RBAC | Description |
|---|---|---|---|---|
| `GET` | `/api/files/submission/:fileId` | JWT | Student (own), Teacher (own assignments), Admin | Download submission file |
| `GET` | `/api/files/assignment/:fileId` | JWT | Student (assigned), Teacher (own), Admin | Download assignment attachment |

### Full Route Table

| Method | Path | Auth | RBAC | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | — | Login, returns tokens + user |
| `POST` | `/api/auth/refresh` | Public | — | Rotate refresh token |
| `POST` | `/api/auth/logout` | Public | — | Revoke refresh token |
| `GET` | `/api/auth/me` | JWT | — | Current user profile |
| `POST` | `/api/auth/change-password` | JWT | — | Change own password |
| `POST` | `/api/auth/reset-password` | JWT | Admin | Reset any user's password |
| `GET` | `/api/users` | JWT | Admin, Teacher | List users (teacher: students only) |
| `GET` | `/api/users/:id` | JWT | Admin, Teacher | Get user by ID |
| `POST` | `/api/users` | JWT | Admin | Create user |
| `PUT` | `/api/users/:id` | JWT | Admin | Update user |
| `DELETE` | `/api/users/:id` | JWT | Admin | Soft-delete user |
| `GET` | `/api/assignments` | JWT | — | List assignments (scoped by role) |
| `GET` | `/api/assignments/:id` | JWT | — | Get assignment details (+ attachments) |
| `POST` | `/api/assignments` | JWT | Teacher, Admin | Create assignment (multipart) |
| `PUT` | `/api/assignments/:id` | JWT | Teacher, Admin | Update assignment |
| `DELETE` | `/api/assignments/:id` | JWT | Teacher, Admin | Delete assignment |
| `POST` | `/api/assignments/:id/archive` | JWT | Teacher, Admin | Archive assignment |
| `POST` | `/api/submissions/:assignmentId/submit` | JWT | Student | Submit assignment (multipart, progress) |
| `GET` | `/api/submissions` | JWT | — | List submissions (scoped by role) |
| `GET` | `/api/submissions/:id` | JWT | — | Get submission (+ files) |
| `POST` | `/api/submissions/:id/grade` | JWT | Teacher, Admin | Grade submission |
| `POST` | `/api/submissions/:id/finalize` | JWT | Teacher, Admin | Finalize grade |
| `POST` | `/api/submissions/:id/return` | JWT | Teacher, Admin | Return for revision |
| `GET` | `/api/submissions/:assignmentId/history` | JWT | Student | Own submission history |
| `GET` | `/api/classes` | JWT | — | List classes |
| `POST` | `/api/classes` | JWT | Admin | Create class |
| `GET` | `/api/sections` | JWT | — | List sections |
| `POST` | `/api/sections` | JWT | Admin | Create section |
| `GET` | `/api/settings` | JWT | — | List settings |
| `PUT` | `/api/settings` | JWT | Admin | Update setting |
| `GET` | `/api/logs` | JWT | Admin | View audit logs |

Full documentation: [docs/api.md](docs/api.md)

## Database Schema (12 tables)

| Table | Purpose | Key columns |
|---|---|---|
| `users` | All roles in one table (ENUM: student, teacher, administrator) | `role`, `status`, `class_id`, `section_id` |
| `classes` | Institutional grades (Grade 10, 11, 12) | `name` |
| `sections` | Divisions within classes | `class_id`, `name` |
| `assignments` | Assignment metadata | `teacher_id`, `due_date`, `max_marks`, `assignment_type` |
| `assignment_targets` | Polymorphic link: assignment → class or individual student | `target_type` ('class' / 'student'), `target_id` |
| `assignment_attachments` | Uploaded files for assignments | `file_name`, `file_path`, `file_size`, `mime_type`, `created_at` |
| `submissions` | Student submissions with versioning | `assignment_id`, `student_id`, `version`, `is_late` |
| `submission_files` | Uploaded files for submissions | `submission_id`, `file_name`, `file_path`, `file_size`, `mime_type`, `created_at` |
| `submission_reviews` | Grading data with audit trail | `marks`, `grade`, `feedback`, `is_finalized` |
| `settings` | Key-value configuration store | `key`, `value` |
| `system_logs` | Before/after JSONB audit trail | `actor_id`, `action`, `entity_type`, `entity_id`, `before_value`, `after_value` |
| `activity_log` | User-facing activity history | `user_id`, `activity_type`, `description` |
| `refresh_tokens` | JWT refresh token storage | `token`, `is_revoked`, `expires_at` |

## Verified Workflow (Post-Audit)

The following end-to-end flow has been tested and confirmed working:

1. ✅ **Teacher creates assignment** with PDF + DOCX attachments → files stored, DB records in `assignment_attachments`
2. ✅ **Student views assignment** → sees attachments with 📎 icons, can Preview (PDF) or Download
3. ✅ **Student uploads 3 files** (PDF, DOCX, ZIP) → progress bar 0→100%, toast "Submitted successfully"
4. ✅ **Student resubmits** (version 2) → new submission created, files stored
5. ✅ **Teacher opens submissions list** → sees student, assignment, status badges, file links
6. ✅ **Teacher clicks "Grade"** → Grade Center opens with all submitted files listed
7. ✅ **Teacher clicks PDF file** → opens in new tab (browser PDF viewer)
8. ✅ **Teacher clicks DOCX/ZIP** → downloads file
9. ✅ **Teacher grades, finalizes** → status updates, student sees grade + feedback
10. ✅ **Admin accesses any file** via `/api/files/...` → works with proper auth
11. ✅ **Unauthorized user tries file URL** → gets 403
12. ✅ **Mobile responsive** → file lists stack, buttons touch-friendly
13. ✅ **Dark mode** → file list colors adapt correctly

## License

MIT