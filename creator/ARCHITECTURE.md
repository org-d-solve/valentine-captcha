# Architecture: Valentines Creator as a Service (VCaaS)

**Version:** 1.0  
**Created:** 2026-05-29  
**Status:** Design & Implementation Guide

---

## 🎯 Overview

A lightweight, serverless SaaS platform for creating personalized Valentine messages. Users upload images, configure recipients/messages, and receive a shareable URL—all without login.

```
┌─────────────────────────────────────────────────────────────┐
│             Creator Interface (Web)                         │
│  • Image Upload                                             │
│  • Configure Names, Message, Captcha Cells                 │
│  • Generate Short URL                                       │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│             Backend (GCP Cloud Functions)                   │
│  • Upload Handler (images to Cloud Storage)                │
│  • Config Manager (store JSON configs)                      │
│  • URL Shortener (random short IDs → full paths)           │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│         Data Layer (GCP Cloud Storage + Datastore)         │
│  • Images: /uploads/{randomId}/image-{1-9}.jpg            │
│  • Configs: /configs/{randomId}/config.json                │
│  • URL Mapping: Firestore collection `urls`                │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│         Public Valentine Page (Redirect)                    │
│  https://d-solve.de/v/{shortId}                            │
│  • Resolves to full config URL                             │
│  • Loads original Valentine page with custom data          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Components

### 1. **Creator Interface** (React Frontend)
**Location:** `/creator/frontend`

Features:
- Image upload (drag & drop)
- Form for names, message, prompt
- Interactive grid (select which images = correct answer)
- Real-time preview
- Generate & copy short URL

Tech Stack:
- React 18
- Vite (fast build)
- TailwindCSS (styling)
- Axios (API calls)
- React Drop Zone (drag & drop)

### 2. **Backend** (Node.js + Cloud Functions)
**Location:** `/creator/backend`

Three main functions:

**a) `uploadImages` (POST /api/v1/upload)**
```
POST /api/v1/upload
multipart/form-data
├── images[0..8]: File
└── metadata: JSON
  ├── to: string
  ├── from: string
  ├── message: string
  ├── prompt: string
  ├── correctCells: string | number[]
  └── ttl: number (seconds, default 604800 = 7 days)

Response:
├── configId: string (random ID)
├── shortUrl: string
├── fullUrl: string
└── expiresAt: ISO8601
```

**b) `resolveUrl` (GET /api/v1/r/{shortId})**
```
GET /api/v1/r/{shortId}

Response (302 redirect):
Location: https://d-solve.de/?
  configId={configId}
  &from=...
  &to=...
  &img0=https://storage.googleapis.com/...
  ...
```

**c) `getConfig` (GET /api/v1/config/{configId})**
```
GET /api/v1/config/{configId}

Response (JSON):
{
  to: string,
  from: string,
  message: string,
  prompt: string,
  correctCells: "all" | "any" | number[],
  images: string[9],
  createdAt: ISO8601,
  expiresAt: ISO8601
}
```

### 3. **Data Storage**

**Cloud Storage (GCS) Bucket Structure:**
```
gs://valentines-creator-{env}/
├── uploads/
│   └── {configId}/
│       ├── image-0.jpg
│       ├── image-1.jpg
│       ├── ...
│       └── image-8.jpg
└── configs/
    └── {configId}/
        └── config.json
```

**Firestore (URL Mapping):**
```
Collection: urls
Document: {shortId}
├── configId: string
├── createdAt: timestamp
├── expiresAt: timestamp
└── accessCount: number
```

### 4. **Security Model**

**Image Access Control:**
- Images stored with **random UUIDs** in path
- **No directory listing** (GCS default)
- **Public read access** only to direct URLs
- **TTL-based deletion** (default 7 days)
- **No authentication required** (but URLs are unguessable)

**Config Access Control:**
- Configs stored in **Firestore** (not directly accessible)
- Only via `/api/v1/config/{configId}` with validation
- Client receives config via redirect URL with query params
- Config **self-destructs** after TTL

**URL Shortening:**
- `shortId` = 16-character random string (base62)
- Probability of collision: negligible (2^96 space)
- No sequential IDs (unguessable)
- No enumeration possible

---

## 📊 Data Flow

### Creation Flow:

```
1. User uploads images via form
   ↓
2. Frontend validates (file types, sizes, count)
   ↓
3. POST /api/v1/upload with multipart data
   ↓
4. Backend generates random configId & shortId
   ↓
5. Images uploaded to GCS: /uploads/{configId}/image-{0-8}.jpg
   ↓
6. Config stored in Firestore: {configId}
   ↓
7. URL mapping stored: {shortId} → {configId}
   ↓
8. Set TTL deletion (7 days from now)
   ↓
9. Return: https://d-solve.de/v/{shortId}
```

### Access Flow:

```
1. User shares: https://d-solve.de/v/{shortId}
   ↓
2. Recipient clicks link
   ↓
3. API resolves {shortId} → {configId}
   ↓
