from fastapi import Depends, HTTPException, Header
from utils.jwt import verify_token
from utils.db import get_db

async def get_current_admin(
    authorization: str = Header(...),
    db=Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload or payload.get("type") != "admin":
        raise HTTPException(status_code=401, detail="Admin access required")
    
    admin = await db.fetchrow(
        "SELECT * FROM admins WHERE id = $1 AND is_active = true",
        payload["sub"]
    )
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return dict(admin)


async def get_superadmin(admin=Depends(get_current_admin)):
    if admin["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return admin
