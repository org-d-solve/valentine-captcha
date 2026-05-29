# Netcup Server: Multicontainer Valentine Creator Deployment

This is the **production-grade, reusable architecture** for deploying the Valentine Creator on your Netcup server with Docker/Kubernetes. Use this as your template for all future multicontainer apps.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│  Your Netcup Server (192.168.x.x)       │
├─────────────────────────────────────────┤
│  Traefik (reverse proxy + TLS)          │
│  ├─ routes /creator/ → creator-web     │
│  ├─ routes /api/v1/* → gcp-proxy       │
│  ├─ routes /v/* → gcp-resolver         │
│  └─ auto-HTTPS (Let's Encrypt)          │
├─────────────────────────────────────────┤
│  Docker Network: valentine              │
│  ├─ creator-web (Node.js serving HTML) │
│  ├─ gcp-proxy (reverse proxy to GCP)    │
│  └─ traefik (orchestrates routing)      │
├─────────────────────────────────────────┤
│  External (GCP)                         │
│  ├─ Cloud Functions (API backend)       │
│  ├─ Firestore (database)                │
│  └─ Cloud Storage (images)              │
└─────────────────────────────────────────┘

User accesses: https://d-solve.de/v/abc123
    ↓
Traefik on Netcup routes to gcp-proxy container
    ↓
gcp-proxy reverse-proxies to GCP Cloud Functions
    ↓
Response redirects to Valentine page
```

**Benefits:**
- ✅ Everything runs on your hardware (no Load Balancer cost)
- ✅ Same pattern works for 50+ future apps
- ✅ Auto-SSL (Let's Encrypt via Traefik)
- ✅ Auto-restart + health checks
- ✅ Easy to add more services (just add another container)
- ✅ Can switch to k3s (Kubernetes) later without rewriting

---

## 🐳 Option 1: Docker Compose (Simple)

### Setup File Structure

```
/opt/valentine-creator/
├── docker-compose.yml
├── traefik/
│   ├── traefik.yml
│   ├── config.yml
│   └── acme.json (auto-generated)
├── creator-web/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── dist/ (frontend build)
└── gcp-proxy/
    ├── Dockerfile
    └── nginx-gcp.conf
```

### Step 1: Install Docker & Docker Compose

```bash
# On Netcup server
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Step 2: Create Docker Compose Config

**File: `/opt/valentine-creator/docker-compose.yml`**

```yaml
version: '3.8'

services:
  # Traefik reverse proxy + SSL termination
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: always
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080" # Dashboard (internal only)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik/traefik.yml:/traefik.yml:ro
      - ./traefik/config.yml:/config.yml:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - valentine
    environment:
      - TRAEFIK_API_DASHBOARD=true
      - TRAEFIK_API_INSECURE=false # Only accessible internally
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.internal`)"
      - "traefik.http.routers.traefik.service=api@internal"

  # Creator frontend (React build served by Nginx)
  creator-web:
    build:
      context: ./creator-web
      dockerfile: Dockerfile
    container_name: creator-web
    restart: always
    expose:
      - "80"
    networks:
      - valentine
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.creator.rule=Host(`d-solve.de`) && PathPrefix(`/creator`)"
      - "traefik.http.routers.creator.entrypoints=websecure"
      - "traefik.http.routers.creator.tls.certresolver=letsencrypt"
      - "traefik.http.services.creator.loadbalancer.server.port=80"

  # GCP reverse proxy (proxies /api/v1/* and /v/* to Cloud Functions)
  gcp-proxy:
    build:
      context: ./gcp-proxy
      dockerfile: Dockerfile
    container_name: gcp-proxy
    restart: always
    expose:
      - "80"
    networks:
      - valentine
    labels:
      - "traefik.enable=true"
      # Route /api/v1/* to GCP
      - "traefik.http.routers.api.rule=Host(`d-solve.de`) && PathPrefix(`/api/v1`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      # Route /v/* to GCP resolver
      - "traefik.http.routers.resolver.rule=Host(`d-solve.de`) && PathPrefix(`/v`)"
      - "traefik.http.routers.resolver.entrypoints=websecure"
      - "traefik.http.routers.resolver.tls.certresolver=letsencrypt"
      - "traefik.http.services.gcp-proxy.loadbalancer.server.port=80"

networks:
  valentine:
    driver: bridge
```

### Step 3: Traefik Configuration

**File: `/opt/valentine-creator/traefik/traefik.yml`**

```yaml
api:
  dashboard: true
  insecure: false  # Only access via localhost:8080

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    watch: true
  file:
    filename: /config.yml
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@d-solve.de
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

**File: `/opt/valentine-creator/traefik/config.yml`**

```yaml
# Additional Traefik middleware (optional)
# Can be extended for rate limiting, auth, etc.
http:
  middlewares:
    compress:
      compress: {}
    cors:
      headers:
        accessControlAllowOriginList:
          - "https://d-solve.de"
        accessControlAllowMethods:
          - GET
          - POST
          - OPTIONS
```

### Step 4: Creator Web Container

**File: `/opt/valentine-creator/creator-web/Dockerfile`**

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN VITE_API_URL="https://d-solve.de/api/v1" npm run build

# Serve with Nginx
FROM nginx:alpine
COPY creator-web/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**File: `/opt/valentine-creator/creator-web/nginx.conf`**

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml application/atom+xml image/svg+xml;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # SPA routing: send all non-file requests to index.html
        location / {
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
        }

        # Cache assets long-term
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, max-age=2592000, immutable";
        }

        # Disable caching for index.html
        location = /index.html {
            expires -1;
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }
    }
}
```

### Step 5: GCP Proxy Container

**File: `/opt/valentine-creator/gcp-proxy/Dockerfile`**

```dockerfile
FROM nginx:alpine
COPY gcp-proxy/nginx-gcp.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**File: `/opt/valentine-creator/gcp-proxy/nginx-gcp.conf`**

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr [$time_local] "$request" $status $bytes_sent';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Replace with your actual GCP project + region
    upstream gcp_api {
        server us-central1-project-id-123.cloudfunctions.net;
    }

    server {
        listen 80;
        server_name _;

        # /api/v1/* → Cloud Functions
        location /api/v1/ {
            proxy_pass https://gcp_api/;
            proxy_set_header Host gcp_api;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_ssl_verify off;

            # Upload limits
            client_max_body_size 100M;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # CORS
            add_header 'Access-Control-Allow-Origin' 'https://d-solve.de' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type' always;

            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }

        # /v/{shortId} → GCP resolver (returns 302)
        location ~ ^/v/([a-zA-Z0-9]+)$ {
            proxy_pass https://gcp_api/resolveUrl?shortId=$1;
            proxy_set_header Host gcp_api;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_ssl_verify off;
        }

        # Health check endpoint
        location /health {
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Step 6: Deploy

```bash
# Create directory structure
mkdir -p /opt/valentine-creator/{traefik,creator-web,gcp-proxy}

# Copy all files (docker-compose.yml, Dockerfiles, nginx configs)
# ...

# Create empty acme.json for Let's Encrypt
touch /opt/valentine-creator/traefik/acme.json
chmod 600 /opt/valentine-creator/traefik/acme.json

# Start everything
cd /opt/valentine-creator
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f traefik
```

### Step 7: Verify

```bash
# Test creator UI
curl -k https://d-solve.de/creator/

# Test API
curl -k https://d-solve.de/api/v1/upload

# Test resolver
curl -kL https://d-solve.de/v/test-short-id

# Check Traefik dashboard (internal only)
# ssh tunnel: ssh -L 8080:localhost:8080 user@netcup-ip
# Then: http://localhost:8080/dashboard/
```

---

## ☸️ Option 2: Kubernetes (k3s) — Future-Proof

If you want the **enterprise-grade setup** (more scalable for 50+ services), use k3s (lightweight Kubernetes):

```bash
# Install k3s
curl -sfL https://get.k3s.io | sh -

# Add Traefik ingress controller (pre-installed with k3s)
# Deploy manifests similar to Docker Compose but as k8s YAMLs
```

I can provide full k3s manifests if you want that path.

---

## 🚀 Deployment Checklist

```
[ ] Install Docker + Docker Compose on Netcup
[ ] Create /opt/valentine-creator directory
[ ] Copy docker-compose.yml, Dockerfiles, nginx configs
[ ] Update traefik.yml with your email
[ ] Update gcp-proxy nginx.conf with your GCP project ID + region
[ ] docker-compose up -d
[ ] Wait 2 min for Let's Encrypt cert (check acme.json)
[ ] Test all URLs (creator, api, resolver)
[ ] Set up monitoring/logging (optional)
```

---

## 💡 Extending This for Future Apps

Once you have this running, adding new services is trivial:

```yaml
# docker-compose.yml (add this service)
  my-new-app:
    build:
      context: ./my-new-app
    container_name: my-new-app
    restart: always
    expose:
      - "8000"
    networks:
      - valentine  # Reuse same network!
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapp.rule=Host(`d-solve.de`) && PathPrefix(`/myapp`)"
      - "traefik.http.routers.myapp.entrypoints=websecure"
      - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
```

Done. New app live at `https://d-solve.de/myapp`.

---

## 📊 Costs

| Item | Cost |
|------|------|
| Netcup Server (running already) | $0 additional |
| Docker/Docker Compose | Free (open source) |
| Traefik | Free (open source) |
| Let's Encrypt SSL | Free |
| GCP Cloud Functions (Valentine API) | $3–5/week |
| **Total (Valentine week)** | **$3–5** |
| **Annual** | **~$5** |

**vs. nginx on d-solve.de:** No difference in cost, but this Netcup setup is **reusable for unlimited apps**.

---

## 🎓 What You Learn

- ✅ Docker containers
- ✅ Docker Compose orchestration
- ✅ Reverse proxy routing (Traefik)
- ✅ Auto-SSL (Let's Encrypt)
- ✅ Multi-service architecture
- ✅ Network isolation
- ✅ Can upgrade to Kubernetes anytime

This is **production-grade** and **reusable**.

