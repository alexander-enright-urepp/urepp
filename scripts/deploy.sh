#!/bin/bash

echo "🚀 UREPP Deployment Script"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the urepp directory"
    echo "   cd ~/.openclaw/workspace/urepp"
    exit 1
fi

echo "Step 1: Checking dependencies..."
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Install it first."
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Dependencies OK"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "Step 2: Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - UREPP"
    echo "✅ Git initialized"
else
    echo "Step 2: Git already initialized"
fi
echo ""

# Check for remote
echo "Step 3: Checking GitHub remote..."
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  No GitHub remote found"
    echo ""
    echo "Create a GitHub repo first:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Name it 'urepp'"
    echo "   3. Don't initialize with README"
    echo ""
    read -p "Enter your GitHub username: " username
    git remote add origin "https://github.com/$username/urepp.git"
    git branch -M main
    git push -u origin main
    echo "✅ Pushed to GitHub"
else
    echo "✅ GitHub remote exists"
    git push
fi
echo ""

# Deploy to Vercel
echo "Step 4: Deploying to Vercel..."
echo ""

if [ ! -f ".vercel/project.json" ]; then
    echo "First time setup - linking to Vercel..."
    vercel
else
    echo "Deploying..."
    vercel --prod
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "   1. Check your Vercel dashboard"
echo "   2. Add environment variables (SUPABASE_URL, etc.)"
echo "   3. Run: vercel --prod again"
echo ""
