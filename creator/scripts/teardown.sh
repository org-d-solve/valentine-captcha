#!/usr/bin/env bash
#
# teardown.sh — disable the public endpoints to save money outside Valentine
# season WITHOUT destroying data. Removes the public invoker binding so the
# functions return 403; re-run deploy.sh to re-enable.
#
# Usage:
#   ./scripts/teardown.sh [region]

set -euo pipefail

REGION="${1:-us-central1}"

echo "==> Disabling public access to functions in $REGION"
for fn in uploadImages resolveUrl getConfig; do
  echo "    - $fn"
  gcloud run services remove-iam-policy-binding "$fn" \
    --region="$REGION" \
    --member="allUsers" \
    --role="roles/run.invoker" \
    --quiet || echo "      (already disabled)"
done

echo "==> Public endpoints disabled. Data is retained."
echo "    Run ./scripts/deploy.sh to re-enable."
