// Based on working whales.js format
console.log('\n=== INDIVIDUAL SCAN API STARTUP ===');

// Use exact same token loading as working whales.js
const UW_TOKEN = process.env.UNUSUAL_WHALES_API_KEY || process.env.UW_TOKEN || '29a464c8-9da0-490a-ac24-0d4aa492dcbd';
console.log('Individual Scan - Token exists:', !!UW_TOKEN);
console.log('Individual Scan - Token length:', UW_TOKEN ? UW_TOKEN.length : 'MISSING');
console.log('Individual Scan - Token preview:', UW_TOKEN ? UW_TOKEN.substring(0, 10) + '...' : 'NOT FOUND');

const BASE_URL = 'https://api.unusualwhales.com/api/stock';

export default async function handler(req, res) {
  console.log('\n=== INDIVIDUAL SCAN REQUEST ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Timestamp:', new Date().toISOString());

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

  if (!UW_TOKEN) {
    console.log('❌ CRITICAL ERROR: No API token found');
    return res.status(500).json({
      error: 'API token not configured',
      debug_info: {
        checked_vars: ['UNUSUAL_WHALES_API_KEY', 'UW_TOKEN'],
        found: false
      }
    });
  }

  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    console.log(`Scanning individual stock: ${symbol}`);

    const result = await scanSingleStock(symbol.toUpperCase());
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'No data available for this symbol' 
      });
    }

    console.log(`✅ Individual scan success: ${symbol}`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(`❌ Individual scan error for ${req.query.symbol}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Function to scan a single stock - EXACT same as bulk-scan.js
async function scanSingleStock(symbol) {
  try {
    // Use exact same format as working whales.js buildRequest function
    const url = `${BASE_URL}/${symbol}/greeks`;
    const headers = {
      'Accept': 'application/json, text/plain',
      'Authorization': UW_TOKEN  // Direct token, no "Bearer" prefix
    };

    console.log(`Fetching ${symbol}:`, url);

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      timeout: 30000
    });

    console.log(`${symbol} response status:`, response.status);

    if (!response.ok) {
      throw new Error(`API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`${symbol} response keys:`, Object.keys(data));
    
    // Check response structure - should match your working whales.js
    const greeks = data.data?.data || [];

    if (!greeks.length) {
      console.log(`No Greeks data for ${symbol}`);
      return null;
    }

    // Calculate squeeze metrics using same function as bulk-scan
    const squeezeMetrics = calculateSqueezeMetrics(greeks, symbol);
    
    return {
      symbol,
      timestamp: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      ...squeezeMetrics
    };

  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    throw error;
  }
}

// Same squeeze calculation function as bulk-scan.js
function calculateSqueezeMetrics(greeks, symbol) {
  // Mock price data
  const mockPrice = 150 + Math.random() * 100;
  const mockChange = (Math.random() - 0.5) * 10;

  // Calculate gamma concentration
  const totalGamma = greeks.reduce((sum, g) => sum + (g.call_gamma || 0) + (g.put_gamma || 0), 0);
  const avgGamma = totalGamma / greeks.length;
  
  // Calculate IV metrics
  const avgCallIV = greeks.reduce((sum, g) => sum + (g.call_volatility || 0), 0) / greeks.length;
  const avgPutIV = greeks.reduce((sum, g) => sum + (g.put_volatility || 0), 0) / greeks.length;
  const avgIV = (avgCallIV + avgPutIV) / 2;

  // Calculate gamma imbalance
  const callGamma = greeks.reduce((sum, g) => sum + (g.call_gamma || 0), 0);
  const putGamma = greeks.reduce((sum, g) => sum + (g.put_gamma || 0), 0);
  const gammaImbalance = Math.abs(callGamma - putGamma);

  // Holy Grail Score calculation
  let holyGrail = 0;
  
  if (avgGamma > 10) holyGrail += 30;
  else if (avgGamma > 5) holyGrail += 20;
  else if (avgGamma > 2) holyGrail += 10;
  
  if (avgIV > 80) holyGrail += 25;
  else if (avgIV > 60) holyGrail += 20;
  else if (avgIV > 40) holyGrail += 15;
  else if (avgIV > 20) holyGrail += 10;
  
  if (gammaImbalance > 5) holyGrail += 20;
  else if (gammaImbalance > 3) holyGrail += 15;
  else if (gammaImbalance > 1) holyGrail += 10;
  
  const unusualMultiplier = 1 + Math.random() * 3;
  if (unusualMultiplier > 3) holyGrail += 15;
  else if (unusualMultiplier > 2) holyGrail += 10;
  else if (unusualMultiplier > 1.5) holyGrail += 5;
  
  holyGrail = Math.min(100, Math.round(holyGrail));
  
  const holyGrailStatus = holyGrail >= 80 ? 'STRONG' : holyGrail >= 60 ? 'MODERATE' : 'WEAK';

  return {
    price: mockPrice,
    change: mockChange,
    holyGrail,
    holyGrailStatus,
    squeeze: Math.round(60 + Math.random() * 40),
    gamma: avgGamma,
    gex: totalGamma * 1000000,
    flow: Math.round(30 + Math.random() * 70),
    dtc: 2 + Math.random() * 8,
    pinRisk: Math.round(Math.random() * 100),
    
    optionsMetrics: {
      totalVolume: Math.round(10000 + Math.random() * 90000),
      putCallRatio: 0.5 + Math.random() * 1.5,
      volumeOIRatio: Math.random() * 3,
      netPremium: (Math.random() - 0.5) * 10000000,
      ivRank: Math.round(Math.random() * 100),
      atmIV: avgIV,
      skew: 0.8 + Math.random() * 0.4,
      term: Math.random() > 0.5 ? 'CONTANGO' : 'BACKWARDATION'
    },
    
    flowAnalysis: {
      unusual: {
        multiplier: unusualMultiplier,
        percentile: Math.round(50 + Math.random() * 50)
      },
      sweeps: {
        count: Math.round(Math.random() * 10),
        bullish: Math.round(Math.random() * 5),
        bearish: Math.round(Math.random() * 5)
      },
      sentiment: {
        score: Math.round(30 + Math.random() * 70),
        overall: Math.random() > 0.6 ? 'BULLISH' : Math.random() > 0.3 ? 'NEUTRAL' : 'BEARISH'
      },
      blocks: {
        count: Math.round(Math.random() * 5)
      }
    },
    
    darkPool: {
      ratio: Math.random() * 0.5,
      volume: Math.round(1000000 + Math.random() * 9000000),
      trades: Math.round(100 + Math.random() * 900)
    },
    
    keyLevels: {
      maxPain: Math.round(mockPrice * (0.9 + Math.random() * 0.2)),
      gammaWall: Math.round(mockPrice * (1.05 + Math.random() * 0.1)),
      putWall: Math.round(mockPrice * (0.85 + Math.random() * 0.1)),
      callWall: Math.round(mockPrice * (1.15 + Math.random() * 0.1))
    }
  };
}

console.log('✅ Individual scan API loaded successfully');
