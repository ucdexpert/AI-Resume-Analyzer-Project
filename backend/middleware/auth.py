from fastapi import Depends, HTTPException, Header
from utils.jwt import verify_token
from utils.db import get_db

async def get_current_user(
    authorization: str = Header(...),
    db=Depends(get_db)
):
    # 1. Extract token from header
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]

    # 2. Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

    # 3. Get user from database
    user = await db.fetchrow(
        "SELECT id, name, email FROM users WHERE id = $1",
        payload["sub"]
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
