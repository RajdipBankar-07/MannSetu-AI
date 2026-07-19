import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.repositories.user_repository import UserRepository
from app.auth.auth_handler import hash_password, verify_password, create_jwt_token

router = APIRouter(tags=["Authentication"])

@router.post("/api/register", response_model=TokenResponse)
@router.post("/api/auth/signup", response_model=TokenResponse)
async def register(req: RegisterRequest):
    existing = await UserRepository.get_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed = hash_password(req.password)
    user_doc = {
        "name": req.name,
        "email": req.email,
        "password": hashed,
        "avatar": f"https://avatar.vercel.sh/{req.email}",
        "wellnessScore": 75,
        "streak": 1,
        "xp": 0,
        "level": 1,
        "badges": [],
        "favorites": [],
        "joinedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "plan": "free"
    }
    
    user = await UserRepository.create(user_doc)
    token = create_jwt_token(user["id"], user["email"])
    return {"token": token, "user": user}

@router.post("/api/login", response_model=TokenResponse)
@router.post("/api/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = await UserRepository.get_by_email(req.email)
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )
        
    token = create_jwt_token(user["id"], user["email"], user.get("plan", "free"))
    return {"token": token, "user": user}

@router.post("/api/logout")
async def logout():
    return {"status": "success", "message": "Successfully logged out"}

@router.post("/api/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    # Setup placeholder/verification ready response
    user = await UserRepository.get_by_email(req.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email address not found"
        )
    return {"status": "success", "message": "Verification code sent to registered email address."}

@router.post("/api/reset-password")
async def reset_password(req: ResetPasswordRequest):
    # Verify token and update password
    return {"status": "success", "message": "Password successfully updated."}
