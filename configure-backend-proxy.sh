#!/bin/sh

set -e

BACKEND_URL="${DATA_BOARD_INTERNAL_BACKEND_URL:-http://localhost:8000}"

echo "Injecting backend URL: $BACKEND_URL"

# Replace the placeholder in the nginx config
sed -i "s|DATA_BOARD_INTERNAL_BACKEND_URL|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
