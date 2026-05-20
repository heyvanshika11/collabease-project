# 🚀 CollabEase - Soft-Design Project & Task Manager

CollabEase is a highly visual, professional, and fully functional full-stack project management web application. It features robust **Role-Based Access Control (RBAC)**, an elegant **soft CSS design system**, and a dynamic Single Page Application (SPA) dashboard.

---

## ✨ Features

- **🔐 Robust Authentication**: Secure registration and login using JWT tokens and salt-hashed passwords.
- **📊 Interactive Dashboard**: Visual task trackers, project progress indicators, status distributions, and overdue warnings.
- **📂 Project Management**: Create projects, set deadlines, and manage your workspace dynamically.
- **👥 Team & Member Invitations**: Invite team members by their email addresses and assign them roles (`Admin` or `Member`) on a per-project basis.
- **✅ Task Assignment & Status Tracking**:
  - Create and assign tasks with specific priorities (`Low`, `Medium`, `High`) and deadlines.
  - Track statuses: `To Do` ➔ `In Progress` ➔ `In Review` ➔ `Completed`.
- **💬 Real-Time Comments**: Discuss task items within a dedicated communication drawer.
- **🛡️ Per-Project Role-Based Permissions (RBAC)**:
  - **Admin**: Can edit/delete the project, manage team memberships, create tasks, edit tasks, and delete tasks.
  - **Member**: Can view the project dashboard, see all tasks, write comments, and update the status of tasks *specifically assigned to them*.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla Modern JS (ES6+), HTML5 Semantic Shell, CSS Custom Properties (Soft glassmorphism and HSL systems), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Security**: JSON Web Tokens (JWT) for session management, `bcryptjs` for secure password hashing.
- **Database**: Custom JSON file-based database service (`database.json`) with an ORM-like API, automatic data seeding, and relational queries.

---

## 🔑 Demo Credentials (Pre-Seeded)

The application automatically seeds a realistic set of demo projects, tasks, and users so that it looks professional right out of the box!

| Name | Email | Password | Default Role (Project: Phoenix Redesign) |
| :--- | :--- | :--- | :--- |
| **Sarah Connor** | `sarah.c@collab.com` | `password123` | **Admin / Project Owner** |
| **John Doe** | `john.d@collab.com` | `password123` | **Member (Assignee)** |
| **Alex Mercer** | `alex.m@collab.com` | `password123` | **Admin (Owner of API Gateway V2)** |
| **Elena Rostova** | `elena.r@collab.com` | `password123` | **Member (Assignee)** |

---

## 🚀 How to Run and Test

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will start at **`http://localhost:3000`**.

### 3. Open the App
Open your favorite web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Codebase Structure

```
├── public/                 # Static frontend assets
│   ├── index.html          # Main HTML structure
│   ├── app.css             # Soft UI CSS styles
│   └── app.js              # State manager & router logic
├── db.js                   # Custom DB manager (handles seeding & CRUD)
├── server.js               # REST APIs & express web server
├── package.json            # Node configuration & dependencies
└── README.md               # You are here!
```
