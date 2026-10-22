# UI DESIGN PLAN: Clean, Professional, Smooth, Aesthetic

## 1. Design Principles
1. Calm and clean: lots of whitespace, soft shadows, rounded corners (12–16px).
2. One primary colour, neutral greys, semantic colours only for status.
3. Motion with purpose: animation guides attention, never blocks the user.
4. Consistent components: every page is built from the same small UI kit.
5. Accessible: 4.5:1 contrast, visible focus rings, `prefers-reduced-motion` respected.

## 2. Colour Palette
| Token | Hex | Use |
|---|---|---|
| primary-600 | #4F46E5 | buttons, active nav, links |
| primary-50 / 100 | #EEF2FF / #E0E7FF | soft backgrounds, hovers |
| accent-500 | #14B8A6 | highlights, charts |
| bg | #F8FAFC | page background |
| surface | #FFFFFF | cards |
| border | #E2E8F0 | dividers |
| text-900 / 600 / 400 | #0F172A / #475569 | headings / body / muted |
| success | #16A34A | Resolved, Appreciation |
| warning | #F59E0B | Pending, Suggestion |
| info | #0EA5E9 | In Review |
| danger | #DC2626 | Complaint, Rejected |

Dark mode (bonus): bg #0B1020, surface #121A2F, border #1F2A44.

## 3. Typography
- Headings: **Plus Jakarta Sans** (600–700)
- Body: **Inter** (400–500)
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 40
- Line height 1.5 for body, 1.2 for headings

## 4. Layout and Spacing
- 8px spacing grid (4, 8, 12, 16, 24, 32, 48)
- Dashboards: fixed left sidebar (260px, collapsible to icons) + top bar + content max-width 1280px
- Auth pages: split screen. Left: gradient brand panel with floating shapes. Right: form card
- Mobile: sidebar becomes slide-in drawer, tables become stacked cards

## 5. Core Components (all in components/ui)
Button (primary, secondary, ghost, danger, loading), Input, Select, Textarea,
Checkbox, Card, Badge (status/type), Modal, Drawer, Table, Pagination, Tabs,
Skeleton, EmptyState, Toast, StarRating, Avatar, Tooltip.

## 6. Pages

### Auth (shared)
- Split layout, brand panel with logo, tagline, animated blobs
- **Role toggle pill (Student | Admin)** above form with sliding indicator
- Heading and helper text crossfade when role changes
- "Register" link visible only in Student mode

### Student
- **Dashboard:** greeting, 4 stat cards (counters), "Give Feedback" CTA, recent list
- **New Feedback:** stepped single-page form (Category → Details → Rating/Comment), live preview card on desktop
- **History:** filter chips (status/type), card list, pagination
- **Detail:** feedback info, status timeline, admin reply thread

### Admin
- **Dashboard:** 4 KPI cards, donut (type), bar (faculty rating), grouped bar (dept), line (trend), 2 leaderboards, common concerns tag cloud
- **Feedback:** sticky filter bar, data table, row click opens side drawer (details, reply box, status select, priority toggle)
- **Analytics:** tabs (Faculty | Subject | Department), sortable tables with inline bars
- **Master data:** table + modal forms (Departments, Faculty, Subjects)
- **Students:** searchable table with activate/deactivate switch
- **Settings:** feedback window switch + date pickers, tag manager

## 7. GSAP Animation Plan
| Where | Animation | Details |
|---|---|---|
| Auth page load | Timeline | brand panel slides in (x:-40), form card fades up, inputs stagger 0.08s |
| Role toggle | Sliding pill | indicator `x` tween 0.4s `power3.inOut`; heading text fade swap |
| Page enter | Stagger reveal | children y:24→0, opacity 0→1, 0.7s `power3.out`, stagger 0.08 |
| Stat cards | Counter | number tweens 0→value over 1.2s `power2.out` |
| Cards hover | Micro lift | translateY -4px, shadow deepen, 0.25s |
| Buttons | Press feedback | scale 0.97 on mousedown, back on release |
| Star rating | Pop | clicked star scale 1→1.35→1 with `back.out` |
| Charts | Reveal | container fades/scale 0.96→1 when scrolled in (ScrollTrigger) |
| Sidebar | Collapse | width tween + label fade |
| Drawer/Modal | Slide/scale | x:100%→0 / scale .95→1 with backdrop fade |
| Table rows | Stagger | rows fade in 0.04s apart on data load |
| Toasts | Slide in | y:-20 → 0, auto dismiss with progress bar |

Rules:
- Duration 0.25–0.8s, easing `power3.out` / `power2.inOut`
- Wrap in `gsap.matchMedia()` and skip when `prefers-reduced-motion: reduce`
- Use `useGSAP` for automatic cleanup
- Never animate on every re-render, only on mount or explicit events

## 8. Empty, Loading and Error States
- Skeleton shimmer for cards and tables
- Friendly empty states with a simple illustration and a CTA
- Inline field errors in danger colour, toast for server errors

## 9. Responsiveness
Breakpoints: sm 640, md 768, lg 1024, xl 1280.
Test at 375px (mobile), 768px (tablet), 1440px (desktop).