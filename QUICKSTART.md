# 🚀 Quick Start Guide

Get your Web Proxy Application up and running in 5 minutes!

## Step 1: Navigate to Project

```bash
cd web-proxy-app
```

## Step 2: Install Dependencies (if not already done)

```bash
npm install
```

## Step 3: Start Both Servers

You need to run TWO commands in SEPARATE terminal windows:

### Terminal 1 - Proxy Server
```bash
npm run proxy
```

✅ You should see:
```
🚀 Proxy server running on http://localhost:3001
📡 Use: http://localhost:3001/proxy?url=YOUR_TARGET_URL
```

### Terminal 2 - Next.js Frontend
```bash
npm run dev
```

✅ You should see:
```
- Local:        http://localhost:3000
```

## Step 4: Open Your Browser

Navigate to: **http://localhost:3000**

## Step 5: Start Using the Proxy

1. Wait for the **green "Proxy Server Online"** chip to appear
2. Enter any website URL (e.g., `example.com`)
3. Click **"Access"** button
4. The website will open through the proxy!

---

## ⚡ One-Line Setup (Windows)

Run both servers at once:
```bash
start cmd /k "cd web-proxy-app && npm run proxy" && cd web-proxy-app && npm run dev
```

## 🐧 One-Line Setup (Linux/Mac)

```bash
cd web-proxy-app && npm run proxy & npm run dev
```

---

## 🎯 Example URLs to Try

- `example.com`
- `https://github.com`
- `https://stackoverflow.com`
- `https://wikipedia.org`

---

## ❌ Troubleshooting

**Issue**: Server shows offline
- **Fix**: Make sure you started the proxy server with `npm run proxy`

**Issue**: Port already in use
- **Fix**: Kill the process using the port or change the port in the configuration

**Issue**: Website won't load
- **Fix**: Some websites block proxy access; try a different website

---

## 🎨 Features to Explore

✨ **Settings Panel** - Click the expand icon to customize behavior
📜 **History** - Your recent websites are automatically saved
🔄 **Auto-redirect** - Enable to automatically open sites in new tabs
🗑️ **Clear History** - Remove all browsing history with one click

---

**Happy Browsing! 🌐**
