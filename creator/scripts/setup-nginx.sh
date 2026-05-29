#!/usr/bin/env bash
#
# setup-nginx.sh — configure your d-solve.de nginx server for VCaaS
#
# This script:
# 1. Copies the nginx config to the right place
# 2. Injects your GCP project ID and region
# 3. Tests the config
# 4. Reloads nginx
#
# Run this on the d-solve.de server (not locally).
#
# Usage:
#   ./scripts/setup-nginx.sh <project-id> <region>
#
# Example:
#   ./scripts/setup-nginx.sh valentines-creator-2026 us-central1

set -euo pipefail

PROJECT_ID="${1:-}"
REGION="${2:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <project-id> [region]"
  echo "Example: $0 valentines-creator-2026 us-central1"
  exit 1
fi

echo "==> Setting up nginx for d-solve.de"
echo "    Project ID: $PROJECT_ID"
echo "    Region: $REGION"

# Get the directory this script is in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
NGINX_CONF="$REPO_ROOT/nginx/valentines-creator.conf.example"
NGINX_SITES="/etc/nginx/sites-available/valentines-creator"
NGINX_ENABLED="/etc/nginx/sites-enabled/valentines-creator"

if [ ! -f "$NGINX_CONF" ]; then
  echo "❌ Config not found: $NGINX_CONF"
  exit 1
fi

echo "==> Generating nginx config..."
# Substitute placeholders
sed "s/us-central1/$REGION/g; s/project-id-123/$PROJECT_ID/g" "$NGINX_CONF" > /tmp/valentines-creator.conf

echo "==> Copying to $NGINX_SITES (requires sudo)..."
sudo cp /tmp/valentines-creator.conf "$NGINX_SITES"
sudo chmod 644 "$NGINX_SITES"

# Enable the site (create symlink)
echo "==> Enabling site..."
sudo ln -sf "$NGINX_SITES" "$NGINX_ENABLED" 2>/dev/null || true

# Test config
echo "==> Testing nginx config..."
if sudo nginx -t; then
  echo "✓ Config is valid"
else
  echo "❌ Config has errors. Fix them and run again."
  exit 1
fi

# Reload nginx
echo "==> Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✓ Done!"
echo ""
echo "You can now access:"
echo "  Creator UI:    https://d-solve.de/creator/"
echo "  Upload API:    https://d-solve.de/api/v1/upload"
echo "  Short links:   https://d-solve.de/v/{shortId}"
echo ""
echo "To test:"
echo "  curl https://d-solve.de/creator/"
echo ""
