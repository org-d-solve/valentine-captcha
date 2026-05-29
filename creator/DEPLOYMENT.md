# Deployment Guide — Step by Step (d-solve.de + GCP)

This is the **concrete, copy-paste** guide to get VCaaS running on GCP with your
existing d-solve.de server as a reverse proxy. For the *why* behind each piece,
see [ARCHITECTURE.md](./ARCHITECTURE.md); for money, see [COSTS.md](./COSTS.md).

**Cost:** ~$3–5 for Valentine week, $0 the rest of the year.

**Result:**
- Creator UI: `https://d-solve.de/creator/`
- Upload API: `https://d-solve.de/api/v1/upload`
- Short links: `https://d-solve.de/v/{shortId}` (what your wife sees)
- Valentine page: `https://d-solve.de/?to=Sarah&from=Alex&...`

---

## 0. One-time prerequisites

```bash
# Install the tools
# - gcloud:   https://cloud.google.com/sdk/docs/install
# - terraform: https://developer.hashicorp.com/terraform/install
# - node 18+:  https://nodejs.org
# - firebase:  npm install -g firebase-tools   (only needed for local dev)

gcloud auth login
gcloud auth application-default login
```

---

## 1. Create the project

```bash
export PROJECT_ID="valentines-creator-2026"   # must be globally unique
export REGION="us-central1"

gcloud projects create "$PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# Link billing (required even for free-tier usage)
gcloud billing accounts list
gcloud billing projects link "$PROJECT_ID" --billing-account=XXXXXX-XXXXXX-XXXXXX
```

---

## 2. Create the Terraform state bucket

```bash
gsutil mb -l "$REGION" "gs://${PROJECT_ID}-tfstate"
gsutil versioning set on "gs://${PROJECT_ID}-tfstate"
```

Then edit `terraform/backend.tf` and uncomment the `backend "gcs"` block,
setting `bucket = "<PROJECT_ID>-tfstate"`.

---

## 3. Configure Terraform variables

```bash
cd creator/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set project_id, bucket_name, URLs
```

---

## 4. Deploy everything with one command

```bash
cd creator
./scripts/deploy.sh prod
```

This script:
1. Zips the three Cloud Functions into `dist/`.
2. Builds the React frontend (`frontend/dist`).
3. Runs `terraform apply` (creates bucket, Firestore, functions, IAM).
4. Syncs the frontend to `gs://<bucket>/website/`.

When it finishes it prints your live URLs:

```
Frontend:   https://storage.googleapis.com/<bucket>/website/index.html
Upload API: https://<region>-<project>.cloudfunctions.net/uploadImages
Resolver:   https://<region>-<project>.cloudfunctions.net/resolveUrl
```

---

## 5. Set up Nginx reverse proxy on d-solve.de

SSH into your d-solve.de server and run the setup script:

```bash
cd /path/to/your/d-solve.de/server

# Download the Valentine Creator repo (or use your existing checkout)
git clone https://github.com/org-d-solve/valentine-captcha.git
cd valentine-captcha/creator

# Run the nginx setup script (it does everything for you)
./scripts/setup-nginx.sh valentines-creator-2026 us-central1
# (replace project ID with your actual GCP project)
```

This script:
1. Generates the nginx config (substituting your project ID + region)
2. Copies it to `/etc/nginx/sites-available/`
3. Enables it (symlink to `/etc/nginx/sites-enabled/`)
4. Tests the config
5. Reloads nginx

**That's it!** Your d-solve.de now proxies to the GCP Cloud Functions.

Verify:
```bash
curl https://d-solve.de/creator/
# Should return the creator UI HTML
```

---

## 6. Build and deploy with d-solve.de API URL

When building the frontend, tell it to use the d-solve.de proxy URL:

```bash
export VITE_API_URL="https://d-solve.de/api/v1"
cd creator/frontend && npm install && npm run build && cd ../..

# Now upload to Cloud Storage
gsutil -m cp -r frontend/dist/* gs://valentines-creator-prod/website/
```

Or use the automated deploy script with the env var set:

```bash
export VITE_API_URL="https://d-solve.de/api/v1"
./scripts/deploy.sh prod
```

This embeds the d-solve.de URL into the frontend bundle so all API calls go
through your nginx proxy.

---

## 7. Verify the full flow

```bash
# 1. Open the creator UI in a browser, upload 9 images, hit "Create".
# 2. You get a short URL. Open it.
# 3. It should redirect to the valentine page with your photos.

# Or test the API directly:
curl -s -X POST "$VITE_API_URL/uploadImages" \
  -F to=Sarah -F from=Alex -F message="Be mine" \
  -F prompt="a heart" -F correctCells=all \
  -F "images[0]=@photo1.jpg" -F "images[1]=@photo2.jpg" \
  -F "images[2]=@photo3.jpg" -F "images[3]=@photo4.jpg" \
  -F "images[4]=@photo5.jpg" -F "images[5]=@photo6.jpg" \
  -F "images[6]=@photo7.jpg" -F "images[7]=@photo8.jpg" \
  -F "images[8]=@photo9.jpg" | jq
```

---

## 8. Set a hard budget cap (do this!)

```bash
gcloud billing budgets create \
  --billing-account=XXXXXX-XXXXXX-XXXXXX \
  --display-name="VCaaS budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0
```

This emails you at 50/90/100% of \$50. (Budgets alert; they don't hard-stop.
For a hard stop, wire the budget Pub/Sub topic to a function that disables
billing — see GCP docs. For a fun project, the `function_max_instances` guard
in Terraform plus the alerts are plenty.)

---

## 9. Off-season: turn it off to pay ~\$0

```bash
# After Valentine's week — disables public endpoints, keeps data:
./scripts/teardown.sh us-central1

# Frontend bucket stays up (cents/month). Functions scale to zero anyway,
# but teardown removes public access so you can't be billed for traffic.

# To bring it back next year:
./scripts/deploy.sh prod
```

> **Note on cost when idle:** Cloud Functions Gen2 scale to **zero** instances
> when idle, so you pay nothing for compute between requests even *without*
> teardown. Teardown is belt-and-suspenders: it removes the public invoker so
> no one (and no crawler) can trigger paid invocations off-season.

---

## Local development (no GCP needed)

```bash
cd creator
./scripts/dev.sh
# Frontend:    http://localhost:3000
# Functions:   http://localhost:8080
# Emulator UI: http://localhost:4000
```

Run the tests against the local stack:

```bash
npm test
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `terraform apply` fails on `dist/*.zip` missing | Run `./scripts/deploy.sh` (it zips first) instead of bare `terraform apply` |
| Functions return 403 | Public invoker binding missing — re-run deploy, or you ran `teardown.sh` |
| Images 404 after a week | Working as intended: TTL deleted them. Lower/raise `upload_ttl_days` |
| CORS errors in browser | Set `frontend_url` in `terraform.tfvars` to your real frontend origin |
| Short links don't resolve | Check the `/v/` proxy and that `resolveUrl` strips the path correctly |
