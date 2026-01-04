#!/bin/bash

# GitHub Repository Initialization Script for Ahmad Ziyad Portfolio

echo "🚀 Initializing GitHub repository for Ahmad Ziyad Portfolio..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. You'll need to create the repository manually."
    echo "   Visit: https://github.com/new"
    MANUAL_SETUP=true
else
    MANUAL_SETUP=false
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/packages/*/build/
/packages/*/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Docker
.docker/

# Temporary folders
tmp/
temp/

# Storybook build outputs
storybook-static/

# Performance audit files
performance-audit.json

# Vercel
.vercel
EOF
fi

# Add all files to git
echo "📦 Adding files to Git..."
git add .

# Create initial commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Creating initial commit..."
    git commit -m "🎉 Initial commit: Ahmad Ziyad Professional Portfolio

✨ Features:
- Modern AI-themed portfolio design
- Interactive tabs (Skills, Experience, Projects, Certifications, Contact)
- Floating AI chat widget
- Real professional certifications
- Responsive design with glass morphism effects
- Performance optimized React application

🚀 Ready for deployment to Vercel, Netlify, or GitHub Pages"
fi

# Create GitHub repository if GitHub CLI is available
if [ "$MANUAL_SETUP" = false ]; then
    echo "🌐 Creating GitHub repository..."
    
    read -p "Enter repository name (default: ahmad-ziyad-portfolio): " REPO_NAME
    REPO_NAME=${REPO_NAME:-ahmad-ziyad-portfolio}
    
    read -p "Make repository public? (y/N): " IS_PUBLIC
    if [[ $IS_PUBLIC =~ ^[Yy]$ ]]; then
        VISIBILITY="--public"
    else
        VISIBILITY="--private"
    fi
    
    # Create repository
    gh repo create "$REPO_NAME" $VISIBILITY --description "Professional portfolio showcasing skills, experience, and projects with modern AI-themed design" --clone=false
    
    # Add remote origin
    git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git"
    
    # Push to GitHub
    echo "⬆️  Pushing to GitHub..."
    git push -u origin main
    
    echo "✅ Repository created successfully!"
    echo "🌐 Repository URL: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
    
else
    echo "📋 Manual setup required:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'ahmad-ziyad-portfolio'"
    echo "3. Don't initialize with README (we already have files)"
    echo "4. After creating, run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/ahmad-ziyad-portfolio.git"
    echo "   git push -u origin main"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "📋 Deployment Options:"
echo "1. 🚀 Vercel (Recommended):"
echo "   - Visit https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'packages/frontend'"
echo "   - Deploy automatically"
echo ""
echo "2. 🌐 Netlify:"
echo "   - Visit https://netlify.com"
echo "   - Deploy from Git"
echo "   - Base directory: packages/frontend"
echo "   - Build command: npm run build"
echo ""
echo "3. 📄 GitHub Pages:"
echo "   - Enable in repository Settings → Pages"
echo "   - Use the provided GitHub Actions workflow"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎨 Customization:"
echo "- Update profile data in packages/frontend/src/data/sampleProfile.ts"
echo "- Modify theme colors in packages/frontend/src/styles/aiTheme.ts"
echo "- Add your certifications and projects"
echo ""
echo "✨ Your portfolio is ready to go live!"