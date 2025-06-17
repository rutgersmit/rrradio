# RRRadio - Containerized Web Application

This web application has been migrated from Azure Static Web Apps to Azure Container Apps for better control and containerized deployment.

## Architecture

- **Azure Container Apps**: Hosts the containerized web application
- **Azure Container Registry**: Stores the Docker images  
- **Azure Log Analytics**: Centralized logging and monitoring
- **Application Insights**: Application performance monitoring
- **Nginx**: Web server for serving static content

## Local Development

### Prerequisites

- Docker and Docker Compose
- Azure CLI
- Azure Developer CLI (azd)

### Running Locally

```bash
# Using Docker Compose
cd docker
docker-compose up --build

# Or using the provided scripts
./rebuild.sh
```

The application will be available at `http://localhost:8080`

## Deployment to Azure

### Prerequisites

1. Azure subscription
2. Azure CLI installed and logged in
3. Azure Developer CLI (azd) installed

### Setup Azure Resources

1. **Create a new environment:**

   ```bash
   azd env new <environment-name>
   ```

2. **Set required environment variables:**

   ```bash
   azd env set AZURE_LOCATION <your-azure-region>
   # Example: azd env set AZURE_LOCATION eastus2
   ```

3. **Deploy the infrastructure and application:**

   ```bash
   azd up
   ```

   This command will:
   - Provision Azure resources (Container Apps Environment, Container Registry, etc.)
   - Build and push the Docker image
   - Deploy the container to Azure Container Apps

### GitHub Actions Deployment

For automated deployments via GitHub Actions:

1. **Set up Azure Service Principal:**

   ```bash
   # Create service principal and get credentials
   az ad sp create-for-rbac --name "rrradio-github-actions" --role contributor --scopes /subscriptions/<subscription-id>
   ```

2. **Configure GitHub Secrets:**
   - `AZURE_CLIENT_ID`: Service principal client ID
   - `AZURE_TENANT_ID`: Azure tenant ID
   - `AZURE_CREDENTIALS`: Complete service principal JSON (for client credentials flow)

3. **Configure GitHub Variables:**
   - `AZURE_ENV_NAME`: Your environment name
   - `AZURE_LOCATION`: Your Azure region
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID

4. **Push to main branch** to trigger the deployment workflow

## Project Structure

```
/
├── src/                    # Web application source files
├── docker/                 # Docker configuration
│   ├── Dockerfile         # Container image definition
│   ├── docker-compose.yml # Local development setup
│   └── nginx.conf         # Nginx configuration
├── infra/                 # Azure infrastructure as code
│   ├── main.bicep        # Main Bicep template
│   └── main.parameters.json # Parameters file
├── .github/workflows/     # GitHub Actions workflows
└── azure.yaml            # Azure Developer CLI configuration
```

## Monitoring and Logs

- **Application Insights**: Monitor application performance and errors
- **Container Apps Logs**: View container logs in Azure portal
- **Log Analytics**: Query and analyze logs using KQL

Access logs via:

```bash
azd monitor --logs
```

## Migration Notes

This application was migrated from Azure Static Web Apps to provide:

- Better control over the runtime environment
- Ability to run custom server configurations  
- Enhanced monitoring and logging capabilities
- Scalability options with Container Apps

The Docker setup uses Nginx to serve static files efficiently while maintaining the same functionality as the original Static Web App.
