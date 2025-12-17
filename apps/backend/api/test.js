module.exports = (req, res) => {
  res.json({
    message: 'Test endpoint works!',
    version: 'v3-fixed-routes-2025-12-17',
    buildTime: '2025-12-17T07:00:00Z',
    timestamp: new Date().toISOString()
  });
};
