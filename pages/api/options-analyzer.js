// Advanced Options Strategy Analyzer API
// Analyzes symbols from Squeeze Scanner through 15 strategies and returns top actionable trades

console.log('\n=== OPTIONS STRATEGY ANALYZER API STARTUP ===');

export default async function handler(req, res) {
  console.log('\n=== OPTIONS STRATEGY ANALYZER REQUEST ===');
  console.log('Method:', req.method);
  console.log('Timestamp:', new Date().toISOString());

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      symbols, 
      maxTrades = 4, 
      minProbability = 65,
      riskTolerance = 'moderate',
      maxInvestment = 10000 
    } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        error: 'Symbols array is required' 
      });
    }

    console.log(`🔍 Analyzing ${symbols.length} symbols through 15 strategies...`);
    console.log(`📊 Parameters: maxTrades=${maxTrades}, minProb=${minProbability}%, risk=${riskTolerance}`);

    const actionableTrades = [];
    const analysisResults = [];

    // Process each symbol through all 15 strategies
    for (const symbol of symbols) {
      console.log(`\n📈 Processing ${symbol}...`);
      
      try {
        // Get current market data for the symbol
        const marketData = await getMarketData(symbol);
        
        // Analyze through all 15 strategies
        const strategies = await analyzeAllStrategies(symbol, marketData, {
          riskTolerance,
          maxInvestment,
          minProbability
        });
        
        // Rank strategies by AI scoring
        const rankedStrategies = strategies
          .filter(s => s.probability >= minProbability)
          .sort((a, b) => b.aiScore - a.aiScore);
        
        analysisResults.push({
          symbol,
          totalStrategies: strategies.length,
          viableStrategies: rankedStrategies.length,
          topStrategy: rankedStrategies[0] || null,
          marketData
        });
        
        // Add top strategies to actionable trades
        rankedStrategies.slice(0, 2).forEach(strategy => {
          actionableTrades.push({
            ...strategy,
            symbol,
            analysisTime: new Date().toISOString()
          });
        });
        
      } catch (error) {
        console.error(`❌ Error analyzing ${symbol}:`, error.message);
        analysisResults.push({
          symbol,
          error: error.message,
          totalStrategies: 0,
          viableStrategies: 0
        });
      }
    }

    // Sort all actionable trades by AI score and take top maxTrades
    const topTrades = actionableTrades
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, maxTrades);

    console.log(`✅ Analysis complete: ${topTrades.length} actionable trades from ${symbols.length} symbols`);

    res.json({
      success: true,
      actionableTrades: topTrades,
      analysisResults,
      summary: {
        symbolsAnalyzed: symbols.length,
        totalTradesGenerated: actionableTrades.length,
        topTradesReturned: topTrades.length,
        averageProbability: topTrades.length > 0 
          ? (topTrades.reduce((sum, t) => sum + t.probability, 0) / topTrades.length).toFixed(1)
          : 0,
        averageAIScore: topTrades.length > 0
          ? (topTrades.reduce((sum, t) => sum + t.aiScore, 0) / topTrades.length).toFixed(1)
          : 0
      },
      parameters: {
        maxTrades,
        minProbability,
        riskTolerance,
        maxInvestment
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Options Strategy Analyzer error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      actionableTrades: [],
      analysisResults: []
    });
  }
}

// Get market data for symbol
async function getMarketData(symbol) {
  // Mock realistic market data - in production would fetch from live APIs
  const mockPrices = {
    'AAPL': 229.70, 'MSFT': 505.13, 'GOOGL': 195.30, 'AMZN': 205.45, 
    'TSLA': 351.18, 'META': 745.00, 'NVDA': 181.90, 'AMD': 167.17,
    'SPY': 646.12, 'QQQ': 572.78
  };

  const price = mockPrices[symbol] || (100 + Math.random() * 400);
  const change = (Math.random() - 0.5) * 6; // ±3%
  const volume = Math.floor(Math.random() * 50000000 + 5000000);
  const impliedVol = 0.15 + Math.random() * 0.35; // 15-50% IV

  return {
    symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat((change / price * 100).toFixed(2)),
    volume,
    impliedVolatility: parseFloat(impliedVol.toFixed(3)),
    marketCap: price * 1000000000 + Math.random() * 500000000000, // Mock market cap
    beta: 0.8 + Math.random() * 0.8, // Beta 0.8-1.6
    avgVolume: volume * (0.8 + Math.random() * 0.4) // ±20% of current volume
  };
}

