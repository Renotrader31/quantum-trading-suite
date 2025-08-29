// Enhanced market scan API with sample opportunities
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scanType = 'comprehensive', riskTolerance = 'medium' } = req.body;

    // Sample market opportunities with realistic data
    const sampleOpportunities = [
      {
        id: 1,
        symbol: 'SOFI',
        strategy: 'Bull Call Spread',
        currentPrice: 26.04,
        strikes: { long: 25, short: 27 },
        expectedReturn: '8.2%',
        maxRisk: '$150',
        probability: 65,
        severity: 'medium',
        risk: 'medium',
        iv: 0.35,
        dte: 30,
        volume: 1250,
        openInterest: 3400
      },
      {
        id: 2,
        symbol: 'NVDA',
        strategy: 'Iron Butterfly',
        currentPrice: 875.30,
        strikes: { put: 860, call: 875, shortCall: 890 },
        expectedReturn: '12.5%',
        maxRisk: '$500',
        probability: 58,
        severity: 'high',
        risk: 'medium',
        iv: 0.42,
        dte: 25,
        volume: 8900,
        openInterest: 15600
      },
      {
        id: 3,
        symbol: 'AAPL',
        strategy: 'Bull Call Spread',
        currentPrice: 175.20,
        strikes: { long: 172, short: 180 },
        expectedReturn: '15.3%',
        maxRisk: '$300',
        probability: 72,
        severity: 'low',
        risk: 'low',
        iv: 0.28,
        dte: 35,
        volume: 5600,
        openInterest: 12300
      },
      {
        id: 4,
        symbol: 'TSLA',
        strategy: 'Iron Condor',
        currentPrice: 248.42,
        strikes: { putStrike: 235, shortPut: 240, shortCall: 255, callStrike: 260 },
        expectedReturn: '18.7%',
        maxRisk: '$400',
        probability: 61,
        severity: 'medium',
        risk: 'medium',
        iv: 0.55,
        dte: 28,
        volume: 3200,
        openInterest: 8900
      },
      {
        id: 5,
        symbol: 'META',
        strategy: 'Bear Put Spread',
        currentPrice: 485.20,
        strikes: { long: 480, short: 470 },
        expectedReturn: '11.4%',
        maxRisk: '$350',
        probability: 69,
        severity: 'low',
        risk: 'low',
        iv: 0.31,
        dte: 32,
        volume: 2100,
        openInterest: 5700
      }
    ];

    // Filter based on risk tolerance
    let filteredOpportunities = sampleOpportunities;
    if (riskTolerance === 'low') {
      filteredOpportunities = sampleOpportunities.filter(op => op.risk === 'low');
    } else if (riskTolerance === 'high') {
      filteredOpportunities = sampleOpportunities.filter(op => op.risk !== 'low');
    }

    console.log(`📊 Enhanced scan completed: Found ${filteredOpportunities.length} opportunities`);

    return res.status(200).json({
      success: true,
      scanType,
      riskTolerance,
      opportunities: filteredOpportunities,
      timestamp: new Date().toISOString(),
      summary: {
        total: filteredOpportunities.length,
        highProbability: filteredOpportunities.filter(op => op.probability > 65).length,
        lowRisk: filteredOpportunities.filter(op => op.risk === 'low').length
      }
    });

  } catch (error) {
    console.error('Enhanced scan error:', error);
    return res.status(500).json({
      success: false,
      error: 'Scan failed',
      message: error.message
    });
  }
}
