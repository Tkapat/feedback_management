feedback-system/
├── README.md
├── docs/                              # ER diagram, screenshots
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── server.ts                  # connect DB + listen
│       ├── app.ts                     # express setup, middleware, routes
│       ├── routes.ts                  # mounts all module routers
│       ├── types/express.d.ts         # req.user typing
│       │
│       ├── config/
│       │   ├── env.ts                 # validated env vars
│       │   ├── db.ts                  # Atlas connection
│       │   └── cookie.ts              # cookie options
│       │
│       ├── models/                    # Mongoose schemas (section 5)
│       │   ├── User.ts
│       │   ├── Department.ts
│       │   ├── Faculty.ts
│       │   ├── Subject.ts
│       │   ├── Feedback.ts
│       │   └── Setting.ts
│       │
│       ├── middleware/
│       │   ├── auth.ts                # protect, authorize
│       │   ├── validate.ts            # zod validation
│       │   ├── rateLimit.ts
│       │   └── errorHandler.ts
│       │
│       ├── utils/
│       │   ├── asyncHandler.ts
│       │   ├── HttpError.ts
│       │   ├── pagination.ts
│       │   ├── settings.ts            # getSettings(), isWindowOpen()
│       │   └── keywords.ts            # comment keyword counter
│       │
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.routes.ts
│       │   │   └── auth.schema.ts
│       │   ├── lookup/                # dropdown data for forms
│       │   │   ├── lookup.controller.ts
│       │   │   └── lookup.routes.ts
│       │   ├── student/
│       │   │   ├── feedback.controller.ts
│       │   │   ├── feedback.schema.ts
│       │   │   └── student.routes.ts
│       │   └── admin/
│       │       ├── feedback.controller.ts
│       │       ├── stats.controller.ts
│       │       ├── masterData.controller.ts
│       │       ├── students.controller.ts
│       │       ├── settings.controller.ts
│       │       ├── admin.schema.ts
│       │       └── admin.routes.ts
│       └── seed/seed.ts
│
└── client/
    ├── package.json
    ├── tsconfig.json                  # "@/*" → "./src/*"
    ├── tailwind.config.ts
    ├── .env.example
    └── src/
        ├── app/                       # ROUTES ONLY, thin pages
        │   ├── layout.tsx
        │   ├── globals.css
        │   ├── page.tsx               # redirect by role
        │   ├── (auth)/
        │   │   ├── layout.tsx         # split layout
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   ├── student/
        │   │   ├── layout.tsx
        │   │   ├── dashboard/page.tsx
        │   │   └── feedback/
        │   │       ├── new/page.tsx
        │   │       ├── history/page.tsx
        │   │       └── [id]/page.tsx
        │   └── admin/
        │       ├── layout.tsx
        │       ├── dashboard/page.tsx
        │       ├── feedback/page.tsx
        │       ├── analytics/page.tsx
        │       ├── departments/page.tsx
        │       ├── faculty/page.tsx
        │       ├── subjects/page.tsx
        │       ├── students/page.tsx
        │       └── settings/page.tsx
        │
        ├── components/
        │   ├── ui/                    # generic primitives
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Select.tsx
        │   │   ├── Textarea.tsx
        │   │   ├── Card.tsx
        │   │   ├── Badge.tsx
        │   │   ├── Modal.tsx
        │   │   ├── Drawer.tsx         # GSAP slide
        │   │   ├── DataTable.tsx
        │   │   ├── Pagination.tsx
        │   │   ├── Skeleton.tsx
        │   │   └── EmptyState.tsx
        │   ├── animations/            # all GSAP wrappers live here
        │   │   ├── Reveal.tsx
        │   │   ├── AnimatedCounter.tsx
        │   │   ├── HoverLift.tsx
        │   │   └── ChartReveal.tsx
        │   ├── layout/
        │   │   ├── DashboardShell.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Topbar.tsx
        │   │   └── PageHeader.tsx
        │   ├── auth/
        │   │   ├── RoleToggle.tsx
        │   │   ├── LoginForm.tsx
        │   │   ├── RegisterForm.tsx
        │   │   ├── AuthBrandPanel.tsx
        │   │   └── ProtectedRoute.tsx
        │   ├── student/
        │   │   ├── FeedbackForm.tsx
        │   │   ├── StarRating.tsx
        │   │   ├── TagSelector.tsx
        │   │   ├── StudentStatCards.tsx
        │   │   ├── FeedbackCard.tsx
        │   │   ├── FeedbackFilters.tsx
        │   │   ├── StatusTimeline.tsx
        │   │   └── ReplyThread.tsx
        │   ├── admin/
        │   │   ├── KpiCards.tsx
        │   │   ├── Leaderboard.tsx
        │   │   ├── ConcernsCloud.tsx
        │   │   ├── FeedbackTable.tsx
        │   │   ├── AdminFilters.tsx
        │   │   ├── FeedbackDrawer.tsx # details + reply + status
        │   │   ├── MasterDataTable.tsx
        │   │   └── MasterDataForm.tsx
        │   ├── charts/
        │   │   ├── TypeDonutChart.tsx
        │   │   ├── FacultyRatingBar.tsx
        │   │   ├── DepartmentGroupedBar.tsx
        │   │   └── TrendLineChart.tsx
        │   └── shared/
        │       └── StatusBadge.tsx
        │
        ├── context/AuthContext.tsx
        ├── hooks/
        │   ├── useFetch.ts
        │   └── useDebounce.ts
        ├── lib/
        │   ├── api.ts                 # axios instance
        │   ├── gsap.ts                # plugin registration + motion query
        │   ├── validators.ts          # zod schemas
        │   └── utils.ts
        ├── types/index.ts             # shared interfaces
        └── constants/
            ├── nav.ts
            └── options.ts