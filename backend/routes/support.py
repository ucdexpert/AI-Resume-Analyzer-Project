from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from middleware.auth import get_current_user
from utils.db import get_db
from utils.notifications import send_contact_notification
from slowapi import Limiter
from slowapi.util import get_remote_address
import asyncpg

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/support", tags=["Support"])

class TicketCreate(BaseModel):
    subject: str
    message: str
    priority: str = "normal" # low, normal, high, urgent

class ContactInquiry(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class NewsletterSubscribe(BaseModel):
    email: str

@router.post("/subscribe")
@limiter.limit("5/hour")
async def subscribe_newsletter(request: Request, data: NewsletterSubscribe, db=Depends(get_db)):
    try:
        await db.execute("""
            INSERT INTO newsletter_subscriptions (email)
            VALUES ($1)
        """, data.email)
        return {"message": "Subscribed successfully"}
    except asyncpg.exceptions.UniqueViolationError:
        return {"message": "You are already subscribed!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/contact")
@limiter.limit("5/hour")
async def contact_form(request: Request, data: ContactInquiry, db=Depends(get_db)):
    inquiry_id = await db.fetchval("""
        INSERT INTO contact_inquiries (name, email, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    """, data.name, data.email, data.subject, data.message)
    
    # Send email notification to admin
    send_contact_notification(data.name, data.email, data.subject, data.message)
    
    return {"message": "Inquiry sent successfully", "inquiry_id": str(inquiry_id)}

@router.post("/tickets")
@limiter.limit("3/hour")
async def create_ticket(request: Request, data: TicketCreate, user=Depends(get_current_user), db=Depends(get_db)):
    ticket_id = await db.fetchval("""
        INSERT INTO support_tickets (user_id, subject, message, priority, status)
        VALUES ($1::uuid, $2, $3, $4, 'open')
        RETURNING id
    """, user["id"], data.subject, data.message, data.priority)
    
    return {"message": "Support ticket created successfully", "ticket_id": str(ticket_id)}

@router.get("/my-tickets")
async def get_my_tickets(user=Depends(get_current_user), db=Depends(get_db)):
    tickets = await db.fetch("""
        SELECT id, subject, message, status, priority, admin_reply, replied_at, created_at
        FROM support_tickets
        WHERE user_id = $1::uuid
        ORDER BY created_at DESC
    """, user["id"])
    
    return [dict(t) for t in tickets]
