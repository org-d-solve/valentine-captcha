# 💌 Valentines Creator as a Service (VCaaS)

**Status:** Production-Ready  
**Version:** 1.0  
**Last Updated:** May 29, 2026

A lightweight, serverless SaaS platform for creating personalized Valentine messages. Users upload images, configure recipients/messages, and receive a shareable short URL—all without authentication.

---

## 🎯 What It Does

Users can:
1. **Upload up to 9 images** (drag & drop)
2. **Configure** sender, recipient, message, CAPTCHA prompt
3. **Select which images** are "correct" in the CAPTCHA
4. **Get a short URL** to share (e.g., `https://d-solve.de/v/abc123xyz`)
5. **Recipients click link**, complete fake CAPTCHA, see your message

**Key Features:**
- ✅ No login/authentication required
- ✅ Random, unguessable short URLs (16 chars, 2^96 space)
- ✅ Auto-deletes after 7 days (default)
- ✅ Images stored on GCP Cloud Storage
- ✅ Serverless (zero cost when not in use)
- ✅ GDPR compliant (no cookies, minimal tracking)

---

## 🏗️ Architecture

```
Creator UI (React)
    ↓ (Image upload + config)
Cloud Functions (Node.js)
    ↓ (Validates, uploads)
GCS Bucket + Firestore
    ↓ (Stores images + URLs)
URL Resolver (Cloud Function)
    ↓ (Redirects short → long URL)
Valentine Page (Existing)
    ↓ (Displays personalized message)
User sees: "You're my Valentine!"
```

**Full architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)  
**Cost analysis:** See [COSTS.md](./COSTS.md)

---

## 🚀 Quick Start (Development)

### Prerequisites

```bash
# Install dependencies
node --version  # v18+
npm --version   # v9+
gcloud --version # GCP CLI

# Install GCP CLI if missing
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Local Development

```bash
# 1. Clone the repo
cd valentine-captcha/creator

# 2. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# 3. Start backend locally (with Firestore emulator)
npm run dev:backend
# Runs on http://localhost:8080

# 4. Start frontend locally (in another terminal)
npm run dev:frontend
# Runs on http://localhost:3000

# 5. Open http://localhost:3000 in browser
```

**Firestore Emulator Setup:**
```bash
# Install emulator
firebase setup:emulators:firestore
firebase setup:emulators:storage

# Start emulator
firebase emulators:start --only firestore,storage
# Runs on localhost:4000, localhost:9199
```

---

## 🌍 Deployment to GCP

### Step 1: Create GCP Project

```bash
# Create project
gcloud projects create valentines-creator-2026 \
  --name="Valentines Creator" \
  --organization-id=YOUR_ORG_ID

# Set as default
gcloud config set project valentines-creator-2026

# Enable APIs
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudrun.googleapis.com \
  storage-api.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com
```

### Step 2: Create Cloud Storage Bucket

```bash
# Create bucket for images
gsutil mb -l us-central1 gs://valentines-creator-prod

# Set lifecycle policy (delete after 30 days)
gsutil lifecycle set - gs://valentines-creator-prod << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF

# Block public list access (security)
gsutil iam ch -d allUsers:objectViewer gs://valentines-creator-prod
```

### Step 3: Create Firestore Database

```bash
# Create Firestore in native mode (us-central1)
gcloud firestore databases create \
  --location=us-central1 \
  --type=native

# Create collection structure
gcloud firestore collections create urls
gcloud firestore collections create configs
```

### Step 4: Deploy Backend Functions

```bash
# Deploy upload function
gcloud functions deploy uploadImages \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --memory 512MB \
  --timeout 60s \
  --region us-central1 \
  --set-env-vars GCS_BUCKET=valentines-creator-prod,FIRESTORE_DB=valentines-prod \
  --source ./backend/functions/uploadImages

# Deploy resolver function
gcloud functions deploy resolveUrl \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --memory 256MB \
  --timeout 10s \
  --region us-central1 \
  --set-env-vars FIRESTORE_DB=valentines-prod \
  --source ./backend/functions/resolveUrl

