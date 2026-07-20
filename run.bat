@echo off
title MannSetu AI Runner

:: Set working directory to the directory of this script
cd /d "%~dp0"

echo ========================================================
echo               MannSetu AI - Quick Startup
echo ========================================================
echo.

:: 0. Clean up any hanging background processes to avoid file locks and port conflicts
echo [INFO] Cleaning up background processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

:: 1. Check for required system executables
echo [INFO] Verifying system dependencies...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in your PATH.
    pause
    exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python from https://www.python.org/ and try again.
    pause
    exit /b 1
)

:: 2. Check and start MongoDB
echo [INFO] Checking MongoDB status on port 27017...
netstat -ano | findstr 27017 >nul 2>nul
if errorlevel 1 (
    echo [WARNING] MongoDB is not running on port 27017.
    echo [INFO] Attempting to start MongoDB service...
    net start MongoDB >nul 2>nul
    
    rem Wait and check again
    timeout /t 2 >nul
    netstat -ano | findstr 27017 >nul 2>nul
    if errorlevel 1 (
        echo [WARNING] Could not start MongoDB service. 
        echo Please ensure MongoDB is installed and running locally on port 27017.
        echo.
    ) else (
        echo [SUCCESS] MongoDB service started successfully!
    )
) else (
    echo [SUCCESS] MongoDB is running.
)

:: 3. Copy env file if missing
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env configuration file from template...
    copy "backend\.env.example" "backend\.env" >nul
)

:: 4. Setup Python Virtual Environment and dependencies
if not exist "backend\venv" (
    echo [INFO] Creating python virtual environment at backend\venv...
    
    rem Try using python -m venv
    python -m venv "backend\venv"
    
    rem If that fails, try using py -m venv
    if errorlevel 1 (
        echo [WARNING] python -m venv failed. Trying py -m venv...
        py -m venv "backend\venv"
    )
    
    rem If that fails, try using python3 -m venv
    if errorlevel 1 (
        echo [WARNING] py -m venv failed. Trying python3 -m venv...
        python3 -m venv "backend\venv"
    )
    
    rem If that fails, try using virtualenv
    if errorlevel 1 (
        echo [WARNING] python3 -m venv failed. Trying virtualenv...
        virtualenv "backend\venv"
    )
    
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to create virtual environment.
        echo Please ensure you have Python fully installed and configured in your PATH.
        echo Try running: pip install virtualenv
        echo.
        pause
        exit /b 1
    )
)

set "needs_install=0"
if not exist "backend\venv\Scripts\uvicorn.exe" set "needs_install=1"
if not exist "backend\venv\Lib\site-packages\email_validator" set "needs_install=1"

if "%needs_install%"=="1" (
    echo [INFO] Installing/repairing backend python requirements...
    echo.
    echo =====================================================================
    echo [WARNING] Installing PyTorch, Transformers, and GenAI libraries.
    echo This is a very large download. The terminal will remain SILENT
    echo for 3 to 10 minutes while writing files to disk. Please do NOT close
    echo this window!
    echo =====================================================================
    echo.
    call backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

:: 5. Setup Frontend dependencies
if not exist "node_modules\.bin\next.cmd" (
    echo [INFO] Installing/repairing frontend npm packages. This might take a minute...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 6. Start Backend Server (FastAPI)
echo [INFO] Starting FastAPI Backend on port 8000...
start "MannSetu AI Backend" cmd /k "title MannSetu AI Backend && cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

:: 7. Start Frontend Server (Next.js)
echo [INFO] Starting Next.js Frontend on port 3000...
start "MannSetu AI Frontend" cmd /k "title MannSetu AI Frontend && npm run dev"

:: 8. Auto-open browser
echo.
echo [SUCCESS] Startup commands issued!
echo [INFO] Launching browser to http://localhost:3000 in 5 seconds...
timeout /t 5 >nul
start http://localhost:3000

echo.
echo ========================================================
echo Both servers are starting up. Please check their separate
echo command windows if you experience any connection errors.
echo ========================================================
echo.
pause
