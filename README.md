This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Woot Homes Client Application

A modern luxury accommodation platform built with Next.js, featuring Docker containerization and Azure deployment.

## Project Structure

```
woothomes-frontend/
├── src/                    # Application source code
├── docker/                 # Docker configuration files
├── scripts/                # Deployment scripts
├── ssl/                    # SSL certificates
├── .github/workflows/      # CI/CD pipelines
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites
- Node.js 20+
- Yarn 4
- Docker (for containerized development)

### Development Setup

1. Install dependencies:
```bash
yarn install
```

2. Run the development server:
```bash
yarn dev
```

### Project Conventions

- **Pages**: Create inside the `src/app/` folder following Next.js App Router structure
- **Components**: Add inside `src/components/` folder following established conventions  
- **Utilities**: Add reusable functions inside `src/lib/` folder following established conventions

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.






## Docker Development

### Using Docker Compose
```bash
# Development with hot reload
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up --build

# Production build
docker-compose -f docker/docker-compose.yml up --build
```

### Manual Docker Build
```bash
# Frontend container
docker build -f docker/Dockerfile.npm-ignore-scripts -t woothomes-frontend .

# Nginx reverse proxy
docker build -f docker/Dockerfile.nginx -t woothomes-nginx .
```

## Deployment

### Azure Container Instances
The application is deployed to Azure Container Instances with:
- **Frontend**: Next.js application (internal port 3000)
- **Nginx**: Reverse proxy with SSL termination (ports 80, 443)
- **SSL**: Custom domain `www.woothomes.com` with certificate

### CI/CD Pipeline
Automated deployment via GitHub Actions:
- Builds and pushes images to Azure Container Registry
- Deploys to Azure Container Instances
- Configures SSL and networking

### Manual Deployment
```bash
# Deploy to Azure Container Registry
./scripts/deploy-acr.sh

# Deploy to Azure Container Instances  
./scripts/deploy-aci.sh
```

## Documentation

- **Docker Configuration**: See `docker/README.md`
- **Deployment Scripts**: See `scripts/README.md`
- **Azure Setup**: See `README-Azure.md`
- **Application Gateway**: See `README-ApplicationGateway.md`

## Architecture

```
Internet → Application Gateway (SSL) → ACI Container Group
                                      ├── Nginx (Reverse Proxy)
                                      └── Next.js App
```

## Live URLs

- **Production**: `https://www.woothomes.com` (via Application Gateway)
- **Direct ACI**: `https://woothomes-aci.eastus2.azurecontainer.io`

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
