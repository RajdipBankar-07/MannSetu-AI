@echo off
title MannSetu AI Runner

echo ========================================================
echo               MannSetu AI - Quick Startup
echo ========================================================
echo.

:: 1. Copy env file if missing
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env configuration file...
    copy "backend\.env.example" "backend\.env"
)

:: 2. Start Backend Server (FastAPI)
echo [INFO] Starting FastAPI Backend on port 8000...
if exist "backend\venv" (
    start "MannSetu AI Backend" cmd /k "title MannSetu AI Backend && cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
) else (
    start "MannSetu AI Backend" cmd /k "title MannSetu AI Backend && cd backend && uvicorn app.main:app --reload --port 8000"
)

:: 3. Start Frontend Server (Next.js)
echo [INFO] Starting Next.js Frontend on port 3000...
start "MannSetu AI Frontend" cmd /k "title MannSetu AI Frontend && npm run dev"

echo.
echo [SUCCESS] Startup commands issued!
echo.
pause
