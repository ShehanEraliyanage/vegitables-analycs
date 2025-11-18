# GitHub Setup Guide

Follow these steps to push your code to GitHub:

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `vegetables-analytics` (or your preferred name)
3. Description: "Sri Lankan Vegetable & Fruit Price Analytics Platform"
4. Choose **Private** repository
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

## Step 2: Initialize and Push Code

Run these commands in your project root:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Check what will be committed (make sure .env files are NOT listed)
git status

# Create initial commit
git commit -m "Initial commit: Vegetables Analytics Platform"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository
2. Check that:
   - ✅ All source code files are present
   - ✅ `.env` files are NOT visible (they're ignored)
   - ✅ `node_modules` folders are NOT present
   - ✅ README.md is visible

## Important Security Notes

⚠️ **Never commit these files:**
- `.env` files (contain database passwords)
- `node_modules/` folders
- `.env.local`, `.env.production` files
- Any files with sensitive credentials

The `.gitignore` file is configured to prevent these from being committed.

## Quick Setup Script

You can also use the provided script:

```bash
./setup-git.sh
```

Then follow the instructions it provides.

## Future Updates

To push changes:

```bash
git add .
git commit -m "Your descriptive commit message"
git push
```
