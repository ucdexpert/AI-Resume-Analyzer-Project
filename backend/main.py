from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analysis, generators, auth, builder
from utils.db import db

app = FastAPI(title="AI Resume Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
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
