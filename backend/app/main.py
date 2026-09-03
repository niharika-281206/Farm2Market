from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Smart Procurement Centre API",
    description="API for Farmer Procurement, Slot Booking & Real-Time Queue Management System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

from app.routers import auth, farmer, operator, centres, admin, company, notifications

app.include_router(auth.router)
app.include_router(company.auth_router)
app.include_router(farmer.router)
app.include_router(operator.router)
app.include_router(centres.router)
app.include_router(admin.router)
app.include_router(company.router)
app.include_router(notifications.router)

from datetime import datetime, timezone
from app.services.sms_service import sms_provider_is_configured

@app.get("/api/v1/health")
def health_check():
    from app.database.session import engine
    from sqlalchemy import text
    db_status = "error"
    try:
        with engine.connect() as conn:
            query = "SELECT 1 FROM DUAL" if "oracle" in str(engine.url) else "SELECT 1"
            conn.execute(text(query))
            db_status = "ok"
    except Exception:
        db_status = "error"

    sms_status = "configured" if sms_provider_is_configured() else "not_configured"
    smtp_status = "configured" if settings.SMTP_PASSWORD else "not_configured"

    return {
        "status": "ok",
        "api": "ok",
        "database": db_status,
        "database_engine": str(engine.url).split(":")[0],
        "socket": "ok",
        "sms": sms_status,
        "smtp": smtp_status,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/health/database")
def health_database():
    from app.database.session import engine
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"database": "ok", "engine": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url)}
    except Exception as e:
        return {"database": "error", "detail": str(e)}

@app.get("/api/v1/health/config")
def health_config():
    return {
        "sms_provider": settings.SMS_PROVIDER,
        "sms_configured": sms_provider_is_configured(),
        "cors_origins": settings.cors_origins_list,
        "environment": settings.APP_ENV,
    }

import socketio
from app.websocket.server import sio

app = socketio.ASGIApp(sio, other_asgi_app=app)
