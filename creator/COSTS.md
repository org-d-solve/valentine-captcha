# GCP Costs Analysis & Projections
## Valentines Creator as a Service (VCaaS)

**Updated:** May 29, 2026  
**Currency:** USD  
**Region:** us-central1 (lowest cost)

---

## 💰 Cost Overview

VCaaS is designed to be **extremely cost-effective** because:
- ✅ Serverless (pay per use, zero cost when idle)
- ✅ Minimal storage (images deleted after 7 days)
- ✅ No database management (Firestore auto-scales)
- ✅ No VM instances (Cloud Functions only)
- ✅ Auto-scaling down to zero

**Bottom Line:** You can run this for **$1-10 per month** depending on volume.

---

## 📈 Usage Scenarios

### Scenario A: Small (1-100 users during Valentine week)

**Assumptions:**
- 50 creators (users who make valentines)
- 100 recipients (people who click links)
- Avg 6 images per valentine
- 5 MB avg per image
- Link clicks avg 2 per valentine

**Daily Breakdown:**
```
Uploads:
- 50 uploads/day
- 300 image uploads/day (50 × 6)
- 1.5 GB total data uploaded

Link Resolution:
- 100 clicks/day
- Small redirect overhead

Config Access:
- 100 config reads/day
```

**Monthly Cost Estimate:**

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Functions** | | |
| Upload handler | 50 invocations | $0.02 |
| Resolver | 100 invocations | $0.01 |
| Config endpoint | 100 invocations | $0.01 |
| **Firestore** | | |
| Reads | 500 reads (5¢/100k) | <$0.01 |
| Writes | 200 writes (5¢/100k) | <$0.01 |
| **Cloud Storage** | | |
| Upload (1.5 GB/day × 7 days) | 10.5 GB | $0.21 |
| Retrieval (2 GB accessed) | 2 GB | $0.10 |
| **Cloud CDN** | 100 GB transferred | $0.12 |
| **DNS** | valentine-creator domain | $0.20 |
| **Networking** | Minimal | $0 |
| **Other** | (networking, misc) | $0.05 |
| **TOTAL** | | **$0.73** |

**7-Day Valentine Week Cost: ~$0.10**

---

### Scenario B: Medium (100-1,000 users)

**Assumptions:**
- 500 creators
- 1,500 recipients
- Avg 6 images per valentine
- 5 MB avg per image
- 3 link clicks per valentine (sharing)

**Daily Breakdown:**
```
Uploads:
- 500 uploads/day
- 3,000 image uploads/day
- 15 GB total uploaded

Link Resolution:
- 4,500 clicks/day
- 25 config reads/day

Access Pattern:
- Peaks at 5pm EST (sharing surge)
- Trough at 4am EST
```

**Monthly Cost Estimate:**

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Functions** | | |
| Upload handler | 500 invocations/day × 7 | $0.35 |
| Resolver | 4,500 invocations/day × 7 | $2.10 |
| Config endpoint | 4,500 invocations/day × 7 | $2.10 |
| **Firestore** | | |
| Reads | 32,500 reads | $0.16 |
| Writes | 3,500 writes | $0.17 |
| **Cloud Storage** | | |
| Upload (100 GB/week) | 100 GB | $2.00 |
| Retrieval (20 GB) | 20 GB | $1.00 |
| **Cloud CDN** | 1,000 GB | $1.20 |
| **Load Balancer** | (optional) | $0 |
| **DNS** | | $0.20 |
| **Networking** | Minimal | $0 |
| **Other** | | $0.50 |
| **TOTAL** | | **$9.78** |

**7-Day Valentine Week Cost: ~$1.40**

---

### Scenario C: Large (1,000-10,000 users)

**Assumptions:**
- 5,000 creators
- 15,000 recipients
- Avg 6 images
- 5 MB avg per image
- 4 link clicks per valentine (high sharing)

