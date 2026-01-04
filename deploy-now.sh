#!/bin/bash

# Quick Deploy Script for Ahmad Ziyad Portfolio
# This script will prepare and deploy your portfolio in minutes

echo "🚀 Ahmad Ziyad Portfolio - Quick Deploy"
echo "======================================"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo ""
echo "🔨 Building the portfolio..."
npm run build:frontend

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:frontend

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but continuing with deployment..."
else
    echo "✅ All tests passed"
fi

echo ""
echo "🎉 Your portfolio is ready for deployment!"
echo ""
echo "📋 Choose your deployment option:"
echo ""
echo "1. 🚀 Vercel (Recommended - Easiest)"
echo "   • Go to https://vercel.com"
echo "   • Sign up with GitHub"
echo "   • Click 'New Project'"
echo "   • Import this repository"
echo "   • Set root directory to 'packages/frontend'"
echo "   • Deploy!"
echo ""
echo "2. 🌐 Netlify (Alternative)"
echo "   • Go to https://netlify.com"
echo "   • Drag and drop the 'packages/frontend/build' folder"
echo "   • Or connect to GitHub for automatic deployments"
echo ""
echo "3. 📄 GitHub Pages"
echo "   • Push this code to GitHub"
echo "   • Enable Pages in repository settings"
echo "   • Use the provided GitHub Actions workflow"
echo ""
echo "📁 Build files are ready in: packages/frontend/build/"
echo ""
echo "🔗 Next steps:"
echo "   1. Push your code to GitHub (if not done already)"
echo "   2. Choose a deployment platform above"
echo "   3. Follow the platform-specific instructions"
echo "   4. Share your live portfolio link!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "📋 Use CHECKLIST.md to ensure everything is configured"
echo ""
echo "✨ Good luck with your portfolio deployment!"