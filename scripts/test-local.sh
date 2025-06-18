#!/bin/bash

echo "Testing cache invalidation locally..."

# Start a simple local server to test the PWA
if command -v python3 &> /dev/null; then
    echo "Starting local server with Python 3..."
    cd src && python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Starting local server with Python 2..."
    cd src && python -m SimpleHTTPServer 8080
else
    echo "Python not found. Please install Python or use another local server."
    echo "You can also use: npx serve src -p 8080"
fi