**Daily Breakdown:**
```
Uploads:
- 5,000 uploads/day
- 30,000 image uploads/day
- 150 GB total uploaded

Link Resolution:
- 60,000 clicks/day
- 300 config reads/day

Concurrent:
- Peak: 20 concurrent functions
```

**Monthly Cost Estimate:**

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Functions** | | |
| Upload handler | 5,000 invocations/day × 7 | $3.50 |
| Resolver | 60,000 invocations/day × 7 | $28.00 |
| Config endpoint | 60,000 invocations/day × 7 | $28.00 |
| **Firestore** | | |
| Reads | 420,000 reads | $2.10 |
| Writes | 35,000 writes | $1.75 |
| **Cloud Storage** | | |
| Upload (1,050 GB/week) | 1,050 GB | $21.00 |
| Retrieval (200 GB) | 200 GB | $10.00 |
| **Cloud CDN** | 10,000 GB | $12.00 |
| **Load Balancer** | 7 days | $3.50 |
| **DNS** | | $0.20 |
| **Compute Instances** | (auto-scale) | $0 |
| **Monitoring** | | $1.00 |
| **Other** | | $2.00 |
| **TOTAL** | | **$113.05** |

**7-Day Valentine Week Cost: ~$16.15**

---

### Scenario D: Very Large (10,000+ users)

**Assumptions:**
- 50,000 creators
- 150,000 recipients
- Avg 6 images
- 5 MB avg
- 5 link clicks per valentine (viral)
- Multi-region deployment required

**Daily Breakdown:**
```
Uploads:
- 50,000 uploads/day
- 300,000 image uploads/day
- 1.5 TB total uploaded

Link Resolution:
- 750,000 clicks/day
- Concurrent functions: 200+

Geo-distribution:
- us-central1: 50%
- europe-west1: 30%
- asia-east1: 20%
```

**Monthly Cost Estimate:**

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Functions** (multi-region) | | |
| Upload handler | 350,000 invocations | $140.00 |
| Resolver | 5,250,000 invocations | $2,100.00 |
| Config endpoint | 5,250,000 invocations | $2,100.00 |
| **Firestore** (multi-region) | | |
| Reads | 21,000,000 reads | $105.00 |
| Writes | 350,000 writes | $17.50 |
| **Cloud Storage** | | |
| Upload (10.5 TB/week) | 10,500 GB | $210.00 |
| Retrieval (2 TB) | 2,000 GB | $100.00 |
| **Cloud CDN** | 100,000 GB | $120.00 |
| **Nginx Reverse Proxy** (d-solve.de) | | $0 |
| **DNS** | (A record on d-solve.de) | $0 |
| **Monitoring & Logging** | | $50.00 |
| **Other** | | $50.00 |
| **TOTAL** | | **$4,863.70** |

**7-Day Valentine Week Cost: ~$763.24**

---

## 💡 Cost Optimization Strategies

### 1. **Scheduled Shutdown (Recommended)**

Deploy API only during Valentine week (Feb 10-20):

```
Before Valentine:
- Frontend: Always on (~$0.50/month)
- API: Disabled ($0)
- Database: Minimal ($0)
- Storage: Minimal ($0)
Total: ~$0.50/month

During Valentine (Feb 10-20):
- All services enabled
- Cost: as calculated above
- Duration: 10 days max

After Valentine:
- Delete old data (7-day TTL)
- Disable API again
- Keep frontend ($0.50)
- Cost: minimal again
```

**Implementation:**
```bash
# Deploy scheduler
gcloud scheduler jobs create app-engine disable-api \
  --schedule="0 0 21 2 *" \
  --http-method POST \
  --uri=https://cloud.googleapis.com/disable-api

gcloud scheduler jobs create app-engine enable-api \
  --schedule="0 0 10 2 *" \
  --http-method POST \
  --uri=https://cloud.google.com/enable-api
```

### 2. **File Size Optimization**

Compress images before storage:

```javascript
// In upload handler
const sharp = require('sharp');

async function compressImage(buffer) {
  return await sharp(buffer)
    .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}
// Reduces 5MB image to ~400KB
```

