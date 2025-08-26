// Unusual Whales API integration for options flow and dark pools
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.UNUSUAL_WHALES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Unusual Whales API key not configured' });
    }

    const { type = 'flow', symbol = 'SPY' } = req.query;

    let endpoint;
    switch (type) {
      case 'flow':
        endpoint = `https://api.unusualwhales.com/api/stock/${symbol}/flow`;
        break;
      case 'darkpool':
        endpoint = `https://api.unusualwhales.com/api/darkpool/${symbol}`;
        break;
      case 'gex':
        endpoint = `https://api.unusualwhales.com/api/gex/${symbol}`;
        break;
      case 'greeks':
        endpoint = `https://api.unusualwhales.com/api/greeks/${symbol}`;
        break;
      default:
        endpoint = `https://api.unusualwhales.com/api/stock/${symbol}/flow`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unusual Whales API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the data based on type
    let processedData = data;
    
    if (type === 'gex' && data.data) {
      // Process GEX data according to the API response structure
      processedData = {
        ...data,
        processed: {
          totalGamma: data.data.reduce((sum, item) => 
            sum + parseFloat(item.gamma_per_one_percent_move_oi || 0), 0),
          totalDelta: data.data.reduce((sum, item) => 
            sum + parseFloat(item.charm_per_one_percent_move_oi || 0), 0),
          flipPoint: data.data[0]?.price || 0,
          timestamp: data.data[0]?.time || new Date().toISOString()
        }
      };
    }

    res.status(200).json({
      data: processedData,
      symbol,
      type,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('Unusual Whales API error:', error);
    
    // Return fallback data
    res.status(200).json({
      data: {
        fallback: true,
        message: 'Using simulated data - API unavailable',
        mockData: generateMockWhalesData(req.query.symbol, req.query.type)
      },
      timestamp: new Date().toISOString(),
      status: 'fallback'
    });
  }
}

function generateMockWhalesData(symbol = 'SPY', type = 'flow') {
  switch (type) {
    case 'flow':
      return {
        bullishFlow: Math.random() * 100,
        bearishFlow: Math.random() * 100,
        unusualActivity: Math.random() > 0.7,
        volume: Math.floor(Math.random() * 1000000)
      };
    case 'gex':
      return {
        totalGamma: Math.floor(Math.random() * 5000000000),
        flipPoint: 450 + Math.random() * 50,
        levels: {
          support: [440, 435, 430],
          resistance: [460, 465, 470]
        }
      };
    default:
      return { symbol, type, mockData: true };
  }
}
