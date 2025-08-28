// Dynamic route for individual stock scanning
// Handles /api/scan/AAPL, /api/scan/MSFT, etc.

export default async function handler(req, res) {
  console.log('\n=== DYNAMIC SCAN ROUTE ===');
  console.log('Method:', req.method);
  console.log('Symbol from URL:', req.query.symbol);
  console.log('Query params:', req.query);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import and use the individual scan logic
    const { default: individualScanHandler } = await import('../individual-scan.js');
    
    // Call the individual scan handler with the symbol from the URL
    return individualScanHandler(req, res);
    
  } catch (error) {
    console.error('Dynamic route error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process scan request',
      details: error.message 
    });
  }
}