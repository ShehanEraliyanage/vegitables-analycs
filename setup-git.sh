#!/bin/bash

# GitHub Setup Script for Vegetables Analytics Platform

echo "🚀 Setting up Git repository..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repository
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already initialized"
fi

# Check for .env files that shouldn't be committed
echo "🔍 Checking for sensitive files..."
if [ -f backend/.env ] || [ -f frontend/.env ]; then
    echo "⚠️  Warning: .env files found. Make sure they are in .gitignore"
    echo "   These files contain sensitive credentials and should NOT be committed!"
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Check what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "1. Create a repository on GitHub: https://github.com/new"
echo "2. Run these commands:"
echo ""
echo "   git commit -m 'Initial commit: Vegetables Analytics Platform'"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "⚠️  IMPORTANT: Make sure .env files are NOT committed!"
echo "   Check with: git status"

