#!/bin/bash

# Deploy script for Search Party to DigitalOcean

echo "🚀 Starting deployment to DigitalOcean..."

# Check if required environment variables are set
if [ -z "$DO_DROPLET_IP" ]; then
    echo "❌ Error: DO_DROPLET_IP environment variable not set"
    echo "Please set your DigitalOcean droplet IP: export DO_DROPLET_IP=your.droplet.ip"
    exit 1
fi

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t search-party:latest .

# Create tarball of the image
echo "📤 Creating deployment package..."
docker save search-party:latest | gzip > search-party.tar.gz

# Upload to droplet
echo "⬆️ Uploading to DigitalOcean droplet..."
scp search-party.tar.gz docker-compose.yml root@$DO_DROPLET_IP:~/

# Deploy on droplet
echo "🎯 Deploying on droplet..."
ssh root@$DO_DROPLET_IP << 'EOF'
    # Load the Docker image
    docker load < search-party.tar.gz
    
    # Stop existing containers
    docker-compose down || true
    
    # Start new containers
    docker-compose up -d
    
    # Cleanup
    rm search-party.tar.gz
    docker system prune -f
EOF

# Cleanup local files
rm search-party.tar.gz

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: http://$DO_DROPLET_IP:5000"
