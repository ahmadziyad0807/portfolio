@echo off
echo Deploying ONLY the frontend to Vercel (avoiding monorepo issues)...
echo.

echo Step 1: Navigate to frontend directory...
cd packages\frontend

echo Step 2: Install frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Frontend install failed!
    pause
    exit /b 1
)

echo Step 3: Build frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo Step 4: Deploy frontend to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo Vercel deployment failed!
    pause
    exit /b 1
)

echo.
echo ✅ Frontend deployed successfully!
echo.
echo Note: This deploys ONLY the frontend directory,
echo avoiding all monorepo/workspace issues.
pause