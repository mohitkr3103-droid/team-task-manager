# TaskFlow — Enterprise Team Task Manager

<div align="center">

**A production-grade, full-stack Team Task Manager platform built for modern enterprise workflows.**

Built with React.js, Node.js, Express.js, MongoDB Atlas, and Tailwind CSS.
Features a clean, corporate design system inspired by the IBM Carbon Design Language.

</div>

---

## Overview

TaskFlow is a comprehensive full-stack application designed to help teams manage projects, assign tasks, and track progress with robust role-based access control. It satisfies all requirements for a modern, scalable project management system.

## Key Features & Requirements Fulfilled

### 1. Authentication & Security
- **Signup / Login System:** Secure JWT-based authentication.
- **Data Protection:** Passwords securely hashed using bcryptjs (12 salt rounds).
- **Security Middleware:** Implementation of Helmet (security headers), CORS, and rate limiting to prevent brute-force attacks.

### 2. Project & Team Management
- **Project Workspaces:** Create, edit, and delete projects. Includes color-coding, progress tracking, and deadline management.
- **Team Management:** Add or remove members to projects. View all team members with search and department filtering.

### 3. Task Creation, Assignment & Status
- **Task Lifecycle:** Full CRUD operations for tasks.
- **Assignment:** Assign tasks to specific team members.
- **Status & Priority Tracking:** Track tasks by status (Pending, In Progress, Completed, Overdue) and priority (Low, Medium, High).
- **Collaboration:** Integrated commenting system and automated activity logging for every task.
- **Smart Notifications:** Dynamic, real-time alerts alerting users to overdue deadlines or newly assigned high-priority tasks.
- **Profile Customization:** Users can securely upload and manage custom profile avatars encoded via base64.

### 4. Enterprise Dashboard
- **Real-Time Analytics:** Visualize project and task data using Recharts.
- **Metrics Tracked:** Total tasks, completion rates, tasks by status (pie charts), and completion trends over time (area charts).
- **Overdue Detection:** Automated tracking and highlighting of overdue tasks.

### 5. Backend Architecture & Database
- **RESTful APIs:** Clean MVC architecture (Models, Views, Controllers) built with Node.js and Express.js.
- **Database:** MongoDB Atlas (NoSQL) integration via Mongoose.
- **Validations:** Comprehensive input validation and sanitization using `express-validator`.
- **Relationships:** Advanced Mongoose population and virtuals to establish complex relationships between Users, Projects, and Tasks.

### 6. Role-Based Access Control (RBAC)
- **Roles:** Admin and Member access levels.
- **Permissions:** Admins have full access to create projects, delete tasks, and manage roles. Members can only update the status of tasks specifically assigned to them.

---

## Technology Stack

**Frontend Environment:**
- React.js (Vite)
- Tailwind CSS v4
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Context API (State Management)
- Axios

**Backend Environment:**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator

---

## Local Installation Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas Database (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd "Team Task Manager"
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

*(Optional) Seed the database with demo data:*
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
The application will be running at `http://localhost:5173`.

---

## Deployment (Railway)

This application is architected to be fully deployable on [Railway](https://railway.app). 

### Backend Deployment Steps:
1. Create a new project on Railway.
2. Connect your GitHub repository.
3. Set the Root Directory to `/server`.
4. Add the required Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
5. Deploy the service.

### Frontend Deployment Steps:
1. Add a new service to the same Railway project from your GitHub repo.
2. Set the Root Directory to `/client`.
3. Set Build Command: `npm run build`
4. Set Start Command: `npx serve dist -s -l 3000`
5. Add the Environment Variable `VITE_API_URL` pointing to your deployed backend URL.
6. Deploy the service.

---

## Submission Details

- **Live URL:** [team-task-manager-production-0885.up.railway.app]
- **Demo Video:** [Insert Link to 2-5 Min Demo Video Here]
- **GitHub Repository:** [Insert GitHub Repo URL Here]

---

*Designed and developed for modern enterprise task management.*
