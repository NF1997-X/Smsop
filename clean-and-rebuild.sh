#!/bin/bash

echo "🧹 Cleaning all caches and rebuilding..."

# Stop any running dev server
echo "⏹️  Stopping dev server (if running)..."
pkill -f "vite" 2>/dev/null || true

# Clean Vite cache
echo "🗑️  Removing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite

# Clean dist
echo "🗑️  Removing dist..."
rm -rf dist

# Clean node_modules (optional but recommended for hooks errors)
echo "🗑️  Removing node_modules..."
rm -rf node_modules

# Clear npm cache
echo "🧼 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ All caches cleared and dependencies reinstalled!"
echo "🚀 You can now run: npm run dev"
