const UW_API_KEY = '29a464c8-9da0-490a-ac24-0d4aa492dcbd'; // 🔑 ADD YOUR REAL API KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbols, batchSize = 10 } = req.body;
    
    // Default symbols list (top 100 most active stocks)
    const defaultSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'BABA', 'V',
      'JPM', 'JNJ', 'WMT', 'PG', 'UNH', 'MA', 'HD', 'DIS', 'ADBE', 'PYPL',
      'CMCSA', 'CRM', 'NFLX', 'PEP', 'ABBV', 'TMO', 'ACN', 'COST', 'AVGO', 'TXN',
      'NEE', 'LLY', 'ABT', 'DHR', 'NKE', 'MCD', 'CVX', 'WFC', 'BAC', 'ORCL',
      'KO', 'INTC', 'BMY', 'PFE', 'CSCO', 'AMD', 'COP', 'XOM', 'VZ', 'QCOM',
      'LOW', 'UPS', 'IBM', 'GS', 'HON', 'AMGN', 'SBUX', 'INTU', 'CAT', 'TGT',
      'SPGI', 'LMT', 'AXP', 'MMM', 'BLK', 'MDLZ', 'GILD', 'MO', 'SYK', 'CVS',
      'ISRG', 'ADI', 'REGN', 'NOW', 'ZTS', 'CI', 'TJX', 'SCHW', 'MU', 'PLD',
      'SO', 'DUK', 'BSX', 'CME', 'EL', 'ICE', 'AON', 'EQIX', 'CL', 'ITW',
      'APD', 'GD', 'SHW', 'NSC', 'KLAC', 'EMR', 'RACE', 'WM', 'PSA', 'WELL'
    ];

    const symbolsToScan = symbols || defaultSymbols;
    const results = [];
    const errors = [];

    // Process in batches
    for (let i = 0; i < symbolsToScan.length; i += batchSize) {
      const batch = symbolsToScan.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => scanSingleStock(symbol));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const symbol = batch[index];
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        } else {
          errors.push({ 
            symbol, 
            error: result.reason?.message || 'Failed to scan stock' 
          });
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < symbolsToScan.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Sort by Holy Grail score
    results.sort((a, b) => b.holyGrail - a.holyGrail);

    res.json({
      success: true,
      results,
      errors,
      scanned: results.length,
      failed: errors.length
    });

  } catch (error) {
    console.error('Bulk scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      results: [],
      errors: [{ error: error.message }]
    });
  }
}

// Function to scan a single stock
async function scanSingleStock(symbol) {
  try {
    // Get Greeks data from Unusual Whales
    const greeksResponse = await fetch(`https://api.unusualwhales.com/api/stock/${symbol}/greeks`, {
  headers: {
    'Accept': 'application/json, text/plain',
    'Authorization': UW_API_KEY  // Direct token, no "Bearer" or "token" prefix
  }
});

    if (!greeksResponse.ok) {
      throw new Error(`Greeks API failed: ${greeksResponse.status}`);
    }

    const greeksData = await greeksResponse.json();
    const greeks = greeksData.data?.data || [];

    if (!greeks.length) {
      return null;
    }

    // Calculate squeeze metrics
    const squeezeMetrics = calculateSqueezeMetrics(greeks, symbol);
    
    return {
      symbol,
      timestamp: new Date().toISOString(),
      ...squeezeMetrics
    };

  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    throw error;
  }
}

// Squeeze calculation function
function calculateSqueezeMetrics(greeks, symbol) {
  // Mock price data - you can integrate with your price API
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
  
  // Gamma concentration (0-30 points)
  if (avgGamma > 10) holyGrail += 30;
  else if (avgGamma > 5) holyGrail += 20;
  else if (avgGamma > 2) holyGrail += 10;
  
  // IV elevation (0-25 points)
  if (avgIV > 80) holyGrail += 25;
  else if (avgIV > 60) holyGrail += 20;
  else if (avgIV > 40) holyGrail += 15;
  else if (avgIV > 20) holyGrail += 10;
  
  // Gamma imbalance (0-20 points)
  if (gammaImbalance > 5) holyGrail += 20;
  else if (gammaImbalance > 3) holyGrail += 15;
  else if (gammaImbalance > 1) holyGrail += 10;
  
  // Additional factors (0-25 points)
  const unusualMultiplier = 1 + Math.random() * 3; // Mock unusual activity
  if (unusualMultiplier > 3) holyGrail += 15;
  else if (unusualMultiplier > 2) holyGrail += 10;
  else if (unusualMultiplier > 1.5) holyGrail += 5;
  
  // Cap at 100
  holyGrail = Math.min(100, Math.round(holyGrail));
  
  const holyGrailStatus = holyGrail >= 80 ? 'STRONG' : holyGrail >= 60 ? 'MODERATE' : 'WEAK';

  return {
    price: mockPrice,
    change: mockChange,
    holyGrail,
    holyGrailStatus,
    squeeze: Math.round(60 + Math.random() * 40), // Mock squeeze score
    gamma: avgGamma,
    gex: totalGamma * 1000000, // Mock GEX
    flow: Math.round(30 + Math.random() * 70), // Mock flow percentage
    dtc: 2 + Math.random() * 8, // Mock days to cover
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

