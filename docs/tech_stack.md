# CampusVoice — Tech Stack

This document describes the complete technology stack used in the CampusVoice feedback management system and what each component is used for.

## Frontend

### Next.js 16 (React 19)
The frontend framework powering the student and admin portals. Used for server-rendered pages, client-side navigation, route protection, and the App Router structure.

### Tailwind CSS v4
Utility-first CSS framework used for styling all components. Custom design tokens (ink, primary, semantic colors) are defined through the `@theme` block in the global stylesheet.

### Lucide React
Icon library used throughout the UI for navigation icons, status indicators, chart icons, and action buttons (menu, bell, download, close, etc.).

### React Hook Form + Zod
Form handling and validation. Zod schemas validate login, registration, and feedback submission data on the client before sending to the server.

### TanStack Query (useFetch pattern)
A custom `useFetch` hook manages data fetching, loading states, and reloading for server data such as departments, subjects, settings, feedback lists, and notifications.

### GSAP (GreenSock Animation Platform)
Animation library used for page entrance reveals, chart animations, drawer slide-ins, modal open/close transitions, and hover effects on interactive elements.

### Recharts
Charting library used for the admin dashboard and analytics pages. Renders donut charts, bar charts, rating bars, and trend lines.

### React Hot Toast
Toast notification library used to show success and error messages after actions like login, feedback submission, replies, and marking notifications as read.

## Backend

### Node.js + Express
The backend runtime and web framework. Exposes REST APIs for authentication, feedback submission, image uploads, statistics, master data, and notifications.

### MongoDB + Mongoose
Document database and ODM. Stores users, departments, faculty, subjects, settings, feedback submissions, replies, and notifications.

### JSON Web Tokens (JWT)
Stateless authentication. Issues signed access tokens on login, stored in HTTP-only cookies, and verified on protected routes.

### Bcrypt.js
Password hashing. Used to securely hash user passwords before storing them in the database.

### Multer
Middleware for handling multipart file uploads. Used to receive proof images from students, validate file type and size, and save them to disk.

### CORS + Cookie Parser
Middleware for cross-origin request handling and parsing HTTP-only cookies containing the authentication token.

### dotenv
Loads environment variables (database URI, JWT secret, client URL, port) from `.env` during development.

## Images

### Local file storage
Uploaded proof images are stored on the server under an `uploads/` directory and served statically through an `/uploads` route so students and administrators can view and download them.

## Deployment Targets

- **Backend:** Render (hosts the Express server; requires MongoDB Atlas connection, JWT secret, client URL).
- **Frontend:** Vercel (hosts the Next.js client; requires the API URL pointing to the Render backend).
- **Database:** MongoDB Atlas (cloud-hosted MongoDB cluster).
