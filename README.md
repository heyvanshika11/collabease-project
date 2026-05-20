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

---

## 🚀 Deployment on Railway

This project is configured and ready to deploy on [Railway](https://railway.app).

### Prerequisites
- A Railway account (free tier available)
- Git repository with your code

### Step-by-Step Deployment

1. **Push your code to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Create a Railway Project**
   - Go to [https://railway.app](https://railway.app)
   - Sign in or create an account
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project settings
   - Add the following variables:
     - `JWT_SECRET`: Set a secure random string (recommended: use a password generator)
     - `NODE_ENV`: Set to `production`
     - `PORT`: Leave empty (Railway will auto-assign)

4. **Deploy**
   - Railway will automatically detect and deploy your Node.js application
   - Your app will be live at a Railway-provided URL (e.g., `https://your-app.railway.app`)

### Important Notes

- **Database**: The app uses a file-based JSON database. Data will persist during the application lifetime but may reset on container restarts. For persistent storage, consider migrating to MongoDB or PostgreSQL.
- **JWT Secret**: Always use a strong, random secret in production. Never commit `.env` files.
- **CORS**: The application is configured to accept CORS requests. Adjust as needed for security.

### Deployment Files Included

- `Procfile`: Specifies how to run the application on Railway
- `railway.json`: Railway configuration
- `.env.example`: Template for environment variables
