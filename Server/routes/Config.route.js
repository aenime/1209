// Legacy Runtime Environment Configuration API
// NOTE: This route is deprecated. Use /api/env-config/* routes instead.
const express = require('express');
const router = express.Router();

// Redirect to new API
router.get('/config', (req, res) => {
  res.status(301).json({
    deprecated: true,
    message: 'This endpoint is deprecated. Use /api/env-config/current instead.',
    newEndpoint: '/api/env-config/current',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
