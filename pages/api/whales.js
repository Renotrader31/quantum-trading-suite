export default async function handler(req, res) {
  try {
    const { endpoint, symbol = 'SPY' } = req.query;

    switch (endpoint) {
      case 'gex':
        return res.status(200).json({
          symbol: symbol,
          current_price: 425.50 + (Math.random() - 0.5) * 10,
          net_gex: (Math.random() - 0.5) * 2000000000,
          gex_flip_point: 420.00 + (Math.random() - 0.5) * 10,
          total_call_gex: Math.random() * 3000000000,
          total_put_gex: -Math.random() * 1500000000,
          largest_gamma_strike: Math.round((425 + (Math.random() - 0.5) * 20) / 5) * 5,
          gamma_walls: [
            {
              strike: Math.round((420 + Math.random() * 10) / 5) * 5,
              gamma: Math.random() * 1000000000,
              type: 'support'
            },
            {
              strike: Math.round((425 + Math.random() * 10) / 5) * 5,
              gamma: Math.random() * 1500000000,
              type: 'resistance'
            },
            {
              strike: Math.round((430 + Math.random() * 10) / 5) * 5,
              gamma: Math.random() * 800000000,
              type: 'resistance'
            },
            {
              strike: Math.round((415 + Math.random() * 10) / 5) * 5,
              gamma: Math.random() * 600000000,
              type: 'support'
            }
          ],
          timestamp: new Date().toISOString()
        });

      case 'flow':
        return res.status(200).json({
          symbol: symbol,
          timestamp: new Date().toISOString(),
          total_premium: Math.random() * 500000000,
          call_premium: Math.random() * 300000000,
          put_premium: Math.random() * 200000000,
          transactions: Array.from({ length: 10 }, (_, i) => ({
            id: `txn_${Date.now()}_${i}`,
            symbol: symbol,
            type: Math.random() > 0.5 ? 'call' : 'put',
            strike: Math.round((425 + (Math.random() - 0.5) * 50) / 5) * 5,
            expiry: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            premium: parseFloat((Math.random() * 50).toFixed(2)),
            volume: Math.floor(Math.random() * 1000) + 1,
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
          }))
        });

      case 'darkpool':
        return res.status(200).json({
          symbol: symbol,
          timestamp: new Date().toISOString(),
          total_volume: Math.floor(Math.random() * 10000000) + 1000000,
          dark_pool_percentage: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          lit_volume: Math.floor(Math.random() * 15000000) + 5000000,
          dark_volume: Math.floor(Math.random() * 8000000) + 2000000,
          venues: [
            {
              name: 'UBS ATS',
              volume: Math.floor(Math.random() * 2000000) + 500000,
              percentage: parseFloat((Math.random() * 25 + 5).toFixed(2))
            },
            {
              name: 'Crossfinder',
              volume: Math.floor(Math.random() * 1500000) + 300000,
              percentage: parseFloat((Math.random() * 20 + 3).toFixed(2))
            },
            {
              name: 'SIGMA X',
              volume: Math.floor(Math.random() * 1800000) + 400000,
              percentage: parseFloat((Math.random() * 22 + 4).toFixed(2))
            }
          ]
        });

      case 'volatility':
        return res.status(200).json({
          symbol: symbol,
          timestamp: new Date().toISOString(),
          implied_volatility: parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)),
          historical_volatility: parseFloat((Math.random() * 0.4 + 0.08).toFixed(4)),
          volatility_skew: parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
          term_structure: Array.from({ length: 8 }, (_, i) => ({
            days_to_expiry: [7, 14, 30, 60, 90, 120, 180, 360][i],
            implied_vol: parseFloat((Math.random() * 0.3 + 0.15).toFixed(4))
          })),
          put_call_ratio: parseFloat((Math.random() * 2 + 0.5).toFixed(2))
        });

      case 'greeks':
        return res.status(200).json({
          symbol: symbol,
          timestamp: new Date().toISOString(),
          spot_price: 425.50 + (Math.random() - 0.5) * 10,
          total_delta: parseFloat(((Math.random() - 0.5) * 2000000).toFixed(2)),
          total_gamma: parseFloat((Math.random() * 500000).toFixed(2)),
          total_theta: parseFloat((-Math.random() * 100000).toFixed(2)),
          total_vega: parseFloat((Math.random() * 800000).toFixed(2)),
          by_expiry: Array.from({ length: 5 }, (_, i) => {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + (i + 1) * 7);
            return {
              expiry: expiry.toISOString().split('T')[0],
              call_delta: parseFloat((Math.random() * 1000000).toFixed(4)),
              put_delta: parseFloat((-Math.random() * 1000000).toFixed(4)),
              call_gamma: parseFloat((Math.random() * 100000).toFixed(4)),
              put_gamma: parseFloat((-Math.random() * 100000).toFixed(4)),
              call_theta: parseFloat((-Math.random() * 50000).toFixed(4)),
              put_theta: parseFloat((-Math.random() * 50000).toFixed(4)),
              call_vega: parseFloat((Math.random() * 200000).toFixed(4)),
              put_vega: parseFloat((Math.random() * 200000).toFixed(4))
            };
          }),
          portfolio_greeks: {
            call_delta: parseFloat((Math.random() * 1000000).toFixed(4)),
            put_delta: parseFloat((-Math.random() * 1000000).toFixed(4)),
            call_gamma: parseFloat((Math.random() * 100000).toFixed(4)),
            put_gamma: parseFloat((-Math.random() * 100000).toFixed(4)),
            call_charm: parseFloat((Math.random() * 1000000).toFixed(4)),
            put_charm: parseFloat((-Math.random() * 500000).toFixed(4))
          }
        });

      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
