@echo off
title MannSetu AI Github Pusher (Optimized)
setlocal enabledelayedexpansion

echo ========================================================
echo         MannSetu AI - Optimized Git Push Helper
echo ========================================================
echo.

:: Check if git repository is initialized
if not exist ".git" (
    echo [ERROR] This directory is not a git repository^!
    echo Please initialize git first.
    goto end
)


:: Git Status
echo [INFO] Current Git Status:
git status -s
echo.

:: Git Add
echo [INFO] Staging project changes...
git add .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to stage changes.
    goto end
)
echo [SUCCESS] Changes staged successfully.
echo.

:: Generate automatic commit message with date and time
set "commit_msg=Auto-update: %date% %time%"

:: Git Commit
echo [INFO] Committing changes with message: "!commit_msg!"
git commit -m "!commit_msg!"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Nothing to commit or commit failed.
)

:: Determine current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set "branch=%%i"
echo [INFO] Current branch is: %branch%

:: Verify remote origin URL and configure if missing or incorrect
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set "remote_url=%%i"

if "%remote_url%"=="" (
    echo [INFO] Remote 'origin' is not set. Adding remote origin...
    git remote add origin https://github.com/RajdipBankar-07/MannSetu-AI.git
) else (
    echo [INFO] Remote 'origin' is set to: %remote_url%
)

:: Push to remote
echo.
echo [INFO] Pushing changes to origin %branch%...
git push -u origin %branch%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to push changes to GitHub.
    echo Please check your internet connection or git authentication/permissions.
    echo.
    echo Press any key to exit...
    pause >nul
) else (
    echo.
    echo [SUCCESS] Code pushed successfully to GitHub^!
    echo.
    echo Window will close in 3 seconds...
    timeout /t 3 >nul
)

:end
