#!/bin/bash

# Web Proxy Application Startup Script
# This script starts both the proxy server and Next.js frontend

echo "🚀 Starting Web Proxy Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the proxy server in the background
echo -e "${BLUE}📡 Starting Proxy Server on port 3001...${NC}"
npm run proxy &
PROXY_PID=$!

# Wait a bit for the proxy server to start
sleep 2

# Start the Next.js frontend
echo -e "${GREEN}🌐 Starting Next.js Frontend on port 3000...${NC}"
echo ""
npm run dev

# If Next.js exits, kill the proxy server
kill $PROXY_PID 2>/dev/null