# Deploy config function
gcloud functions deploy getConfig \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --memory 256MB \
  --timeout 10s \
  --region us-central1 \
  --set-env-vars FIRESTORE_DB=valentines-prod,GCS_BUCKET=valentines-creator-prod \
  --source ./backend/functions/getConfig
```

### Step 5: Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Upload to Cloud Storage
gsutil -m cp -r frontend/dist/* \
  gs://valentines-creator-prod/website/

# Set index.html as default
gsutil web set -m index.html -e index.html \
  gs://valentines-creator-prod

# Enable public access for frontend only
gsutil iam ch allUsers:objectViewer \
  gs://valentines-creator-prod/website/
```

### Step 6: Set Up Load Balancer (Optional, for custom domain)

```bash
# Create backend service
gcloud compute backend-services create valentines-backend \
  --global \
  --load-balancing-scheme EXTERNAL \
  --protocol HTTP

# Create URL map
gcloud compute url-maps create valentines-urls \
  --default-service=valentines-backend

# Create HTTP proxy
gcloud compute target-http-proxies create valentines-proxy \
  --url-map=valentines-urls

# Create forwarding rule
gcloud compute forwarding-rules create valentines-fr \
  --global \
  --target-http-proxy=valentines-proxy \
  --address=valentines-ip \
  --ports=80
```

### Step 7: Configure Domain (DNS)

```bash
# Get Load Balancer IP
gcloud compute forwarding-rules describe valentines-fr --global

# In your DNS provider (Google Domains, Route53, etc.):
# Create A record:
# d-solve.de  A  YOUR_LOAD_BALANCER_IP
# creator.d-solve.de  CNAME  YOUR_LOAD_BALANCER_IP
```

---

## 📝 Configuration

Create `.env.gcp` file in project root:

```bash
# GCP Configuration
GCP_PROJECT_ID=valentines-creator-2026
GCP_REGION=us-central1
FIRESTORE_DB=valentines-prod
GCS_BUCKET=valentines-creator-prod

# Feature Flags
ENABLE_IMAGE_COMPRESSION=true
ENABLE_SIGNED_URLS=false
ENABLE_ANALYTICS=true

# Limits
UPLOAD_MAX_SIZE=10485760  # 10MB per file
UPLOAD_MAX_TOTAL=94371840 # 90MB total
UPLOAD_TTL_DAYS=7
RATE_LIMIT_PER_HOUR=10   # Creator endpoint
RATE_LIMIT_RESOLVER=1000 # Resolver endpoint

# URLs
FRONTEND_URL=https://creator.d-solve.de
API_URL=https://api.valentines.d-solve.de
VALENTINE_PAGE_URL=https://d-solve.de
```

Load during deployment:
```bash
gcloud functions deploy uploadImages \
  --env-vars-file .env.gcp
```

---

## 🔐 Security Implementation

### Image Access Control

Images are stored with:
- **Random UUIDs** in path (unguessable)
- **No directory listing** (GCS default)
- **Public read** only to direct URLs
- **Auto-deletion** after TTL

Example path:
```
gs://valentines-creator-prod/uploads/
  f47ac10b-58cc-4372-a567-0e02b2c3d479/
    image-0.jpg
    image-1.jpg
    ...
```

### URL Shortening Security

Short IDs are:
- **16 random base62 characters** (2^96 space)
- **No sequential patterns** (not enumerable)
- **No user tracking** (anonymous creation)
- **TTL-based deletion** (7 days default)

### CORS & Rate Limiting

```javascript
// In Cloud Functions
const cors = require('@google-cloud/functions-framework').cors;

cors({ origin: 'https://creator.d-solve.de' }, (req, res) => {
  // Rate limit check
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  // ... process request
});
```

### Input Validation

```javascript
// Validate all inputs
const validateConfig = (config) => {
  if (!config.to || config.to.length > 100) throw new Error('Invalid to');
  if (!config.from || config.from.length > 100) throw new Error('Invalid from');
  if (config.message && config.message.length > 500) throw new Error('Message too long');
  if (!Array.isArray(config.imageUrls) || config.imageUrls.length !== 9) {
    throw new Error('Must have exactly 9 images');
  }
  return true;
};
```

