module.exports = (req, res) => {
  res.json({
    message: 'Test endpoint works!',
    version: 'v2-fixed-2025-12-17',
    timestamp: new Date().toISOString()
  });
};
