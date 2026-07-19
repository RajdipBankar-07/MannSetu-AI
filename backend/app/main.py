import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database.connection import Database
from app.repositories.game_repository import GameRepository
from app.services.emotion_service import init_classifier
from app.services.embedding_service import init_embedding_model

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mannsetu.main")

# Initialize FastAPI App with Swagger and ReDoc documentation enabled
app = FastAPI(
    title="MannSetu AI Backend",
    description="Empathetic, Secure, and Private AI Mental Wellness companion platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Lifecycle Event
@app.on_event("startup")
async def startup_event():
    # 1. Connect MongoDB
    await Database.connect_db()
    
    # 2. Seed Games Data
    await GameRepository.seed_games()
    
    # 3. Load Hugging Face GoEmotions Model
    init_classifier()
    
    # 4. Load Sentence Transformers Model
    init_embedding_model()
    
    logger.info("Application startup steps completed successfully.")

# Shutdown Lifecycle Event
@app.on_event("shutdown")
async def shutdown_event():
    # Disconnect database
    await Database.close_db()
    logger.info("Application shutdown completed.")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error. Please contact backend support."}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )

# Import and Register Routers
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.emotion import router as emotion_router
from app.api.recommendations import router as rec_router
from app.api.journal import router as journal_router
from app.api.activity import router as activity_router
from app.api.games import router as games_router
from app.api.profile import router as profile_router
from app.api.community import router as community_router
from app.api.dashboard import router as dashboard_router
from app.api.wellness import router as wellness_router
from app.api.notifications import router as notifications_router
from app.api.history import router as history_router
from app.api.meditation import router as med_router
from app.api.health import router as health_router

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(emotion_router)
app.include_router(rec_router)
app.include_router(journal_router)
app.include_router(activity_router)
app.include_router(games_router)
app.include_router(profile_router)
app.include_router(community_router)
app.include_router(dashboard_router)
app.include_router(wellness_router)
app.include_router(notifications_router)
app.include_router(history_router)
app.include_router(med_router)
app.include_router(health_router)
