const fs = require('fs');
const path = require('path');

// Post-build script to fix MIME type issues for Tailwind CSS and copy env-config.js
const buildPath = path.join(__dirname, 'build');
const indexPath = path.join(buildPath, 'index.html');

// First, copy env-config.js from public to build directory
const sourceEnvConfig = path.join(__dirname, 'public', 'env-config.js');
const destEnvConfig = path.join(buildPath, 'env-config.js');

if (fs.existsSync(sourceEnvConfig)) {
  fs.copyFileSync(sourceEnvConfig, destEnvConfig);
} else {
}

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Fix all CSS link tags to have explicit type="text/css"
  html = html.replace(
    /<link([^>]*href="[^"]*\/static\/css\/[^"]*"[^>]*?)(?:\s+type="[^"]*")?([^>]*?)>/g,
    '<link$1 type="text/css"$2>'
  );
  
  // Also fix any CSS links without the /static/css/ pattern
  html = html.replace(
    /<link([^>]*href="[^"]*\.css[^"]*"[^>]*?)(?:\s+type="[^"]*")?([^>]*?)>/g,
    '<link$1 type="text/css"$2>'
  );
  
  // Add comprehensive CSS loader script for MIME type enforcement
  const cssLoaderScript = `
<script>
// Comprehensive CSS MIME type fix for production deployment
(function() {
  function forceStylesheetMimeType() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
      if (!link.type || link.type !== 'text/css') {
        link.type = 'text/css';
      }
      
      // For severely broken servers, recreate the link element
      if (link.href.includes('/static/css/')) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.type = 'text/css';
        newLink.href = link.href;
        newLink.media = link.media || 'all';
        
        // Replace the old link after the new one loads
        newLink.onload = function() {
          if (link.parentNode && link !== newLink) {
            link.parentNode.removeChild(link);
          }
        };
        
        // Insert new link after the old one
        if (link.parentNode) {
          link.parentNode.insertBefore(newLink, link.nextSibling);
        }
      }
    });
  }
  
  // Force MIME type check immediately and on DOM ready
  forceStylesheetMimeType();
  document.addEventListener('DOMContentLoaded', forceStylesheetMimeType);
  
  // Additional fallback for dynamic content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceStylesheetMimeType);
  } else {
    forceStylesheetMimeType();
  }
})();
</script>`;
  
  // Insert the script before the closing head tag
  html = html.replace('</head>', cssLoaderScript + '</head>');
  
  // Write back the modified HTML
  fs.writeFileSync(indexPath, html);
} else {
}

// Also create .htaccess for Apache servers
const htaccessPath = path.join(buildPath, '.htaccess');
const htaccessContent = `# MIME type configuration for CSS and JS files
AddType text/css .css
AddType application/javascript .js
AddType application/json .json

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# React Router support
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
`;

fs.writeFileSync(htaccessPath, htaccessContent);

// Create nginx.conf snippet for Nginx servers
const nginxConfigPath = path.join(buildPath, 'nginx-mime.conf');
const nginxContent = `# Add this to your nginx server block

location ~* \\.css$ {
    add_header Content-Type text/css;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \\.js$ {
    add_header Content-Type application/javascript;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \\.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# React Router support
location / {
    try_files $uri $uri/ /index.html;
}
`;

fs.writeFileSync(nginxConfigPath, nginxContent);
