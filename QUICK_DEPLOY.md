# 🚀 Quick Deploy to DigitalOcean

## 1. Create DigitalOcean Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/droplets)
2. Click "Create Droplet"
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (2GB RAM minimum)
   - **Authentication**: SSH Key (recommended)
4. Click "Create Droplet"
5. Note your droplet's IP address

## 2. Setup Droplet

SSH into your droplet and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app directory
mkdir -p /opt/search-party
```

## 3. Deploy App

### Option A: PowerShell (Windows)
```powershell
# In your Search Party directory
.\deploy.ps1 -DropletIP YOUR_DROPLET_IP
```

### Option B: Manual Steps
```bash
# Build frontend
cd client && npm run build && cd ..

# Copy production environment
cp .env.production .env
# Edit .env with your values (optional)

# Build and save Docker image
docker build -t search-party .
docker save search-party:latest | gzip > search-party.tar.gz

# Upload to droplet (replace YOUR_DROPLET_IP)
scp search-party.tar.gz docker-compose.yml .env root@YOUR_DROPLET_IP:/opt/search-party/

# Deploy on droplet
ssh root@YOUR_DROPLET_IP "cd /opt/search-party && docker load < search-party.tar.gz && docker-compose up -d"
```

## 4. Access Your App

🌐 **Your app is now live at**: `http://YOUR_DROPLET_IP:5000`

## 5. Verify Deployment

```bash
# Check status
ssh root@YOUR_DROPLET_IP "docker-compose ps"

# View logs
ssh root@YOUR_DROPLET_IP "docker-compose logs -f"
```

## 🔧 Troubleshooting

- **Can't access app**: Check firewall with `ufw status`
- **Container not running**: Check logs with `docker-compose logs`
- **Build fails**: Ensure you have enough disk space

## 🎉 Done!

Your Search Party app is now live and accessible worldwide!

Share the URL with your team: `http://YOUR_DROPLET_IP:5000`
