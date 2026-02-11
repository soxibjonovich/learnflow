#!/bin/bash
set -e

echo "🚀 LearnFlow Deployment Script for Raspberry Pi"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed successfully${NC}"
    echo -e "${YELLOW}Please log out and log back in for group changes to take effect${NC}"
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Installing Docker Compose..."
    sudo apt update
    sudo apt install -y docker-compose
    echo -e "${GREEN}✓ Docker Compose installed successfully${NC}"
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Build the Docker image
echo "🏗️  Building Docker image (this may take 5-15 minutes on Raspberry Pi)..."
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Start the application
echo "🎬 Starting LearnFlow..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ LearnFlow is now running${NC}"
else
    echo -e "${RED}❌ Failed to start LearnFlow${NC}"
    exit 1
fi

echo ""

# Get IP address
IP=$(hostname -I | awk '{print $1}')

echo "================================================"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo ""
echo "Access LearnFlow at:"
echo "  • Local:   http://localhost:3000"
echo "  • Network: http://$IP:3000"
echo ""
echo "Useful commands:"
echo "  • View logs:    docker-compose logs -f"
echo "  • Stop app:     docker-compose down"
echo "  • Restart app:  docker-compose restart"
echo "  • Check status: docker-compose ps"
echo "================================================"
