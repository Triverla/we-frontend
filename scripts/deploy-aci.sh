#!/bin/bash

# Deploy Woothomes to Azure Container Instances (ACI)

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

# Configuration
ACR_NAME="${ACR_NAME:-}"
RESOURCE_GROUP="${RESOURCE_GROUP:-}"
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-}"
CONTAINER_GROUP_NAME="${CONTAINER_GROUP_NAME:-woothomes-aci}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
LOCATION="${LOCATION:-East US}"
DNS_NAME_LABEL="${DNS_NAME_LABEL:-woothomes-$(date +%s)}"

# Check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed"
        print_status "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
}

# Get configuration from user if not set
get_configuration() {
    print_header "Azure Container Instance Configuration"
    
    if [ -z "$ACR_NAME" ]; then
        read -p "Enter your ACR name: " ACR_NAME
    fi
    
    if [ -z "$RESOURCE_GROUP" ]; then
        read -p "Enter your Resource Group name: " RESOURCE_GROUP
    fi
    
    if [ -z "$SUBSCRIPTION_ID" ]; then
        print_status "Available subscriptions:"
        az account list --output table --query "[].{Name:name, SubscriptionId:id, State:state}"
        read -p "Enter your Subscription ID: " SUBSCRIPTION_ID
    fi
    
    read -p "Enter DNS name label [$DNS_NAME_LABEL]: " input_dns
    if [ ! -z "$input_dns" ]; then
        DNS_NAME_LABEL="$input_dns"
    fi
    
    # Confirm configuration
    print_status "Configuration:"
    print_status "  ACR Name: $ACR_NAME"
    print_status "  Resource Group: $RESOURCE_GROUP"
    print_status "  Subscription: $SUBSCRIPTION_ID"
    print_status "  Container Group: $CONTAINER_GROUP_NAME"
    print_status "  DNS Label: $DNS_NAME_LABEL"
    print_status "  Location: $LOCATION"
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

# Get ACR credentials
get_acr_credentials() {
    print_header "Getting ACR Credentials"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
    ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "username" -o tsv)
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)
    
    print_status "✅ ACR credentials retrieved"
}

# Delete existing container group if it exists
cleanup_existing() {
    print_header "Cleanup Existing Deployment"
    
    if az container show --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_GROUP_NAME" &> /dev/null; then
        print_warning "Container group '$CONTAINER_GROUP_NAME' already exists. Deleting..."
        az container delete \
            --resource-group "$RESOURCE_GROUP" \
            --name "$CONTAINER_GROUP_NAME" \
            --yes
        
        print_status "✅ Existing container group deleted"
    else
        print_status "No existing container group found"
    fi
}

# Deploy to ACI
deploy_to_aci() {
    print_header "Deploying to Azure Container Instances"
    
    FRONTEND_IMAGE="$ACR_LOGIN_SERVER/woothomes-frontend:$IMAGE_TAG"
    NGINX_IMAGE="$ACR_LOGIN_SERVER/woothomes-nginx:$IMAGE_TAG"
    
    print_status "Deploying container group '$CONTAINER_GROUP_NAME'..."
    print_status "Frontend Image: $FRONTEND_IMAGE"
    print_status "Nginx Image: $NGINX_IMAGE"
    
    # Create the container group with both containers
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$CONTAINER_GROUP_NAME" \
        --location "$LOCATION" \
        --dns-name-label "$DNS_NAME_LABEL" \
        --restart-policy Always \
        --registry-login-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --yaml-file <(cat << EOF
apiVersion: 2019-12-01
location: $LOCATION
name: $CONTAINER_GROUP_NAME
properties:
  containers:
  - name: woothomes-frontend
    properties:
      image: $FRONTEND_IMAGE
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 1.0
      ports:
      - port: 3000
        protocol: TCP
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "3000"
      - name: NEXT_TELEMETRY_DISABLED
        value: "1"
  - name: woothomes-nginx
    properties:
      image: $NGINX_IMAGE
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 0.5
      ports:
      - port: 80
        protocol: TCP
      - port: 443
        protocol: TCP
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
    dnsNameLabel: $DNS_NAME_LABEL
  imageRegistryCredentials:
  - server: $ACR_LOGIN_SERVER
    username: $ACR_USERNAME
    password: $ACR_PASSWORD
EOF
)
    
    print_status "✅ Container group deployed successfully"
}

# Get deployment information
get_deployment_info() {
    print_header "Deployment Information"
    
    # Wait a moment for the deployment to stabilize
    print_status "Waiting for deployment to stabilize..."
    sleep 10
    
    # Get container group details
    CONTAINER_INFO=$(az container show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$CONTAINER_GROUP_NAME" \
        --output json)
    
    PUBLIC_IP=$(echo "$CONTAINER_INFO" | jq -r '.ipAddress.ip // "N/A"')
    FQDN=$(echo "$CONTAINER_INFO" | jq -r '.ipAddress.fqdn // "N/A"')
    STATE=$(echo "$CONTAINER_INFO" | jq -r '.instanceView.state // "Unknown"')
    
    print_status "🎉 Deployment completed successfully!"
    print_status ""
    print_status "📋 Container Information:"
    print_status "  Container Group: $CONTAINER_GROUP_NAME"
    print_status "  Resource Group: $RESOURCE_GROUP"
    print_status "  Location: $LOCATION"
    print_status "  State: $STATE"
    print_status ""
    print_status "🌐 Access Information:"
    print_status "  Public IP: $PUBLIC_IP"
    print_status "  FQDN: $FQDN"
    print_status ""
    print_status "🔗 Access URLs:"
    if [ "$FQDN" != "N/A" ]; then
        print_status "  HTTP: http://$FQDN"
        print_status "  HTTPS: https://$FQDN (if SSL configured)"
    fi
    if [ "$PUBLIC_IP" != "N/A" ]; then
        print_status "  Direct IP: http://$PUBLIC_IP"
    fi
    print_status ""
    print_status "📊 Monitor in Azure Portal:"
    print_status "  https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerInstance/containerGroups/$CONTAINER_GROUP_NAME/overview"
    print_status ""
    print_status "🔍 Useful Commands:"
    print_status "  View logs: az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_GROUP_NAME --container-name woothomes-nginx"
    print_status "  View status: az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_GROUP_NAME"
    print_status "  Delete: az container delete --resource-group $RESOURCE_GROUP --name $CONTAINER_GROUP_NAME --yes"
}

# Main execution
print_header "Woothomes ACI Deployment Script"

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
        --container-group)
            CONTAINER_GROUP_NAME="$2"
            shift 2
            ;;
        --dns-label)
            DNS_NAME_LABEL="$2"
            shift 2
            ;;
        --location)
            LOCATION="$2"
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
            echo "  --container-group NAME   Container group name (default: woothomes-aci)"
            echo "  --dns-label LABEL        DNS name label"
            echo "  --location LOCATION      Azure location (default: East US)"
            echo "  --image-tag TAG          Docker image tag (default: latest)"
            echo "  --help                   Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check prerequisites
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. Installing via package manager..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        print_error "Please install jq manually: https://stedolan.github.io/jq/download/"
        exit 1
    fi
fi

# Run deployment steps
check_azure_cli
get_configuration
azure_login
get_acr_credentials
cleanup_existing
deploy_to_aci
get_deployment_info

print_status "🎉 ACI deployment completed successfully!"
