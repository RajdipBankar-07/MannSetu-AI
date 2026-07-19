@echo off
title MannSetu AI - Git Clean & Fast Reset
echo ========================================================
echo         MannSetu AI - Git Reset Helper (Fast)
echo ========================================================
echo.
echo WARNING: This script will reset your local Git history.
echo It will delete the .git folder and start fresh, which instantly
echo untracks the 37,000+ files in node_modules, .next, and venv.
echo.
echo Your actual code files are 100%% safe and will NOT be deleted.
echo.
set /p confirm="Do you want to proceed with the Git reset? (y/n): "
if /i "%confirm%" neq "y" goto end

:: Kill any locked/hung background git processes
echo [INFO] Closing any hung background Git processes...
taskkill /f /im git.exe >nul 2>&1

:: Remove the bloated .git folder
echo [INFO] Deleting bloated .git folder...
if exist ".git" rmdir /s /q .git

:: Initialize fresh repository
echo [INFO] Initializing fresh Git repository...
git init
if errorlevel 1 (
    echo [ERROR] Failed to initialize Git repository.
    goto error_pause
)

:: Configure remote origin
echo [INFO] Setting remote origin...
git remote add origin https://github.com/RajdipBankar-07/MannSetu-AI.git

:: Stage all files (this will be instant because of .gitignore)
echo [INFO] Staging files...
git add .
if errorlevel 1 (
    echo [ERROR] Failed to stage files.
    goto error_pause
)

:: Commit
echo [INFO] Committing files...
git commit -m "Initial clean commit"
if errorlevel 1 (
    echo [ERROR] Failed to commit files.
    goto error_pause
)

:: Rename branch to main
echo [INFO] Setting branch to main...
git branch -M main

:: Force push to GitHub
echo [INFO] Force-pushing to GitHub (this will overwrite the repo with the clean version)...
git push -f -u origin main
if errorlevel 1 (
    echo.
    echo [ERROR] Force push failed. Please check your internet connection or git credentials.
    goto error_pause
)

echo.
echo [SUCCESS] Git reset and push completed successfully^!
echo Subsequent pushes will be instantaneous.
timeout /t 5
goto end

:error_pause
echo.
echo Press any key to exit...
pause >nul

:end
