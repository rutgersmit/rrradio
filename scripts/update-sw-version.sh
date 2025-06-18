#!/bin/bash

# Generate a unique timestamp for cache busting
TIMESTAMP=$(date +%s)

# Replace the cache version in service worker
sed -i.bak "s/Date\.now()/\"$TIMESTAMP\"/g" src/sw.js

echo "Service Worker updated with timestamp: $TIMESTAMP"
