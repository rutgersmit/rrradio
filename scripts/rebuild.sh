#!/bin/bash

# Rrradio Docker Rebuild Script
# This script rebuilds the Docker image and restarts the container

echo "🎵 Rrradio Container Rebuild Script"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📦 Stopping existing containers..."
docker compose -f docker/docker-compose.yml down

if [ $? -eq 0 ]; then
    echo "✅ Containers stopped successfully"
else
    echo "⚠️  Warning: No containers were running or error occurred during stop"
fi

echo ""
echo "🔨 Building new image and starting container..."
docker compose -f docker/docker-compose.yml up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container rebuilt and started successfully!"
    echo "🌐 Application is available at: http://localhost:8080"
    echo ""
    echo "🔍 Useful commands:"
    echo "   docker compose logs -f    # View container logs"
    echo "   docker compose ps         # Check container status"
    echo "   docker compose down       # Stop the container"
    echo ""
    
    # Wait a moment for the container to start
    sleep 2
    
    # Check if the container is healthy
    echo "🏥 Checking container health..."
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Container is healthy and responding"
    else
        echo "⚠️  Container may still be starting up. Give it a few more seconds."
    fi
    
else
    echo "❌ Error: Failed to build or start container"
    echo "🔍 Check the error messages above for details"
    exit 1
fi
