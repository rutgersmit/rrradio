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

## Project Structure

```
rrradio/
├── src/                    # Application source files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   ├── script.js          # Application logic
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── docker/                # Docker configuration
│   ├── Dockerfile         # Container definition
│   ├── docker-compose.yml # Multi-container setup
│   └── nginx.conf         # Nginx configuration
├── scripts/               # Development scripts
│   ├── rebuild.sh         # Full rebuild script
│   ├── restart.sh         # Quick restart script
│   └── logs.sh            # View logs script
├── rebuild.sh             # Convenience rebuild script
├── restart.sh             # Convenience restart script
├── logs.sh                # Convenience logs script
└── README.md              # This file
```

## Benefits of This Structure

### 🏗️ **Separation of Concerns**
- **`src/`** - Pure application code (HTML, CSS, JS)
- **`docker/`** - All containerization and deployment files
- **`scripts/`** - Development and build automation scripts

### 🚀 **Development Benefits**
- Clear distinction between application code and infrastructure
- Easy to navigate and maintain
- Better for CI/CD pipelines (can build from `src/` only)
- Docker files are isolated and reusable
- Scripts can be version controlled separately

### 📦 **Deployment Benefits**
- Clean Docker builds that only include necessary files
- Infrastructure as Code (IaC) best practices
- Easy to adapt for different environments (dev/staging/prod)
- Scalable for larger teams and projects

## Features

- 🎵 **Stream Radio Stations**: Play your favorite radio streams directly in the browser
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Local Storage**: All your radio stations are stored locally in your browser
- ➕ **Add/Remove Stations**: Easily manage your radio station collection
- 📻 **Default Presets**: Comes with sample stations to get you started
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔊 **Audio Controls**: Play, pause, stop, and volume control
- 📻 **Station Management**: Edit station details and organize your collection
- 🐳 **Docker Ready**: Easy deployment with Docker containerization

## Quick Start

### Using Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd rrradio
```

2. Build and run with Docker Compose:
```bash
docker compose up -d
```

3. Open your browser and navigate to `http://localhost:8080`

#### Development Scripts

For easier development, use the provided shell scripts:

```bash
# Rebuild image and restart container (use after code changes)
./rebuild.sh

# Quick restart container (without rebuilding)
./restart.sh
```

### Manual Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd rrradio
```

2. Serve the files using any static file server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx serve)
npx serve -s . -l 8080

# Using PHP
php -S localhost:8080
```

3. Open your browser and navigate to `http://localhost:8080`

## Usage

### Getting Started with Default Stations

When you first open Rrradio, you'll see 6 sample radio stations already loaded:

- **Jazz FM** - Sample jazz station
- **Rock Central** - Sample rock station  
- **Classical Radio** - Sample classical station
- **Electronic Beats** - Sample electronic station
- **News Radio 24/7** - Sample news station
- **Chill Lounge** - Sample chill station (no image example)

*Note: These are placeholder URLs for demonstration. Replace them with real radio stream URLs.*

### Adding a Radio Station

1. Click the "Add Station" button
2. Fill in the station details:
   - **Station Name**: A friendly name for your station
   - **Stream URL**: The direct URL to the radio stream
   - **Image URL**: Optional image for the station
3. Click "Add Station" to save

### Playing Radio Stations

- Click on any station card to start playing
- Use the audio player controls at the bottom to manage playback
- The currently playing station will be highlighted

### Managing Stations

- **Edit**: Click the "Edit" button on any station card
- **Remove**: Click the "Remove" button to delete a station
- All changes are automatically saved to your browser's local storage

## Docker Deployment

### Building the Image

```bash
docker build -t rrradio .
```

### Running the Container

```bash
docker run -d -p 8080:80 --name rrradio rrradio
```

### Using Docker Compose

```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart (after code changes)
./rebuild.sh

# Quick restart (without rebuilding)
./restart.sh
```

## Technical Details

- **Frontend**: Pure HTML5, CSS3, and JavaScript (no frameworks)
- **Audio**: HTML5 Audio API for streaming
- **Storage**: Browser localStorage for persistence
- **Server**: Nginx (in Docker container)
- **PWA**: Service Worker for offline support

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Features in Detail

### Audio Player
- HTML5 audio with streaming support
- Volume control
- Play/Pause/Stop functionality
- Real-time status updates
- Error handling for invalid streams

### Data Management
- Local storage for all user data
- Import/Export capabilities (future feature)
- Data persistence across sessions

### User Interface
- Responsive grid layout
- Modern glassmorphism design
- Smooth animations and transitions
- Touch-friendly controls

## Common Radio Stream URLs

Here are some example stream URLs you can use to test the application:

- **BBC Radio 1**: `http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one`
- **NPR News**: `https://npr-ice.streamguys1.com/live.mp3`
- **Classical KUSC**: `https://kusc.streamguys1.com/kusc-hi`

*Note: Stream availability may vary by region and time.*

## Troubleshooting

### Audio Not Playing
- Check if the stream URL is valid and accessible
- Ensure the stream format is supported by your browser
- Check browser console for error messages

### Stations Not Saving
- Ensure localStorage is enabled in your browser
- Check if you're in private/incognito mode
- Clear browser cache and try again

### Docker Issues
- Ensure Docker is running on your system
- Check if port 8080 is available
- Review Docker logs: `docker-compose logs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the repository.
