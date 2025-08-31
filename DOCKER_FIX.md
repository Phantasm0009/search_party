# Quick Fix for NPM Lock File Issue

## Current Error
The Docker build is failing because of a mismatch between `package.json` and `package-lock.json` files.

## Immediate Solution

Run these commands on your droplet:

```bash
# Navigate to your app directory
cd /opt/search_party

# Clean up any existing containers and images
docker-compose down
docker system prune -f

# Remove problematic lock files and node_modules
rm -rf client/node_modules server/node_modules
rm -f client/package-lock.json server/package-lock.json

# Pull latest updates (includes Dockerfile fixes)
git pull origin main

# Build with no cache to ensure clean build
docker-compose build --no-cache

# Start the application
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs search-party
```

## What Was Fixed

1. **Dockerfile Updated**: Changed from `npm ci` to `npm install` to handle lock file mismatches
2. **Frontend Build**: Now installs all dependencies (including dev) needed for React build
3. **Server Build**: Uses `npm install --only=production` for server dependencies

## Verification

After running the fix, your app should be available at:
- **App**: http://YOUR_DROPLET_IP:5000
- **Health**: http://YOUR_DROPLET_IP:5000/api/health

The build should complete successfully without npm errors.
