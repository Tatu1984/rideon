// Debug endpoint to see what Vercel provides for request body
module.exports = async (req, res) => {
  const results = {
    version: 'v1-body-debug',
    method: req.method,
    contentType: req.headers['content-type'],
    body: {
      exists: !!req.body,
      type: typeof req.body,
      isObject: typeof req.body === 'object',
      isArray: Array.isArray(req.body),
      keys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
      value: req.body
    },
    rawBody: {
      exists: !!req.rawBody,
      type: typeof req.rawBody
    }
  };

  res.json(results);
};
