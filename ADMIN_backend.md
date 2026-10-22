# ADMIN-SIDE BACKEND PLAN

## Responsibilities
Admin auth, master data CRUD, student management, feedback review (filter, reply,
status, priority), analytics aggregation, settings, CSV export.

## Endpoints

### Auth
POST /api/auth/login with `role: "admin"` (admin created by seed script only)

### Master Data (protect + authorize("admin"))
| Method | Route | Purpose |
|---|---|---|
| GET/POST | /api/admin/departments | list / create |
| PUT/DELETE | /api/admin/departments/:id | update / soft-deactivate |
| GET/POST | /api/admin/faculty | list (filter by department) / create |
| PUT/DELETE | /api/admin/faculty/:id | update / deactivate |
| GET/POST | /api/admin/subjects | list / create |
| PUT/DELETE | /api/admin/subjects/:id | update / deactivate |

### Students
| GET | /api/admin/students?search=&department=&page= | list |
| PATCH | /api/admin/students/:id/active | activate / deactivate |

### Feedback
| Method | Route | Purpose |
|---|---|---|
| GET | /api/admin/feedback | list with filters + pagination |
| GET | /api/admin/feedback/:id | detail (anonymity respected) |
| PATCH | /api/admin/feedback/:id/status | pending / in_review / resolved / rejected |
| PATCH | /api/admin/feedback/:id/priority | toggle priority |
| POST | /api/admin/feedback/:id/reply | add reply |
| GET | /api/admin/feedback/export | CSV of filtered results |

Query filters: `department, subject, faculty, type, category, status, priority,
from, to, search, page, limit, sort`

### Stats
| GET | /api/admin/stats/overview | KPI cards + type/status split + monthly trend |
| GET | /api/admin/stats/faculty | per-faculty avg rating, counts |
| GET | /api/admin/stats/subjects | per-subject stats |
| GET | /api/admin/stats/departments | per-department stats |
| GET | /api/admin/stats/top | top 5 complaints / appreciations (faculty + department) |
| GET | /api/admin/stats/concerns | top tags + top comment keywords |

All stats accept `?from=&to=` for date range.

### Settings
GET /api/settings · PUT /api/admin/settings
{ feedbackOpen, startDate, endDate, currentCycle, tags[] }

## Aggregation Plan
| Metric | Pipeline |
|---|---|
| KPI cards | `$match(date) → $facet(totals, byType, byStatus, monthly)` |
| Faculty stats | `$match(faculty exists) → $group(by faculty: avg rating, counts per type) → $lookup faculty → $sort` |
| Department stats | same, grouped by department |
| Top complaints | faculty stats sorted by complaints desc, `$limit 5` |
| Top tags | `$unwind tags → $group → $sort → $limit 10` |
| Keywords | fetch comments, strip stop words in JS, count words |
| Monthly trend | `$group` by `$dateToString` format `%Y-%m` |

Indexes: `{faculty, type}`, `{department, type}`, `{status}`, `{createdAt}`,
text index on `comment`.

## Business Rules
1. Every `/admin/*` route runs `protect → authorize("admin")`.
2. Deleting master data is a **soft delete** (`isActive: false`) so old feedback stays valid.
3. Cannot deactivate a department that still has active faculty/subjects (409).
4. Status change and reply are separate actions. A reply on a Pending item auto-moves it to In Review.
5. When anonymous, API never returns `student` data, even to admin.
6. Settings stored as a single document (singleton).
7. Admin cannot be created or modified through any public route.

## Validation
- Status in allowed list, reply message 2–500 chars
- Settings: endDate > startDate
- Master data: unique name/code per collection, valid ObjectId refs

## Export (CSV)
Same filters as list. Columns: date, department, subject, faculty, category, type,
rating, status, comment, student (blank if anonymous).

## Test Checklist
- Student token on any /admin route → 403
- Anonymous feedback has no `student` field in response
- Faculty stats avg matches manual calculation on seed data
- Soft-deleted faculty hidden in student dropdowns but visible on old feedback
- Reply moves Pending → In Review