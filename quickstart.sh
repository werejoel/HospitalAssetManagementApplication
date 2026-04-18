#!/bin/bash
# Quick Start Script for MRRH Asset Management System

echo "=========================================="
echo "MRRH Asset Management System - Quick Start"
echo "=========================================="
echo ""

# Check prerequisites
echo " Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo " Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo " npm is not installed. Please install npm."
    exit 1
fi

echo " npm $(npm --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not in PATH. Please ensure PostgreSQL is installed and in your PATH."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ PostgreSQL is installed"
fi

echo ""
echo "=========================================="
echo "Installing Backend Dependencies"
echo "=========================================="

cd Back_end
echo "📦 Installing Backend packages..."
npm install

if [ $? -ne 0 ]; then
    echo "Backend installation failed"
    exit 1
fi

echo "✓ Backend dependencies installed"

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo ".env file not found in Back_end/"
    echo "Please create .env file with the following content:"
    echo ""
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_USER=postgres"
    echo "DB_PASSWORD=your_password"
    echo "DB_NAME=mbale_asset_management_db"
    echo "PORT=5000"
    echo "JWT_SECRET=mrrh_secret_key_here"
    echo "NODE_ENV=development"
    echo ""
    read -p "Press Enter after creating .env file..."
fi

cd ..

echo ""
echo "=========================================="
echo "Installing Frontend Dependencies"
echo "=========================================="

cd Front_end
echo "Installing Frontend packages..."
npm install

if [ $? -ne 0 ]; then
    echo "Frontend installation failed"
    exit 1
fi

echo "Frontend dependencies installed"

cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Ensure PostgreSQL is running"
echo ""
echo "2. Create and setup the database:"
echo "   createdb mbale_asset_management_db"
echo "   psql -U postgres -d mbale_asset_management_db -f Back_end/sql.sql"
echo ""
echo "3. Seed the database (optional but recommended):"
echo "   cd Back_end"
echo "   npm run seed"
echo ""
echo "4. Start the backend server:"
echo "   cd Back_end"
echo "   npm run dev"
echo ""
echo "5. In a new terminal, start the frontend:"
echo "   cd Front_end"
echo "   npm run dev"
echo ""
echo "6. Open http://localhost:5173 in your browser"
echo ""
echo "Test Credentials (after seeding):"
echo "   Admin: admin / admin123"
echo "   Manager: asset_manager / user123"
echo "   Technician: technician1 / user123"
echo ""
echo "For detailed setup guide, see: SETUP_GUIDE.md"
echo ""
