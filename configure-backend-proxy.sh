#!/bin/sh

set -e

DATA_BOARD_INTERNAL_BACKEND_URL="${DATA_BOARD_INTERNAL_BACKEND_URL:-http://localhost:8000}"

echo "Injecting backend URL: $DATA_BOARD_INTERNAL_BACKEND_URL"

# Replace the placeholder in the nginx config
envsubst '${DATA_BOARD_INTERNAL_BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && \
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

