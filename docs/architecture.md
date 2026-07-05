# SmartAssign LMS - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│  HTML5 + CSS3 + Vanilla JS (ES Modules) + Fetch API    │
│                    localhost:3000                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/Fetch
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)             │
│                    localhost:3000/api                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Routes   │→ │Middleware│→ │ Controllers          │  │
│  └──────────┘  └──────────┘  └──────────┬───────────┘  │
│                                          │              │
│  ┌───────────────────────────────────────▼───────────┐  │
│  │ Services (Business Logic)                        │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ Repositories (Data Access)                       │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │     PostgreSQL         │
              │   smartassign_lms      │
              └────────────────────────┘
```

## Authentication Flow

1. User submits credentials via login form
2. Server validates against database (bcrypt compare)
3. Server issues JWT access token (15 min) + refresh token (7 days)
4. Access token sent as Bearer header for all API requests
5. When access token expires, client calls /auth/refresh
6. Old refresh token is revoked (rotation), new pair issued
7. On logout, refresh token is revoked server-side

## RBAC Implementation

- `authenticate` middleware: verifies JWT and attaches `req.user`
- `authorize(role1, role2, ...)` middleware: checks `req.user.role`
- Applied per-route: `router.get('/', authorize('administrator'), handler)`
- Frontend navigation is role-based but never trusted for permissions

## Module Structure

### Backend Layers
- **Routes**: Define URL paths and HTTP methods
- **Middleware**: Auth, validation, file upload, rate limiting
- **Controllers**: Parse request, call services, format response
- **Services**: Business logic, validation, orchestration
- **Repositories**: Database queries, parameterized SQL
- **Validators**: express-validator rules

### Key Design Decisions
- Soft deletes: `deleted_at` timestamp on all major tables
- Computed assignment status: calculated from `due_date` and `is_archived` (not stored)
- Audit logging: Before/after values stored as JSONB
- File validation: Server-side MIME type + extension check (never trust client)
- Rate limiting: 10 login attempts/15min, 200 API requests/15min

## Database Schema

### Core Tables
- **users**: All roles in one table with role-specific nullable fields
- **classes**: Institutional class/grades
- **sections**: Divisions within classes
- **assignments**: Assignment metadata
- **assignment_targets**: Polymorphic link (class or student)
- **assignment_attachments**: Uploaded files
- **submissions**: Student submissions with version tracking
- **submission_files**: Uploaded submission files
- **submission_reviews**: Grading data with audit trail
- **system_logs**: Complete audit log
- **refresh_tokens**: JWT refresh token storage
- **activity_log**: User-facing activity history
- **settings**: Key-value configuration store

### Indexes
- Foreign key indexes on all relationships
- Performance indexes on email, role, status, dates
- Full-text search via ILIKE on name/title fields

## File Upload Flow

1. Client sends multipart/form-data via Fetch API
2. Multer middleware processes upload, validates file type + size
3. File saved to /uploads with UUID filename
4. File metadata stored in database
5. File path referenced by ID in API responses

## Security Measures
- Helmet for HTTP headers
- Parameterized queries (SQL injection prevention)
- bcrypt password hashing (10 rounds)
- JWT with expiration + refresh rotation
- Rate limiting on sensitive endpoints
- File type whitelist (PDF, DOCX, ZIP only)
- 5MB file size limit
- RBAC on every protected route
- Input validation via express-validator
