# STUDENT-SIDE BACKEND PLAN

## Responsibilities
Registration, login, lookup data for the form, feedback submission, personal history,
detail view with replies, personal summary counts.

## Endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | create student account |
| POST | /api/auth/login | public | login with `role: "student"` |
| POST | /api/auth/logout | any | clear cookie |
| GET | /api/auth/me | any | current user |
| GET | /api/departments | public | active departments |
| GET | /api/subjects?department= | student | subjects (with faculty) |
| GET | /api/faculty?department= | student | faculty list |
| GET | /api/settings | student | feedback window + tags |
| POST | /api/feedback | student | submit feedback |
| GET | /api/feedback/mine | student | paginated history + filters |
| GET | /api/feedback/mine/summary | student | counts by status |
| GET | /api/feedback/mine/:id | student | one feedback with replies |
| PATCH | /api/feedback/mine/:id | student | (bonus) edit while pending |
| DELETE | /api/feedback/mine/:id | student | (bonus) delete while pending |

## Request Bodies

POST /auth/register
{ name, email, rollNo, department, password }

POST /auth/login
{ email, password, role: "student" | "admin" }

POST /feedback
{ category, type, department, subject?, faculty?, rating?, tags?[], comment, isAnonymous }

## Validation Rules (Zod)
- name 2–60 chars, email valid, password min 8 chars with letter + number
- rollNo unique, required for students
- category in [teaching, classroom, laboratory, other]
- type in [appreciation, complaint, suggestion]
- category = teaching → subject, faculty, rating (1–5) required
- comment 10–1000 chars
- tags max 5, must exist in the settings tag list

## Business Rules
1. Feedback only accepted while the feedback window is open.
2. Subject must belong to the chosen department; faculty must teach the subject.
3. One teaching feedback per student + faculty + subject + cycle (unique partial index).
4. Student identity is always stored, but hidden from admin when `isAnonymous`.
5. Students can read only their own feedback (`student: req.user._id` in every query).
6. Deactivated students cannot log in and existing tokens stop working
   (checked in `protect` middleware).
7. Admin replies show as "Administrator", never the admin's name.

## Middleware Chain
`rateLimit → protect → authorize("student") → validate(schema) → controller`

## Response Shape
Success: `{ success: true, data, meta? }`  
Error: `{ success: false, message, errors? }`

## Error Codes
400 validation · 401 not logged in · 403 wrong role / window closed ·
404 not found · 409 duplicate · 429 too many requests · 500 server

## Test Checklist
- Register duplicate email/rollNo → 409
- Student token on /admin routes → 403
- Submit with closed window → 403
- Submit teaching without rating → 400
- Submit duplicate teaching feedback → 409
- Read another student's feedback id → 404