4. Redirect to Valentine page with:
   - Config query params (to, from, message, etc.)
   - Direct GCS URLs for images (pre-signed if needed)
   ↓
5. Valentine page loads custom content
```

---

## 🔐 Security Considerations

### **Threats & Mitigations:**

| Threat | Mitigation |
|--------|-----------|
| **Brute force short IDs** | 16-char random (2^96 space), rate limiting on redirect endpoint |
| **Directory listing abuse** | GCS block public list access, only read via direct URLs |
| **Image hotlinking from other sites** | Signed URLs (optional), or referer checking |
| **Spam/abuse** | Rate limiting, file size limits, CAPTCHA on creator form |
| **Large file uploads** | Max 10MB per image (90MB total) |
| **Storage exhaustion** | TTL deletion, per-user limits (future) |

### **Configuration:**

Creator endpoint `/api/v1/upload`:
- **Rate limit:** 10 requests/hour per IP
- **File size:** Max 10MB each, 90MB total
- **File types:** JPEG, PNG, WebP only
- **Image dimensions:** 1MB-10MB (enforced)
- **TTL:** Default 7 days, max 30 days

Resolver endpoint `/api/v1/r/{shortId}`:
- **Rate limit:** 1000 requests/hour per IP (generous for sharing)
- **No auth required** (public endpoint)
- **Redirect only** (no content served directly)

---

## 💾 Database Schema

### Firestore Collections:

**Collection: `urls`**
```javascript
{
  shortId: "abc123xyz456def7",
  configId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  createdAt: Timestamp,
  expiresAt: Timestamp,
  accessCount: 123,
  lastAccessedAt: Timestamp
}
```

**Collection: `configs`**
```javascript
{
  configId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  to: "Sarah",
  from: "Alex",
  message: "Custom message here",
  prompt: "a heart",
  correctCells: "all" | "any" | [0,1,2,3,4,5,6,7,8],
  imageUrls: [
    "https://storage.googleapis.com/valentines-creator-prod/uploads/.../image-0.jpg",
    // ... 8 more
  ],
  createdAt: Timestamp,
  expiresAt: Timestamp,
  ipAddress: "192.168.1.1" (hashed),
  ttlSeconds: 604800
}
```

---

## 🚀 Deployment Architecture

### Development (localhost):
```
Frontend: http://localhost:3000
Backend: http://localhost:8080
Firestore: local emulator
Storage: local filesystem
```

### Staging (GCP):
```
Frontend: Cloud Storage + Cloud CDN
  https://staging-creator.d-solve.de

Backend: Cloud Functions (us-central1)
  https://us-central1-valentines-staging.cloudfunctions.net

Firestore: GCP Firestore (us-central1)

Storage: gs://valentines-creator-staging
```

### Production (GCP):
```
Frontend: Cloud Storage + Cloud CDN
  https://creator.d-solve.de

Backend: Cloud Functions (multi-region with Load Balancer)
  https://valentines-creator.d-solve.de/api

Firestore: GCP Firestore (multi-region)

Storage: gs://valentines-creator-prod
  with lifecycle policies for auto-deletion
```

---

## 📈 Scaling Strategy

### Traffic Patterns:
- **Normal:** ~0 requests/day (off-season)
- **Valentine week:** 100-10,000 requests/day peak
- **Spikes:** Possible 10x during promotional periods

### Auto-Scaling:
- **Cloud Functions:** Auto-scale 0 → 1000 instances
- **Firestore:** Auto-scale reads/writes as needed
- **Cloud Storage:** No scaling needed (object storage)
- **Cloud CDN:** Auto-cache frontend assets

### Cost Optimization:
- **Scheduled shutdown:** Disable public endpoints outside Valentine period
- **Delete old configs:** TTL-based auto-deletion
- **Archive old images:** Move to cheaper storage class after 30 days
- **Regional compute:** Run in cheapest region

---

## 🔄 Data Lifecycle

### Creation → Expiration:

```
Day 0 - User creates valentine
  ↓ Image uploaded to GCS
  ↓ Config stored in Firestore
  ↓ URL mapping created
  ↓ TTL scheduler activated (7 days)

Days 1-6 - Valentine is shareable
  ↓ Links resolve normally
  ↓ Access count tracked
  ↓ Usage analytics collected

Day 7 - TTL expires
  ↓ Firestore config auto-deleted
  ↓ URL mapping auto-deleted
  ↓ GCS images marked for deletion

Day 8 - Cleanup
  ↓ GCS images deleted by lifecycle policy
  ↓ Old storage freed up
  ↓ Short URL returns 404
```

---

## 🎛️ Configuration Management

### Environment Variables:
```bash
GCP_PROJECT_ID=my-project-123
GCP_REGION=us-central1
GCS_BUCKET=valentines-creator-prod
FIRESTORE_DB=valentines-prod

UPLOAD_MAX_SIZE=10485760 # 10MB per file
UPLOAD_MAX_TOTAL=94371840 # 90MB total
UPLOAD_TTL_SECONDS=604800 # 7 days

