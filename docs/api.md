# SmartAssign LMS API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication

### POST /auth/login
Login and receive access + refresh tokens.
```
Request:
{
  "email": "admin@smartassign.com",
  "password": "Password1"
}

Response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "fullName": "System Administrator",
    "email": "admin@smartassign.com",
    "role": "administrator"
  }
}
```

### POST /auth/refresh
Refresh expired access token.
```
Request:
{
  "refreshToken": "eyJ..."
}

Response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/logout
Revoke refresh token.
```
Request:
{
  "refreshToken": "eyJ..."
}

Response:
{ "message": "Logged out successfully" }
```

### GET /auth/me
Get current authenticated user profile.
```
Headers: Authorization: Bearer <accessToken>

Response:
{
  "id": 1,
  "full_name": "System Administrator",
  "email": "admin@smartassign.com",
  "role": "administrator",
  ...
}
```

### POST /auth/change-password
Change own password (authenticated).
```
Request:
{
  "currentPassword": "oldPassword1",
  "password": "newPassword1"
}

Response:
{ "message": "Password changed successfully" }
```

### POST /auth/reset-password
Admin resets another user's password.
```
Headers: Authorization: Bearer <adminToken>
Request:
{
  "userId": 3,
  "password": "NewPassword1"
}

Response:
{ "message": "Password reset successfully" }
```

---

## Users

All endpoints require authentication.

### GET /api/users
List users (admin only).
```
Query params: ?role=student&status=active&search=alice&page=1&limit=20

Response:
{
  "users": [...],
  "pagination": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

### GET /api/users/:id
Get user by ID (admin/teacher).

### POST /api/users
Create user (admin only).
```
Request:
{
  "fullName": "New Student",
  "email": "new@test.com",
  "role": "student",
  "rollNumber": "STU003",
  "registrationNumber": "REG003",
  "classId": 1,
  "sectionId": 1
}
```

### PUT /api/users/:id
Update user (admin only).

### DELETE /api/users/:id
Soft delete user (admin only).

### POST /api/users/:id/activate
Activate user (admin only).

### POST /api/users/:id/suspend
Suspend user (admin only).

### GET /api/users/profile
Get own profile.

### PUT /api/users/profile
Update own profile.
```
Request:
{
  "fullName": "Updated Name",
  "phoneNumber": "+1234567890"
}
```

### GET /api/users/counts
Get user counts by role (admin only).

### GET /api/users/activity
Get own activity log.

---

## Assignments

### GET /api/assignments
List assignments. Teachers see their own; students see assigned.
```
Query: ?status=active&type=homework&search=math&classId=1&studentId=3&page=1&limit=10
```

### GET /api/assignments/:id
Get assignment details with targets and attachments.

### POST /api/assignments
Create assignment (teacher/admin).
```
Request (multipart/form-data):
{
  "title": "Math Homework",
  "description": "Chapter 5 exercises",
  "dueDate": "2026-07-01T23:59:59Z",
  "maxMarks": 100,
  "targets": "[{\"targetType\":\"class\",\"targetId\":1},{\"targetType\":\"student\",\"targetId\":3}]",
  "attachments": [File...]
}
```

### PUT /api/assignments/:id
Update assignment.

### DELETE /api/assignments/:id
Delete assignment.

### POST /api/assignments/:id/archive
Archive assignment.

---

## Submissions

### GET /api/submissions
List submissions. Teachers see their students'; students see their own.
```
Query: ?assignmentId=1&studentId=3&status=submitted&search=alice&isLate=true&page=1&limit=10
```

### GET /api/submissions/:id
Get submission with files.

### POST /api/submissions/:assignmentId/submit
Submit assignment (student). Multipart form with 'files' field.

### GET /api/submissions/:assignmentId/history
Get submission history for own assignment (student).

### POST /api/submissions/:id/grade
Grade submission (teacher/admin).
```
Request:
{
  "marks": 85,
  "feedback": "Good work!",
  "reviewNotes": "Internal note",
  "status": "graded"
}
```

### POST /api/submissions/:id/finalize
Finalize grade.

### POST /api/submissions/:id/return
Return for revision.
```
Request:
{
  "feedback": "Please revise section 2"
}
```

---

## Reports

### GET /api/reports/teacher/stats
Teacher dashboard stats.

### GET /api/reports/teacher/performance/:assignmentId
Per-student performance for an assignment.

### GET /api/reports/teacher/missing/:assignmentId
Students who haven't submitted.

### GET /api/reports/admin/stats
Admin system-wide stats.

### GET /api/reports/admin/user-growth
User growth over time (?days=30).

### GET /api/reports/admin/teacher-activity
Teacher activity summary.

---

## Settings

### GET /api/settings
List all settings (authenticated).

### PUT /api/settings
Update a setting (admin).
```
Request:
{
  "key": "max_file_size",
  "value": "10485760"
}
```

### PUT /api/settings/bulk
Update multiple settings (admin).
```
Request:
{
  "settings": [
    { "key": "max_file_size", "value": "10485760" },
    { "key": "allowed_file_types", "value": "pdf,docx,zip" }
  ]
}
```

---

## System Logs

### GET /api/logs
List audit logs (admin only).
```
Query: ?actorId=1&action=user_create&entityType=users&dateFrom=2026-01-01&page=1&limit=20
```

---

## Classes

### GET /api/classes
List all classes.

### POST /api/classes
Create class (admin).

### PUT /api/classes/:id
Update class (admin).

### DELETE /api/classes/:id
Delete class (admin).

---

## Sections

### GET /api/sections
List sections (?classId=1).

### POST /api/sections
Create section (admin).

### PUT /api/sections/:id
Update section (admin).

### DELETE /api/sections/:id
Delete section (admin).

---

## Error Response Format
```json
{
  "error": "Error message description"
}
```

## Validation Error Format
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```
