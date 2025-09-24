#!/bin/bash

# Deploy Woothomes to Azure Container Registry (ACR)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Configuration (update these values)
ACR_NAME="${ACR_NAME:-}"
RESOURCE_GROUP="${RESOURCE_GROUP:-}"
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-}"
IMAGE_NAME="woothomes"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed"
        print_status "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Get configuration from user if not set
get_configuration() {
    print_header "Azure Container Registry Configuration"
    
    if [ -z "$ACR_NAME" ]; then
        read -p "Enter your ACR name (e.g., myregistry): " ACR_NAME
    fi
    
    if [ -z "$RESOURCE_GROUP" ]; then
        read -p "Enter your Resource Group name (e.g., myResourceGroup): " RESOURCE_GROUP
    fi
    
    if [ -z "$SUBSCRIPTION_ID" ]; then
        print_status "Available subscriptions:"
        az account list --output table --query "[].{Name:name, SubscriptionId:id, State:state}"
        read -p "Enter your Subscription ID: " SUBSCRIPTION_ID
    fi
    
    # Confirm configuration
    print_status "Configuration:"
    print_status "  ACR Name: $ACR_NAME"
    print_status "  Resource Group: $RESOURCE_GROUP"
    print_status "  Subscription: $SUBSCRIPTION_ID"
    print_status "  Image: $IMAGE_NAME:$IMAGE_TAG"
    print_status ""
    
    read -p "Is this configuration correct? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Please update the configuration and try again."
        exit 0
    fi
}

# Login to Azure
azure_login() {
    print_header "Azure Authentication"
    
    # Check if already logged in
    if az account show &> /dev/null; then
        CURRENT_SUBSCRIPTION=$(az account show --query "id" -o tsv)
        print_status "Already logged in to Azure"
        print_status "Current subscription: $CURRENT_SUBSCRIPTION"
        
        if [ "$CURRENT_SUBSCRIPTION" != "$SUBSCRIPTION_ID" ]; then
            print_status "Switching to subscription: $SUBSCRIPTION_ID"
            az account set --subscription "$SUBSCRIPTION_ID"
        fi
    else
        print_status "Logging in to Azure..."
        az login
        az account set --subscription "$SUBSCRIPTION_ID"
    fi
}

# Create ACR if it doesn't exist
create_acr() {
    print_header "Azure Container Registry Setup"
    
    # Check if ACR exists
    if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        print_status "✅ ACR '$ACR_NAME' already exists"
    else
        print_warning "ACR '$ACR_NAME' does not exist. Creating..."
        
        # Create resource group if it doesn't exist
        if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
            print_status "Creating resource group '$RESOURCE_GROUP'..."
            az group create --name "$RESOURCE_GROUP" --location "East US"
        fi
        
        # Create ACR
        print_status "Creating ACR '$ACR_NAME'..."
        az acr create \
            --resource-group "$RESOURCE_GROUP" \
            --name "$ACR_NAME" \
            --sku Basic \
            --admin-enabled true
        
        print_status "✅ ACR '$ACR_NAME' created successfully"
    fi
}

# Login to ACR
acr_login() {
    print_header "ACR Authentication"
    
    print_status "Logging in to ACR '$ACR_NAME'..."
    az acr login --name "$ACR_NAME"
    
    print_status "✅ Successfully logged in to ACR"
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    
    # Get the full ACR login server name
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    
    # Build frontend image
    FRONTEND_IMAGE="$ACR_LOGIN_SERVER/$IMAGE_NAME-frontend:$IMAGE_TAG"
    print_status "Building frontend image: $FRONTEND_IMAGE"
    docker build -f Dockerfile.npm-ignore-scripts -t "$FRONTEND_IMAGE" .
    
    # Build nginx image with custom config
    NGINX_IMAGE="$ACR_LOGIN_SERVER/$IMAGE_NAME-nginx:$IMAGE_TAG"
    print_status "Building nginx image: $NGINX_IMAGE"
    
    # Create temporary Dockerfile for nginx with custom config
    cat > Dockerfile.nginx << EOF
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if they exist)
COPY ssl/ /etc/nginx/ssl/

