#!/bin/bash

echo "Testing cache invalidation locally..."

# Start a simple local server to test the PWA
if command -v npx &> /dev/null && npx serve -v > /dev/null 2>&1; then
    echo "Starting local server with npx serve..."
    npx serve -s src -p 8080
elif command -v python3 &> /dev/null; then
    echo "Starting local server with Python 3..."
    cd src && python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Starting local server with Python 2..."
    cd src && python -m SimpleHTTPServer 8080
else
    echo "Neither npx serve nor Python is available."
    echo "Please install Node.js or Python to run a local server."
fi
