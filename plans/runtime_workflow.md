STUDENT FLOW
Open site → /login (Student tab) → POST /auth/login {role:"student"} → cookie set
 └─► /student/dashboard → GET /feedback/mine/summary + GET /feedback/mine?limit=5
      └─► Give Feedback → GET /departments, /settings
           ├─ pick department → GET /subjects?department=
           ├─ pick subject → faculty auto-filled
           ├─ pick rating, tags, comment, anonymous
           └─ POST /feedback ─► [window open?] ─► [subject/faculty match?] ─► [duplicate?] ─► saved (pending)
      └─► My Feedback → GET /feedback/mine → open one → GET /feedback/mine/:id
           └─ sees status timeline + "Administrator" replies

ADMIN FLOW
Open site → /login (Admin tab) → POST /auth/login {role:"admin"} → cookie set
 └─► /admin/dashboard → GET /admin/stats/overview, /faculty, /top, /concerns → KPIs + charts
 └─► Feedback → GET /admin/feedback?filters → click row → Drawer opens (GSAP slide)
      ├─ POST /admin/feedback/:id/reply → pending becomes in_review automatically
      ├─ PATCH /admin/feedback/:id/status → resolved / rejected
      ├─ PATCH /admin/feedback/:id/priority
      └─ GET /admin/feedback/export → CSV
 └─► Analytics → /admin/stats/faculty | subjects | departments
 └─► Departments / Faculty / Subjects → CRUD (soft delete)
 └─► Students → search, activate/deactivate
 └─► Settings → open/close feedback window, dates, cycle, tag list

FEEDBACK STATUS LIFECYCLE
pending ──(admin replies)──► in_review ──► resolved
   │                             │
   └─────────(admin rejects)─────┴──────► rejected