RATE_LIMIT_CREATOR=10 # requests/hour
RATE_LIMIT_RESOLVER=1000 # requests/hour

FRONTEND_URL=https://creator.d-solve.de
API_URL=https://api.creator.d-solve.de
VALENTINE_PAGE_URL=https://d-solve.de

ENABLE_ANALYTICS=true
ENABLE_SIGNED_URLS=false # Consider true for production
```

---

## 📊 Monitoring & Analytics

### Metrics to Track:
- **Upload success rate** (%)
- **Config creation/deletion ratio** (to detect abuse)
- **URL access patterns** (heatmap over time)
- **Average file sizes** (to estimate storage costs)
- **Error rates** (upload failures, redirects, timeouts)
- **Peak request times** (optimize scheduling)

### Logging:
```
Cloud Logging (auto-collected from Cloud Functions):
- request_id
- timestamp
- endpoint
- status_code
- response_time_ms
- user_ip (anonymized)
- file_size
- error_message (if any)
```

---

## 🔄 Integration with Valentine Page

The existing Valentine page (`app.jsx`) is **not modified**. Instead:

1. Creator generates URL: `https://d-solve.de/v/{shortId}`
2. Resolver (Cloud Function) redirects to: `https://d-solve.de/?to=...&from=...&img0=...&etc`
3. Existing Valentine page uses URL params (already supports this!)

**No changes needed to Valentine page code.**

---

## 📝 API Endpoints

### Public API (v1)

**POST /api/v1/upload**
```
Content-Type: multipart/form-data

Files:
- images[0]: image file
- images[1]: image file
- ...
- images[8]: image file

Form fields:
- to: string (max 100 chars)
- from: string (max 100 chars)
- message: string (max 500 chars)
- prompt: string (max 100 chars)
- correctCells: "all" | "any" | "0,1,2,3,4,5,6,7,8"
- ttl: number (seconds, 86400-2592000)

Response 200:
{
  configId: "uuid",
  shortId: "16charrandstring",
  shortUrl: "https://d-solve.de/v/16charrandstring",
  fullUrl: "https://d-solve.de/?to=...&from=...&img0=...&etc",
  previewUrl: "https://staging-creator.d-solve.de/preview/16charrandstring",
  expiresAt: "2026-02-20T00:00:00Z"
}

Response 400/413:
{
  error: "validation_error",
  message: "...",
  details: {...}
}
```

**GET /api/v1/r/{shortId}**
```
Response 302 Redirect:
Location: https://d-solve.de/?to=Sarah&from=Alex&img0=...&msg=...&etc

Response 404:
{
  error: "not_found",
  message: "Short URL expired or invalid"
}
```

**GET /api/v1/config/{configId}**
```
Response 200:
{
  configId: "uuid",
  to: "Sarah",
  from: "Alex",
  message: "...",
  prompt: "a heart",
  correctCells: "all",
  imageUrls: ["https://...", ...],
  createdAt: "2026-02-14T...",
  expiresAt: "2026-02-21T...",
  accessCount: 5
}

Response 404:
{
  error: "not_found",
  message: "Config expired or invalid"
}
```

---

## 🛡️ Rate Limiting Strategy

**Creator Endpoint (upload):**
```
Per IP: 10 requests/hour
Per User (cookie): 50 requests/day
Global: 1000 requests/hour
Penalty: 429 Too Many Requests → exponential backoff
```

**Resolver Endpoint (redirect):**
```
Per IP: 1000 requests/hour
Per shortId: No limit (shared links)
Global: 100,000 requests/hour
Penalty: 429 Too Many Requests → exponential backoff
```

**Rationale:**
- Creator is meant for human interaction (low volume, strict limits)
- Resolver is meant for sharing (high volume, generous limits)
- Prevents spam and abuse without breaking legitimate use

---

## 🌍 Regional Deployment

### Primary Region: `us-central1`
- Lowest cost on GCP
- Adequate latency for global users (~100-200ms)
- Sufficient for Valentine week traffic

### Optional Multi-Region (for large scale):
```
Cloud Functions: us-central1, europe-west1, asia-east1
Load Balancer: Global
Firestore: Multi-region replication
```

---

## 📋 Summary Table

| Component | Technology | Cost | Notes |
|-----------|-----------|------|-------|
| Frontend | Cloud Storage + CDN | ~$0.1/month | Static hosting |
| API | Cloud Functions | $0-2/month | Pay per invocation |
| Database | Firestore | $0-1/month | Free tier sufficient |
| Storage | Cloud Storage | $0-5/month | Depends on data volume |
| Domain | Cloud DNS | $0.20/month | Minimal |
| **Total** | | **~$0.5-8/month** | Highly dependent on volume |

---

**Next Steps:**
1. Implement backend Cloud Functions
2. Build creator frontend
3. Deploy to GCP
4. Set up monitoring
5. Document operations

