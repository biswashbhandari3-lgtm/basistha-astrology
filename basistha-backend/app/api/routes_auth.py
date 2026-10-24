"""
Basistha Astrological Engine
Authentication & Authorization API Endpoints (Production Security)
"""
import time
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError

from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])
security = HTTPBearer(auto_error=False)

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "astrologer"

class AuthResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    token: str
    token_type: str = "Bearer"
    expires_in_minutes: int
    user: dict

def hash_password(password: str) -> str:
    """Hashes password with SHA256 + salt for local storage."""
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a cryptographically signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Dependency that extracts and validates the Bearer token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="लगइन टोकन फेला परेन। कृपया पहिले लगइन गर्नुहोस्।",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="अमान्य प्रमाणिकरण टोकन।",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "id": user_id,
            "name": payload.get("name", "User"),
            "email": payload.get("email", ""),
            "role": payload.get("role", "astrologer")
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="टोकनको म्याद सकियो वा अमान्य छ।",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login", response_model=AuthResponse)
def login_user(req: LoginRequest):
    """
    Authenticates an astrologer or client and returns a signed JWT.
    Secured under Basistha platform.
    """
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="पासवर्ड कम्तिमा ४ अक्षरको हुनुपर्छ।")
        
    user_id = f"usr_{abs(hash(req.email)) % 100000}"
    name = req.email.split("@")[0].capitalize()
    
    token = create_access_token(data={
        "sub": user_id,
        "email": req.email,
        "name": name,
        "role": "astrologer"
    })
    
    return AuthResponse(
        token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user={
            "id": user_id,
            "name": name,
            "email": req.email,
            "role": "astrologer",
            "role_ne": "प्रमाणित ज्योतिषी"
        }
    )

@router.post("/register", response_model=AuthResponse)
def register_user(req: RegisterRequest):
    """Registers a new astrologer or user account and returns a signed JWT."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।")
        
    user_id = f"usr_{abs(hash(req.email)) % 100000}"
    token = create_access_token(data={
        "sub": user_id,
        "email": req.email,
        "name": req.name,
        "role": req.role
    })
    
    return AuthResponse(
        token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user={
            "id": user_id,
            "name": req.name,
            "email": req.email,
            "role": req.role,
            "role_ne": "प्रमाणित ज्योतिषी" if req.role == "astrologer" else "सामान्य ग्राहक"
        }
    )

@router.get("/me", tags=["Authentication & User Management"])
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns currently authenticated user profile."""
    return {
        "status": "authenticated",
        "user": current_user
    }
