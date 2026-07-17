# SmartAssign LMS

Learning Management System for assignment submission and evaluation with three roles: **student**, **teacher**, **administrator**. Express.js backend serves a React SPA frontend.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, Zustand, TanStack Query, TanStack Table, React Router 6, Recharts, date-fns, Lucide icons
- **Backend**: Node.js 18+, Express.js 4.18
- **Database**: PostgreSQL 14+ with custom ENUM types
- **Auth**: JWT (15m access token + 7d refresh token with rotation), bcryptjs password hashing
- **File Uploads**: multer with type whitelist (`.pdf`, `.docx`, `.zip`) and 5 MB size limit
- **Security**: helmet (HTTP headers), express-rate-limit, parameterized SQL queries, file download authorization
- **Validation**: express-validator on all mutation endpoints

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
cd frontend && npm install && cd ..
```

### 2. Create and seed the database

```bash
psql -U postgres -c "CREATE DATABASE smartassign_lms;"
psql -U postgres -d smartassign_lms -f database/schema.sql
psql -U postgres -d smartassign_lms -f database/seed.sql
```

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

Terminal 1 — backend:
```bash
npm run dev
```

Terminal 2 — frontend (dev mode with HMR):
```bash
cd frontend && npm run dev
```

For production, build the frontend first then start only the backend:
```bash
cd frontend && npm run build && cd ..
npm run dev
```

Open **http://localhost:3000** (production) or **http://localhost:5173** (dev with HMR).

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
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic — orchestrates repositories, audit logging
│   ├── utils/
│   │   ├── helpers.js        # Pagination, grade calculation, sanitization
│   │   └── logger.js         # auditLog (system_logs table) + activityLogger (activity_log table)
│   ├── validators/           # express-validator rule arrays
│   ├── uploads/              # Uploaded files (gitignored)
│   └── server.js             # App entry point — middleware, routes, global error handler, serves frontend/dist
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js     # Fetch wrapper — JWT auto-refresh, base URL config
│   │   ├── components/
│   │   │   ├── layout/       # AppLayout, Sidebar, TopHeader, ProtectedRoute
│   │   │   └── ui/           # 17 shared components (Button, Card, Modal, Table, etc.)
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/        # Dashboard, Users, Assignments, Reports, Settings, Logs, Profile
│   │   │   ├── teacher/      # Dashboard, CreateAssignment, Assignments, Submissions, GradeCenter, GradeSubmission, Reports, Profile
│   │   │   └── student/      # Dashboard, Assignments, AssignmentDetail, Submissions, Grades, Profile
│   │   ├── store/
│   │   │   ├── auth.js       # Zustand — user, tokens, session-check gate
│   │   │   └── ui.js         # Zustand — sidebar, theme, toasts
│   │   ├── styles/
│   │   │   └── tokens.css    # CSS custom properties — Office Hours design tokens
│   │   └── utils/
│   │       ├── helpers.js    # cn(), status maps, grade helpers
│   │       └── format.js     # formatDate, formatFileSize, etc.
│   ├── dist/                 # Production build output (served by Express)
│   ├── eslint.config.js
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/
│   ├── schema.sql            # Full schema: 12 tables, 4 ENUMs, indexes, default settings
│   ├── seed.sql              # Demo data
├── docs/
│   ├── api.md                # Full API reference
│   └── architecture.md      # Architecture decision record
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

### Frontend architecture

```
React Router → ProtectedRoute → Layout (Sidebar + TopHeader) → Page
```

- **Routing**: 28 routes (23 page views + 5 index redirects) across 3 roles, all under `/app/{role}/...`. `RootRedirect` handles first-load role detection. `ProtectedRoute` gates by role and returns `null` during session check to prevent flash-of-login.
- **State**: Zustand stores for `auth` (user, tokens, session state) and `ui` (sidebar, theme, toasts). Both stores persist key state to `localStorage` — `theme` and `sidebarOpen` survive page reload.
- **Sidebar**: Fixed left sidebar with 260px expanded / 64px icon-only collapsed states, animated via CSS transitions (300ms). On mobile (<1024px), the sidebar slides in as an overlay. The toggle state is shared with `AppLayout` via the Zustand store so the main content area reflows correctly (margin transition). Desktop collapse button uses `ChevronLeft`/`ChevronRight` icons; mobile uses a hamburger in the top header. The top "S" logo is clickable and navigates to the user's dashboard. Nav icons are wrapped in a rounded container that reveals an `--accent-subtle` background fill and transitions the icon color to `--accent-light` on hover.
- **UI System**: 17 shared components styled with CSS custom properties (Office Hours palette). Status indicators use a 3px colored left-edge bar on tables and pill badges in detail views. Sidebar navigation uses dedicated CSS variables (`--sidebar-nav-text`, `--sidebar-nav-bg-hover`, etc.) for consistent light/dark theming with four distinguishable states: default, hover (icon accent fill), active (white text + active background), and active+hover.
- **Design Tokens**: Single source of truth in `tokens.css` — ink `#1B2430`, paper `#F6F5F1`, teal `#0E7C66`, brass `#C9922B`. Fonts: Public Sans (UI), JetBrains Mono (monospace).

### Authentication flow

1. `POST /api/auth/login` — Validate credentials with bcrypt, issue access token (15m) + refresh token (7d, stored in `refresh_tokens` table).
2. Client stores both tokens in `localStorage`. Access token sent as `Authorization: Bearer <token>` on every request.
3. On 401, the API client automatically calls `POST /api/auth/refresh` with the refresh token. The old refresh token is revoked (rotation). A new token pair is issued and the original request is retried once.
4. `POST /api/auth/logout` revokes the refresh token server-side.
5. On app mount, a `useEffect` in `main.jsx` calls `GET /api/auth/me` to restore the session. The `isCheckingSession` flag prevents route guards from redirecting before the check completes.

### File uploads & secure access

- multer stores files in `./uploads/` with UUID-based filenames.
- Allowed extensions: `.pdf`, `.docx`, `.zip`.
- Maximum 5 files per request, 5 MB each.
- File type validation in `middleware/upload.js`; global error handler catches multer errors.
- Files served via **static `/uploads/`** directory with Express `express.static`.

## API Routes

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
| `POST` | `/api/submissions/:assignmentId/submit` | JWT | Student | Submit assignment (multipart) |
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
| `PUT` | `/api/settings/bulk` | JWT | Admin | Bulk update settings |
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

## License

MIT
