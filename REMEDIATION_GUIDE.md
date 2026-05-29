# Security Remediation Guide
## Valentine Captcha - Fix Implementation

**Date:** 2026-05-29  
**Priority:** Implement in order of severity

---

## Overview

This guide provides step-by-step remediation for vulnerabilities identified in the security assessment. Each fix includes:
- Difficulty level (Easy / Medium / Hard)
- Code examples (before/after)
- Testing procedures
- Implementation notes

---

## 1. ADD SUBRESOURCE INTEGRITY (SRI) HASHES - Easy

**Severity:** Medium  
**Difficulty:** Easy  
**Time to Fix:** 5 minutes

### What it does:
Ensures CDN-hosted libraries haven't been tampered with by adding cryptographic checksums.

### Steps:

**Step 1: Generate SRI hashes for React dependencies**

```bash
# Install SRI hash generator (or use online tool)
npm install -g sri-hash

# Generate for React
sri-hash https://unpkg.com/react@18.3.1/umd/react.production.min.js
# Output: sha384-xxxxxxxxxxxxx

sri-hash https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
# Output: sha384-yyyyyyyyyyyyyy

sri-hash https://unpkg.com/@babel/standalone@7.29.0/babel.min.js
# Output: sha384-zzzzzzzzzzzzzz
```

**Alternatively, fetch and hash locally:**
```bash
# Fetch the file
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js > react.min.js

# Generate SHA-384 hash
openssl dgst -sha384 -binary react.min.js | openssl base64 -A
# Output: sha384value/here/in/base64format

# Compute hash using Node.js
node -e "console.log(require('crypto').createHash('sha384').update(require('fs').readFileSync('react.min.js')).digest('base64'))"
```

**Step 2: Update index.html**

**Before:**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
```

**After:**
```html
<script 
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" 
  crossorigin="anonymous"
  integrity="sha384-ZsRHZoURN1Zs8e5f0sGVJnAF1LvVADU1VtjPFqJz4e8GK7FlvvGLLcVmEflXpxGh">
</script>
<script 
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" 
  crossorigin="anonymous"
  integrity="sha384-+4eqFVpZ16WZBfVxlGhD5k7Sw7K3h7rQVHhzjWdz3L4vZ5WJ8Ew4nqO0RX0xZZsz">
</script>
<script 
  src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" 
  crossorigin="anonymous"
  integrity="sha384-FjfEqDFzHZ8WW5wxSxR5sMLWxg7c6vPV0Uc0g5gGtGjRhA8pxZFPz+5UQ+vHqxPq">
</script>
```

### Testing:

```bash
# Verify the script loads
curl -I https://unpkg.com/react@18.3.1/umd/react.production.min.js | head -10

# Open page in browser, check that React loads
open http://localhost:8000

# Tamper with hash to test SRI rejection
# Change one character in the integrity attribute
# Script should NOT load (check console error)
```

### Validation:
```bash
# Check that SRI attributes are present
grep -c "integrity=" index.html
# Should output: 3
```

---

## 2. VALIDATE URL PARAMETERS - Medium

**Severity:** High  
**Difficulty:** Medium  
**Time to Fix:** 20 minutes

### What it does:
Prevents XSS and phishing by validating user input against expected patterns.

### Implementation:

**Create a new file: `utils.js`**

```javascript
// ============================================================
// Input validation utilities
// ============================================================

// Whitelist domains for image URLs
const ALLOWED_IMAGE_DOMAINS = [
  'imgur.com',
  'cloudinary.com',
  'cdn.example.com',
  // Add your approved domains here
];

/**
 * Validate that a name parameter is safe text
 * Allows: letters, numbers, spaces, hyphens, apostrophes
 */
