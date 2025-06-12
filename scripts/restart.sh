#!/bin/bash

# Rrradio Docker Quick Restart Script
# This script quickly restarts the container without rebuilding

echo "🔄 Rrradio Quick Restart"
echo "======================="

echo "📦 Restarting container..."
docker compose -f docker/docker-compose.yml restart

if [ $? -eq 0 ]; then
    echo "✅ Container restarted successfully!"
    echo "🌐 Application is available at: http://localhost:8080"
else
    echo "❌ Error: Failed to restart container"
    exit 1
fi