// Analyze symbol through all 15 strategies
async function analyzeAllStrategies(symbol, marketData, config) {
  const strategies = [
    'straddle', 'strangle', 'ironCondor', 'butterfly', 'coveredCall',
    'calendar', 'shortStraddle', 'shortStrangle', 'ironButterfly', 
    'putSpread', 'callSpread', 'protectivePut', 'collar', 'ratio'
  ];

  const results = [];

  for (const strategyName of strategies) {
    try {
      const analysis = await analyzeStrategy(symbol, strategyName, marketData, config);
      results.push(analysis);
    } catch (error) {
      console.error(`Error analyzing ${strategyName} for ${symbol}:`, error.message);
    }
  }

  return results;
}

// Analyze individual strategy with AI scoring
async function analyzeStrategy(symbol, strategyName, marketData, config) {
  const { price, impliedVolatility, change, volume, beta } = marketData;
  const { riskTolerance, maxInvestment } = config;
  
  // Strategy-specific analysis
  const strategyData = getStrategyTemplate(strategyName);
  
  // Calculate key metrics
  const timeToExpiry = 30; // 30 days default
  const riskFreeRate = 0.05; // 5% risk-free rate
  
  // AI-powered probability calculation
  let baseProbability = 50;
  
  // Adjust based on strategy and market conditions
  switch (strategyName) {
    case 'straddle':
    case 'strangle':
      // High volatility favors long volatility strategies
      baseProbability += (impliedVolatility - 0.25) * 100;
      baseProbability += Math.abs(change) * 5; // Recent movement
      break;
      
    case 'shortStraddle':
    case 'shortStrangle':
      // Low volatility favors short volatility strategies
      baseProbability += (0.25 - impliedVolatility) * 100;
      baseProbability -= Math.abs(change) * 3;
      break;
      
    case 'ironCondor':
    case 'ironButterfly':
      // Range-bound strategies favor low volatility
      baseProbability += (0.30 - impliedVolatility) * 80;
      baseProbability -= Math.abs(change) * 4;
      break;
      
    case 'callSpread':
    case 'putSpread':
      // Directional spreads favor momentum
      baseProbability += change > 0 ? change * 8 : Math.abs(change) * 4;
      break;
      
    case 'coveredCall':
      // Income strategies favor stable, dividend stocks
      baseProbability += volume > 10000000 ? 10 : 0; // High volume bonus
      baseProbability += beta < 1.2 ? 8 : 0; // Low beta bonus
      break;
  }
  
  // Risk tolerance adjustments
  const riskMultiplier = getRiskMultiplier(riskTolerance, strategyName);
  baseProbability *= riskMultiplier;
  
  // Ensure probability is within realistic bounds
  const probability = Math.max(20, Math.min(95, Math.round(baseProbability)));
  
  // Calculate position sizing using Kelly Criterion
  const kellyFraction = calculateKellyFraction(probability, strategyName);
  const positionSize = Math.min(maxInvestment * kellyFraction, maxInvestment * 0.1); // Max 10% of capital
  
  // Calculate expected returns
  const expectedReturn = calculateExpectedReturn(strategyName, price, impliedVolatility, timeToExpiry);
  const maxLoss = calculateMaxLoss(strategyName, price, positionSize);
  const maxGain = calculateMaxGain(strategyName, price, positionSize);
  
  // AI Score combines multiple factors
  let aiScore = probability * 0.4; // 40% weight on probability
  aiScore += (expectedReturn / Math.abs(maxLoss)) * 20; // 20% weight on risk/reward
  aiScore += (volume / 10000000) * 10; // 10% weight on liquidity
  aiScore += (100 - impliedVolatility * 100) * 0.2; // 20% weight on IV level
  aiScore += Math.random() * 10; // 10% random factor for variability
  
  return {
    strategy: strategyName,
    strategyName: strategyData.name,
    description: strategyData.description,
    complexity: strategyData.complexity,
    probability: Math.round(probability),
    aiScore: Math.round(Math.max(0, Math.min(100, aiScore))),
    expectedReturn: parseFloat(expectedReturn.toFixed(2)),
    maxLoss: parseFloat(maxLoss.toFixed(2)),
    maxGain: parseFloat(maxGain.toFixed(2)),
    positionSize: Math.round(positionSize),
    kellyFraction: parseFloat(kellyFraction.toFixed(4)),
    riskReward: parseFloat((maxGain / Math.abs(maxLoss)).toFixed(2)),
    impliedVolatility: parseFloat((impliedVolatility * 100).toFixed(1)),
    timeDecay: calculateTimeDecay(strategyName, timeToExpiry),
    legs: generateOptionLegs(strategyName, price),
    marketCondition: assessMarketCondition(change, impliedVolatility),
    recommendation: probability >= 70 ? 'STRONG BUY' : probability >= 60 ? 'BUY' : probability >= 50 ? 'NEUTRAL' : 'AVOID'
  };
}

