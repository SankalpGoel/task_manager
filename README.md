# TaskMaster - Professional Task Management System

![TaskMaster Overview](https://img.shields.io/badge/Status-Active-success) ![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi) ![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react) ![Deployment](https://img.shields.io/badge/Deploy-Railway-131415?logo=railway)

TaskMaster is a modern, full-stack web application designed for seamless project collaboration and task management. It features a robust Role-Based Access Control (RBAC) system, a dynamic analytics dashboard, and a premium, highly responsive user interface.

## ✨ Key Features

- **🔐 Secure Authentication:** JWT-based login and registration with hashed passwords (bcrypt).
- **👥 Role-Based Access Control:** 
  - **Admins:** Full control over projects, tasks, and team members. Access to system-wide analytics.
  - **Members:** Focused view of assigned tasks and relevant projects. Ability to update task progression.
- **📊 Dynamic Dashboard:** Real-time statistics tracking overall progress, overdue items, and task statuses.
- **📁 Project Management:** Create, edit, and organize multiple team projects.
- **✅ Task Tracking:** Kanban-style status tracking (To Do, In Progress, Done) with due dates and assignments.
- **🎨 Premium UI/UX:** Built with a custom, lightweight CSS design system featuring glassmorphism, fluid typography, and micro-animations.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** SQLite (Easily swappable to PostgreSQL via connection string)
- **ORM:** SQLAlchemy
- **Security:** PassLib (Bcrypt), Python-JOSE (JWT)

### Frontend
- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (Zero dependency, high performance)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Backend Setup
Open a terminal and set up the Python environment:
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Start the API server
uvicorn main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
Open a second terminal and set up the React app:
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
The frontend will run on `http://localhost:5173`. Open this link in your browser to view the app!

---

## 🧪 Testing the Project Features

Once your local servers are running, follow these steps to test the full RBAC (Role-Based Access Control) flow:

### 1. Test the Admin Flow
1. Open the app and click **Register**.
2. Create an account with the role set to **ADMIN**.
3. **Dashboard:** You will see a high-level overview of the entire system (all projects, all tasks).
4. **Projects:** Navigate to the Projects tab and create a new project. You can also edit existing projects.
5. **Tasks:** Navigate to the Tasks tab, create a new task, and assign it to a project.

### 2. Test the Member Flow
1. Open the app in an Incognito window (or log out) and click **Register**.
2. Create an account with the role set to **MEMBER**.
3. **Restricted View:** Notice that your Dashboard and Tasks page are empty. This is because you haven't been assigned anything yet!
4. **Assign a Task:** Go back to your **Admin** window, edit a task, and set the "Assignee" to your newly created Member account.
5. **Verify Access:** Refresh your **Member** window. You will now see the assigned task on your dashboard, and the project it belongs to will become visible in your Projects tab. As a member, you can change the status of the task (e.g., from *To Do* to *Done*), but you cannot edit its core details or delete it.

---

## ☁️ Deployment (Render - Free)

This repository is fully configured with a robust `Dockerfile` for a seamless, completely free deployment on [Render.com](https://render.com/).

1. Push this repository to your GitHub account.
2. Sign into Render.com and click **New +** > **Web Service**.
3. Select **"Deploy from a GitHub repo"** and choose your repository. 
4. On the setup page, leave everything as default:
   - **Language:** Docker
   - **Branch:** `main`
   - **Instance Type:** Free
5. Click **Create Web Service**.

**What happens automatically?**
- Render reads the `Dockerfile` and creates a secure Linux container.
- **Stage 1:** It installs Node.js, installs frontend dependencies, and builds the highly-optimized React production bundle.
- **Stage 2:** It installs Python, sets up the FastAPI backend, and securely transfers the React production files into the backend's static delivery folder.
- It boots up the FastAPI server, binding to Render's dynamic ports.
- Your application will be live and accessible via a public URL in a few minutes!

---

## 📂 Project Structure

```text
taskManager/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # API Endpoints & Static Serving
│   ├── models.py             # SQLAlchemy Database Models
│   ├── schemas.py            # Pydantic Validation Schemas
│   ├── auth.py               # JWT & Security Utilities
│   └── database.py           # Database Connection Setup
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── api.js            # Frontend API Service Layer
│   │   ├── App.jsx           # Routing & Layout
│   │   ├── index.css         # Premium Design System
│   │   └── pages/            # Dashboard, Login, Projects, Tasks
│   └── vite.config.js        # Build configuration
├── Dockerfile                # Render deployment configuration
├── .dockerignore             # Docker build optimization
└── requirements.txt          # Python dependencies
```

---
*Built with ❤️ for advanced team productivity.*