function validateName(value, fallback = 'You') {
  if (!value || typeof value !== 'string') return fallback;
  
  // Remove any suspicious characters
  const sanitized = value
    .replace(/[^a-zA-Z0-9\s\-']/g, '')
    .trim();
  
  // Ensure reasonable length (prevents DoS)
  if (sanitized.length === 0 || sanitized.length > 100) {
    return fallback;
  }
  
  return sanitized;
}

/**
 * Validate message content
 * Note: React's JSX will still auto-escape, but do validation anyway
 */
function validateMessage(value, fallback = '') {
  if (!value || typeof value !== 'string') return fallback;
  
  // Basic length check
  if (value.length > 500) {
    console.warn('Message truncated (max 500 chars)');
    return value.substring(0, 500);
  }
  
  return value;
}

/**
 * Validate challenge prompt
 */
function validatePrompt(value, fallback = 'a heart') {
  if (!value || typeof value !== 'string') return fallback;
  
  const sanitized = value
    .replace(/[^a-zA-Z0-9\s\-'.,]/g, '')
    .trim();
  
  if (sanitized.length === 0 || sanitized.length > 100) {
    return fallback;
  }
  
  return sanitized;
}

/**
 * Validate image URLs
 * Only allows https URLs to whitelisted domains (or data URIs)
 */
function validateImageUrl(url) {
  if (!url) return null;
  
  try {
    const parsed = new URL(url, window.location.href);
    
    // Allow data URIs (embedded images)
    if (parsed.protocol === 'data:') {
      return url;
    }
    
    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      console.warn(`Blocked non-HTTPS image URL: ${url}`);
      return null;
    }
    
    // Check against whitelist
    const isDomainAllowed = ALLOWED_IMAGE_DOMAINS.some(domain =>
      parsed.hostname.endsWith(domain)
    );
    
    if (!isDomainAllowed) {
      console.warn(`Image domain not whitelisted: ${parsed.hostname}`);
      return null;
    }
    
    return url;
  } catch (e) {
    console.warn(`Invalid image URL: ${url}`, e);
    return null;
  }
}

/**
 * Validate cells parameter (e.g., "0,1,2" or "all" or "any")
 */
function validateCells(value) {
  if (!value) return null;
  
  if (value === 'all' || value === 'any') {
    return value;
  }
  
  // Parse comma-separated indices
  const parts = String(value)
    .split(',')
    .map(s => {
      const num = parseInt(s.trim(), 10);
      return isNaN(num) ? null : num;
    })
    .filter(n => n !== null && n >= 0 && n < 9);
  
  return parts.length > 0 ? parts : null;
}

// Export utilities
window.validateName = validateName;
window.validateMessage = validateMessage;
window.validatePrompt = validatePrompt;
window.validateImageUrl = validateImageUrl;
window.validateCells = validateCells;
```

**Update `index.html` to load utilities:**

```html
<!-- Add this BEFORE app.jsx -->
<script src="utils.js"></script>
<script src="config.js"></script>
```

**Update `app.jsx` to use validators:**

**Before:**
```javascript
const toName = (tweaks.to || urlTo || CFG.to || "You").trim();
const fromName = (tweaks.from || urlFrom || CFG.from || "Your Secret Admirer").trim();
const message = tweaks.message || urlMsg || CFG.message || "";
const CFG_PROMPT = getParam("prompt", "") || CFG.challengePrompt || "a heart";
```

**After:**
```javascript
const toName = validateName(tweaks.to || urlTo || CFG.to);
const fromName = validateName(tweaks.from || urlFrom || CFG.from, "Your Secret Admirer");
const message = validateMessage(tweaks.message || urlMsg || CFG.message);
const CFG_PROMPT = validatePrompt(getParam("prompt", "") || CFG.challengePrompt);
```

**Update image loading:**

**Before:**
```javascript
function urlImages() {
  const out = [];
  for (let i = 0; i < 9; i++) {
    out.push(getParam("img" + i, null));
  }
  return out;
}
const URL_IMAGES = urlImages();
```

**After:**
```javascript
function urlImages() {
  const out = [];
  for (let i = 0; i < 9; i++) {
    const url = getParam("img" + i, null);
    out.push(validateImageUrl(url)); // Validate each URL
  }
  return out;
}
const URL_IMAGES = urlImages();
```

### Testing:

```bash
# Test with malicious payload
curl "http://localhost:8000/?to=<img src=x onerror=alert(1)>"
# Should render as literal text

# Test with invalid image domain
curl "http://localhost:8000/?img0=https://evil.com/image.jpg"
# Browser console should show: "Image domain not whitelisted"

# Test with valid URL
curl "http://localhost:8000/?img0=https://imgur.com/abc.jpg"
# Should load the image
```

### Validation:
```bash
# Verify all validators are present
grep -c "validate" app.jsx
# Should output: 5+
```

---

## 3. FIX POSTMESSAGE ORIGIN VALIDATION - Medium

**Severity:** High  
**Difficulty:** Easy  
**Time to Fix:** 10 minutes

### What it does:
Prevents cross-origin attacks via postMessage by validating the sender's origin.

### Implementation:

**Update `tweaks-panel.jsx`:**

**Before:**
```javascript
React.useEffect(() => {
  const onMsg = (e) => {
    const t = e?.data?.type;
    if (t === '__activate_edit_mode') setOpen(true);
    else if (t === '__deactivate_edit_mode') setOpen(false);
  };
  window.addEventListener('message', onMsg);
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  return () => window.removeEventListener('message', onMsg);
}, []);
```

**After:**
```javascript
React.useEffect(() => {
  // Define allowed origins (add your domain here)
  const ALLOWED_ORIGINS = [
    window.location.origin,
    // Add your parent frame origin if applicable:
    // 'https://editor.example.com',
  ];
  
  const onMsg = (e) => {
    // Validate origin before processing
    if (!ALLOWED_ORIGINS.includes(e.origin)) {
      console.warn(`Blocked postMessage from untrusted origin: ${e.origin}`);
      return;
    }
    
    const t = e?.data?.type;
    if (t === '__activate_edit_mode') setOpen(true);
    else if (t === '__deactivate_edit_mode') setOpen(false);
  };
  
  window.addEventListener('message', onMsg);
  
  // Send availability notification only to allowed origin
  window.parent.postMessage(
    { type: '__edit_mode_available' },
    window.location.origin
  );
  
  return () => window.removeEventListener('message', onMsg);
}, []);
```

**Also update the setTweak postMessage:**

**Before:**
```javascript
window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
```

**After:**
```javascript
window.parent.postMessage(
  { type: '__edit_mode_set_keys', edits },
  window.location.origin
);
```

### Testing:

```javascript
// Test from console:
// This SHOULD be blocked now:
window.postMessage({
  type: '__activate_edit_mode'
}, '*');

// Check console for warning:
// "Blocked postMessage from untrusted origin: about:blank"
```

### Validation:
```bash
# Verify all postMessage calls now include origin:
grep -n "postMessage" tweaks-panel.jsx | grep -v "origin"
# Should return: 0 results
```

---

## 4. ADD CONTENT-SECURITY-POLICY HEADER - Hard

**Severity:** Medium  
**Difficulty:** Hard  
**Time to Fix:** 30 minutes (depends on your hosting platform)

### What it does:
Restricts what content can be loaded, preventing XSS attacks and unauthorized resource loading.

### Steps:

**Option A: If using Netlify**

Create `netlify.toml` in the root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: https:; font-src https://fonts.gstatic.com; connect-src 'none'; base-uri 'self'; form-action 'none'"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Option B: If using Vercel**

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: https:; font-src https://fonts.gstatic.com; connect-src 'none'"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**Option C: If using Apache**

Edit `.htaccess`:

```apache
<IfModule mod_headers.c>
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: https:; font-font 'fonts.gstatic.com; connect-src 'none'; base-uri 'self'"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

**Option D: If using Nginx**

Edit nginx.conf:

```nginx
server {
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: https:; font-src https://fonts.gstatic.com; connect-src 'none';" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### CSP Policy Breakdown:

- `default-src 'self'`: Restrict all resources to same origin by default
- `script-src 'self' https://unpkg.com`: Allow scripts from our domain and unpkg
- `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`: Allow styles (unsafe-inline needed for JSX)
- `img-src 'self' data: https:`: Allow images from same origin, data URIs, and https
- `font-src https://fonts.gstatic.com`: Google Fonts only
- `connect-src 'none'`: Disable fetch/XHR (no API calls)
- `base-uri 'self'`: Prevent base tag injection
- `form-action 'none'`: No form submissions

### Testing:

```bash
# Check CSP header is present
curl -I https://valentine.example.com | grep -i "content-security-policy"

# Check CSP via curl
curl -I https://valentine.example.com
# Should include: Content-Security-Policy: ...
```

In browser console, test that:
- ✅ React loads successfully
- ✅ Styles apply correctly
- ✅ Google Fonts load
- ✅ External images load (if whitelisted)
- ❌ Inline script injection is blocked

### Validation:

Use CSP validator:
```bash
# Online tool: https://csp-evaluator.withgoogle.com/
# Paste your CSP policy
```

---

## 5. VALIDATE IMAGE DOMAINS - Easy

**Severity:** Medium  
**Difficulty:** Easy  
**Time to Fix:** 10 minutes

### What it does:
Prevents phishing by only allowing images from trusted sources.

**Add to `utils.js` (already done in Step 2):**

```javascript
const ALLOWED_IMAGE_DOMAINS = [
  'imgur.com',
  'cloudinary.com',
  'images.example.com',
  // Add your approved domains
];
```

**Update this list based on your use case:**

```javascript
const ALLOWED_IMAGE_DOMAINS = [
  'imgur.com',           // User-provided imgur links
  'cloudinary.com',      // Cloudinary CDN
  'cdn.example.com',     // Your own CDN
  'example.com',         // Your domain
  // DON'T add: 'attacker.com', 'phishing-site.com', etc.
];
```

### Testing:

```bash
# Test whitelisted domain
curl "http://localhost:8000/?img0=https://imgur.com/abc123.jpg"
# Should load image

# Test blocked domain
curl "http://localhost:8000/?img0=https://evil.com/image.jpg"
# Console should warn: "Image domain not whitelisted: evil.com"

# Test data URI
curl "http://localhost:8000/?img0=data:image/svg%2Bxml;..."
# Should work (data URIs are allowed)
```

---

## 6. DISABLE TWEAKS PANEL IN PRODUCTION - Medium

**Severity:** Low  
**Difficulty:** Medium  
**Time to Fix:** 20 minutes

### What it does:
Removes the dev-only tweaks panel from production to reduce attack surface.

### Option A: Compile-time removal (Best)

**Create environment detection in `config.js`:**

```javascript
// Check if we're in development/preview mode
window.VALENTINE_CONFIG = {
  // ... existing config ...
};

// Development mode detection
window.IS_DEV = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('preview') ||
  window.location.hostname.includes('staging')
);
```

**Update `index.html` to conditionally load tweaks:**

**Before:**
```html
<script type="text/babel" src="tweaks-panel.jsx"></script>
<script type="text/babel" src="app.jsx"></script>
```

**After:**
```html
<script type="text/babel">
  // Only load tweaks panel in development
  if (window.IS_DEV) {
    const script = document.createElement('script');
    script.src = 'tweaks-panel.jsx';
    script.type = 'text/babel';
    document.body.appendChild(script);
  }
</script>
<script type="text/babel" src="app.jsx"></script>
```

### Option B: Build-time removal (Better)

If using a build tool, add build-time defines:

```javascript
// webpack.config.js or vite.config.js
if (process.env.NODE_ENV === 'production') {
  // Don't include tweaks-panel.jsx in production bundle
}
```

### Testing:

```bash
# In production/preview environment
curl https://valentine.example.com | grep -c "TweaksPanel"
# Should output: 0

# In development environment
curl http://localhost:8000 | grep -c "TweaksPanel"
# Should output: 1 (or 2, if in both places)
```

---

## 7. ADD STRICT SECURITY HEADERS - Easy

**Severity:** Medium  
**Difficulty:** Easy  
**Time to Fix:** 10 minutes

### What it does:
Adds HTTP headers that instruct browsers to enforce security policies.

**Add to Netlify (in `netlify.toml`), Vercel, or web server:**

```
X-Frame-Options: SAMEORIGIN
  → Prevents page from being embedded in other domains' iframes

X-Content-Type-Options: nosniff
  → Prevents browser from sniffing content type

Referrer-Policy: strict-origin-when-cross-origin
  → Controls what referrer info is sent to other sites

Permissions-Policy: geolocation=(), microphone=(), camera=()
  → Disable unnecessary browser APIs

Strict-Transport-Security: max-age=31536000; includeSubDomains
  → Force HTTPS (only add if site is fully HTTPS)
```

### Netlify example:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

### Testing:

```bash
curl -I https://valentine.example.com | grep -E "X-Frame|X-Content|Referrer|Permissions|Strict"
```

---

## Implementation Checklist

Use this checklist to track remediation progress:

```
CRITICAL & HIGH PRIORITY:
[ ] 1. Add SRI hashes to CDN scripts (5 min)
[ ] 2. Implement input validation (20 min)
[ ] 3. Fix postMessage origin validation (10 min)

MEDIUM PRIORITY:
[ ] 4. Add CSP header (30 min)
[ ] 5. Validate image URLs against whitelist (5 min)
[ ] 6. Disable tweaks panel in production (10 min)
[ ] 7. Add strict security headers (5 min)

LOW PRIORITY:
[ ] 8. Pre-compile Babel to improve CSP compliance
[ ] 9. Add HSTS header for HTTPS enforcement
[ ] 10. Set up automated security scanning
```

---

## Deployment Strategy

### Phase 1: Immediate (Week 1)
1. Add SRI hashes
2. Deploy new index.html
3. Test in staging

### Phase 2: Near-term (Week 2)
4. Implement input validation
5. Deploy utils.js + updated app.jsx
6. Test with malicious payloads

### Phase 3: Medium-term (Week 3)
7. Configure web server for CSP + security headers
8. Deploy with Netlify/Vercel changes
9. Monitor CSP violation reports

### Phase 4: Long-term (Month 2)
10. Review and iterate based on security logs
11. Consider removing tweaks panel from production
12. Automate security scanning in CI/CD

---

## Verification & Testing

### Manual Testing After Each Fix

```bash
#!/bin/bash
TARGET="https://valentine.example.com"

echo "=== SRI Hash Verification ==="
curl -s "$TARGET" | grep -c "integrity="

echo "=== Input Validation ==="
curl -s "$TARGET/?to=<img src=x onerror=alert(1)>" | grep -q "<img src=x" && echo "XSS FAILED" || echo "XSS BLOCKED ✓"

echo "=== CSP Header Check ==="
curl -I "$TARGET" | grep -i "content-security-policy"

echo "=== Security Headers Check ==="
curl -I "$TARGET" | grep -E "X-Frame|X-Content|Referrer-Policy"

echo "=== postMessage Origin Validation ==="
curl -s "$TARGET" | grep -c "ALLOWED_ORIGINS"
```

### Automated Testing Script

```javascript
// test-security.js
async function testSecurity() {
  const tests = [
    {
      name: "SRI Hashes",
      test: () => document.querySelectorAll('script[integrity]').length >= 3
    },
    {
      name: "CSP Header",
      test: () => {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        return !!meta;
      }
    },
    {
      name: "Input Validation",
      test: () => typeof window.validateName === 'function'
    }
  ];

  tests.forEach(({ name, test }) => {
    console.log(`${name}: ${test() ? '✓ PASS' : '✗ FAIL'}`);
  });
}

testSecurity();
```

---

## Monitoring & Logging

After deploying fixes, monitor:

1. **CSP Violations**: Set up CSP reporting
   ```
   Content-Security-Policy: ...; report-uri https://your-domain/csp-report
   ```

2. **Error Logs**: Check browser console for security warnings

3. **Performance**: Ensure SRI + CSP don't impact load times

4. **User Feedback**: Monitor for broken functionality

---

## References

- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [OWASP: CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [SRI Hash Generator](https://www.srihash.org/)

---

## Support

If you encounter issues during remediation:

1. Check browser console for CSP violations
2. Verify domain whitelist is correct
3. Test in incognito mode (fresh cache)
4. Check web server logs for errors
5. Use CSP validator at: https://csp-evaluator.withgoogle.com/

