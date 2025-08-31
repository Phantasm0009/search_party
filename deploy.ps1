# PowerShell deployment script for Search Party to DigitalOcean

param(
    [Parameter(Mandatory=$true)]
    [string]$DropletIP,
    
    [Parameter(Mandatory=$false)]
    [string]$SSHUser = "root"
)

Write-Host "🚀 Starting deployment to DigitalOcean..." -ForegroundColor Green

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Build the frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Push-Location "client"
try {
    npm run build
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Create production environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow
    Copy-Item ".env.production" ".env"
    Write-Host "⚠️  Please edit .env file with your production values" -ForegroundColor Yellow
    pause
}

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
try {
    docker build -t search-party:latest .
    Write-Host "✅ Docker image built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📤 Creating deployment package..." -ForegroundColor Yellow
docker save search-party:latest | gzip > search-party.tar.gz

# Upload files to droplet
Write-Host "⬆️  Uploading to DigitalOcean droplet..." -ForegroundColor Yellow
try {
    scp search-party.tar.gz docker-compose.yml .env "${SSHUser}@${DropletIP}:~/"
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Upload failed. Check your SSH connection" -ForegroundColor Red
    Remove-Item search-party.tar.gz -ErrorAction SilentlyContinue
    exit 1
}

# Deploy on droplet
Write-Host "🎯 Deploying on droplet..." -ForegroundColor Yellow
$deployScript = @"
# Load the Docker image
docker load < search-party.tar.gz

# Stop existing containers
docker-compose down 2>/dev/null || true

# Start new containers
docker-compose up -d

# Cleanup
rm search-party.tar.gz
docker system prune -f
"@

try {
    ssh "${SSHUser}@${DropletIP}" $deployScript
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
}

# Cleanup local files
Remove-Item search-party.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🌐 Your app should be available at: http://${DropletIP}:5000" -ForegroundColor Cyan
Write-Host "🏥 Health check: http://${DropletIP}:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check deployment status:" -ForegroundColor Yellow
Write-Host "ssh ${SSHUser}@${DropletIP} 'docker-compose ps && docker-compose logs --tail=20'" -ForegroundColor Gray
