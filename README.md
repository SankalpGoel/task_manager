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

## ☁️ Deployment (Railway)

This repository is completely pre-configured for a seamless, single-service deployment on [Railway.app](https://railway.app/).

1. Push this repository to your GitHub account.
2. Log into Railway and click **New Project** > **Deploy from GitHub repo**.
3. Select your repository. 

**What happens automatically?**
- Railway detects the `railway.json` configuration file.
- It executes `bash build.sh`, which builds the highly-optimized React production bundle and moves it into the backend's static delivery folder.
- It starts the FastAPI server using the exact configurations required for production.
- Your application will be live in under 2 minutes!

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
├── build.sh                  # Railway deployment build script
├── railway.json              # Railway environment configuration
└── requirements.txt          # Python dependencies
```

---
*Built with ❤️ for advanced team productivity.*
