#!/bin/bash

# MoveIt Setup Script
# This script helps you set up the MoveIt project

set -e

echo "🚀 MoveIt Setup Script"
echo "====================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists sui; then
    echo -e "${RED}❌ Sui CLI not found. Please install: https://docs.sui.io/guides/developer/getting-started/sui-install${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Sui CLI found${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install: https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found ($(node --version))${NC}"

if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. You'll need it for the indexer.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

echo ""

# Step 2: Get deployment info
echo "📝 Configuration"
echo "================"
echo ""

read -p "Have you already deployed the smart contract? (y/n): " deployed

if [ "$deployed" != "y" ]; then
    echo ""
    echo "Please deploy the contract first:"
    echo "  cd contract/moveit"
    echo "  sui move build"
    echo "  sui client publish --gas-budget 100000000"
    echo ""
    echo "Then run this script again."
    exit 0
fi

echo ""
read -p "Enter your PACKAGE_ID: " package_id
read -p "Enter your ADMIN_CAP_ID: " admin_cap_id

if [ -z "$package_id" ] || [ -z "$admin_cap_id" ]; then
    echo -e "${RED}❌ Package ID and Admin Cap ID are required${NC}"
    exit 1
fi

echo ""
read -p "Enter your PostgreSQL database URL (e.g., postgresql://postgres:password@localhost:5432/moveit_indexer): " database_url

if [ -z "$database_url" ]; then
    echo -e "${RED}❌ Database URL is required for the indexer${NC}"
    exit 1
fi

echo ""
read -p "Which network are you using? (testnet/devnet/mainnet) [testnet]: " network
network=${network:-testnet}

# Step 3: Set up indexer
echo ""
echo "🔧 Setting up indexer..."
echo "========================"

cd indexer-ts

# Create .env file
cat > .env << EOF
NETWORK=$network
PACKAGE_ID=$package_id
DATABASE_URL=$database_url
POLLING_INTERVAL_MS=5000
PORT=3001
NODE_ENV=development
EOF

echo -e "${GREEN}✅ Created indexer/.env${NC}"

# Install dependencies
echo "📦 Installing indexer dependencies..."
npm install

# Set up database
echo "🗄️  Setting up database..."
npm run db:setup:dev

echo -e "${GREEN}✅ Indexer setup complete${NC}"

# Step 4: Set up dApp
echo ""
echo "🔧 Setting up dApp..."
echo "====================="

cd ../dapp/sui-tasks

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_NETWORK=$network
NEXT_PUBLIC_PACKAGE_ID=$package_id
NEXT_PUBLIC_ADMIN_CAP_ID=$admin_cap_id
NEXT_PUBLIC_CLOCK_ID=0x6
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
NEXT_PUBLIC_EXPLORER_URL=https://suiexplorer.com/?network=$network
EOF

echo -e "${GREEN}✅ Created dapp/.env.local${NC}"

# Install dependencies
echo "📦 Installing dApp dependencies..."
npm install

echo -e "${GREEN}✅ dApp setup complete${NC}"

# Step 5: Instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the indexer (in one terminal):"
echo "   cd indexer-ts"
echo "   npm run indexer         # Event listener"
echo ""
echo "2. Start the API server (in another terminal):"
echo "   cd indexer-ts"
echo "   npm run api:dev         # REST API"
echo ""
echo "3. Start the dApp (in another terminal):"
echo "   cd dapp/sui-tasks"
echo "   npm run dev             # Frontend"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - Integration Guide: INTEGRATION_GUIDE.md"
echo "   - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}"
