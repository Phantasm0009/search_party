# 🚀 Deploy Search Party to DigitalOcean

This guide will help you deploy the Search Party app to a DigitalOcean droplet using DigitalOcean's web console.

## 🔧 Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Web Browser**: Access to DigitalOcean's console interface

## 🖥️ Step 1: Create DigitalOcean Droplet

1. **Log into DigitalOcean Console**:
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Click **"Create"** → **"Droplets"**

2. **Configure Your Droplet**:
   - **Image**: Choose **Ubuntu 22.04 LTS**
   - **Plan**: Select **Basic** (Minimum: $12/month - 2GB RAM, 1 vCPU, 50GB SSD)
   - **Region**: Choose closest to your users
   - **Authentication**: Select **SSH Keys** (recommended) or **Password**
   - **Hostname**: Enter a name like `search-party-app`

3. **Click "Create Droplet"** and wait for it to spin up (1-2 minutes)

4. **Note Your Droplet IP**: Copy the public IP address from the droplets list

## � Step 2: Deploy Using DigitalOcean Console

### Method 1: One-Click Console Deployment (Easiest)

1. **Open Console**:
   - In DigitalOcean dashboard, click your droplet name
   - Click **"Console"** button (top right)
   - Wait for console to load

2. **Login**: 
   - Login as `root` (or your configured user)
   - If using password, enter the password you set

3. **Run Deployment Command**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/Phantasm0009/search_party/main/deploy-github.sh | bash
   ```

4. **Follow Prompts**:
   - Press `y` when asked to continue
   - Wait for deployment to complete (5-10 minutes)

5. **Access Your App**:
   - Open browser to `http://YOUR_DROPLET_IP:5000`
   - Your Search Party app is now live! 🎉

### Method 2: Manual Console Deployment

If you prefer step-by-step control:

1. **Open DigitalOcean Console** (as above)

2. **Update System**:
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Install Docker Compose**:
   ```bash
   apt install docker-compose git -y
   ```

5. **Clone Repository**:
   ```bash
   cd /opt
   git clone https://github.com/Phantasm0009/search_party.git
   cd search_party
   ```

6. **Build and Start**:
   ```bash
   docker-compose up -d --build
   ```

7. **Check Status**:
   ```bash
   docker-compose ps
   docker-compose logs search-party
   ```

## 🌐 Step 3: Access Your Application

After successful deployment:

1. **Open Your Browser**:
   - Navigate to `http://YOUR_DROPLET_IP:5000`
   - Replace `YOUR_DROPLET_IP` with your actual droplet IP
   - **Important**: Use `http://` (not `https://`) for initial access

2. **Test the App**:
   - You should see the Search Party homepage
   - Create a room and test the functionality
   - Health check available at `http://YOUR_DROPLET_IP:5000/health`

3. **Troubleshoot SSL Errors** (if you see SSL/HTTPS errors):
   - **Clear Browser Cache**: Press `Ctrl+F5` to hard refresh
   - **Check URL**: Ensure you're using `http://` not `https://`
   - **Disable HTTPS-Everywhere**: Some browser extensions force HTTPS
   - **Try Incognito Mode**: This bypasses many browser security features

4. **Share Your App**:
   - Send the URL to team members: `http://YOUR_DROPLET_IP:5000`
   - Everyone can now collaborate in real-time!

### 🔧 Common Access Issues

**Problem**: SSL Protocol Errors or "Failed to load resource" errors
**Solution**: 
```bash
# Open DigitalOcean Console and run:
cd /opt/search_party
docker-compose logs search-party

# Check if app is actually running:
docker-compose ps

# If container is stopped, restart it:
docker-compose up -d
```

**Problem**: Page won't load at all
**Solution**:
- Verify port 5000 is open in DigitalOcean Firewall
- Check if Docker container is running via console
- Try accessing the health endpoint: `http://YOUR_IP:5000/health`

## ⚙️ Step 4: Environment Configuration (Optional)

The app comes with sensible defaults, but you can customize it using the DigitalOcean console:

1. **Open Console** and navigate to your app directory:
   ```bash
   cd /opt/search_party
   ```

2. **View Current Settings**:
   ```bash
   cat .env.production
   ```

3. **Edit Configuration** (if needed):
   ```bash
   nano .env
   ```

4. **Key Settings Available**:
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

5. **Apply Changes**:
   ```bash
   docker-compose restart
   ```

## 🔄 Step 5: Updating Your App

When updates are available, use the DigitalOcean console:

1. **Open Console** and navigate to app directory:
   ```bash
   cd /opt/search_party
   ```

2. **Pull Latest Updates**:
   ```bash
   git pull origin main
   ```

3. **Rebuild and Restart**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

4. **Clean Up Old Images**:
   ```bash
   docker system prune -f
   ```

## � Step 6: Monitoring Your App

### Check Application Status (via Console)

1. **Container Status**:
   ```bash
   docker-compose ps
   ```

2. **View Application Logs**:
   ```bash
   docker-compose logs -f search-party
   ```

3. **Check Resource Usage**:
   ```bash
   docker stats
   ```

