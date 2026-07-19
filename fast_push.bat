@echo off
title MannSetu AI - Fast Push
echo ========================================================
echo         MannSetu AI - Fast Git Push Helper
echo ========================================================
echo.

:: Stage all files
echo [INFO] Staging all changes...
git add .
if errorlevel 1 (
    echo [ERROR] Failed to stage changes.
    goto error_pause
)

:: Commit with a automatic timestamped message
echo [INFO] Committing changes...
git commit -m "Auto-update: %date% %time%"
:: We don't fail on commit error because it might just mean there is nothing to commit

:: Get current branch name
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "branch=%%i"
if "%branch%"=="" set "branch=main"

:: Push to current branch on GitHub
echo [INFO] Pushing changes to origin %branch%...
git push origin %branch%
if errorlevel 1 (
    echo.
    echo [ERROR] Push failed! Please check the error above.
    goto error_pause
)

echo.
echo [SUCCESS] Code pushed successfully to GitHub^!
echo Window will close in 3 seconds...
timeout /t 3 >nul
goto end

:error_pause
echo.
echo Press any key to exit...
pause >nul

:end
