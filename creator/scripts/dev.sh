#!/usr/bin/env bash
#
# dev.sh — run the full stack locally with the Firestore + Storage emulators.
#
# Usage:
#   ./scripts/dev.sh
#
# Prereqs: firebase-tools, node. Opens:
#   - Frontend:  http://localhost:3000
#   - Functions: http://localhost:8080
#   - Emulator UI: http://localhost:4000

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Starting Firestore + Storage emulators..."
firebase emulators:start --only firestore,storage &
EMU_PID=$!
trap 'kill $EMU_PID 2>/dev/null || true' EXIT

sleep 5

export FIRESTORE_EMULATOR_HOST="localhost:8081"
export STORAGE_EMULATOR_HOST="http://localhost:9199"
export GCS_BUCKET="valentines-creator-dev"
export FIRESTORE_DB="(default)"

echo "==> Starting upload function on :8080..."
(cd "$ROOT/backend/functions/uploadImages" && npm install --silent && \
  npx functions-framework --target=uploadImages --port=8080) &

echo "==> Starting frontend on :3000..."
(cd "$ROOT/frontend" && npm install --silent && npm run dev)