4. **System Resources**:
   ```bash
   htop
   ```

### Using DigitalOcean Monitoring

1. **Enable Monitoring**:
   - In your droplet dashboard, click **"Monitoring"**
   - Enable detailed monitoring for CPU, memory, disk, and network

2. **Set Up Alerts**:
   - Click **"Alerting"** in DigitalOcean dashboard
   - Create alerts for high CPU, memory usage, or downtime

3. **View Graphs**:
   - Monitor your app's performance directly in DigitalOcean console
   - Set up email notifications for issues

## 🔒 Step 7: Security Setup (Optional but Recommended)

### Fix SSL/HTTPS Issues First

If you're experiencing SSL errors, here's how to resolve them:

1. **Open DigitalOcean Console** and check your app:
   ```bash
   cd /opt/search_party
   
   # Check if app is running properly
   docker-compose ps
   docker-compose logs search-party
   
   # Test the health endpoint
   curl http://localhost:5000/health
   ```

2. **Common SSL Error Fixes**:
   ```bash
   # If you see CORS or SSL errors, rebuild with correct settings:
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Option A: Use HTTP Only (Simplest)

For testing and internal use, HTTP is sufficient:

1. **Configure App for HTTP Only**:
   ```bash
   cd /opt/search_party
   echo "FORCE_HTTPS=false" >> .env
   docker-compose restart
   ```

2. **Access via HTTP**:
   - Always use `http://YOUR_DROPLET_IP:5000`
   - Share HTTP links with team members
   - Suitable for internal/testing use

### Option B: Setup HTTPS with Domain (Production)

For production use with a custom domain:

1. **Get a Domain Name**:
   - Purchase a domain (e.g., from Namecheap, GoDaddy)
   - Point it to your droplet IP in DNS settings

2. **Add Domain to DigitalOcean**:
   - Go to **"Networking"** → **"Domains"** in DigitalOcean dashboard
   - Add your domain and point it to your droplet IP

3. **Setup SSL via Console**:
   ```bash
   # Install Certbot and Nginx
   apt install certbot nginx -y
   
   # Stop the app temporarily
   cd /opt/search_party
   docker-compose down
   
   # Get SSL certificate
   certbot certonly --standalone -d yourdomain.com
   
   # Create Nginx config
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
   rm -f /etc/nginx/sites-enabled/default
   nginx -t && systemctl restart nginx
   
   # Start the app again
   docker-compose up -d
   ```

### Using DigitalOcean Firewall

1. **Create Firewall in DigitalOcean**:
   - Go to **"Networking"** → **"Firewalls"** in DigitalOcean dashboard
   - Click **"Create Firewall"**
   - Name it `search-party-firewall`

2. **Configure Inbound Rules**:
   ```
   Type: SSH, Protocol: TCP, Port: 22, Sources: All IPv4, All IPv6
   Type: HTTP, Protocol: TCP, Port: 80, Sources: All IPv4, All IPv6
   Type: HTTPS, Protocol: TCP, Port: 443, Sources: All IPv4, All IPv6
   Type: Custom, Protocol: TCP, Port: 5000, Sources: All IPv4, All IPv6
   ```

3. **Apply to Droplet**:
   - In the **"Droplets"** section, select your droplet
   - Click **"Apply to Droplets"**

### Using Console for UFW (Alternative)

If you prefer command-line firewall setup:

1. **Open DigitalOcean Console**:
   ```bash
   # Configure UFW firewall
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow ssh
   ufw allow 80
   ufw allow 443
   ufw allow 5000
   ufw enable
   ```

## 🐛 Troubleshooting

### SSL and HTTPS Issues

**Problem**: `ERR_SSL_PROTOCOL_ERROR` or `Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR`
**Cause**: Browser trying to access HTTPS when server only provides HTTP
**Solutions**:
1. **Use HTTP URLs**: Always access via `http://YOUR_IP:5000` (not `https://`)
2. **Clear Browser Cache**: Press `Ctrl+F5` or `Cmd+Shift+R`
3. **Disable HTTPS Everywhere**: Turn off browser extensions that force HTTPS
4. **Try Incognito/Private Mode**: Bypasses many browser security settings
5. **Check Console Logs**:
   ```bash
   cd /opt/search_party
   docker-compose logs search-party
   ```

**Problem**: `Cross-Origin-Opener-Policy header has been ignored`
**Solution**: This is a warning, not an error. Your app should still work.

**Problem**: `Origin-Agent-Cluster` warnings
**Solution**: These are browser security warnings, app functionality shouldn't be affected.

### Common Application Issues

**1. Can't Access App on Port 5000**
- **Check in DigitalOcean Console**:
  ```bash
  docker-compose ps
  docker-compose logs search-party
  ```
- **Verify Firewall**: Ensure port 5000 is open in DigitalOcean Firewall settings
- **Test Health Endpoint**: Try `http://YOUR_IP:5000/health`

**2. Container Won't Start**
- **Check in Console**:
  ```bash
  docker-compose logs
  docker system df  # Check disk space
  free -h  # Check memory
  ```

