const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// User-Agent rotation pool
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Rewrite URLs in HTML content
function rewriteHTML(html, targetUrl, proxyBase) {
  try {
    const $ = cheerio.load(html);
    const urlObj = new URL(targetUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Rewrite all href attributes
    $('a[href], link[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('data:')) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          $(elem).attr('href', `${proxyBase}?url=${encodeURIComponent(absoluteUrl)}`);
        } catch (e) {
          // Keep original if URL is invalid
        }
      }
    });

    // Rewrite all src attributes
    $('img[src], script[src], iframe[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.startsWith('data:')) {
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          $(elem).attr('src', `${proxyBase}?url=${encodeURIComponent(absoluteUrl)}`);
        } catch (e) {
          // Keep original if URL is invalid
        }
      }
    });

    // Rewrite form actions
    $('form[action]').each((i, elem) => {
      const action = $(elem).attr('action');
      if (action) {
        try {
          const absoluteUrl = new URL(action, baseUrl).href;
          $(elem).attr('action', `${proxyBase}?url=${encodeURIComponent(absoluteUrl)}`);
        } catch (e) {
          // Keep original if URL is invalid
        }
      }
    });

    // Add base tag to help with relative URLs
    if ($('base').length === 0) {
      $('head').prepend(`<base href="${baseUrl}/">`);
    }

    return $.html();
  } catch (error) {
    console.error('HTML rewriting error:', error.message);
    return html;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Advanced Proxy server is running' });
});

// Advanced proxy endpoint with content rewriting
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  const proxyBase = `http://localhost:${PORT}/proxy`;

  console.log(`[PROXY] Requesting: ${targetUrl}`);

  if (!targetUrl) {
    return res.status(400).send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 40px; background: #1e293b; color: white; }
            code { background: #334155; padding: 4px 8px; border-radius: 4px; }
            a { color: #6366f1; text-decoration: none; }
          </style>
        </head>
        <body>
          <h2>❌ Missing URL Parameter</h2>
          <p>Usage: <code>/proxy?url=https://example.com</code></p>
          <p><a href="http://localhost:3000">← Back to Proxy App</a></p>
        </body>
      </html>
    `);
  }

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are supported');
    }
  } catch (error) {
    console.error(`[ERROR] Invalid URL: ${targetUrl}`);
    return res.status(400).send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 40px; background: #1e293b; color: white; }
            a { color: #6366f1; text-decoration: none; }
          </style>
        </head>
        <body>
          <h2>❌ Invalid URL</h2>
          <p>The URL is not valid: <strong>${targetUrl}</strong></p>
          <p>Error: ${error.message}</p>
          <p><a href="http://localhost:3000">← Back to Proxy App</a></p>
        </body>
      </html>
    `);
  }

  try {
    // Make request with advanced headers
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': parsedUrl.origin,
      },
      maxRedirects: 5,
      timeout: 30000,
      validateStatus: () => true, // Accept any status code
      responseType: 'arraybuffer',
    });

    console.log(`[SUCCESS] Status ${response.status} from ${targetUrl}`);

    const contentType = response.headers['content-type'] || '';
    
    // Set response headers
    res.status(response.status);
    
    // Copy relevant headers
    const headersToForward = [
      'content-type',
      'content-length',
      'cache-control',
      'expires',
      'last-modified',
      'etag'
    ];
    
    headersToForward.forEach(header => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle HTML content - rewrite URLs
    if (contentType.includes('text/html')) {
      try {
        const html = response.data.toString('utf-8');
        const rewrittenHTML = rewriteHTML(html, targetUrl, proxyBase);
        
        // Add proxy info banner
        const banner = `
          <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; text-align: center; z-index: 999999; font-family: Arial; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            🌐 <strong>Proxied via Web Proxy</strong> | Currently viewing: ${parsedUrl.host} | <a href="http://localhost:3000" style="color: white; text-decoration: underline;">Back to Proxy</a>
          </div>
          <div style="height: 44px;"></div>
        `;
        
        const finalHTML = rewrittenHTML.replace('<body', `<body>${banner}`);
        res.send(finalHTML);
      } catch (e) {
        console.error('[ERROR] HTML processing failed:', e.message);
        res.send(response.data);
      }
    } else {
      // For non-HTML content, send as-is
      res.send(response.data);
    }

  } catch (error) {
    console.error(`[ERROR] Proxy failed for ${targetUrl}:`, error.message);
    
    let errorMessage = error.message;
    let suggestions = [];

    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Website not found or DNS resolution failed';
      suggestions = [
        'The website may not exist',
        'Check if the URL is correct',
        'The site might be down'
      ];
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused by the server';
      suggestions = [
        'The website is blocking connections',
        'The server may be down',
        'Firewall might be blocking access'
      ];
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Connection timed out';
      suggestions = [
        'The website is taking too long to respond',
        'Your internet connection might be slow',
        'The site may be under heavy load'
      ];
    } else if (error.response) {
      errorMessage = `Server returned error ${error.response.status}`;
      suggestions = [
        'The website returned an error',
        'You may not have permission to access this resource',
        'The page might have been moved or deleted'
      ];
    }

    res.status(500).send(`
      <html>
        <head>
          <style>
            body { 
              font-family: Arial; 
              padding: 40px; 
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              color: white;
              margin: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #1e293b;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            h2 { color: #ef4444; margin-top: 0; }
            .url { 
              background: #334155; 
              padding: 12px; 
              border-radius: 8px; 
              word-break: break-all;
              margin: 20px 0;
            }
            ul { 
              background: #334155; 
              padding: 20px 40px; 
              border-radius: 8px; 
              margin: 20px 0;
            }
            li { margin: 10px 0; }
            a { 
              color: #6366f1; 
              text-decoration: none;
              font-weight: bold;
            }
            a:hover { text-decoration: underline; }
            .error-code {
              background: #ef4444;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-family: monospace;
              display: inline-block;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>❌ Proxy Error</h2>
            <p>Failed to access the requested website:</p>
            <div class="url">${targetUrl}</div>
            <p><span class="error-code">${errorMessage}</span></p>
            ${suggestions.length > 0 ? `
              <p><strong>Possible reasons:</strong></p>
              <ul>
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
              </ul>
            ` : ''}
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Double-check the URL is correct</li>
              <li>Try again in a few moments</li>
              <li>Try a different website to test if the proxy is working</li>
              <li>Some websites actively block proxy access</li>
            </ul>
            <p><a href="http://localhost:3000">← Back to Proxy App</a></p>
          </div>
        </body>
      </html>
    `);
  }
});

// POST method support for forms
app.post('/proxy', async (req, res) => {
  // Similar implementation for POST requests
  res.status(501).send('POST method not yet fully implemented');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Advanced Proxy Server Running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔧 Features: User-Agent Rotation, URL Rewriting, Enhanced Headers`);
  console.log(`🌐 Usage: http://localhost:${PORT}/proxy?url=YOUR_TARGET_URL`);
  console.log(`✨ Ready to bypass restrictions!`);
});
