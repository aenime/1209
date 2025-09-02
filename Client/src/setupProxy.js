const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API routes proxy
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
      secure: false,
      logLevel: 'warn', // Reduce logging verbosity
      onError: function (err, req, res) {
        // Try to send a reasonable error response
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Proxy Error',
            message: 'Backend server not available',
            details: err.message
          });
        }
      },
      onProxyReq: function (proxyReq, req, res) {
        // Only log important requests
        if (req.url.includes('/validate') || req.url.includes('/login')) {
        }
      }
    })
  );

  // Payment redirect routes proxy (for Cashfree server-side redirects)
  app.use(
    '/payment/checkout',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
      secure: false,
      logLevel: 'info', // More verbose for payment debugging
      onError: function (err, req, res) {
        console.error('❌ Payment proxy error:', err.message);
        if (!res.headersSent) {
          res.status(502).send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>Payment Service Unavailable</h2>
                <p>The payment service is temporarily unavailable.</p>
                <p>Error: ${err.message}</p>
                <p><a href="http://localhost:3000">Return to website</a></p>
              </body>
            </html>
          `);
        }
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('🔄 Proxying payment request:', req.method, req.url);
      },
      onProxyRes: function (proxyRes, req, res) {
        console.log('✅ Payment proxy response:', proxyRes.statusCode, req.url);
      }
    })
  );
};
