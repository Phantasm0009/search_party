#!/bin/bash

# GitHub-based deployment script for Search Party
# This script can be run on the DigitalOcean droplet

echo "🚀 Starting GitHub deployment for Search Party..."

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Set variables
REPO_URL="https://github.com/Phantasm0009/search_party.git"
APP_DIR="/opt/search_party"
BACKUP_DIR="/opt/search_party_backup_$(date +%Y%m%d_%H%M%S)"

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Update system
    apt update && apt upgrade -y
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        apt install docker-compose -y
    fi
    
    # Install Git if not present
    if ! command -v git &> /dev/null; then
        echo "Installing Git..."
        apt install git -y
    fi
    
    echo "✅ Dependencies installed"
}

# Function to backup existing installation
backup_existing() {
    if [ -d "$APP_DIR" ]; then
        echo "📋 Backing up existing installation..."
        cp -r "$APP_DIR" "$BACKUP_DIR"
        echo "✅ Backup created at $BACKUP_DIR"
    fi
}

# Function to deploy application
deploy_app() {
    echo "📥 Cloning/updating repository..."
    
    if [ -d "$APP_DIR" ]; then
        # Update existing repository
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/main
        git clean -fd
    else
        # Clone new repository
        cd /opt
        git clone "$REPO_URL" search_party
        cd "$APP_DIR"
    fi
    
    # Setup environment
    echo "⚙️ Setting up environment..."
    if [ ! -f ".env" ]; then
        cp .env.production .env
        echo "📝 Created .env file from template"
        echo "⚠️  You may want to edit .env with: nano .env"
    fi
    
    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Clean up potential lock file issues
    echo "🧹 Cleaning up node_modules..."
    rm -rf client/node_modules server/node_modules client/package-lock.json server/package-lock.json 2>/dev/null || true
    
    # Build and start new containers
    echo "🏗️ Building and starting containers..."
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for containers to start
    echo "⏳ Waiting for containers to start..."
    sleep 10
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Deployment successful!"
        echo ""
        echo "🌐 Your app is available at: http://$(curl -s ifconfig.me):5000"
        echo "🏥 Health check: http://$(curl -s ifconfig.me):5000/api/health"
        echo ""
        echo "📊 Container status:"
        docker-compose ps
    else
        echo "❌ Deployment failed. Check logs:"
        docker-compose logs
        exit 1
    fi
}

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    docker system prune -f >/dev/null 2>&1
}

# Main execution
echo "🎯 Target directory: $APP_DIR"
echo "📦 Repository: $REPO_URL"
echo ""

# Ask for confirmation
read -p "🤔 Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Execute deployment steps
install_dependencies
backup_existing
deploy_app
cleanup

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 To update in the future, run this script again or:"
echo "   cd $APP_DIR"
echo "   git pull origin main"
echo "   docker-compose down && docker-compose up -d --build"
