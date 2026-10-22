# 🎓 College Feedback Management System

A full-stack web application where students submit structured feedback about teaching,
classrooms, labs and college services, and administrators analyse, respond to and
manage that feedback from a centralised dashboard.

**Stack:** MERN (React via Next.js) · MongoDB Atlas · Tailwind CSS · GSAP · Recharts

---

## ✨ Features

### Student
- Register / login (role toggle: Student | Admin on the same page)
- Select department → subject → faculty (dependent dropdowns)
- Feedback categories: Teaching, Classroom, Laboratory, Other Services
- Feedback types: Appreciation, Complaint, Suggestion
- 1–5 star rating for teaching feedback
- Quick tags (Late Lectures, Poor Internet, ...) and free-text comments
- Anonymous submission option
- Feedback history with filters, status badges and admin reply thread
- Status timeline: Pending → In Review → Resolved / Rejected

### Administrator
- Secure admin login (account created by seed script only)
- Dashboard: summary cards, charts, leaderboards
- Feedback management: filter by department, subject, faculty, type, status, date
- Reply to feedback and update status, priority flag
- Faculty-wise, subject-wise and department-wise statistics
- Top complaints / appreciations, average ratings, common concerns
- Manage departments, subjects, faculty and student accounts
- System settings: open/close feedback window, manage tags
- Export filtered feedback to CSV

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Animation | GSAP + @gsap/react |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (httpOnly cookie) + bcryptjs |
| Security | helmet, cors, express-rate-limit |
| Deployment | Vercel (client), Render/Railway (server), Atlas (DB) |

---

## 🏗 Architecture

```
Next.js client  ──(Axios, cookies)──►  Express REST API  ──(Mongoose)──►  MongoDB Atlas
   /client                                 /server
```

---

## 📁 Project Structure (short)

```
feedback-system/
├── client/    # Next.js frontend
├── server/    # Express backend
├── docs/      # diagrams, screenshots
└── README.md
```

Full structure is in `docs/STRUCTURE.md`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 tier)

### 1. Clone
```bash
git clone <your-repo-url>
cd feedback-system
```

### 2. Server setup
```bash
cd server
npm install
cp .env.example .env     # then fill in values
npm run seed             # creates admin, departments, faculty, subjects, demo data
npm run dev              # http://localhost:5000
```

`server/.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/feedback_system?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=Admin@12345
```

### 3. Client setup
```bash
cd client
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

`client/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | Admin@12345 |
| Student | student@college.edu | Student@123 |

Use the **Student | Admin** toggle on the login page.

---

## 🔌 API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Lookups | `GET /departments`, `GET /subjects?department=`, `GET /faculty?department=` |
| Student | `POST /feedback`, `GET /feedback/mine`, `GET /feedback/mine/:id`, `GET /feedback/mine/summary` |
| Admin feedback | `GET /admin/feedback`, `GET /admin/feedback/:id`, `PATCH /admin/feedback/:id/status`, `POST /admin/feedback/:id/reply`, `GET /admin/feedback/export` |
| Admin stats | `GET /admin/stats/overview`, `/faculty`, `/subjects`, `/departments`, `/top`, `/concerns` |
| Admin master data | CRUD on `/admin/departments`, `/admin/faculty`, `/admin/subjects` |
| Admin students | `GET /admin/students`, `PATCH /admin/students/:id/active` |
| Settings | `GET /settings`, `PUT /admin/settings` |

---

## 🔐 Security

- Passwords hashed with bcrypt
- JWT in httpOnly cookie, role-based middleware (`protect`, `authorize`)
- Zod validation on every write endpoint
- helmet, CORS allow-list, rate limiting on auth routes
- Anonymous feedback: student identity is removed **in the API response**
- Admin accounts are never created through public registration

---

## ☁️ Deployment

1. **Atlas:** allow `0.0.0.0/0` in Network Access, copy the URI.
2. **Server (Render):** root `server`, build `npm install`, start `npm start`.
   Set all env vars. Set `NODE_ENV=production` and `CLIENT_URL=<vercel-url>`.
3. **Client (Vercel):** root `client`, set `NEXT_PUBLIC_API_URL=<render-url>/api`.
4. Cross-domain cookies need `sameSite: "none"` and `secure: true` (already handled
   when `NODE_ENV=production`).

---

## 🧪 Scripts

| Location | Script | Purpose |
|---|---|---|
| server | `npm run dev` | start with nodemon |
| server | `npm start` | production start |
| server | `npm run seed` | wipe and reseed database |
| client | `npm run dev` | Next.js dev server |
| client | `npm run build` | production build |

---

## 🗺 Roadmap
- Faculty login role (view own feedback only)
- Email notifications on admin reply
- Sentiment analysis on comments
- PDF report export

## 📄 License
MIT (for academic use)