PROJECT BUILD WORKFLOW
│
├── PHASE 0  Setup
│   ├── Create Atlas M0 cluster → DB user → allow 0.0.0.0/0 → copy URI
│   ├── Create repo: /server (Express + TS)  /client (Next.js + TS)
│   └── server/.env + client/.env.local from .env.example
│
├── PHASE 1  Server foundation  (Shared Server Core)
│   ├── config/env, db, cookie
│   ├── utils: asyncHandler, HttpError, pagination, settings
│   ├── middleware: auth, validate, rateLimit, errorHandler
│   ├── app.ts + server.ts + routes.ts
│   └── ✔ CHECK: GET /health returns { ok: true } and "MongoDB Atlas connected" prints
│
├── PHASE 2  Database
│   ├── All 6 models (Schema section)
│   ├── seed.ts (admin, departments, faculty, subjects, students, feedback)
│   └── ✔ CHECK: npm run seed → data visible in Atlas Browse Collections
│
├── PHASE 3  Auth + Lookup  (Student backend plan)
│   ├── auth module: register, login(role), logout, me
│   ├── lookup module: departments, subjects, faculty, settings
│   └── ✔ CHECK: login as student and admin with correct role; wrong role → 401
│
├── PHASE 4  Student backend
│   ├── feedback.schema → controller → routes
│   └── ✔ CHECK: submit, duplicate → 409, closed window → 403, other student's id → 404
│
├── PHASE 5  Admin backend
│   ├── masterData CRUD → students → settings
│   ├── feedback list/filters/reply/status/priority/export
│   ├── stats: overview, faculty, subjects, departments, top, concerns
│   └── ✔ CHECK: student token → 403; anonymous feedback has student = null; avg ratings correct
│
├── PHASE 6  Client foundation
│   ├── tailwind config + globals.css + fonts
│   ├── lib: api, gsap, validators · types · constants · hooks/useFetch
│   ├── components/ui primitives (Button, Input, Card, Badge, Skeleton, EmptyState)
│   ├── components/animations (Reveal, AnimatedCounter, HoverLift, ChartReveal)
│   ├── AuthContext + ProtectedRoute
│   └── ✔ CHECK: app builds with zero TypeScript errors
│
├── PHASE 7  Auth UI
│   ├── AuthBrandPanel + (auth)/layout
│   ├── RoleToggle + LoginForm + RegisterForm
│   ├── DashboardShell (Sidebar, Topbar, PageHeader) + student/admin layouts
│   └── ✔ CHECK: toggle animates, role redirects work, refresh keeps session
│
├── PHASE 8  Student UI
│   ├── Dashboard: StudentStatCards + recent FeedbackCard list
│   ├── New feedback: FeedbackForm (StarRating, TagSelector, dependent dropdowns)
│   ├── History: FeedbackFilters + FeedbackCard + Pagination
│   ├── Detail: StatusTimeline + ReplyThread
│   └── ✔ CHECK: full submit → appears in history → admin reply visible
│
├── PHASE 9  Admin UI
│   ├── Dashboard: KpiCards + 4 charts + Leaderboard + ConcernsCloud
│   ├── Feedback: AdminFilters + FeedbackTable + FeedbackDrawer (reply, status, priority) + CSV export
│   ├── Analytics: tabs for faculty / subject / department tables
│   ├── Master data: MasterDataTable + MasterDataForm (departments, faculty, subjects)
│   ├── Students + Settings pages
│   └── ✔ CHECK: every requirement in the admin list is reachable from the sidebar
│
└── PHASE 10  Polish and deploy
    ├── Loading, empty and error states everywhere
    ├── Responsive pass at 375 / 768 / 1440 px
    ├── prefers-reduced-motion test
    ├── README, screenshots, ER diagram
    └── Deploy: Atlas → Render (server) → Vercel (client); set NODE_ENV, CLIENT_URL, NEXT_PUBLIC_API_URL