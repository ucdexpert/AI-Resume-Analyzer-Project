from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
import os
from routes import analysis, generators, auth, builder, admin, support, password, manual_payments
from utils.db import db

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="SkillSense API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will restrict after testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# Include Routes
app.include_router(auth.router, prefix="/api")
app.include_router(builder.router, prefix="/api")
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(generators.router, prefix="/api", tags=["Generators"])
app.include_router(admin.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(password.router, prefix="/api")
app.include_router(manual_payments.router, prefix="/api")

os.makedirs("uploaded_screenshots", exist_ok=True) # New line to ensure directory exists
# Serve static files for uploaded screenshots
app.mount("/uploaded_screenshots", StaticFiles(directory="uploaded_screenshots"), name="uploaded_screenshots")

@app.get("/")
async def root():
    return {"message": "SkillSense API is running"}

# Catch-all for OpenAI-style endpoints (to prevent 404 noise in logs)
@app.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def openai_style_fallback(path: str):
    return {
        "error": "This is not an OpenAI API endpoint. Please use /api/* endpoints.",
        "message": "SkillSense uses custom API endpoints under /api/"
    }