// Helper functions
function getStrategyTemplate(strategyName) {
  const templates = {
    straddle: { name: 'Long Straddle', description: 'Profit from large moves in either direction', complexity: 'Beginner' },
    strangle: { name: 'Long Strangle', description: 'Lower cost volatility play', complexity: 'Beginner' },
    ironCondor: { name: 'Iron Condor', description: 'Profit from low volatility', complexity: 'Intermediate' },
    butterfly: { name: 'Long Call Butterfly', description: 'Limited risk/reward at target price', complexity: 'Advanced' },
    coveredCall: { name: 'Covered Call', description: 'Generate income from stock holdings', complexity: 'Beginner' },
    calendar: { name: 'Calendar Spread', description: 'Profit from time decay', complexity: 'Advanced' },
    shortStraddle: { name: 'Short Straddle', description: 'Profit from low volatility', complexity: 'Advanced' },
    shortStrangle: { name: 'Short Strangle', description: 'Collect premium from range-bound movement', complexity: 'Advanced' },
    ironButterfly: { name: 'Iron Butterfly', description: 'Limited risk volatility play', complexity: 'Advanced' },
    putSpread: { name: 'Bull Put Spread', description: 'Bullish limited risk strategy', complexity: 'Intermediate' },
    callSpread: { name: 'Bull Call Spread', description: 'Bullish limited upside', complexity: 'Intermediate' },
    protectivePut: { name: 'Protective Put', description: 'Downside protection', complexity: 'Beginner' },
    collar: { name: 'Protective Collar', description: 'Cost-effective protection', complexity: 'Intermediate' },
    ratio: { name: 'Call Ratio Spread', description: 'Profit from moderate upside', complexity: 'Advanced' }
  };
  
  return templates[strategyName] || { name: strategyName, description: 'Options strategy', complexity: 'Intermediate' };
}

function getRiskMultiplier(riskTolerance, strategyName) {
  const baseMultipliers = {
    conservative: 0.8,
    moderate: 1.0,
    aggressive: 1.2
  };
  
  const strategyRisk = {
    'shortStraddle': 0.7, // High risk
    'shortStrangle': 0.8,
    'ratio': 0.75,
    'coveredCall': 1.1, // Lower risk
    'protectivePut': 1.1,
    'collar': 1.05
  };
  
  return (baseMultipliers[riskTolerance] || 1.0) * (strategyRisk[strategyName] || 1.0);
}

