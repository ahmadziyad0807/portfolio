@echo off
REM GitHub Repository Initialization Script for Ahmad Ziyad Portfolio (Windows)

echo 🚀 Initializing GitHub repository for Ahmad Ziyad Portfolio...

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if GitHub CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  GitHub CLI not found. You'll need to create the repository manually.
    echo    Visit: https://github.com/new
    set MANUAL_SETUP=true
) else (
    set MANUAL_SETUP=false
)

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    git branch -M main
) else (
    echo ✅ Git repository already initialized
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Production builds
        echo /packages/*/build/
        echo /packages/*/dist/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # IDE files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo.
        echo # Runtime data
        echo pids/
        echo *.pid
        echo *.seed
        echo *.pid.lock
        echo.
        echo # Coverage directory used by tools like istanbul
        echo coverage/
        echo.
        echo # Docker
        echo .docker/
        echo.
        echo # Temporary folders
        echo tmp/
        echo temp/
        echo.
        echo # Storybook build outputs
        echo storybook-static/
        echo.
        echo # Performance audit files
        echo performance-audit.json
        echo.
        echo # Vercel
        echo .vercel
    ) > .gitignore
)

REM Add all files to git
echo 📦 Adding files to Git...
git add .

REM Create initial commit
git diff --staged --quiet
if errorlevel 1 (
    echo 💾 Creating initial commit...
    git commit -m "🎉 Initial commit: Ahmad Ziyad Professional Portfolio

✨ Features:
- Modern AI-themed portfolio design
- Interactive tabs (Skills, Experience, Projects, Certifications, Contact)
- Floating AI chat widget
- Real professional certifications
- Responsive design with glass morphism effects
- Performance optimized React application

🚀 Ready for deployment to Vercel, Netlify, or GitHub Pages"
) else (
    echo ✅ No changes to commit
)

REM Manual setup instructions
echo.
echo 📋 Manual setup required:
echo 1. Go to https://github.com/new
echo 2. Create a new repository named 'ahmad-ziyad-portfolio'
echo 3. Don't initialize with README (we already have files)
echo 4. After creating, run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ahmad-ziyad-portfolio.git
echo    git push -u origin main
echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 📋 Deployment Options:
echo 1. 🚀 Vercel (Recommended):
echo    - Visit https://vercel.com
echo    - Import your GitHub repository
echo    - Set root directory to 'packages/frontend'
echo    - Deploy automatically
echo.
echo 2. 🌐 Netlify:
echo    - Visit https://netlify.com
echo    - Deploy from Git
echo    - Base directory: packages/frontend
echo    - Build command: npm run build
echo.
echo 3. 📄 GitHub Pages:
echo    - Enable in repository Settings → Pages
echo    - Use the provided GitHub Actions workflow
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.
echo 🎨 Customization:
echo - Update profile data in packages/frontend/src/data/sampleProfile.ts
echo - Modify theme colors in packages/frontend/src/styles/aiTheme.ts
echo - Add your certifications and projects
echo.
echo ✨ Your portfolio is ready to go live!
echo.
pause