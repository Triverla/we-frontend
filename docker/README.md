# Docker Configuration

This folder contains all Docker-related configuration files for the Woothomes application.

## Files

### Dockerfiles
- **`Dockerfile.npm-ignore-scripts`** - Production Dockerfile (used in CI/CD)
- **`Dockerfile.dev`** - Development Dockerfile
- **`Dockerfile.nginx`** - Nginx reverse proxy Dockerfile

### Docker Compose
- **`docker-compose.yml`** - Main Docker Compose configuration
- **`docker-compose.override.yml`** - Development overrides

### Configuration
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`.dockerignore`** - Docker build context exclusions (if present)
- **`.dockerignore.optimized`** - Optimized Docker ignore rules (if present)

## Usage

### Development
```bash
# From project root
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up --build
```

### Production
```bash
# Build production image
docker build -f docker/Dockerfile.npm-ignore-scripts -t woothomes-frontend .

# Build nginx image
docker build -f docker/Dockerfile.nginx -t woothomes-nginx .
```

### Nginx Proxy
The nginx configuration provides:
- Reverse proxy to Next.js app (port 3000)
- SSL termination (HTTPS support)
- Static file serving
- Health check endpoint

## SSL Configuration

SSL certificates should be placed in the `ssl/` directory at the project root. The nginx container will automatically include them.

Current SSL setup:
- **Domain**: www.woothomes.com
- **Certificate**: ssl/www.woothomes.com.crt
- **Private Key**: ssl/www.woothomes.com.key
- **PFX Bundle**: ssl/www.woothomes.com.pfx (for Azure Application Gateway)
