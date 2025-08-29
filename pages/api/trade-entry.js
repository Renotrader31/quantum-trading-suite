// Trade entry API with sample portfolio positions
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, userId } = req.body;

    if (action === 'getActiveTrades') {
      // Sample active portfolio positions
      const samplePositions = [
        {
          id: 'pos_1',
          symbol: 'SOFI',
          strategy: 'Bull Call Spread',
          type: 'options',
          quantity: 5,
          entryPrice: 1.50,
          currentPrice: 1.85,
          pnl: 175,
          status: 'active',
          severity: 'medium',
          risk: 'medium',
          entryDate: '2024-01-15T10:30:00Z',
          dte: 25,
          strikes: { long: 25, short: 27 },
          delta: 0.35,
          theta: -0.08,
          maxLoss: 750,
          maxProfit: 1000
        },
        {
          id: 'pos_2',
          symbol: 'AAPL',
          strategy: 'Iron Butterfly',
          type: 'options',
          quantity: 3,
          entryPrice: 2.20,
          currentPrice: 2.90,
          pnl: 210,
          status: 'active',
          severity: 'low',
          risk: 'low',
          entryDate: '2024-01-12T14:15:00Z',
          dte: 18,
          strikes: { put: 172, call: 175, shortCall: 178 },
          delta: 0.15,
          theta: -0.12,
          maxLoss: 660,
          maxProfit: 540
        },
        {
          id: 'pos_3',
          symbol: 'NVDA',
          strategy: 'Bull Call Spread',
          type: 'options',
          quantity: 2,
          entryPrice: 8.50,
          currentPrice: 6.20,
          pnl: -460,
          status: 'active',
          severity: 'high',
          risk: 'high',
          entryDate: '2024-01-08T09:45:00Z',
          dte: 12,
          strikes: { long: 870, short: 890 },
          delta: 0.42,
          theta: -0.25,
          maxLoss: 1700,
          maxProfit: 4000
        },
        {
          id: 'pos_4',
          symbol: 'META',
          strategy: 'Iron Condor',
          type: 'options',
          quantity: 4,
          entryPrice: 1.80,
          currentPrice: 2.15,
          pnl: 140,
          status: 'active',
          severity: 'medium',
          risk: 'medium',
          entryDate: '2024-01-10T11:20:00Z',
          dte: 22,
          strikes: { putStrike: 475, shortPut: 480, shortCall: 490, callStrike: 495 },
          delta: 0.08,
          theta: 0.15,
          maxLoss: 720,
          maxProfit: 280
        },
        {
          id: 'pos_5',
          symbol: 'TSLA',
          strategy: 'Long Call',
          type: 'options',
          quantity: 6,
          entryPrice: 12.30,
          currentPrice: 15.70,
          pnl: 2040,
          status: 'active',
          severity: 'low',
          risk: 'medium',
          entryDate: '2024-01-05T13:00:00Z',
          dte: 35,
          strikes: { long: 250 },
          delta: 0.68,
          theta: -0.18,
          maxLoss: 7380,
          maxProfit: 'Unlimited'
        }
      ];

      console.log(`📋 Retrieved ${samplePositions.length} active positions for user: ${userId}`);

      return res.status(200).json({
        success: true,
        action,
        userId,
        positions: samplePositions,
        summary: {
          totalPositions: samplePositions.length,
          totalPnL: samplePositions.reduce((sum, pos) => sum + pos.pnl, 0),
          activeStrategies: [...new Set(samplePositions.map(pos => pos.strategy))].length,
          riskBreakdown: {
            low: samplePositions.filter(pos => pos.risk === 'low').length,
            medium: samplePositions.filter(pos => pos.risk === 'medium').length,
            high: samplePositions.filter(pos => pos.risk === 'high').length
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Trade entry error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process trade request',
      message: error.message
    });
  }
}
