import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
from models.admin import ManualPaymentProofCreate
from utils.db import db
from middleware.auth import get_current_user # Corrected import
import uuid

router = APIRouter()

UPLOAD_DIRECTORY = "uploaded_screenshots" # Define upload directory

# In a real application, you'd integrate with cloud storage like S3, Azure Blob Storage, etc.
# For now, we'll simulate storing the file and just use a placeholder URL.
async def upload_screenshot_to_storage(file: UploadFile) -> str:
    # Ensure the upload directory exists
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    # Generate a unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "png"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

    # Save the file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # Return the URL to access the locally saved file
    # This assumes your FastAPI app will serve static files from /uploaded_screenshots
    return f"/uploaded_screenshots/{unique_filename}"


@router.post("/manual-payments", status_code=status.HTTP_201_CREATED)
async def submit_manual_payment_proof(
    plan: str = Form(...),
    amount: str = Form(...), # Changed to string to allow FastAPI to receive it
    payment_method: str = Form(...),
    transaction_id: str = Form(...),
    screenshot: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user) # Assuming user authentication
):
    """
    Submits a manual payment proof for a plan upgrade.
    Requires user authentication and includes screenshot upload.
    """
    user_id = current_user["id"] # Assuming user ID is available in the current_user dict

    if not screenshot.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image."
        )
    
    # Upload screenshot and get URL
    screenshot_url = await upload_screenshot_to_storage(screenshot)

    try:
        amount_int = int(amount) # Convert amount to integer for database
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be a valid integer."
        )

    # Create manual payment proof entry in the database
    manual_payment_id = await db.fetchval("""
        INSERT INTO manual_payments
        (user_id, plan, amount, payment_method, transaction_id, screenshot_url, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING id
    """, user_id, plan, amount_int, payment_method, transaction_id, screenshot_url, notes)

    return {
        "message": "Manual payment proof submitted successfully. It is now pending admin approval.",
        "manual_payment_id": str(manual_payment_id),
        "screenshot_url": screenshot_url
    }

@router.get("/manual-payments/history")
async def get_manual_payment_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves the manual payment history for the current authenticated user.
    """
    user_id = current_user["id"]
    
    history = await db.fetch("""
        SELECT id, plan, amount, payment_method, transaction_id, screenshot_url, notes, status, admin_notes, created_at, updated_at
        FROM manual_payments
        WHERE user_id = $1
        ORDER BY created_at DESC
    """, user_id)
    
    return [
        {
            "id": str(h["id"]),
            "plan": h["plan"],
            "amount": h["amount"],
            "payment_method": h["payment_method"],
            "transaction_id": h["transaction_id"],
            "screenshot_url": h["screenshot_url"],
            "notes": h["notes"],
            "status": h["status"],
            "admin_notes": h["admin_notes"],
            "created_at": h["created_at"],
            "updated_at": h["updated_at"]
        }
        for h in history
    ]