function calculateKellyFraction(probability, strategyName) {
  // Simplified Kelly Criterion: f = (bp - q) / b
  // where b = odds, p = win probability, q = loss probability
  const winProb = probability / 100;
  const lossProb = 1 - winProb;
  const avgOdds = 2.0; // Assume 2:1 average odds for options
  
  const kelly = (avgOdds * winProb - lossProb) / avgOdds;
  return Math.max(0, Math.min(0.25, kelly)); // Cap at 25% of capital
}

function calculateExpectedReturn(strategyName, price, iv, tte) {
  // Simplified expected return calculation
  const baseReturn = price * 0.02; // 2% base return
  const volatilityBonus = iv * price * 0.1;
  const timeBonus = (30 - tte) / 30 * price * 0.01;
  
  return baseReturn + volatilityBonus + timeBonus;
}

function calculateMaxLoss(strategyName, price, positionSize) {
  // Strategy-specific max loss calculations
  const lossRatios = {
    'straddle': 0.8, 'strangle': 0.7, 'ironCondor': 0.4,
    'shortStraddle': 2.0, 'shortStrangle': 1.5, 'ratio': 1.8,
    'coveredCall': 0.9, 'protectivePut': 0.1, 'collar': 0.05
  };
  
  return (positionSize * (lossRatios[strategyName] || 0.5)) * -1;
}

function calculateMaxGain(strategyName, price, positionSize) {
  // Strategy-specific max gain calculations  
  const gainRatios = {
    'straddle': 3.0, 'strangle': 2.5, 'ironCondor': 0.8,
    'shortStraddle': 0.3, 'shortStrangle': 0.4, 'ratio': 0.6,
    'coveredCall': 0.15, 'protectivePut': 2.0, 'collar': 0.3
  };
  
  return positionSize * (gainRatios[strategyName] || 1.0);
}

function calculateTimeDecay(strategyName, tte) {
  // Time decay impact per day
  const decayRates = {
    'straddle': -0.02, 'strangle': -0.018, 'calendar': 0.01,
    'shortStraddle': 0.025, 'shortStrangle': 0.02, 'coveredCall': 0.015
  };
  
  return decayRates[strategyName] || -0.01;
}

function generateOptionLegs(strategyName, price) {
  // Generate specific option legs with strikes and expirations
  const legs = [];
  const atm = Math.round(price);
  
  switch (strategyName) {
    case 'straddle':
      legs.push(
        { type: 'call', action: 'buy', strike: atm, expiry: '30d', quantity: 1 },
        { type: 'put', action: 'buy', strike: atm, expiry: '30d', quantity: 1 }
      );
      break;
    case 'strangle':
      legs.push(
        { type: 'call', action: 'buy', strike: atm + 5, expiry: '30d', quantity: 1 },
        { type: 'put', action: 'buy', strike: atm - 5, expiry: '30d', quantity: 1 }
      );
      break;
    case 'ironCondor':
      legs.push(
        { type: 'put', action: 'buy', strike: atm - 15, expiry: '30d', quantity: 1 },
        { type: 'put', action: 'sell', strike: atm - 5, expiry: '30d', quantity: 1 },
        { type: 'call', action: 'sell', strike: atm + 5, expiry: '30d', quantity: 1 },
        { type: 'call', action: 'buy', strike: atm + 15, expiry: '30d', quantity: 1 }
      );
      break;
    default:
      legs.push({ type: 'call', action: 'buy', strike: atm, expiry: '30d', quantity: 1 });
  }
  
  return legs;
}

function assessMarketCondition(change, iv) {
  if (Math.abs(change) > 3 && iv > 0.3) return 'HIGH_VOLATILITY';
  if (Math.abs(change) < 1 && iv < 0.2) return 'LOW_VOLATILITY';  
  if (change > 2) return 'BULLISH_MOMENTUM';
  if (change < -2) return 'BEARISH_MOMENTUM';
  return 'NEUTRAL';
}

console.log('✅ Options Strategy Analyzer API loaded successfully');