#!/usr/bin/env bash
#
# deploy.sh — build + deploy the whole VCaaS stack to GCP.
#
# Usage:
#   ./scripts/deploy.sh [staging|prod]
#
# Prereqs: gcloud, terraform, node, zip installed and `gcloud auth login` done.

set -euo pipefail

ENV="${1:-prod}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

echo "==> Deploying VCaaS ($ENV)"
echo "    Root: $ROOT"

# ---------------------------------------------------------------------------
# 1. Package Cloud Functions into zip archives
# ---------------------------------------------------------------------------
echo "==> Packaging functions..."
rm -rf "$DIST"
mkdir -p "$DIST"

for fn in uploadImages resolveUrl getConfig; do
  echo "    - $fn"
  (cd "$ROOT/backend/functions/$fn" && zip -qr "$DIST/$fn.zip" . -x "node_modules/*")
done

# ---------------------------------------------------------------------------
# 2. Build the frontend
# ---------------------------------------------------------------------------
echo "==> Building frontend..."
(cd "$ROOT/frontend" && npm install --silent && npm run build)

# ---------------------------------------------------------------------------
# 3. Terraform apply (infra + functions)
# ---------------------------------------------------------------------------
echo "==> Applying Terraform..."
(cd "$ROOT/terraform" && terraform init -input=false && terraform apply -auto-approve)

# ---------------------------------------------------------------------------
# 4. Upload frontend to the bucket
# ---------------------------------------------------------------------------
BUCKET="$(cd "$ROOT/terraform" && terraform output -raw bucket_name)"
echo "==> Uploading frontend to gs://$BUCKET/website/"
gsutil -m rsync -r -d "$ROOT/frontend/dist" "gs://$BUCKET/website"

# Cache-bust HTML, long-cache assets
gsutil -m setmeta -h "Cache-Control:public, max-age=60" "gs://$BUCKET/website/index.html"
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" "gs://$BUCKET/website/assets/**" || true

echo "==> Done!"
echo ""
echo "    Frontend:  https://storage.googleapis.com/$BUCKET/website/index.html"
echo "    Upload API: $(cd "$ROOT/terraform" && terraform output -raw upload_endpoint)"
echo "    Resolver:   $(cd "$ROOT/terraform" && terraform output -raw resolver_endpoint)"
