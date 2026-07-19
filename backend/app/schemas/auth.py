from pydantic import BaseModel, EmailStr
from typing import List, Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSchema(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    wellnessScore: int = 75
    streak: int = 1
    xp: int = 0
    level: int = 1
    badges: List[str] = []
    favorites: List[str] = []
    joinedAt: str
    plan: str = "free"

class TokenResponse(BaseModel):
    token: str
    user: UserSchema

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
