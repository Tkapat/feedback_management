feedback-system/
├── README.md
├── docs/
│   ├── STRUCTURE.md
│   ├── er-diagram.png
│   └── screenshots/
│
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── server.js                  # connect DB + listen
│       ├── app.js                     # express app, middleware, routes
│       ├── config/
│       │   ├── db.js
│       │   └── cookie.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Department.js
│       │   ├── Faculty.js
│       │   ├── Subject.js
│       │   ├── Feedback.js
│       │   └── Setting.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── lookup.controller.js
│       │   ├── settings.controller.js
│       │   ├── student/
│       │   │   └── feedback.controller.js
│       │   └── admin/
│       │       ├── feedback.controller.js
│       │       ├── stats.controller.js
│       │       ├── masterData.controller.js
│       │       └── student.controller.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── auth.routes.js
│       │   ├── lookup.routes.js
│       │   ├── student.routes.js
│       │   └── admin.routes.js
│       ├── middleware/
│       │   ├── auth.js                # protect, authorize
│       │   ├── validate.js
│       │   ├── rateLimit.js
│       │   └── errorHandler.js
│       ├── validators/
│       │   ├── auth.schema.js
│       │   └── feedback.schema.js
│       ├── utils/
│       │   ├── asyncHandler.js
│       │   ├── httpError.js
│       │   ├── pagination.js
│       │   ├── keywords.js
│       │   └── toCsv.js
│       └── seed/
│           └── seed.js
│
└── client/
    ├── package.json
    ├── .env.example
    ├── tailwind.config.js
    ├── jsconfig.json                  # "@/*" alias
    ├── app/
    │   ├── layout.js
    │   ├── globals.css
    │   ├── page.js                    # redirects by role
    │   ├── (auth)/
    │   │   ├── layout.js              # split auth layout
    │   │   ├── login/page.js
    │   │   └── register/page.js
    │   ├── student/
    │   │   ├── layout.js              # ProtectedRoute role="student"
    │   │   ├── dashboard/page.js
    │   │   └── feedback/
    │   │       ├── new/page.js
    │   │       ├── history/page.js
    │   │       └── [id]/page.js
    │   └── admin/
    │       ├── layout.js              # ProtectedRoute role="admin"
    │       ├── dashboard/page.js
    │       ├── feedback/page.js
    │       ├── analytics/page.js
    │       ├── departments/page.js
    │       ├── faculty/page.js
    │       ├── subjects/page.js
    │       ├── students/page.js
    │       └── settings/page.js
    ├── components/
    │   ├── ui/                        # reusable primitives
    │   │   ├── Button.js
    │   │   ├── Input.js
    │   │   ├── Select.js
    │   │   ├── Textarea.js
    │   │   ├── Card.js
    │   │   ├── Badge.js
    │   │   ├── Modal.js
    │   │   ├── Drawer.js
    │   │   ├── Table.js
    │   │   ├── Pagination.js
    │   │   ├── Skeleton.js
    │   │   ├── EmptyState.js
    │   │   └── Toaster.js
    │   ├── animation/
    │   │   ├── Reveal.js
    │   │   ├── AnimatedCounter.js
    │   │   └── HoverLift.js
    │   ├── layout/
    │   │   ├── DashboardShell.js
    │   │   ├── Sidebar.js
    │   │   ├── Topbar.js
    │   │   └── PageHeader.js
    │   ├── auth/
    │   │   ├── RoleToggle.js
    │   │   ├── LoginForm.js
    │   │   ├── RegisterForm.js
    │   │   └── ProtectedRoute.js
    │   ├── feedback/
    │   │   ├── FeedbackForm.js
    │   │   ├── StarRating.js
    │   │   ├── TagSelector.js
    │   │   ├── FeedbackCard.js
    │   │   ├── FeedbackFilters.js
    │   │   ├── StatusBadge.js
    │   │   ├── StatusTimeline.js
    │   │   └── ReplyThread.js
    │   ├── charts/
    │   │   ├── TypeDonutChart.js
    │   │   ├── FacultyRatingBar.js
    │   │   ├── DepartmentGroupedBar.js
    │   │   └── TrendLineChart.js
    │   └── dashboard/
    │       ├── StatCard.js
    │       ├── Leaderboard.js
    │       └── ConcernsCloud.js
    ├── context/
    │   └── AuthContext.js
    ├── hooks/
    │   ├── useFetch.js
    │   └── useDebounce.js
    ├── lib/
    │   ├── api.js                     # axios instance
    │   ├── validators.js              # zod schemas
    │   └── utils.js
    └── constants/
        ├── nav.js                     # sidebar items per role
        └── options.js                 # categories, types, statuses