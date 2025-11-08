#!/bin/bash

# HostHelper Setup Script
# This script helps you set up the HostHelper project quickly

set -e

echo "🏠 HostHelper - Setup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. You have $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check if Python is installed
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Python 3 not found. Python service will not be available.${NC}"
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠ Firebase CLI not found.${NC}"
    echo "Install with: npm install -g firebase-tools"
else
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install Firebase Functions dependencies
echo ""
echo "Installing Firebase Functions dependencies..."
cd firebase/functions
npm install
cd ../..

# Python setup
if command -v python3 &> /dev/null; then
    echo ""
    echo "Setting up Python service..."
    cd python-services/booking-processor

    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate and install dependencies
    echo "Installing Python dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    deactivate
    cd ../..
    echo -e "${GREEN}✓ Python service ready${NC}"
fi

# Check for .env file
echo ""
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ No .env file found${NC}"
    echo "Creating .env from template..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env with your Firebase credentials${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Summary
echo ""
echo "=============================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=============================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Firebase:"
echo "   ${BLUE}firebase login${NC}"
echo "   ${BLUE}firebase init${NC}"
echo ""
echo "2. Update .env file with your Firebase credentials"
echo ""
echo "3. Start development servers:"
echo ""
echo "   Frontend (Terminal 1):"
echo "   ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "   Python Service (Terminal 2 - optional):"
echo "   ${BLUE}cd python-services/booking-processor${NC}"
echo "   ${BLUE}source venv/bin/activate${NC}"
echo "   ${BLUE}python main.py${NC}"
echo ""
echo "   Firebase Emulators (Terminal 3 - optional):"
echo "   ${BLUE}firebase emulators:start${NC}"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - QUICKSTART.md - Quick setup guide"
echo "   - PROJECT_SUMMARY.md - What's been built"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
