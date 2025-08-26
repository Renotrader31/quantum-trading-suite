// Enhanced Unusual Whales API integration with real response structures
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.UNUSUAL_WHALES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Unusual Whales API key not configured' });
    }

    const { type = 'flow', symbol = 'SPY', limit = 100 } = req.query;

    let endpoint;
    let headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // Enhanced endpoints based on your API docs
    switch (type) {
      case 'flow':
        endpoint = `https://api.unusualwhales.com/api/stock/${symbol}/flow?limit=${limit}`;
        break;
      case 'darkpool':
        endpoint = `https://api.unusualwhales.com/api/darkpool/${symbol}?limit=${limit}`;
        break;
      case 'gex':
        endpoint = `https://api.unusualwhales.com/api/gex/${symbol}`;
        break;
      case 'greeks':
        endpoint = `https://api.unusualwhales.com/api/greeks/${symbol}`;
        break;
      case 'options':
        endpoint = `https://api.unusualwhales.com/api/options/${symbol}?limit=${limit}`;
        break;
      case 'volatility':
        endpoint = `https://api.unusualwhales.com/api/volatility/${symbol}`;
        break;
      default:
        endpoint = `https://api.unusualwhales.com/api/stock/${symbol}/flow?limit=${limit}`;
    }

    console.log(`Fetching UW data: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Unusual Whales API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    // Enhanced data processing based on actual API structures
    let processedData = data;
    
    switch (type) {
      case 'gex':
        if (data.data && Array.isArray(data.data)) {
          processedData = {
            ...data,
            processed: {
              totalGamma: data.data.reduce((sum, item) => 
                sum + parseFloat(item.gamma_per_one_percent_move_oi || 0), 0),
              totalCharm: data.data.reduce((sum, item) => 
                sum + parseFloat(item.charm_per_one_percent_move_oi || 0), 0),
              totalVanna: data.data.reduce((sum, item) => 
                sum + parseFloat(item.vanna_per_one_percent_move_oi || 0), 0),
              flipPoint: data.data[0]?.price || 0,
              timestamp: data.data[0]?.time || new Date().toISOString(),
              callGamma: data.data.reduce((sum, item) => 
                sum + parseFloat(item.call_gamma_oi || 0), 0),
              putGamma: data.data.reduce((sum, item) => 
                sum + parseFloat(item.put_gamma_oi || 0), 0)
            }
          };
        }
        break;
        
      case 'options':
        if (data.data && Array.isArray(data.data)) {
          processedData = {
            ...data,
            processed: {
              totalPremium: data.data.reduce((sum, item) => 
                sum + parseFloat(item.premium || 0), 0),
              avgIV: data.data.reduce((sum, item) => 
                sum + parseFloat(item.implied_volatility || 0), 0) / data.data.length,
              callPutRatio: data.data.filter(item => item.option_type === 'call').length / 
                           data.data.filter(item => item.option_type === 'put').length,
              unusualCount: data.data.filter(item => item.flow_alert_id).length
            }
          };
        }
        break;
        
      case 'darkpool':
        if (data.data && Array.isArray(data.data)) {
          processedData = {
            ...data,
            processed: {
              totalVolume: data.data.reduce((sum, item) => sum + (item.volume || 0), 0),
              totalPremium: data.data.reduce((sum, item) => 
                sum + parseFloat(item.premium || 0), 0),
              avgPrice: data.data.reduce((sum, item) => 
                sum + parseFloat(item.price || 0), 0) / data.data.length,
              marketCenters: [...new Set(data.data.map(item => item.market_center))]
            }
          };
        }
        break;
        
      case 'greeks':
        if (data.data && Array.isArray(data.data)) {
          processedData = {
            ...data,
            processed: {
              totalCallDelta: data.data.reduce((sum, item) => 
                sum + parseFloat(item.call_delta || 0), 0),
              totalPutDelta: data.data.reduce((sum, item) => 
                sum + parseFloat(item.put_delta || 0), 0),
              totalCallGamma: data.data.reduce((sum, item) => 
                sum + parseFloat(item.call_gamma || 0), 0),
              totalPutGamma: data.data.reduce((sum, item) => 
                sum + parseFloat(item.put_gamma || 0), 0),
              netDelta: data.data.reduce((sum, item) => 
                sum + parseFloat(item.call_delta || 0) + parseFloat(item.put_delta || 0), 0)
            }
          };
        }
        break;
    }

    res.status(200).json({
      data: processedData,
      symbol,
      type,
      timestamp: new Date().toISOString(),
      status: 'success',
      source: 'unusual_whales'
    });

  } catch (error) {
    console.error('Unusual Whales API error:', error);
    
    // Enhanced fallback data based on real structures
    res.status(200).json({
      data: {
        fallback: true,
        message: 'Using simulated data - API unavailable',
        mockData: generateEnhancedMockData(req.query.symbol, req.query.type),
        error: error.message
      },
      timestamp: new Date().toISOString(),
      status: 'fallback',
      source: 'mock_data'
    });
  }
}

function generateEnhancedMockData(symbol = 'SPY', type = 'flow') {
  const basePrice = 450;
  
  switch (type) {
    case 'flow':
      return {
        data: Array.from({ length: 10 }, (_, i) => ({
          ask_vol: Math.floor(Math.random() * 100),
          bid_vol: Math.floor(Math.random() * 100),
          delta: (Math.random() * 0.8 + 0.1).toFixed(6),
          gamma: (Math.random() * 0.01).toFixed(8),
          implied_volatility: (Math.random() * 0.5 + 0.2).toFixed(6),
          premium: (Math.random() * 5000).toFixed(2),
          option_type: Math.random() > 0.5 ? 'call' : 'put',
          ticker: symbol,
          executed_at: new Date().toISOString()
        }))
      };
      
    case 'gex':
      return {
        data: [{
          charm_per_one_percent_move_oi: (Math.random() * 1000000000).toFixed(2),
          gamma_per_one_percent_move_oi: (Math.random() * 100000000).toFixed(2),
          vanna_per_one_percent_move_oi: (Math.random() * 1000000000).toFixed(2),
          call_gamma_oi: (Math.random() * 50000000).toFixed(2),
          put_gamma_oi: (Math.random() * 50000000).toFixed(2),
          price: basePrice.toString(),
          time: new Date().toISOString()
        }]
      };
      
    case 'darkpool':
      return {
        data: Array.from({ length: 5 }, (_, i) => ({
          executed_at: new Date().toISOString(),
          market_center: ['D', 'N', 'L', 'K'][Math.floor(Math.random() * 4)],
          premium: (Math.random() * 100000).toFixed(2),
          price: (basePrice + (Math.random() - 0.5) * 10).toFixed(2),
          size: Math.floor(Math.random() * 10000),
          volume: Math.floor(Math.random() * 1000000),
          ticker: symbol
        }))
      };
      
    case 'greeks':
      return {
        data: [{
          call_delta: (Math.random() * 1000000).toFixed(4),
          put_delta: (-Math.random() * 1000000).toFixed(4),
          call_gamma: (Math.random() * 100000).toFixed(4),
        put_gamma: (-Math.random() * 100000).toFixed(4),
        call_charm: (Math.random() * 1000000).toFixed(4),
        put_charm: (-Math.random() * 500000).toFixed(4)
        };
      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
