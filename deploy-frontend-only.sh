#!/bin/bash

echo "Deploying ONLY the frontend to Vercel (avoiding monorepo issues)..."
echo

echo "Step 1: Navigate to frontend directory..."
cd packages/frontend

echo "Step 2: Install frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Frontend install failed!"
    exit 1
fi

echo "Step 3: Build frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

echo "Step 4: Deploy frontend to Vercel..."
vercel --prod
if [ $? -ne 0 ]; then
    echo "Vercel deployment failed!"
    exit 1
fi

echo
echo "✅ Frontend deployed successfully!"
echo
echo "Note: This deploys ONLY the frontend directory,"
echo "avoiding all monorepo/workspace issues."