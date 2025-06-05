import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('Proxying video request for:', url);
    
    // Fetch the video from the original source
    const response = await fetch(url, {
      method: req.method || 'GET',
      headers: {
        'User-Agent': 'LMS-Ali-Video-Proxy/1.0',
        'Accept': '*/*',
        'Accept-Encoding': 'identity', // Disable compression for streaming
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch video:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch video',
        status: response.status,
        statusText: response.statusText
      });
    }

    // Copy relevant headers from the original response
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');
    const contentRange = response.headers.get('content-range');
    
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    if (acceptRanges) {
      res.setHeader('Accept-Ranges', acceptRanges);
    }
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('ETag', `"${Date.now()}"`);

    // Handle range requests for video streaming
    if (req.headers.range && acceptRanges === 'bytes') {
      res.status(206); // Partial Content
    } else {
      res.status(200);
    }

    // Stream the video data
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 