**Impact:** Reduces storage by ~90%, transfer by ~90%

### 3. **Caching Strategy**

Use Cloud CDN to cache redirect responses:

```yaml
# Cloud Load Balancer config
caching:
  ttl: 3600 # 1 hour cache on redirects
  negative_ttl: 300 # Cache 404s for 5 mins
```

**Impact:** Reduces functions by ~80% during peak hours

### 4. **Regional Deployment**

For small volumes (Scenario A & B): Use only `us-central1`  
For large volumes (Scenario C & D): Add `europe-west1` as needed

**Cost Reduction:** 30-50% lower than multi-region for small volumes

### 5. **Cloud Storage Lifecycle**

Auto-delete old files:

```yaml
# gs://valentines-creator-prod/lifecycle.yaml
lifecycle:
  rules:
  - action: Delete
    condition:
      age: 30 # Delete after 30 days
```

**Impact:** Keeps storage costs low, automatic cleanup

### 6. **Firestore Partitioning**

Use document paths to optimize reads:

```javascript
// Good (indexed):
/configs/{configId}/data

// Avoid (full collection scan):
/configs?where=createdAt > now
```

**Impact:** Reduces read costs by 60-80%

---

## 📊 Cost Comparison Table

| Scenario | Volume | 7-Day Cost | Monthly* | Per-User Cost |
|----------|--------|-----------|---------|--------------|
| **A: Small** | 1-100 users | $0.10 | $0.73 | $0.001 |
| **B: Medium** | 100-1k | $1.40 | $9.78 | $0.010 |
| **C: Large** | 1k-10k | $16.15 | $107.05 | $0.011 |
| **D: Very Large** | 10k+ | $763.24 | $4,863.70 | $0.038 |

*Assuming 7-day Valentine week only

### With Optimization:
```
Scenario A: $0.05 (compression)
Scenario B: $0.70 (compression + caching)
Scenario C: $8.00 (compression + caching + regional)
Scenario D: $2,000+ (requires mitigation strategies)
```

---

## 🌍 DNS & Reverse Proxy Architecture

**We use your existing d-solve.de server** to route traffic:

```
User clicks: https://d-solve.de/v/aBcD3fGhIjKlMnOp
    ↓
Nginx on d-solve.de reverses to GCP Cloud Functions
    ↓
https://us-central1-project-id.cloudfunctions.net/resolveUrl?shortId=...
    ↓
Returns 302 redirect to Valentine page
    ↓
User sees: https://d-solve.de/?to=Sarah&from=Alex&img0=...
```

**Cost impact:** $0 additional (uses existing d-solve.de infrastructure)

---

## 🛡️ Cost Controls

### Hard Limits (Prevent Runaway Costs)

**Set GCP Budget Alerts:**

```bash
gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="VCaaS Monthly Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

**Set Cloud Functions Limits:**
```yaml
runtime: nodejs18
memory: 256MB # Limit memory per function
timeout: 30s # Limit execution time
maxInstances: 50 # Prevent auto-scaling beyond this
```

**Set Cloud Storage Limits:**
```bash
gsutil quota set gs://valentines-creator-prod 100GB
```

### Quotas:

| Resource | Quota | Cost Impact |
|----------|-------|-------------|
| Cloud Functions invocations/day | 100,000 | $50 max |
| Firestore reads/day | 1,000,000 | $5 max |
| Firestore writes/day | 100,000 | $5 max |
| Cloud Storage bandwidth/day | 500 GB | $50 max |

---

## 📈 Scale Path & Pricing

### Path 1: Stay Small (Best for Fun Project)

```
Traffic: 1-100 users during Valentine week
Cost: $0.10-1 for the entire week
Infrastructure: Single region, no optimization needed
Effort: Minimal
Recommendation: Just enable during Valentine period
```

### Path 2: Moderate Growth (Medium Scale)

```
Traffic: 100-1,000 users
Cost: $1.40-15 per week (with optimizations)
Infrastructure: Single region + d-solve.de nginx proxy
Effort: Minimal (already have d-solve.de, add 3 nginx lines)
Recommendation: This is the sweet spot! Zero extra infrastructure cost.
```

### Path 3: Large Scale (Enterprise)

```
Traffic: 1,000-10,000+ users
Cost: $16-500+ per week
Infrastructure: Single region (us-central1), d-solve.de nginx reverse proxy
Effort: Minimal (still just nginx, GCP scales Functions automatically)
Recommendation: Still very cheap due to serverless. Charge users only if commercializing.
```

---

## 💵 Monetization Options (If Needed)

If costs become significant, you could:

### Option A: Free + Premium Tiers
```
Free: 
  - Max 3 images
  - 24 hour expiration
  - Basic styling