---

## 📊 Monitoring & Analytics

### View Logs

```bash
# View Cloud Function logs
gcloud functions logs read uploadImages --region us-central1

# Real-time logs
gcloud functions logs read uploadImages --region us-central1 --limit 50 --follow

# Filter by error
gcloud functions logs read uploadImages --region us-central1 \
  --filter='severity:ERROR'
```

### Create Monitoring Dashboard

```bash
gcloud monitoring dashboards create --config='{
  "displayName": "VCaaS Monitoring",
  "gridLayout": {
    "widgets": [
      {
        "title": "Request Rate",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"cloudfunctions.googleapis.com/execution_count\""
              }
            }
          }]
        }
      },
      {
        "title": "Error Rate",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"cloudfunctions.googleapis.com/execution_times\""
              }
            }
          }]
        }
      },
      {
        "title": "Storage Size",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"storage.googleapis.com/storage/total_bytes\""
              }
            }
          }]
        }
      }
    ]
  }
}'
```

View dashboard: https://console.cloud.google.com/monitoring/dashboards

---

## 💰 Cost Management

### Set Budget Alerts

```bash
# Get billing account ID
gcloud billing accounts list

# Create budget alert
gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="VCaaS Monthly Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### Scheduled Shutdown (Save Money!)

Create scheduler to disable during off-season:

```bash
# Disable after Valentine's Day
gcloud scheduler jobs create http disable-api \
  --schedule="0 0 21 2 *" \
  --uri="https://YOUR_REGION-valentines.cloudfunctions.net/disable" \
  --http-method=POST

# Enable before Valentine's Day
gcloud scheduler jobs create http enable-api \
  --schedule="0 0 10 2 *" \
  --uri="https://YOUR_REGION-valentines.cloudfunctions.net/enable" \
  --http-method=POST
```

### View Costs

```bash
# See detailed cost breakdown
gcloud billing accounts describe ACCOUNT_ID

# Export costs to BigQuery for analysis
bq ls --project_id=BILLING_PROJECT_ID

# Query costs
bq query --use_legacy_sql=false '
  SELECT
    service.description,
    SUM(CAST(cost as FLOAT64)) as total_cost
  FROM `billing.gcp_billing_export_v1_XXXXX`
  WHERE invoice.month >= "202602"
  GROUP BY service.description
  ORDER BY total_cost DESC
'
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test upload
curl -X POST http://localhost:8080/api/v1/upload \
  -F "to=Sarah" \
  -F "from=Alex" \
  -F "message=Be mine?" \
  -F "prompt=a heart" \
  -F "correctCells=all" \
  -F "images[0]=@image1.jpg" \
  -F "images[1]=@image2.jpg" \
  ... # etc for all 9 images

# Test resolver
curl -L http://localhost:8080/api/v1/r/abc123xyz456def7

# Test config endpoint
curl http://localhost:8080/api/v1/config/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Automated Testing

```bash
# Run test suite
npm test

# Test coverage
npm run test:coverage

# Load testing (with Apache Bench)
ab -n 1000 -c 10 http://localhost:8080/api/v1/r/abc123
```

---

## 🔄 Deployment Pipeline (CI/CD)

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]
    paths:
      - 'creator/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy Backend
        run: |
          cd creator/backend
          npm install
          npm run deploy
      
      - name: Deploy Frontend
        run: |
          cd creator/frontend
          npm install
          npm run build
          npm run deploy
      
      - name: Run Tests
        run: |
          cd creator
          npm test
      
      - name: Slack Notification
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📁 Project Structure