# Create nginx user and set permissions
RUN addgroup -g 101 -S nginx && \\
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx && \\
    mkdir -p /var/cache/nginx && \\
    chown -R nginx:nginx /var/cache/nginx && \\
    chown -R nginx:nginx /etc/nginx/ssl/ || true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
EOF
    
    docker build -f Dockerfile.nginx -t "$NGINX_IMAGE" .
    
    # Clean up temporary Dockerfile
    rm Dockerfile.nginx
    
    print_status "✅ Images built successfully"
}

# Push images to ACR
push_images() {
    print_header "Pushing Images to ACR"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    
    FRONTEND_IMAGE="$ACR_LOGIN_SERVER/$IMAGE_NAME-frontend:$IMAGE_TAG"
    NGINX_IMAGE="$ACR_LOGIN_SERVER/$IMAGE_NAME-nginx:$IMAGE_TAG"
    
    print_status "Pushing frontend image..."
    docker push "$FRONTEND_IMAGE"
    
    print_status "Pushing nginx image..."
    docker push "$NGINX_IMAGE"
    
    print_status "✅ Images pushed successfully to ACR"
}

# Create docker-compose file for ACR deployment
create_acr_compose() {
    print_header "Creating ACR Docker Compose File"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    
    cat > docker-compose.acr.yml << EOF
services:
  # Nginx reverse proxy
  nginx:
    image: $ACR_LOGIN_SERVER/$IMAGE_NAME-nginx:$IMAGE_TAG
    container_name: woothomes-nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - woothomes-frontend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  woothomes-frontend:
    image: $ACR_LOGIN_SERVER/$IMAGE_NAME-frontend:$IMAGE_TAG
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    name: woothomes-network
EOF
    
    print_status "✅ Created docker-compose.acr.yml for ACR deployment"
}

# Show deployment information
show_deployment_info() {
    print_header "Deployment Information"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    
    print_status "🎉 Deployment to ACR completed successfully!"
    print_status ""
    print_status "📋 ACR Information:"
    print_status "  Registry: $ACR_LOGIN_SERVER"
    print_status "  Frontend Image: $ACR_LOGIN_SERVER/$IMAGE_NAME-frontend:$IMAGE_TAG"
    print_status "  Nginx Image: $ACR_LOGIN_SERVER/$IMAGE_NAME-nginx:$IMAGE_TAG"
    print_status ""
    print_status "🚀 Next Steps:"
    print_status "  1. Deploy to Azure Container Instances:"
    print_status "     ./deploy-aci.sh"
    print_status ""
    print_status "  2. Deploy to Azure App Service:"
    print_status "     az webapp create --resource-group $RESOURCE_GROUP --plan myAppServicePlan --name myapp --deployment-container-image-name $ACR_LOGIN_SERVER/$IMAGE_NAME-frontend:$IMAGE_TAG"
    print_status ""
    print_status "  3. Deploy to Azure Kubernetes Service:"
    print_status "     kubectl apply -f k8s-deployment.yml"
    print_status ""
    print_status "  4. Use docker-compose with ACR images:"
    print_status "     docker-compose -f docker-compose.acr.yml up -d"
    print_status ""
    print_status "📊 View images in Azure Portal:"
    print_status "  https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME/repository"
}

# Main execution
print_header "Woothomes ACR Deployment Script"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --acr-name)
            ACR_NAME="$2"
            shift 2
            ;;
        --resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --subscription-id)
            SUBSCRIPTION_ID="$2"
            shift 2
            ;;
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --acr-name NAME          Azure Container Registry name"
            echo "  --resource-group NAME    Azure Resource Group name"
            echo "  --subscription-id ID     Azure Subscription ID"
            echo "  --image-tag TAG          Docker image tag (default: latest)"
            echo "  --help                   Show this help message"
            echo ""
            echo "Example:"
            echo "  $0 --acr-name myregistry --resource-group myRG --subscription-id 12345678-1234-1234-1234-123456789012"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run deployment steps
check_azure_cli
check_docker
get_configuration
azure_login
create_acr
acr_login
build_images
push_images
create_acr_compose
show_deployment_info

print_status "🎉 ACR deployment completed successfully!"