Premium ($1):
  - 9 images
  - 7 day expiration
  - Custom styling
  - Analytics
```

### Option B: Donation Model
```
"Create valentines for free, optional donation covers costs"
Target: $0.50 per valentine
Expected conversion: 1-5%
Revenue per 100 valentines: $0.25-2.50
```

### Option C: B2B Licensing
```
"White-label solution for event planners, florists, etc."
$50/month for branded Valentine creator
Revenue: 10-50 customers × $50 = $500-2,500/month
Covers all costs + profit
```

---

## 🎯 Recommended Configuration (With d-solve.de Nginx)

### For This Project (Valentine Fun):

```
Budget: $50/month (max safety limit, should spend ~$3-5)
Traffic target: 1,000 users max
Duration: Feb 10-20 only
Cost estimate: $2-5 for the week

Configuration:
✅ Single region (us-central1)
✅ Nginx reverse proxy on d-solve.de (existing server)
✅ Image compression enabled
✅ 7-day TTL for auto-cleanup
✅ Rate limiting enabled
✅ Scheduled enable/disable (optional, Cloud Functions already scale to zero)
❌ Multi-region (not needed)
❌ Cloud Load Balancer (using nginx instead, free)
❌ Cloud Armor (overkill for a fun project)
❌ Backup replication (not needed)

Expected costs if done well:
- Week of Valentine: $3-5 (Cloud Functions + storage only)
- Rest of year: $0 (Cloud Functions idle cost = $0, storage minimal)
- Annual: $5-10 total (just the Valentine week)
- Nginx proxy: $0 (already have d-solve.de)
```

---

## 📋 Cost Monitoring Dashboard

After deployment, create a dashboard:

```bash
gcloud monitoring dashboards create \
  --config='{
    "displayName": "VCaaS Costs",
    "gridLayout": {
      "widgets": [
        {
          "title": "Daily Cost Trend",
          "xyChart": {...}
        },
        {
          "title": "Cost by Service",
          "pieChart": {...}
        },
        {
          "title": "Storage Growth",
          "lineChart": {...}
        },
        {
          "title": "Request Rates",
          "lineChart": {...}
        }
      ]
    }
  }'
```

View at: https://console.cloud.google.com/monitoring/dashboards

---

## 🚨 Cost Alerts Setup

Prevent surprises:

```bash
# Alert if daily cost > $20
gcloud alpha monitoring alert-policies create \
  --notification-channel=CHANNEL_ID \
  --display-name="VCaaS Daily Cost Alert" \
  --condition-display-name="Cost > \$20" \
  --condition-threshold-value=20 \
  --condition-threshold-duration=3600
```

---

## Summary

| Metric | Value |
|--------|-------|
| **Minimum Monthly Cost** | $0.50 (frontend only, disabled) |
| **Typical Week Cost** (Scenario B) | $1.40 |
| **Worst Case (Very Large)** | $5,348/month |
| **Recommended Budget** | $50/month |
| **Cost per User (Small)** | $0.001-0.01 |
| **Cost per User (Large)** | $0.01-0.04 |
| **Break-even (at $1/valentine)** | 100+ users |

**Bottom Line:** This project can run **nearly free** if kept small and disabled outside Valentine season.