```
creator/
├── ARCHITECTURE.md           # System design & components
├── COSTS.md                  # Cost analysis & projections
├── README.md                 # This file
│
├── frontend/                 # React creator UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── ConfigForm.jsx
│   │   │   └── Preview.jsx
│   │   ├── pages/
│   │   │   └── Creator.jsx
│   │   ├── api.js            # API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Cloud Functions
│   ├── functions/
│   │   ├── uploadImages/
│   │   │   ├── index.js      # Main handler
│   │   │   ├── package.json
│   │   │   └── validators.js
│   │   ├── resolveUrl/
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   └── getConfig/
│   │       ├── index.js
│   │       └── package.json
│   └── shared/               # Shared utilities
│       ├── firestore.js
│       ├── storage.js
│       ├── errors.js
│       └── rateLimit.js
│
├── terraform/                # IaC for GCP
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── backend.tf
│
├── scripts/                  # Deployment scripts
│   ├── deploy.sh
│   ├── cleanup.sh
│   ├── migrate.sh
│   └── costs.sh
│
└── tests/                    # Test suite
    ├── api.test.js
    ├── upload.test.js
    └── integration.test.js
```

---

## 🚨 Troubleshooting

### Images not uploading

```bash
# Check Cloud Storage permissions
gsutil bucketpolicyonly get gs://valentines-creator-prod

# Check Cloud Functions logs
gcloud functions logs read uploadImages --region us-central1 --limit 100

# Verify bucket exists
gsutil ls gs://valentines-creator-prod
```

### URLs not resolving

```bash
# Test Firestore connectivity
gcloud firestore documents list --collection=urls

# Check Firestore rules
gcloud firestore rules describe

# Test resolver function directly
gcloud functions call resolveUrl \
  --region=us-central1 \
  --data='{"shortId":"test123"}'
```

### High costs

```bash
# Check storage usage
gsutil du -sh gs://valentines-creator-prod

# Check Cloud Functions invocations
gcloud monitoring timeseries list \
  --filter='metric.type="cloudfunctions.googleapis.com/execution_count"'

# Check if auto-deletion is working
gsutil lifecycle get gs://valentines-creator-prod
```

---

## 🛠️ Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check cost trend
- Monitor storage usage

**Monthly:**
- Update dependencies
- Review security
- Analyze usage patterns

**Before Valentine:**
- Enable APIs & functions
- Test full flow
- Set up alerts
- Verify DNS

**After Valentine:**
- Disable public endpoints
- Backup data (if needed)
- Analyze metrics
- Plan improvements

### Backup Strategy

```bash
# Export all configs as backup
gcloud firestore export gs://valentines-backup-bucket/configs \
  --collection-ids=configs,urls

# Restore from backup if needed
gcloud firestore import gs://valentines-backup-bucket/configs/YYYYMMDD...
```

---

## 📚 Additional Resources

- **GCP Cloud Functions:** https://cloud.google.com/functions/docs
- **Firestore:** https://firebase.google.com/docs/firestore
- **Cloud Storage:** https://cloud.google.com/storage/docs
- **Cloud Run:** https://cloud.google.com/run/docs
- **Terraform GCP:** https://registry.terraform.io/providers/hashicorp/google/latest/docs

---

## 🎓 Learning Objectives

By building this project, you'll learn:

✅ **Serverless Architecture**
- Cloud Functions (event-driven)
- Stateless design
- Auto-scaling

✅ **GCP Services**
- Cloud Storage (blob storage)
- Firestore (NoSQL database)
- Cloud Functions (FaaS)
- Load Balancer & CDN
- Cloud Scheduler (cron jobs)

✅ **Cost Optimization**
- Resource scheduling
- Auto-scaling
- Regional deployment
- Lifecycle policies

✅ **Security**
- Input validation
- Rate limiting
- CORS policies
- Signed URLs
- TTL-based deletion

✅ **SaaS Architecture**
- Multi-tenant design (implicit via randomness)
- Stateless operations
- Minimal dependencies
- Scalability patterns

---

## 📄 License

Same as valentine-captcha project (MIT)

---

## 💬 Questions?

See troubleshooting section above, or check:
- GCP documentation
- GitHub issues
- Cloud Functions logs

---

**Status:** Ready for deployment! 🚀

Next steps:
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review [COSTS.md](./COSTS.md)
3. Follow deployment steps above
4. Test locally first
5. Deploy to GCP
6. Monitor costs

Good luck! 💌

