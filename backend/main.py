from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from routes import analysis, generators, auth, builder
from utils.db import db

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AI Resume Analyzer API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running"}
