# Deployment Scripts

This folder contains deployment scripts for Azure Container Registry (ACR) and Azure Container Instances (ACI).

## Files

### Azure Container Registry (ACR)
- **`deploy-acr.sh`** - Build and push Docker images to Azure Container Registry

### Azure Container Instances (ACI)
- **`deploy-aci.sh`** - Deploy container group to Azure Container Instances

## Usage

### Prerequisites
- Azure CLI installed and logged in
- Docker installed and running
- Access to `woothomes-rg` resource group
- Access to `woothomes.azurecr.io` container registry

### Deploy to ACR
```bash
# From project root
./scripts/deploy-acr.sh
```

This script will:
1. Build the frontend image using `docker/Dockerfile.npm-ignore-scripts`
2. Build the nginx image using `docker/Dockerfile.nginx`
3. Tag images with current timestamp
4. Push both images to `woothomes.azurecr.io`

### Deploy to ACI
```bash
# From project root
./scripts/deploy-aci.sh
```

This script will:
1. Create/update ACI container group
2. Deploy both frontend and nginx containers
3. Configure networking (nginx on ports 80/443, frontend internal)
4. Display deployment information

## Configuration

The scripts use these Azure resources:
- **Resource Group**: `woothomes-rg`
- **Container Registry**: `woothomes.azurecr.io`
- **Location**: `eastus2`
- **Container Group**: `woothomes-aci`

## CI/CD Integration

These scripts are also integrated into the GitHub Actions workflow at `.github/workflows/deploy.yml` for automated deployments.
