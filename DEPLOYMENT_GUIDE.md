# 🚀 Deploy Search Party to DigitalOcean

This guide will help you deploy the Search Party app to a DigitalOcean droplet.

## 🔧 Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Docker Installed Locally**: Download from [docker.com](https://docker.com)
3. **SSH Key Setup**: Configure SSH keys for your droplet access

## 🖥️ Create DigitalOcean Droplet

1. **Create a new droplet**:
   - Choose **Ubuntu 22.04 LTS**
   - Select **Basic plan** (2GB RAM, 1 vCPU minimum recommended)
   - Add your **SSH key**
   - Choose a datacenter region close to your users

2. **Initial droplet setup**:
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app directory
mkdir -p /opt/search-party
cd /opt/search-party
```

## 🔄 Deployment Methods

### Method 1: GitHub Repository Deployment (Recommended)

### Method 1: GitHub Repository Deployment (Recommended)

Deploy directly from the GitHub repository for the latest version:

**Option A: One-Command Deployment**
```bash
# SSH into droplet and run the deployment script
ssh root@YOUR_DROPLET_IP
curl -fsSL https://raw.githubusercontent.com/Phantasm0009/search_party/main/deploy-github.sh | bash
```

**Option B: Manual GitHub Deployment**
```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Install dependencies (if not already installed)
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
apt install docker-compose git -y

# Navigate to app directory
cd /opt

# Clone the repository
git clone https://github.com/Phantasm0009/search_party.git
cd search_party

# Create production environment file
cp .env.production .env
# Edit .env if needed: nano .env
```

```bash
# Build the application
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f search-party
```

**For updates:**
```bash
# Pull latest changes
cd /opt/search_party
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

### Method 2: Local Build and Upload

### Method 2: Local Build and Upload

If you want to build locally and upload to your droplet:

1. **Prepare your local environment**:
```bash
# In your Search Party project directory
npm run build  # Build the frontend

# Create production environment file
cp .env.production .env
# Edit .env with your production values
```

2. **Upload files to droplet**:
```bash
# Upload necessary files
scp Dockerfile docker-compose.yml .env root@YOUR_DROPLET_IP:/opt/search-party/
scp -r server/ root@YOUR_DROPLET_IP:/opt/search-party/
scp -r client/build/ root@YOUR_DROPLET_IP:/opt/search-party/public/
```

3. **Deploy on droplet**:
```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Navigate to app directory
cd /opt/search-party

# Build and run the application
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Method 3: Automated Deployment Script

1. **Set environment variable**:
```bash
export DO_DROPLET_IP=your.droplet.ip.address
```

2. **Run deployment script**:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🌐 Access Your App

After successful deployment:
- **App URL**: `http://YOUR_DROPLET_IP:5000`
- **Health Check**: `http://YOUR_DROPLET_IP:5000/api/health`

## ⚙️ Environment Configuration

The app includes a pre-configured `.env.production` file with sensible defaults. Key settings:

```bash
# Production configuration
NODE_ENV=production
PORT=5000

# Optional: Google Search API (app works without these)
GOOGLE_SEARCH_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# Optional: Database (currently uses in-memory storage)
MONGODB_URI=your-mongodb-connection-string

# Security
JWT_SECRET=your-secure-random-string
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**To customize your deployment:**
```bash
# Edit environment variables
cd /opt/search_party
nano .env

# Restart containers to apply changes
docker-compose restart
```

## 🔒 Security Setup (Optional but Recommended)

### 1. Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot nginx -y

# Get SSL certificate (replace with your domain)
certbot certonly --standalone -d yourdomain.com

# Create Nginx config for SSL proxy
cat > /etc/nginx/sites-available/search-party << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/search-party /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 2. Setup Firewall

```bash
# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## 📊 Monitoring & Maintenance

### Check Application Status
```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs -f search-party

# Check resource usage
docker stats

# Check system resources
htop
```

### Update Application
```bash
# Pull latest changes and rebuild
cd /opt/search-party
docker-compose down
docker-compose pull
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

### Backup Data (if using database)
```bash
# For MongoDB (when implemented)
docker exec search-party-db mongodump --out /backup

# For file-based backups
tar -czf search-party-backup-$(date +%Y%m%d).tar.gz /opt/search-party
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 not accessible**:
   - Check if firewall is blocking the port: `ufw status`
   - Verify container is running: `docker-compose ps`

2. **WebSocket connection issues**:
   - Check if container has proper networking: `docker network ls`
   - Verify logs for connection errors: `docker-compose logs`

3. **Container won't start**:
   - Check logs: `docker-compose logs`
   - Verify environment variables: `cat .env`
   - Check disk space: `df -h`

### Debug Commands
```bash
# Enter running container
docker-compose exec search-party sh

# Check container logs
docker-compose logs search-party

# Restart specific service
docker-compose restart search-party

# Rebuild from scratch (fixes package-lock issues)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# If build fails with npm ci errors, update lock files locally first:
# cd client && npm install && cd ../server && npm install && cd ..
# Then rebuild: docker-compose build --no-cache
```

### Common Build Issues

**NPM Lock File Mismatch**: If you see `npm ci` errors about package-lock.json sync:
```bash
# Option 1: Rebuild without cache
docker-compose build --no-cache

# Option 2: Update lock files locally first
cd /opt/search_party
rm -rf client/node_modules server/node_modules
cd client && npm install && cd ../server && npm install && cd ..
docker-compose build --no-cache
```

## 🎯 Performance Optimization

### For Higher Traffic

1. **Use a load balancer** (DigitalOcean Load Balancer)
2. **Add Redis for session storage**:
```yaml
# Add to docker-compose.yml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped
  
  search-party:
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
```

3. **Enable horizontal scaling**:
```bash
# Scale to multiple instances
docker-compose up -d --scale search-party=3
```

## 💡 Tips

- **Monitor resource usage** regularly with `htop` and `docker stats`
- **Set up automatic backups** for any persistent data
- **Use a domain name** instead of IP for better UX
- **Consider using DigitalOcean App Platform** for simpler deployment
- **Set up monitoring** with tools like DigitalOcean Monitoring

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs: `docker-compose logs`
3. Check DigitalOcean's status page for any service issues
4. Refer to the project's GitHub repository for known issues

---

**Your Search Party app should now be live and accessible worldwide! 🎉**