**3. Build Fails with NPM Errors**
- **Fix via Console**:
  ```bash
  cd /opt/search_party
  rm -rf client/node_modules server/node_modules
  rm -f client/package-lock.json server/package-lock.json
  git pull origin main
  docker-compose build --no-cache
  docker-compose up -d
  ```

**4. App Loads but Features Don't Work**
- **Check WebSocket Connection**:
  ```bash
  # In browser dev tools console, check for WebSocket errors
  # Should see connection to ws://YOUR_IP:5000
  ```
- **Restart Application**:
  ```bash
  docker-compose restart search-party
  ```

**5. Resource Loading Errors**
- **Mixed Content Issues**: Ensure all URLs use HTTP when server is HTTP-only
- **CORS Errors**: Check server logs for CORS configuration issues
- **Static File Issues**: Rebuild frontend:
  ```bash
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
  ```

### Debug Commands (via Console)

```bash
# Enter running container
docker-compose exec search-party sh

# Check container logs in real-time
docker-compose logs -f search-party

# Restart specific service
docker-compose restart search-party

# Complete rebuild (fixes most issues)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check system resources
df -h  # Disk space
free -h  # Memory usage
docker stats  # Container resource usage

# Test network connectivity
curl http://localhost:5000/health
netstat -tlnp | grep 5000
```

### Browser-Specific Issues

**Chrome/Edge**:
- Disable "Secure DNS" in settings
- Clear site data: Developer Tools → Application → Storage → Clear site data

**Firefox**:
- Disable "HTTPS-Only Mode" in settings
- Clear cookies and site data for the domain

**Safari**:
- Disable "Fraudulent website warning"
- Allow insecure content in developer menu

### Network and Firewall Issues

**Problem**: Can't access from external networks
**Solutions**:
1. **Check DigitalOcean Firewall**: Ensure port 5000 is open to all sources
2. **Check UFW Status**: `ufw status` in console
3. **Verify Container Binding**: 
   ```bash
   docker-compose ps
   # Should show 0.0.0.0:5000->5000/tcp
   ```

**Problem**: Works locally but not remotely
**Solution**: Check if the server is binding to localhost only:
```bash
netstat -tlnp | grep 5000
# Should show 0.0.0.0:5000, not 127.0.0.1:5000
```

### Getting Help

1. **Check Container Logs**: Always start with `docker-compose logs`
2. **DigitalOcean Support**: Use the support ticket system
3. **Community**: Check DigitalOcean Community forums
4. **App Logs**: Monitor real-time logs via console

## 💡 Tips for Success

### Performance Optimization

1. **Upgrade Droplet Size**:
   - If traffic increases, resize droplet in DigitalOcean dashboard
   - **Droplets** → Select droplet → **"Resize"**

2. **Add DigitalOcean Load Balancer**:
   - For high traffic, add a load balancer
   - **Networking** → **"Load Balancers"** → **"Create"**

3. **Use DigitalOcean Spaces**:
   - For file storage, integrate DigitalOcean Spaces
   - More cost-effective than local storage

### Monitoring & Maintenance

1. **Set Up Monitoring Alerts**:
   - **Monitoring** → **"Alerting"** in DigitalOcean dashboard
   - Monitor CPU, memory, disk usage

2. **Regular Updates**:
   - Check for app updates monthly
   - Run `docker system prune -f` weekly to clean up

3. **Backup Strategy**:
   - Use DigitalOcean Snapshots for full backups
   - **Droplets** → Select droplet → **"Snapshots"**

### Cost Optimization

1. **Right-Size Your Droplet**:
   - Start with $12/month (2GB RAM)
   - Monitor usage and scale as needed

2. **Use DigitalOcean Monitoring**:
   - Identify resource usage patterns
   - Downsize if consistently underutilized

## 🎯 Next Steps

### After Successful Deployment

1. **Test All Features**:
   - Create rooms and invite team members
   - Test search functionality
   - Verify real-time collaboration works

2. **Share Your App**:
   - Send `http://YOUR_DROPLET_IP:5000` to users
   - Consider setting up a custom domain

3. **Optional Enhancements**:
   - Set up SSL certificate for HTTPS
   - Configure Google Search API for real search results
   - Add database for persistent data storage

### Scaling Your App

1. **Multiple Droplets**: Deploy across multiple regions
2. **Database**: Add managed PostgreSQL or MongoDB
3. **CDN**: Use DigitalOcean Spaces + CDN for static assets
4. **Monitoring**: Implement comprehensive logging and monitoring

---

## 🆘 Support & Resources

- **DigitalOcean Documentation**: [docs.digitalocean.com](https://docs.digitalocean.com)
- **DigitalOcean Community**: [community.digitalocean.com](https://community.digitalocean.com)
- **Project Repository**: [github.com/Phantasm0009/search_party](https://github.com/Phantasm0009/search_party)
- **DigitalOcean Support**: Available via dashboard ticket system

---

**🎉 Congratulations! Your Search Party app is now live and accessible worldwide via DigitalOcean!**

*The app provides collaborative search capabilities, real-time shared browsing, and team chat functionality - all running on your own DigitalOcean infrastructure.*
