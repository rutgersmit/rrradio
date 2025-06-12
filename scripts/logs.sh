#!/bin/bash

# Rrradio Docker Logs Script
# This script shows live logs from the container

echo "📋 Rrradio Container Logs"
echo "========================"
echo "Press Ctrl+C to exit log viewing"
echo ""

docker compose -f docker/docker-compose.yml logs -f
