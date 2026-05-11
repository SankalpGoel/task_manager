from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine, Base, get_db
import models
import schemas
import auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Endpoints
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        name=user.name, 
        email=user.email, 
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Projects Endpoints
@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    db_project = models.Project(**project.model_dump(), owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    # Add owner as a member automatically
    db_member = models.ProjectMember(project_id=db_project.id, user_id=current_user.id)
    db.add(db_member)
    db.commit()
    return db_project

@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == models.RoleEnum.ADMIN:
        return db.query(models.Project).all()
    else:
        memberships = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
        project_ids = [m.project_id for m in memberships]
        # Include projects where they have a task assigned
        tasks = db.query(models.Task).filter(models.Task.assignee_id == current_user.id).all()
        assigned_project_ids = [t.project_id for t in tasks]
        all_ids = set(project_ids + assigned_project_ids)
        return db.query(models.Project).filter(models.Project.id.in_(all_ids)).all()

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role != models.RoleEnum.ADMIN:
        membership = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id, models.ProjectMember.user_id == current_user.id).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this project")
            
    return project

@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    db.commit()
    db.refresh(db_project)
    return db_project

@app.post("/api/projects/{project_id}/members", status_code=status.HTTP_201_CREATED)
def add_project_member(project_id: int, member_data: schemas.ProjectMemberCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user = db.query(models.User).filter(models.User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id, models.ProjectMember.user_id == member_data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
        
    db_member = models.ProjectMember(project_id=project_id, user_id=member_data.user_id)
    db.add(db_member)
    db.commit()
    return {"message": "Member added successfully"}

# Tasks Endpoints
@app.post("/api/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user), project_id: int = None):
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
        
    if current_user.role != models.RoleEnum.ADMIN:
        memberships = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
        project_ids = [m.project_id for m in memberships]
        query = query.filter((models.Task.project_id.in_(project_ids)) | (models.Task.assignee_id == current_user.id))
        
    return query.all()

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check permissions: Admin can update anything. Assignee can update status.
    if current_user.role != models.RoleEnum.ADMIN:
        if db_task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        # Members can only update status
        if task_update.status:
            db_task.status = task_update.status
    else:
        # Admin can update everything
        update_data = task_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
            
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return None

# Users Endpoints
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin)):
    return db.query(models.User).all()

# Dashboard Endpoint
@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    now = datetime.utcnow()
    
    if current_user.role == models.RoleEnum.ADMIN:
        # System-wide stats
        total_projects = db.query(models.Project).count()
        tasks = db.query(models.Task).all()
    else:
        # Only assigned tasks for members (or tasks in their projects? Prompt says "only assigned tasks for Members")
        total_projects = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).count()
        tasks = db.query(models.Task).filter(models.Task.assignee_id == current_user.id).all()
        
    total_tasks = len(tasks)
    todo = sum(1 for t in tasks if t.status == models.StatusEnum.TODO)
    in_progress = sum(1 for t in tasks if t.status == models.StatusEnum.IN_PROGRESS)
    done = sum(1 for t in tasks if t.status == models.StatusEnum.DONE)
    overdue = sum(1 for t in tasks if t.due_date and t.due_date < now and t.status != models.StatusEnum.DONE)
    
    return schemas.DashboardStats(
        total_projects=total_projects,
        total_tasks=total_tasks,
        todo_tasks=todo,
        in_progress_tasks=in_progress,
        done_tasks=done,
        overdue_tasks=overdue
    )

# Static Files Serving for React Frontend
frontend_dist = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(frontend_dist):
    os.makedirs(frontend_dist)

# Mount the static directory
assets_dir = os.path.join(frontend_dist, "assets")
if not os.path.exists(assets_dir):
    os.makedirs(assets_dir)
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Catch-all route for SPA
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    index_file = os.path.join(frontend_dist, "index.html")
    # Check if a specific file is requested in the root (like favicon.ico)
    requested_file = os.path.join(frontend_dist, full_path)
    if os.path.exists(requested_file) and os.path.isfile(requested_file):
        return FileResponse(requested_file)
    # Default to index.html for React Router
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend not built yet. Run build.sh or npm run build."}

