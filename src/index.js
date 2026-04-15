

import HealthCheck from './HealthCheck.js';
HealthCheck();

import http from 'http';
import handleRequest from './handleRequest.js';

const PORT = process.env.HTTP_PORT || 3000;

function emitObjectResponse(res, object) {
  console.log('Emitting response:', object);
  res.writeHead(object.code || 200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(object));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let payload = '';

    req.on('data', chunk => {
      payload += chunk;

      if (payload.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!payload) return resolve(null);

      try {
        resolve(JSON.parse(payload));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    req.body = await parseBody(req);

    const response = await handleRequest(req);

    if (!response) {
      return emitObjectResponse(res, {
        success: false,
        error: 'Not found',
        code: 404,
      });
    }

    emitObjectResponse(res, response);
  } catch (err) {
    emitObjectResponse(res, {
      success: false,
      error: err.message || 'Server error',
      code: 500,
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 SMS API running on port ${PORT}`);
});
