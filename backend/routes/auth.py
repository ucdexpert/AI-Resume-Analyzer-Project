from fastapi import APIRouter, HTTPException, Depends
from models.user import SignupRequest, LoginRequest, TokenResponse, UserResponse
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from utils.db import get_db
from middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- SIGNUP ---
@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, db=Depends(get_db)):
    # 1. Check email already exists
    existing = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1", data.email
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash password
    hashed = hash_password(data.password)

    # 3. Save user to database
    user = await db.fetchrow(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        data.name, data.email, hashed
    )

    # 4. Create JWT token
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"]
    }


# --- LOGIN ---
@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db=Depends(get_db)):
    # 1. Find user by email
    user = await db.fetchrow(
        "SELECT * FROM users WHERE email = $1", data.email
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 2. Verify password
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 3. Create JWT token
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"]
    }


# --- GET CURRENT USER ---
@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    # Convert Record to dict or return as is if UserResponse can handle UUID/Record
    return {
        "id": str(current_user["id"]),
        "name": current_user["name"],
        "email": current_user["email"]
    }
