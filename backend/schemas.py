from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from models import RoleEnum, StatusEnum

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.MEMBER

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: int
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: StatusEnum
    due_date: Optional[datetime]
    project_id: int
    assignee_id: Optional[int]

    class Config:
        from_attributes = True

class ProjectMemberCreate(BaseModel):
    user_id: int

class DashboardStats(BaseModel):
    total_projects: int
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    done_tasks: int
    overdue_tasks: int
