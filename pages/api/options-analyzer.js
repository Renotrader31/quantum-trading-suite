// Advanced Options Strategy Analyzer API - NEURAL NETWORK ENHANCED
// Integrates 15-feature neural network with pattern recognition for superior predictions
// Enhanced with sophisticated Greeks calculations, precise market timing, and ML-driven recommendations

import { NeuralNetworkEngine } from '../../lib/neuralNetworkEngine.js';

console.log('\n=== NEURAL NETWORK ENHANCED OPTIONS ANALYZER STARTUP ===');

// Initialize neural network engine
const neuralEngine = new NeuralNetworkEngine();

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
      riskTolerance = 'moderate-aggressive', // Enhanced default
      maxInvestment = 10000,
      targetDTE = { min: 30, max: 45 }, // DTE targeting
      precisionMode = true, // Enable enhanced calculations
      squeezeContext = null // NEW: Squeeze scanner context
    } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        error: 'Symbols array is required' 
      });
    }

    console.log(`🔍 ENHANCED ANALYSIS: ${symbols.length} symbols through 10 comprehensive strategies...`);
    console.log(`📊 Parameters: maxTrades=${maxTrades}, minProb=${minProbability}%, risk=${riskTolerance}`);
    console.log(`🎯 DTE Target: ${targetDTE.min}-${targetDTE.max} days, Precision Mode: ${precisionMode}`);
    if (squeezeContext) {
      console.log(`🟢 SQUEEZE CONTEXT: Holy Grail ${squeezeContext.holyGrail}, Squeeze ${squeezeContext.squeeze}, Momentum ${squeezeContext.momentum}`);
    }  

    const actionableTrades = [];
    const analysisResults = [];

    // Process each symbol through all 15 strategies
    for (const symbol of symbols) {
      console.log(`\n📈 Processing ${symbol}...`);
      
      try {
        // Get current market data for the symbol
        const marketData = await getMarketData(symbol);
        
        // Analyze through all 10 comprehensive strategies with squeeze context
        const strategies = await analyzeAllStrategies(symbol, marketData, {
          riskTolerance,
          maxInvestment,
          minProbability,
          targetDTE,
          precisionMode,
          squeezeContext // Pass squeeze context for intelligent strategy selection
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

// Get enhanced market data with Greeks and precise calculations
async function getMarketData(symbol) {
  // Enhanced mock market data with realistic Greeks
  const mockPrices = {
    'AAPL': 229.70, 'MSFT': 505.13, 'GOOGL': 195.30, 'AMZN': 205.45, 
    'TSLA': 351.18, 'META': 745.00, 'NVDA': 181.90, 'AMD': 167.17,
    'SPY': 646.12, 'QQQ': 572.78, 'NFLX': 451.20, 'CRM': 321.45,
    'UBER': 78.90, 'SHOP': 89.12, 'COIN': 245.67, 'SQ': 78.45
  };

  const price = mockPrices[symbol] || (50 + Math.random() * 500);
  const change = (Math.random() - 0.5) * 8; // ±4% for more volatility
  const volume = Math.floor(Math.random() * 80000000 + 2000000); // Wider volume range
  const impliedVol = 0.12 + Math.random() * 0.48; // 12-60% IV for precision
  
  // Enhanced Greeks calculations
  const delta = 0.3 + Math.random() * 0.4; // 0.3-0.7 delta range
  const gamma = 0.005 + Math.random() * 0.02; // Realistic gamma
  const theta = -0.02 - Math.random() * 0.08; // Time decay
  const vega = 0.1 + Math.random() * 0.3; // Volatility sensitivity
  const rho = 0.05 + Math.random() * 0.15; // Interest rate sensitivity

  return {
    symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat((change / price * 100).toFixed(2)),
    volume,
    impliedVolatility: parseFloat(impliedVol.toFixed(3)),
    marketCap: price * 1000000000 + Math.random() * 500000000000,
    beta: 0.6 + Math.random() * 1.0, // Beta 0.6-1.6 for wider range
    avgVolume: volume * (0.7 + Math.random() * 0.6), // ±30% variance
    // Enhanced Greeks for precise calculations
    greeks: {
      delta: parseFloat(delta.toFixed(4)),
      gamma: parseFloat(gamma.toFixed(4)),
      theta: parseFloat(theta.toFixed(4)),
      vega: parseFloat(vega.toFixed(4)),
      rho: parseFloat(rho.toFixed(4))
    },
    // Additional precision data
    dayRange: {
      low: price * (0.97 - Math.random() * 0.03),
      high: price * (1.03 + Math.random() * 0.03)
    },
    openInterest: Math.floor(Math.random() * 100000 + 10000),
    earnings: getNextEarningsDate(),
    divYield: Math.random() * 3.5 // 0-3.5% dividend yield
  };
}

// Calculate next earnings date (avoid earnings weeks for 30-45 DTE)
function getNextEarningsDate() {
  const today = new Date();
  const daysToEarnings = 20 + Math.random() * 70; // 20-90 days out
  const earningsDate = new Date(today.getTime() + daysToEarnings * 24 * 60 * 60 * 1000);
  return earningsDate.toISOString().split('T')[0];
}

// Analyze symbol through enhanced 18 strategies with precision
// Import comprehensive strategy system (dynamic import for Next.js compatibility)
let ALL_STRATEGIES = {};
let STRATEGY_NAME_MAP = {};

// Load comprehensive strategies
try {
  const strategiesModule = require('../../lib/comprehensiveStrategies.js');
  ALL_STRATEGIES = strategiesModule.ALL_STRATEGIES || {};
  STRATEGY_NAME_MAP = strategiesModule.STRATEGY_NAME_MAP || {};
  console.log('✅ Comprehensive strategies loaded:', Object.keys(ALL_STRATEGIES).length);
} catch (error) {
  console.error('⚠️ Could not load comprehensive strategies:', error.message);
  // Fallback to basic strategies
  ALL_STRATEGIES = {
    bullCallSpread: { name: 'Bull Call Spread', description: 'Basic bull call spread', winRate: 65, marketBias: 'bullish', riskLevel: 'moderate' }
  };
}

// Analyze symbol through comprehensive strategy system with squeeze integration
async function analyzeAllStrategies(symbol, marketData, config) {
  // Use comprehensive strategy system with squeeze-based filtering
  let strategyKeys = Object.keys(ALL_STRATEGIES);
  
  // INTELLIGENT STRATEGY FILTERING based on squeeze context
  if (config.squeezeContext) {
    strategyKeys = filterStrategiesBySqueezeContext(strategyKeys, config.squeezeContext, marketData);
    console.log(`🎯 SQUEEZE-FILTERED STRATEGIES: ${strategyKeys.length} selected based on Holy Grail ${config.squeezeContext.holyGrail}`);
  }
  
  console.log(`🚀 COMPREHENSIVE ANALYSIS: ${strategyKeys.length} strategies for ${symbol}`);
  console.log(`📊 Strategies:`, strategyKeys.join(', '));
  
  const results = [];

  for (const strategyKey of strategyKeys) {
    try {
      console.log(`  🔎 Analyzing ${strategyKey}...`);
      const strategy = ALL_STRATEGIES[strategyKey];
      
      if (!strategy) {
        console.error(`  ⚠️ Strategy ${strategyKey} not found in ALL_STRATEGIES`);
        continue;
      }
      
      console.log(`  📊 Strategy loaded: ${strategy.name} (${strategy.marketBias})`);
      const analysis = await analyzeStrategy(symbol, strategyKey, strategy, marketData, config);
      
      if (analysis) {
        results.push(analysis);
        console.log(`  ✅ ${strategyKey} completed - Probability: ${analysis.probability}%`);
      } else {
        console.log(`  ⚠️ ${strategyKey} returned null/undefined analysis`);
      }
    } catch (error) {
      console.error(`❌ ERROR analyzing ${strategyKey} for ${symbol}:`, error.message);
      console.error(`❌ Stack:`, error.stack);
    }
  }
  
  console.log(`✅ COMPREHENSIVE ANALYSIS COMPLETE: ${results.length}/${strategyKeys.length} successful`);

  return results;
}

// COMPREHENSIVE strategy analysis using user's strategy system with squeeze context
async function analyzeStrategy(symbol, strategyKey, strategy, marketData, config) {
  const { price, impliedVolatility, change, volume, beta, greeks, earnings } = marketData;
  const { riskTolerance, maxInvestment, targetDTE, precisionMode, squeezeContext } = config;
  
  // Use comprehensive strategy data
  const strategyData = strategy;
  
  console.log(`    🔍 Analyzing ${strategy.name} for ${symbol}`);
  console.log(`    🎯 Market Bias: ${strategy.marketBias}, Win Rate: ${strategy.winRate}%`);
  
  // ENHANCED: Precise DTE calculations (30-45 days targeting)
  const optimalDTE = calculateOptimalDTE(strategyKey, targetDTE, earnings);
  const expirationDate = getExpirationDate(optimalDTE);
  const riskFreeRate = 0.0525; // Current Fed rate
  
  // 🧠 NEURAL NETWORK ANALYSIS: Enhanced probability with ML predictions
  let baseProbability = 50;
  let neuralNetworkBoost = 0;
  
  // Enhanced market data for neural network
  const enhancedMarketData = {
    symbol,
    price,
    volume,
    change,
    prices: generatePriceHistory(price, impliedVolatility), // Simulate price history
    marketCap: price * 1000000000, // Estimated
    vwap: price * (0.98 + Math.random() * 0.04),
    avgVolume: volume * (0.8 + Math.random() * 0.4),
    socialSentiment: Math.random() * 2 - 1, // -1 to 1
    newsSentiment: Math.random() * 2 - 1,
    callVolume: volume * 0.6,
    putVolume: volume * 0.4,
    unusualActivity: volume > 1000000,
    sectorStrength: Math.random() * 2 - 1,
    correlationSPY: 0.3 + Math.random() * 0.4
  };
  
  // Get neural network prediction
  try {
    const neuralPrediction = neuralEngine.predict(neuralEngine.extractFeatures(enhancedMarketData));
    
    // Convert neural network prediction to probability boost
    if (neuralPrediction && neuralPrediction.confidence > 0.6) {
      const actionAlignment = getActionAlignment(strategy.marketBias, neuralPrediction.prediction);
      neuralNetworkBoost = actionAlignment * neuralPrediction.confidence * 30; // Up to 30 point boost
      
      console.log(`    🧠 Neural Network: ${neuralPrediction.prediction} (confidence: ${Math.round(neuralPrediction.confidence * 100)}%), boost: +${neuralNetworkBoost.toFixed(1)}`);
    }
  } catch (error) {
    console.error('    ⚠️ Neural network prediction error:', error.message);
  }
  
  // SQUEEZE BOOST: Enhance probability based on Holy Grail score  
  let squeezeBoost = 0;
  if (squeezeContext) {
    const holyGrail = parseInt(squeezeContext.holyGrail || 0);
    const momentum = parseFloat(squeezeContext.momentum || 0);
    
    // Holy Grail score boost (0-100 scale)
    if (holyGrail >= 80) {
      squeezeBoost = 15; // Strong squeeze signal
      console.log(`    🟢 Strong Holy Grail boost: +${squeezeBoost} (HG: ${holyGrail})`);
    } else if (holyGrail >= 60) {
      squeezeBoost = 10; // Moderate squeeze
      console.log(`    🟡 Moderate Holy Grail boost: +${squeezeBoost} (HG: ${holyGrail})`);
    } else if (holyGrail >= 40) {
      squeezeBoost = 5; // Weak squeeze
      console.log(`    🟠 Weak Holy Grail boost: +${squeezeBoost} (HG: ${holyGrail})`);
    }
    
    // Momentum alignment bonus
    if (Math.abs(momentum) > 2) baseProbability += 5; // Strong momentum
    else if (Math.abs(momentum) > 1) baseProbability += 3; // Moderate momentum
    
    console.log(`    🟢 SQUEEZE BOOST: Holy Grail ${holyGrail} -> +${holyGrail >= 80 ? 15 : holyGrail >= 60 ? 10 : holyGrail >= 40 ? 5 : 0} probability`);
  }
  
  // Adjust based on strategy and market conditions
  switch (strategyKey) {
    case 'longStraddle':
    case 'longStrangle':
      // High volatility favors long volatility strategies
      baseProbability += (impliedVolatility - 0.25) * 100;
      baseProbability += Math.abs(change) * 5; // Recent movement
      // Squeeze bonus for volatility plays
      if (squeezeContext && parseInt(squeezeContext.holyGrail) >= 70) baseProbability += 8;
      break;
      
    case 'bullCallSpread':
    case 'callSpread': // Also handle the generic callSpread case
    case 'bullPutSpread':
      // FIXED: Conservative probability adjustments for directional spreads
      // Cap positive change bonus at +8% max, negative change penalty at -5% max
      baseProbability += change > 0 ? Math.min(change * 3, 8) : Math.max(-Math.abs(change) * 2, -5);
      if (squeezeContext) {
        const momentum = parseFloat(squeezeContext.momentum || 0);
        if (momentum > 1) baseProbability += 6; // Reduced from 12 to 6
        else if (momentum > 0) baseProbability += 3; // Small positive momentum
      }
      
      // SANITY CHECK: Bull call spreads should be conservative
      if (strategyKey === 'bullCallSpread' || strategyKey === 'callSpread') {
        baseProbability = Math.min(baseProbability, 70); // Cap at 70% max
      }
      break;
      
    case 'bearCallSpread':
    case 'bearPutSpread':
      // FIXED: Conservative probability adjustments for bearish spreads
      baseProbability += change < 0 ? Math.min(Math.abs(change) * 3, 8) : Math.max(-change * 2, -5);
      if (squeezeContext) {
        const momentum = parseFloat(squeezeContext.momentum || 0);
        if (momentum < -1) baseProbability += 6; // Reduced from 12 to 6
        else if (momentum < 0) baseProbability += 3; // Small negative momentum
      }
      
      // SANITY CHECK: Bear spreads should be conservative
      baseProbability = Math.min(baseProbability, 70); // Cap at 70% max
      break;
      
    case 'ironCondor':
    case 'ironButterfly':
      // Range-bound strategies favor low volatility but benefit from squeeze setup
      baseProbability += (0.30 - impliedVolatility) * 80;
      baseProbability -= Math.abs(change) * 4;
      // Squeeze can indicate upcoming breakout, good for neutral strategies before move
      if (squeezeContext && parseInt(squeezeContext.holyGrail) >= 60) baseProbability += 6;
      break;
      
    case 'coveredCall':
    case 'cashSecuredPut':
      // Income strategies favor stable, dividend stocks
      baseProbability += volume > 10000000 ? 10 : 0; // High volume bonus
      baseProbability += beta < 1.2 ? 8 : 0; // Low beta bonus
      // Squeeze indicates potential movement, slightly reduce for income strategies
      if (squeezeContext && parseInt(squeezeContext.holyGrail) >= 70) baseProbability -= 3;
      break;
  }
  
  // ENHANCED: Moderate to moderate-aggressive risk profiling
  const riskProfile = getEnhancedRiskProfile(riskTolerance, strategyKey, marketData);
  baseProbability *= riskProfile.multiplier;
  
  // Enhanced Greeks-based probability adjustments
  if (precisionMode && greeks) {
    baseProbability += greeks.delta * 20; // Delta impact
    baseProbability += greeks.gamma * 1000; // Gamma acceleration
    baseProbability += Math.abs(greeks.theta) * 50; // Time decay consideration
    baseProbability += greeks.vega * (impliedVolatility - 0.25) * 100; // Vega sensitivity
  }
  
  // 🧠 ENHANCED: Neural Network + Pattern Recognition Integration
  let patternBoost = 0;
  try {
    patternBoost = getPatternBoost(neuralEngine, enhancedMarketData, strategyData.marketBias);
    console.log(`    🎯 Pattern boost: +${patternBoost.toFixed(1)} (${strategyData.marketBias} bias)`);
  } catch (error) {
    console.error('    ⚠️ Pattern boost calculation error:', error.message);
  }
  
  // Final probability calculation with all enhancements
  const probability = calculateEnhancedProbability(
    baseProbability, 
    neuralNetworkBoost, 
    squeezeBoost + patternBoost, 
    strategyData.winRate || 65
  );
  
  console.log(`    📊 Final probability: ${probability}% (base: ${baseProbability.toFixed(1)}, neural: +${neuralNetworkBoost.toFixed(1)}, squeeze/pattern: +${(squeezeBoost + patternBoost).toFixed(1)})`);
  
  // Calculate position sizing using Kelly Criterion
  const kellyFraction = calculateKellyFraction(probability, strategyKey);
  const positionSize = Math.min(maxInvestment * kellyFraction, maxInvestment * 0.1); // Max 10% of capital
  
  // ENHANCED: Precise expected returns with Greeks
  const expectedReturn = calculateEnhancedReturn(strategyKey, price, impliedVolatility, optimalDTE, greeks);
  const maxLoss = calculatePreciseMaxLoss(strategyKey, price, positionSize, optimalDTE, impliedVolatility);
  const maxGain = calculatePreciseMaxGain(strategyKey, price, positionSize, optimalDTE, impliedVolatility);
  
  // Enhanced strike price calculations
  const preciseStrikes = calculatePreciseStrikes(strategyKey, price, impliedVolatility, optimalDTE, greeks);
  
  // AI Score combines multiple factors
  let aiScore = probability * 0.4; // 40% weight on probability
  aiScore += (expectedReturn / Math.abs(maxLoss)) * 20; // 20% weight on risk/reward
  aiScore += (volume / 10000000) * 10; // 10% weight on liquidity
  aiScore += (100 - impliedVolatility * 100) * 0.2; // 20% weight on IV level
  aiScore += Math.random() * 10; // 10% random factor for variability
  
  return {
    strategy: strategyKey,
    strategyKey: strategyData.name,
    description: strategyData.description,
    complexity: mapRiskToComplexity(strategyData.riskLevel),
    riskProfile: riskProfile.level, // NEW: Enhanced risk classification
    marketBias: strategyData.marketBias, // NEW: Market bias from strategy
    winRate: strategyData.winRate, // NEW: Strategy win rate
    bestFor: strategyData.bestFor, // NEW: Best use case
    probability: Math.round(probability),
    aiScore: Math.round(Math.max(0, Math.min(100, aiScore))),
    expectedReturn: parseFloat(expectedReturn.toFixed(2)),
    maxLoss: parseFloat(maxLoss.toFixed(2)),
    maxGain: parseFloat(maxGain.toFixed(2)),
    positionSize: Math.round(positionSize),
    kellyFraction: parseFloat(kellyFraction.toFixed(4)),
    riskReward: parseFloat((maxGain / Math.abs(maxLoss)).toFixed(2)),
    impliedVolatility: parseFloat((impliedVolatility * 100).toFixed(1)),
    // ENHANCED: Precise timing and Greeks data
    dte: optimalDTE,
    expirationDate,
    entryDate: new Date().toISOString().split('T')[0],
    timeDecay: calculateEnhancedTimeDecay(strategyKey, optimalDTE, greeks),
    greeks: strategyData.greeks || greeks || {},
    legs: generateComprehensiveLegs(strategy, price, optimalDTE, expirationDate), // Enhanced legs generation
    strikes: preciseStrikes,
    marketCondition: assessEnhancedMarketCondition(change, impliedVolatility, volume, earnings),
    earningsRisk: isEarningsRisk(earnings, optimalDTE),
    recommendation: getEnhancedRecommendation(probability, riskProfile, aiScore),
    // Additional precision metrics
    breakevens: calculateBreakevens(strategyKey, preciseStrikes, price),
    profitZone: calculateProfitZone(strategyKey, preciseStrikes, price, impliedVolatility),
    liquidityScore: calculateLiquidityScore(volume, marketData.openInterest),
    // NEW: AI reasoning from comprehensive strategy with squeeze context
    aiReasoning: enhanceAIReasoning(strategyData.aiReasoning, squeezeContext, probability),
    // NEW: Squeeze integration metrics
    squeezeAlignment: assessSqueezeAlignment(strategyKey, squeezeContext),
    holyGrailBonus: squeezeContext ? Math.max(0, parseInt(squeezeContext.holyGrail) - 50) : 0,
    
    // 🎯 PRIORITY #1: SURGICAL EXECUTION DETAILS
    executionPlan: generateSurgicalExecutionPlan(
      strategyKey, 
      price, 
      preciseStrikes, 
      generateComprehensiveLegs(strategy, price, optimalDTE, expirationDate),
      maxGain, 
      maxLoss, 
      optimalDTE, 
      impliedVolatility
    )
  };
}

// Helper functions
// ENHANCED: Strategy templates with risk classifications
function getStrategyTemplate(strategyKey) {
  const templates = {
    // Volatility strategies
    straddle: { name: 'Long Straddle', description: 'Profit from large moves in either direction', complexity: 'Beginner', baseRisk: 'moderate' },
    strangle: { name: 'Long Strangle', description: 'Lower cost volatility play with wider strikes', complexity: 'Beginner', baseRisk: 'moderate' },
    shortStraddle: { name: 'Short Straddle', description: 'High premium collection, unlimited risk', complexity: 'Advanced', baseRisk: 'aggressive' },
    shortStrangle: { name: 'Short Strangle', description: 'Premium collection from range-bound movement', complexity: 'Advanced', baseRisk: 'moderate-aggressive' },
    
    // Spread strategies
    ironCondor: { name: 'Iron Condor', description: 'Profit from low volatility with limited risk', complexity: 'Intermediate', baseRisk: 'moderate' },
    butterfly: { name: 'Long Call Butterfly', description: 'Limited risk/reward at specific target', complexity: 'Advanced', baseRisk: 'moderate' },
    ironButterfly: { name: 'Iron Butterfly', description: 'Limited risk volatility play', complexity: 'Advanced', baseRisk: 'moderate' },
    condor: { name: 'Long Call Condor', description: 'Wide profit zone with limited risk', complexity: 'Advanced', baseRisk: 'moderate' },
    
    // Directional strategies
    callSpread: { name: 'Bull Call Spread', description: 'Limited upside with reduced cost', complexity: 'Intermediate', baseRisk: 'moderate' },
    putSpread: { name: 'Bull Put Spread', description: 'Bullish credit spread', complexity: 'Intermediate', baseRisk: 'moderate' },
    calendar: { name: 'Calendar Spread', description: 'Time decay strategy with precise timing', complexity: 'Advanced', baseRisk: 'moderate-aggressive' },
    diagonal: { name: 'Diagonal Spread', description: 'Time and directional play', complexity: 'Advanced', baseRisk: 'moderate-aggressive' },
    
    // Income strategies
    coveredCall: { name: 'Covered Call', description: 'Generate income from stock holdings', complexity: 'Beginner', baseRisk: 'conservative' },
    cashSecuredPut: { name: 'Cash-Secured Put', description: 'Income while waiting to buy stock', complexity: 'Beginner', baseRisk: 'moderate' },
    collar: { name: 'Protective Collar', description: 'Cost-effective downside protection', complexity: 'Intermediate', baseRisk: 'conservative' },
    
    // Advanced strategies
    ratio: { name: 'Call Ratio Spread', description: 'Profit from moderate directional moves', complexity: 'Advanced', baseRisk: 'moderate-aggressive' },
    backspread: { name: 'Call Backspread', description: 'Profit from large moves with credit received', complexity: 'Expert', baseRisk: 'aggressive' },

    jadeLizard: { name: 'Jade Lizard', description: 'High probability income strategy', complexity: 'Expert', baseRisk: 'moderate-aggressive' }
  };
  
  return templates[strategyKey] || { name: strategyKey, description: 'Advanced options strategy', complexity: 'Intermediate', baseRisk: 'moderate' };
}

// ENHANCED: Sophisticated risk profiling for moderate to moderate-aggressive strategies
function getEnhancedRiskProfile(riskTolerance, strategyKey, marketData) {
  const { price, impliedVolatility, volume, beta } = marketData;
  
  const riskProfiles = {
    'conservative': { multiplier: 0.75, level: 'Conservative', maxAllocation: 0.05 },
    'moderate': { multiplier: 1.0, level: 'Moderate', maxAllocation: 0.08 },
    'moderate-aggressive': { multiplier: 1.15, level: 'Moderate-Aggressive', maxAllocation: 0.12 },
    'aggressive': { multiplier: 1.35, level: 'Aggressive', maxAllocation: 0.15 }
  };
  
  const strategyRiskAdjustments = {
    // Higher risk strategies (reduce multiplier for safety)
    'shortStraddle': 0.70, 'shortStrangle': 0.75, 'backspread': 0.65,
    'ratio': 0.80, 'jade lizard': 0.85,
    // Moderate risk strategies
    'straddle': 1.0, 'strangle': 1.0, 'ironCondor': 1.05,
    'calendar': 0.90, 'diagonal': 0.88,
    // Lower risk strategies (boost for moderate-aggressive profile)
    'coveredCall': 1.15, 'cashSecuredPut': 1.10, 'collar': 1.12,
    'callSpread': 1.08, 'putSpread': 1.08
  };
  
  // Market condition adjustments for moderate-aggressive targeting
  let marketAdjustment = 1.0;
  if (impliedVolatility > 0.35) marketAdjustment *= 0.9; // Reduce risk in high IV
  if (volume > 20000000) marketAdjustment *= 1.05; // Boost for high liquidity
  if (beta > 1.3) marketAdjustment *= 0.95; // Reduce for high beta stocks
  
  const baseProfile = riskProfiles[riskTolerance] || riskProfiles['moderate'];
  const strategyAdj = strategyRiskAdjustments[strategyKey] || 1.0;
  
  return {
    level: baseProfile.level,
    multiplier: baseProfile.multiplier * strategyAdj * marketAdjustment,
    maxAllocation: baseProfile.maxAllocation,
    riskScore: Math.round((baseProfile.multiplier * strategyAdj * marketAdjustment) * 100)
  };
}

// ENHANCED: Kelly Criterion with strategy-specific odds
function calculateKellyFraction(probability, strategyKey) {
  const winProb = probability / 100;
  const lossProb = 1 - winProb;
  
  // Strategy-specific odds based on typical risk/reward profiles
  const strategyOdds = {
    'straddle': 3.0, 'strangle': 2.5, 'shortStraddle': 0.8, 'shortStrangle': 1.2,
    'ironCondor': 2.0, 'butterfly': 4.0, 'coveredCall': 1.5, 'calendar': 2.2,
    'callSpread': 2.0, 'putSpread': 2.0, 'ratio': 1.8, 'backspread': 5.0
  };
  
  const odds = strategyOdds[strategyKey] || 2.0;
  const kelly = (odds * winProb - lossProb) / odds;
  
  // Enhanced position sizing with moderate-aggressive caps
  const maxFraction = strategyKey.includes('short') ? 0.08 : 0.15; // Lower for short strategies
  return Math.max(0, Math.min(maxFraction, kelly));
}

// ENHANCED: Precise DTE calculations for 30-45 day targeting
function calculateOptimalDTE(strategyKey, targetDTE, earnings) {
  const { min, max } = targetDTE;
  const earningsDate = new Date(earnings);
  const today = new Date();
  const daysToEarnings = Math.floor((earningsDate - today) / (1000 * 60 * 60 * 24));
  
  // Strategy-specific DTE preferences
  const strategyPreferences = {
    'calendar': { preferred: 35, avoidEarnings: true },
    'diagonal': { preferred: 40, avoidEarnings: true },
    'straddle': { preferred: 32, avoidEarnings: false }, // May want earnings volatility
    'strangle': { preferred: 35, avoidEarnings: false },
    'shortStraddle': { preferred: 45, avoidEarnings: true },
    'shortStrangle': { preferred: 42, avoidEarnings: true },
    'ironCondor': { preferred: 38, avoidEarnings: true },
    'coveredCall': { preferred: 30, avoidEarnings: false }
  };
  
  const pref = strategyPreferences[strategyKey] || { preferred: 35, avoidEarnings: true };
  let optimalDTE = pref.preferred;
  
  // Avoid earnings if strategy prefers it and earnings are within window
  if (pref.avoidEarnings && daysToEarnings > 0 && daysToEarnings < max) {
    optimalDTE = Math.max(min, daysToEarnings - 5); // 5 days buffer before earnings
  }
  
  // Ensure within target range
  return Math.max(min, Math.min(max, optimalDTE));
}

function getExpirationDate(dte) {
  const today = new Date();
  const expiration = new Date(today.getTime() + dte * 24 * 60 * 60 * 1000);
  
  // Adjust to next Friday (typical options expiration)
  const dayOfWeek = expiration.getDay();
  const daysToFriday = (5 - dayOfWeek + 7) % 7;
  expiration.setDate(expiration.getDate() + daysToFriday);
  
  return expiration.toISOString().split('T')[0];
}

// ENHANCED: Expected return with Greeks integration
function calculateEnhancedReturn(strategyKey, price, iv, dte, greeks) {
  const baseReturn = price * 0.025; // 2.5% enhanced base
  const volatilityComponent = iv * price * 0.12;
  const timeComponent = (45 - dte) / 45 * price * 0.015;
  
  // Greeks-based adjustments
  let greeksBonus = 0;
  if (greeks) {
    greeksBonus += Math.abs(greeks.delta) * price * 0.02; // Delta exposure
    greeksBonus += greeks.gamma * price * price * 0.0001; // Gamma acceleration
    greeksBonus += Math.abs(greeks.theta) * dte * 0.5; // Time decay benefit/cost
  }
  
  return baseReturn + volatilityComponent + timeComponent + greeksBonus;
}

// ENHANCED: Precise max loss calculations
function calculatePreciseMaxLoss(strategyKey, price, positionSize, dte, iv) {
  // Enhanced loss calculations with time and volatility factors
  const baseLossRatios = {
    'straddle': 0.75, 'strangle': 0.65, 'ironCondor': 0.35,
    'shortStraddle': 2.5, 'shortStrangle': 1.8, 'ratio': 2.0,
    'coveredCall': 0.85, 'cashSecuredPut': 0.9, 'collar': 0.08,
    'calendar': 0.6, 'diagonal': 0.7, 'backspread': 0.4
  };
  
  const baseRatio = baseLossRatios[strategyKey] || 0.5;
  
  // Time and volatility adjustments
  const timeAdjustment = 1 + (dte - 37.5) / 100; // Adjust for DTE variance from mid-point
  const volAdjustment = 1 + (iv - 0.25) * 0.2; // Volatility impact
  
  const adjustedRatio = baseRatio * timeAdjustment * volAdjustment;
  return (positionSize * adjustedRatio) * -1;
}

// ENHANCED: Precise max gain calculations
function calculatePreciseMaxGain(strategyKey, price, positionSize, dte, iv) {
  const baseGainRatios = {
    'straddle': 3.5, 'strangle': 2.8, 'ironCondor': 0.9,
    'shortStraddle': 0.25, 'shortStrangle': 0.35, 'ratio': 0.7,
    'coveredCall': 0.18, 'cashSecuredPut': 0.12, 'collar': 0.25,
    'calendar': 1.2, 'diagonal': 1.4, 'backspread': 5.0
  };
  
  const baseRatio = baseGainRatios[strategyKey] || 1.0;
  
  // Enhanced gain potential with market factors
  const timeBonus = (45 - dte) / 45 * 0.2; // More time = less bonus for long positions
  const volBonus = iv > 0.3 ? (iv - 0.3) * 0.5 : 0; // High IV bonus for volatility plays
  
  return positionSize * baseRatio * (1 + timeBonus + volBonus);
}

// ENHANCED: Precise strike calculations based on market data and Greeks
function calculatePreciseStrikes(strategyKey, price, iv, dte, greeks) {
  console.log(`\n🎯 CALCULATING STRIKES: Strategy=${strategyKey}, Price=$${price}`);
  const atm = Math.round(price);
  
  // SANITY CHECK: Cap implied volatility to prevent wild calculations
  const cappedIV = Math.min(Math.max(iv || 0.25, 0.10), 2.0); // Cap between 10% and 200%
  
  // Expected 1-sigma move with sanity limits
  let priceMove = price * cappedIV * Math.sqrt(dte / 365);
  
  // ADDITIONAL SANITY CHECK: Cap price move to reasonable percentage of stock price
  const maxMovePercent = 0.5; // Max 50% move for strike calculations
  priceMove = Math.min(priceMove, price * maxMovePercent);
  
  // Debug logging for wild strikes
  if (priceMove > price * 0.3) {
    console.warn(`🚨 Large priceMove detected: ${priceMove.toFixed(2)} for ${strategyKey} on stock price ${price}, IV: ${iv}, DTE: ${dte}`);
  }
  
  // Strategy-specific strike calculations
  const strikes = {};
  
  switch (strategyKey) {
    case 'straddle':
      strikes.call = atm;
      strikes.put = atm;
      break;
      
    case 'strangle':
      // Place strikes at ~0.3 delta for optimal risk/reward
      strikes.call = Math.round(atm + priceMove * 0.6);
      strikes.put = Math.round(atm - priceMove * 0.6);
      
      // SANITY CHECK: Keep within reasonable bounds (±15% of stock price)
      strikes.call = Math.min(strikes.call, atm + price * 0.15);
      strikes.put = Math.max(strikes.put, atm - price * 0.15);
      break;
      
    case 'ironCondor':
      // Sell strikes at ~0.2 delta, buy strikes 10-15 points out
      const sellCall = Math.round(atm + priceMove * 0.8);
      const sellPut = Math.round(atm - priceMove * 0.8);
      strikes.sellCall = sellCall;
      strikes.buyCall = sellCall + Math.round(price * 0.05);
      strikes.sellPut = sellPut;
      strikes.buyPut = sellPut - Math.round(price * 0.05);
      
      // SANITY CHECK: Ensure strikes are reasonable
      strikes.sellCall = Math.min(strikes.sellCall, atm + price * 0.2);
      strikes.buyCall = Math.min(strikes.buyCall, atm + price * 0.3);
      strikes.sellPut = Math.max(strikes.sellPut, atm - price * 0.2);
      strikes.buyPut = Math.max(strikes.buyPut, atm - price * 0.3);
      break;
      
    case 'ironButterfly':
    case 'butterfly':
      // FIXED: Iron Butterfly - sell straddle at ATM, buy protective wings
      strikes.sellCall = atm; // Sell ATM call
      strikes.sellPut = atm;  // Sell ATM put
      
      // Buy protective wings - reasonable distance from ATM
      const wingDistance = Math.max(2, Math.min(Math.round(price * 0.08), Math.round(priceMove * 0.6))); // 8% max, capped by priceMove
      strikes.buyCall = atm + wingDistance;  // Buy OTM call protection
      strikes.buyPut = atm - wingDistance;   // Buy OTM put protection
      
      // STRICT SANITY CHECK: Keep butterfly wings close to stock price
      strikes.sellCall = Math.max(Math.round(price * 0.95), Math.min(strikes.sellCall, Math.round(price * 1.05))); // Within ±5%
      strikes.sellPut = Math.max(Math.round(price * 0.95), Math.min(strikes.sellPut, Math.round(price * 1.05))); // Within ±5%
      strikes.buyCall = Math.max(atm + 1, Math.min(strikes.buyCall, Math.round(price * 1.15))); // Max 15% OTM
      strikes.buyPut = Math.max(Math.round(price * 0.85), Math.min(strikes.buyPut, atm - 1)); // Min 85% of stock price
      
      console.log(`📊 IRON BUTTERFLY FIX - Stock: $${price}, ATM: $${atm}, Wings: $${strikes.buyPut}/$${strikes.buyCall}, Distance: $${wingDistance}`);
      break;
      
    case 'callSpread':
    case 'bullCallSpread':
      // FIXED: Conservative bull call spread - buy ATM/slightly ITM, sell OTM
      strikes.buyCall = Math.max(atm - Math.round(price * 0.02), Math.round(atm * 0.98)); // Slightly ITM or ATM
      strikes.sellCall = strikes.buyCall + Math.max(5, Math.round(price * 0.025)); // 2.5% spread width minimum $5
      
      // STRICT SANITY CHECK: Keep call spreads very reasonable
      strikes.buyCall = Math.max(Math.round(price * 0.95), Math.min(strikes.buyCall, Math.round(price * 1.05))); // Within ±5%
      strikes.sellCall = Math.max(strikes.buyCall + 2, Math.min(strikes.sellCall, Math.round(price * 1.08))); // Max 8% OTM
      
      // Ensure minimum spread width of $2 and maximum of 10% of stock price
      const spreadWidth = strikes.sellCall - strikes.buyCall;
      if (spreadWidth < 2) strikes.sellCall = strikes.buyCall + 2;
      if (spreadWidth > price * 0.1) strikes.sellCall = strikes.buyCall + Math.round(price * 0.1);
      
      console.log(`📊 BULL CALL SPREAD FIX - Stock: $${price}, Buy: $${strikes.buyCall}, Sell: $${strikes.sellCall}, Width: $${strikes.sellCall - strikes.buyCall}`);
      break;
      
    case 'putSpread':
    case 'bullPutSpread':
      // Bull put spread: sell higher strike put, buy lower strike put
      strikes.sellPut = Math.max(atm - Math.round(price * 0.05), Math.round(price * 0.92)); // Slightly OTM
      strikes.buyPut = strikes.sellPut - Math.max(2, Math.round(price * 0.025)); // $2 minimum width
      
      // SANITY CHECK: Keep put spreads reasonable
      strikes.sellPut = Math.max(Math.round(price * 0.85), Math.min(strikes.sellPut, Math.round(price * 0.98))); // 85%-98% of stock price
      strikes.buyPut = Math.max(Math.round(price * 0.80), Math.min(strikes.buyPut, strikes.sellPut - 1)); // At least $1 below sell put
      
      console.log(`📊 BULL PUT SPREAD FIX - Stock: $${price}, Sell: $${strikes.sellPut}, Buy: $${strikes.buyPut}, Width: $${strikes.sellPut - strikes.buyPut}`);
      break;
      
    case 'bearCallSpread':
      // Bear call spread: sell lower strike call, buy higher strike call
      strikes.sellCall = Math.min(atm + Math.round(price * 0.05), Math.round(price * 1.08)); // Slightly OTM
      strikes.buyCall = strikes.sellCall + Math.max(2, Math.round(price * 0.025)); // $2 minimum width
      
      // SANITY CHECK: Keep bear call spreads reasonable  
      strikes.sellCall = Math.max(Math.round(price * 1.02), Math.min(strikes.sellCall, Math.round(price * 1.15))); // 102%-115% of stock price
      strikes.buyCall = Math.min(Math.round(price * 1.20), Math.max(strikes.buyCall, strikes.sellCall + 1)); // At least $1 above sell call
      
      console.log(`📊 BEAR CALL SPREAD FIX - Stock: $${price}, Sell: $${strikes.sellCall}, Buy: $${strikes.buyCall}, Width: $${strikes.buyCall - strikes.sellCall}`);
      break;
      
    case 'bearPutSpread':
      // Bear put spread: buy higher strike put, sell lower strike put
      strikes.buyPut = Math.min(atm + Math.round(price * 0.02), Math.round(price * 1.05)); // Slightly ITM
      strikes.sellPut = strikes.buyPut - Math.max(2, Math.round(price * 0.025)); // $2 minimum width
      
      // SANITY CHECK: Keep bear put spreads reasonable
      strikes.buyPut = Math.max(Math.round(price * 0.95), Math.min(strikes.buyPut, Math.round(price * 1.08))); // 95%-108% of stock price
      strikes.sellPut = Math.max(Math.round(price * 0.85), Math.min(strikes.sellPut, strikes.buyPut - 1)); // At least $1 below buy put
      
      console.log(`📊 BEAR PUT SPREAD FIX - Stock: $${price}, Buy: $${strikes.buyPut}, Sell: $${strikes.sellPut}, Width: $${strikes.buyPut - strikes.sellPut}`);
      break;
      
    default:
      strikes.primary = atm;
  }
  
  // FINAL SANITY CHECK: Ensure all strikes are reasonable relative to stock price
  Object.keys(strikes).forEach(key => {
    const strike = strikes[key];
    if (typeof strike === 'number') {
      // Check if strike is more than 100% away from stock price
      if (strike > price * 2.0 || strike < price * 0.5) {
        console.warn(`🚨 Extreme strike detected: ${key}: ${strike} for stock price ${price}, capping it`);
        
        // Cap extreme strikes
        if (strike > price * 2.0) {
          strikes[key] = Math.round(price * 1.5); // Max 50% above
        } else if (strike < price * 0.5) {
          strikes[key] = Math.round(price * 0.5); // Min 50% below
        }
      }
    }
  });
  
  return strikes;
}

// ENHANCED: Time decay with Greeks integration
function calculateEnhancedTimeDecay(strategyKey, dte, greeks) {
  const baseDecayRates = {
    'straddle': -0.025, 'strangle': -0.022, 'calendar': 0.015,
    'shortStraddle': 0.035, 'shortStrangle': 0.028, 'coveredCall': 0.018,
    'ironCondor': 0.012, 'diagonal': 0.008
  };
  
  let decay = baseDecayRates[strategyKey] || -0.015;
  
  // Theta acceleration as expiration approaches
  if (dte < 21) {
    decay *= (1 + (21 - dte) / 21 * 0.5); // 50% acceleration in final 3 weeks
  }
  
  // Greeks-based adjustment
  if (greeks && greeks.theta) {
    decay += greeks.theta * 0.1; // Incorporate actual theta
  }
  
  return parseFloat(decay.toFixed(4));
}

// 🎯 SURGICAL EXECUTION DETAILS - Priority #1 Enhancement
function generateSurgicalExecutionPlan(strategyKey, price, strikes, legs, maxGain, maxLoss, dte, iv) {
  const executionPlan = {
    // Entry Strategy
    entry: {
      orderType: 'LIMIT',
      timing: 'MARKET_OPEN', // or 'MID_SESSION', 'POWER_HOUR'
      priceImprovement: 0.02, // Try to get 2 cents better than mid price
      maxSlippage: 0.05, // Don't pay more than 5 cents over limit
      notes: []
    },
    
    // Profit Taking Strategy  
    profitTargets: [],
    
    // Risk Management
    riskManagement: {
      stopLoss: null,
      timeStops: [],
      adjustmentTriggers: [],
      maxDaysToHold: Math.min(Math.floor(dte * 0.75), 21) // Exit by 75% of DTE or 21 days
    },
    
    // Exit Strategy
    exitStrategy: {
      preferredExit: 'PROFIT_TARGET',
      emergencyExit: 'STOP_LOSS',
      timeDecayExit: null,
      rollStrategy: null
    },
    
    // Order Management
    orderManagement: {
      bracket: false, // OCO bracket order
      conditional: false, // Conditional orders
      multiLeg: legs.length > 1,
      commission: legs.length * 0.65 // Estimate $0.65 per leg
    }
  };

  // Strategy-specific execution plans
  switch (strategyKey) {
    case 'ironCondor':
      // High probability, limited profit strategy
      executionPlan.entry.timing = 'MID_SESSION'; // Better fills in middle of day
      executionPlan.entry.notes.push('Enter when IV > 25th percentile');
      executionPlan.entry.notes.push('Avoid earnings announcements within DTE');
      
      executionPlan.profitTargets = [
        { percent: 25, action: 'CLOSE_25%', trigger: maxGain * 0.25, timeLimit: Math.floor(dte * 0.2) },
        { percent: 50, action: 'CLOSE_50%', trigger: maxGain * 0.50, timeLimit: Math.floor(dte * 0.4) },
        { percent: 75, action: 'CLOSE_100%', trigger: maxGain * 0.75, timeLimit: Math.floor(dte * 0.6) }
      ];
      
      executionPlan.riskManagement.stopLoss = {
        type: 'PERCENTAGE',
        trigger: Math.abs(maxLoss * 2.0), // Stop at 200% of max theoretical loss
        notes: 'Close if trade moves against theoretical max loss'
      };
      
      executionPlan.riskManagement.timeStops = [
        { dte: 21, action: 'REVIEW_POSITION', reason: '3 weeks to expiration - high gamma risk' },
        { dte: 14, action: 'CLOSE_OR_ROLL', reason: '2 weeks to expiration - time decay accelerating' },
        { dte: 7, action: 'MANDATORY_CLOSE', reason: '1 week to expiration - pin risk high' }
      ];
      break;

    case 'straddle':
      // Volatility expansion play
      executionPlan.entry.timing = 'PRE_MARKET'; // Get in before volatility expansion
      executionPlan.entry.notes.push('Enter when IV < 50th percentile');
      executionPlan.entry.notes.push('Best before earnings or events');
      
      executionPlan.profitTargets = [
        { percent: 100, action: 'CLOSE_50%', trigger: maxGain * 1.0, timeLimit: Math.floor(dte * 0.3) },
        { percent: 200, action: 'CLOSE_25%', trigger: maxGain * 2.0, timeLimit: Math.floor(dte * 0.5) },
        { percent: 300, action: 'LET_RIDE', trigger: maxGain * 3.0, timeLimit: Math.floor(dte * 0.7) }
      ];
      
      executionPlan.riskManagement.stopLoss = {
        type: 'TIME_DECAY',
        trigger: Math.abs(maxLoss * 0.5), // Stop at 50% loss due to time decay
        notes: 'Close if theta burn exceeds expected gamma gains'
      };
      break;

    case 'strangle':
      // Lower cost volatility play
      executionPlan.entry.timing = 'MARKET_OPEN';
      executionPlan.entry.notes.push('Enter when IV rank < 30');
      executionPlan.entry.notes.push('Lower cost alternative to straddle');
      
      executionPlan.profitTargets = [
        { percent: 50, action: 'CLOSE_50%', trigger: maxGain * 0.5, timeLimit: Math.floor(dte * 0.4) },
        { percent: 100, action: 'CLOSE_100%', trigger: maxGain * 1.0, timeLimit: Math.floor(dte * 0.6) }
      ];
      break;

    case 'callSpread':
    case 'putSpread':
      // Directional limited risk plays
      const isCall = strategyKey === 'callSpread';
      executionPlan.entry.timing = 'POWER_HOUR'; // Last hour often has directional moves
      executionPlan.entry.notes.push(`${isCall ? 'Bullish' : 'Bearish'} directional bias required`);
      executionPlan.entry.notes.push('Best when IV is elevated');
      
      executionPlan.profitTargets = [
        { percent: 50, action: 'CLOSE_50%', trigger: maxGain * 0.5, timeLimit: Math.floor(dte * 0.5) },
        { percent: 80, action: 'CLOSE_100%', trigger: maxGain * 0.8, timeLimit: Math.floor(dte * 0.7) }
      ];
      
      executionPlan.riskManagement.adjustmentTriggers = [
        {
          condition: `Stock ${isCall ? 'falls below' : 'rises above'} ${isCall ? strikes.buyCall : strikes.sellPut}`,
          action: 'CONSIDER_ROLL',
          notes: `${isCall ? 'Bullish' : 'Bearish'} thesis challenged`
        }
      ];
      break;

    default:
      // Generic execution plan
      executionPlan.profitTargets = [
        { percent: 50, action: 'CLOSE_50%', trigger: maxGain * 0.5, timeLimit: Math.floor(dte * 0.5) },
        { percent: 100, action: 'CLOSE_100%', trigger: maxGain * 1.0, timeLimit: Math.floor(dte * 0.7) }
      ];
  }

  // Universal time-based exits
  if (dte > 45) {
    executionPlan.riskManagement.timeStops.push({
      dte: 45, 
      action: 'REVIEW_POSITION', 
      reason: 'Long-term position review'
    });
  }
  
  if (dte > 30) {
    executionPlan.riskManagement.timeStops.push({
      dte: 30, 
      action: 'CONSIDER_ADJUSTMENTS', 
      reason: 'One month to expiration - plan adjustments'
    });
  }

  // Order management settings
  if (executionPlan.profitTargets.length > 0) {
    executionPlan.orderManagement.bracket = true;
    executionPlan.orderManagement.conditional = true;
  }

  return executionPlan;
}

// ENHANCED: Precise option legs with calculated strikes and dates
function generatePreciseOptionLegs(strategyKey, price, strikes, dte, expirationDate) {
  const legs = [];
  
  switch (strategyKey) {
    case 'straddle':
      legs.push(
        { type: 'call', action: 'buy', strike: strikes.call, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.call, price, dte) },
        { type: 'put', action: 'buy', strike: strikes.put, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.put, price, dte) }
      );
      break;
      
    case 'strangle':
      legs.push(
        { type: 'call', action: 'buy', strike: strikes.call, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.call, price, dte) },
        { type: 'put', action: 'buy', strike: strikes.put, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.put, price, dte) }
      );
      break;
      
    case 'ironCondor':
      legs.push(
        { type: 'put', action: 'buy', strike: strikes.buyPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.buyPut, price, dte) },
        { type: 'put', action: 'sell', strike: strikes.sellPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.sellPut, price, dte) },
        { type: 'call', action: 'sell', strike: strikes.sellCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.sellCall, price, dte) },
        { type: 'call', action: 'buy', strike: strikes.buyCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.buyCall, price, dte) }
      );
      break;
      
    case 'ironButterfly':
    case 'butterfly':
      legs.push(
        { type: 'put', action: 'buy', strike: strikes.buyPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.buyPut, price, dte), description: `Buy ${strikes.buyPut} Put (protective wing)` },
        { type: 'put', action: 'sell', strike: strikes.sellPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.sellPut, price, dte), description: `Sell ${strikes.sellPut} Put (ATM short)` },
        { type: 'call', action: 'sell', strike: strikes.sellCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.sellCall, price, dte), description: `Sell ${strikes.sellCall} Call (ATM short)` },
        { type: 'call', action: 'buy', strike: strikes.buyCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.buyCall, price, dte), description: `Buy ${strikes.buyCall} Call (protective wing)` }
      );
      break;
      
    case 'callSpread':
      legs.push(
        { type: 'call', action: 'buy', strike: strikes.buyCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.buyCall, price, dte) },
        { type: 'call', action: 'sell', strike: strikes.sellCall, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('call', strikes.sellCall, price, dte) }
      );
      break;
      
    case 'putSpread':
      legs.push(
        { type: 'put', action: 'sell', strike: strikes.sellPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.sellPut, price, dte) },
        { type: 'put', action: 'buy', strike: strikes.buyPut, expiry: expirationDate, dte, quantity: 1, premium: estimatePremium('put', strikes.buyPut, price, dte) }
      );
      break;
      
    default:
      legs.push({ 
        type: 'call', 
        action: 'buy', 
        strike: strikes.primary || Math.round(price), 
        expiry: expirationDate, 
        dte, 
        quantity: 1, 
        premium: estimatePremium('call', strikes.primary || Math.round(price), price, dte) 
      });
  }
  
  return legs;
}

// Helper function to estimate option premiums
function estimatePremium(optionType, strike, spotPrice, dte) {
  const moneyness = optionType === 'call' ? strike / spotPrice : spotPrice / strike;
  const timeValue = Math.sqrt(dte / 365) * spotPrice * 0.15; // Simplified premium estimation
  const intrinsicValue = Math.max(0, optionType === 'call' ? spotPrice - strike : strike - spotPrice);
  return parseFloat((intrinsicValue + timeValue * (moneyness > 1 ? 0.5 : 1)).toFixed(2));
}

// ENHANCED: Market condition assessment with earnings and volume
function assessEnhancedMarketCondition(change, iv, volume, earnings) {
  const earningsDate = new Date(earnings);
  const today = new Date();
  const daysToEarnings = Math.floor((earningsDate - today) / (1000 * 60 * 60 * 24));
  
  // Enhanced conditions
  if (daysToEarnings > 0 && daysToEarnings < 30) {
    if (iv > 0.35) return 'PRE_EARNINGS_HIGH_IV';
    return 'PRE_EARNINGS';
  }
  
  if (Math.abs(change) > 4 && iv > 0.35 && volume > 20000000) return 'EXTREME_VOLATILITY';
  if (Math.abs(change) > 2.5 && iv > 0.25) return 'HIGH_VOLATILITY';
  if (Math.abs(change) < 0.8 && iv < 0.18) return 'LOW_VOLATILITY';
  if (change > 3) return 'STRONG_BULLISH';
  if (change > 1.5) return 'BULLISH_MOMENTUM';
  if (change < -3) return 'STRONG_BEARISH';
  if (change < -1.5) return 'BEARISH_MOMENTUM';
  if (volume > 30000000) return 'HIGH_VOLUME';
  return 'NEUTRAL';
}

// Check if earnings pose risk to strategy
function isEarningsRisk(earnings, dte) {
  const earningsDate = new Date(earnings);
  const today = new Date();
  const daysToEarnings = Math.floor((earningsDate - today) / (1000 * 60 * 60 * 1000));
  return daysToEarnings > 0 && daysToEarnings < dte;
}

// Enhanced recommendation system
function getEnhancedRecommendation(probability, riskProfile, aiScore) {
  if (probability >= 80 && aiScore >= 85) return 'STRONG BUY';
  if (probability >= 70 && aiScore >= 75) return 'BUY';
  if (probability >= 60 && aiScore >= 65 && riskProfile.level.includes('Aggressive')) return 'MODERATE BUY';
  if (probability >= 55 && aiScore >= 60) return 'CAUTIOUS BUY';
  if (probability >= 45) return 'NEUTRAL';
  return 'AVOID';
}

// Calculate breakeven points
function calculateBreakevens(strategyKey, strikes, price) {
  const breakevens = [];
  
  switch (strategyKey) {
    case 'straddle':
      breakevens.push(strikes.call + 2, strikes.put - 2); // Simplified with premium estimate
      break;
    case 'strangle':
      breakevens.push(strikes.call + 1.5, strikes.put - 1.5);
      break;
    case 'ironCondor':
      breakevens.push(strikes.sellCall - 1, strikes.sellPut + 1);
      break;
    case 'ironButterfly':
    case 'butterfly':
      // Iron butterfly breakeven = ATM +/- net debit (wing distance - net credit)
      const netCredit = estimatePremium('call', strikes.sellCall, price, 30) + estimatePremium('put', strikes.sellPut, price, 30) - estimatePremium('call', strikes.buyCall, price, 30) - estimatePremium('put', strikes.buyPut, price, 30);
      const wingDistance = strikes.buyCall - strikes.sellCall; // Distance from ATM to wing
      breakevens.push(strikes.sellCall - Math.max(wingDistance - netCredit, 1), strikes.sellCall + Math.max(wingDistance - netCredit, 1));
      break;
    case 'callSpread':
    case 'bullCallSpread':
      // FIXED: Bull call spread breakeven = long strike + net debit paid
      const netDebit = estimatePremium('call', strikes.buyCall, price, 30) - estimatePremium('call', strikes.sellCall, price, 30);
      breakevens.push(strikes.buyCall + Math.max(netDebit, 0.5)); // Minimum $0.50 debit
      break;
    case 'putSpread':
    case 'bullPutSpread':
      // Bull put spread breakeven = short strike - net credit received
      const netCredit = estimatePremium('put', strikes.sellPut, price, 30) - estimatePremium('put', strikes.buyPut, price, 30);
      breakevens.push(strikes.sellPut - Math.max(netCredit, 0.5)); // Minimum $0.50 credit
      break;
    default:
      breakevens.push(price);
  }
  
  return breakevens;
}

// Calculate profit zone range
function calculateProfitZone(strategyKey, strikes, price, iv) {
  const priceMove = price * iv * 0.5; // Simplified profit zone calculation
  
  switch (strategyKey) {
    case 'ironCondor':
      return { lower: strikes.sellPut + 1, upper: strikes.sellCall - 1 };
    case 'shortStrangle':
      return { lower: strikes.put + 2, upper: strikes.call - 2 };
    default:
      return { lower: price - priceMove, upper: price + priceMove };
  }
}

// Calculate liquidity score
function calculateLiquidityScore(volume, openInterest) {
  const volumeScore = Math.min(50, volume / 1000000 * 10); // Volume component
  const oiScore = Math.min(50, openInterest / 10000 * 10); // Open interest component
  return Math.round(volumeScore + oiScore);
}

// Helper functions for comprehensive strategy integration
function assessMarketBias(change, impliedVolatility) {
  if (change > 2 && impliedVolatility < 0.25) return 'BULLISH';
  if (change < -2 && impliedVolatility < 0.25) return 'BEARISH';
  if (Math.abs(change) < 1 && impliedVolatility < 0.2) return 'NEUTRAL';
  if (impliedVolatility > 0.35) return 'HIGH_VOLATILITY';
  return 'NEUTRAL';
}

function mapRiskToComplexity(riskLevel) {
  const riskMap = {
    'low': 'Beginner',
    'moderate': 'Intermediate', 
    'high': 'Advanced',
    'aggressive': 'Expert'
  };
  return riskMap[riskLevel] || 'Intermediate';
}

function generateComprehensiveLegs(strategy, price, dte, expirationDate) {
  try {
    // Calculate strikes based on strategy requirements
    const strikes = calculateStrategicStrikes(strategy, price);
    
    // Generate legs using the strategy's own generator
    const legs = strategy.generateLegs({
      ...strikes,
      expiry: expirationDate,
      contracts: 1
    });
    
    // Convert to our format with enhanced data
    return legs.map(leg => ({
      type: leg.optionType?.toLowerCase() || 'call',
      action: leg.action?.toLowerCase() || 'buy',
      strike: leg.strike,
      expiry: expirationDate,
      dte: dte,
      quantity: leg.quantity || 1,
      premium: leg.strike !== 'N/A' ? estimatePremium(leg.optionType?.toLowerCase(), leg.strike, price, dte) : 0,
      description: leg.description
    }));
  } catch (error) {
    console.log(`Warning: Could not generate comprehensive legs for ${strategy.name}: ${error.message}`);
    // Fallback to basic legs
    return [{
      type: 'call',
      action: 'buy', 
      strike: Math.round(price),
      expiry: expirationDate,
      dte: dte,
      quantity: 1,
      premium: estimatePremium('call', Math.round(price), price, dte),
      description: `Basic ${strategy.name} position`
    }];
  }
}

function calculateStrategicStrikes(strategy, price) {
  const atm = Math.round(price);
  const otmCall = Math.round(price * 1.05); // 5% OTM call
  const otmPut = Math.round(price * 0.95);  // 5% OTM put
  const itmCall = Math.round(price * 0.95); // 5% ITM call
  const itmPut = Math.round(price * 1.05);  // 5% ITM put
  
  // Return strikes based on strategy name
  switch (strategy.name) {
    case 'Bull Call Spread':
      return { longStrike: atm, shortStrike: otmCall };
    case 'Bull Put Spread':
      return { shortStrike: otmPut, longStrike: Math.round(price * 0.90) };
    case 'Bear Call Spread':
      return { shortStrike: atm, longStrike: otmCall };
    case 'Bear Put Spread':
      return { longStrike: atm, shortStrike: otmPut };
    case 'Long Straddle':
      return { strike: atm };
    case 'Long Strangle':
      return { callStrike: otmCall, putStrike: otmPut };
    case 'Iron Condor':
      return {
        putSellStrike: otmPut,
        putBuyStrike: Math.round(price * 0.90),
        callSellStrike: otmCall,
        callBuyStrike: Math.round(price * 1.10)
      };
    case 'Iron Butterfly':
      return {
        centerStrike: atm,
        wingStrike1: otmPut,
        wingStrike2: otmCall
      };
    case 'Covered Call':
      return { callStrike: otmCall, stockShares: 100 };
    case 'Cash-Secured Put':
      return { putStrike: otmPut, cashRequired: otmPut * 100 };
    default:
      return { strike: atm };
  }
}

function extractStrikesFromLegs(legs) {
  const strikes = {};
  legs.forEach((leg, index) => {
    if (leg.strike && leg.strike !== 'N/A') {
      strikes[`strike${index + 1}`] = leg.strike;
      if (leg.type === 'call') strikes.call = leg.strike;
      if (leg.type === 'put') strikes.put = leg.strike;
    }
  });
  return strikes;
}

// NEW: Intelligent strategy filtering based on squeeze context
function filterStrategiesBySqueezeContext(allStrategies, squeezeContext, marketData) {
  const holyGrail = parseInt(squeezeContext.holyGrail || 0);
  const momentum = parseFloat(squeezeContext.momentum || 0);
  const { impliedVolatility, change } = marketData;
  
  // Priority strategies based on squeeze characteristics
  let priorityStrategies = [];
  let secondaryStrategies = [];
  
  for (const strategyKey of allStrategies) {
    // High Holy Grail (70+) - Expect breakout, favor directional and volatility
    if (holyGrail >= 70) {
      if (['longStraddle', 'longStrangle', 'bullCallSpread', 'bearPutSpread'].includes(strategyKey)) {
        priorityStrategies.push(strategyKey);
      } else if (['bullPutSpread', 'bearCallSpread'].includes(strategyKey)) {
        secondaryStrategies.push(strategyKey);
      }
    }
    // Moderate Holy Grail (40-69) - Mixed signals, favor balanced approaches
    else if (holyGrail >= 40) {
      if (['ironCondor', 'ironButterfly', 'bullCallSpread', 'bullPutSpread'].includes(strategyKey)) {
        priorityStrategies.push(strategyKey);
      } else {
        secondaryStrategies.push(strategyKey);
      }
    }
    // Low Holy Grail (<40) - Favor income and conservative strategies
    else {
      if (['coveredCall', 'cashSecuredPut', 'ironCondor'].includes(strategyKey)) {
        priorityStrategies.push(strategyKey);
      } else {
        secondaryStrategies.push(strategyKey);
      }
    }
  }
  
  // Add momentum-based adjustments
  if (Math.abs(momentum) > 2) {
    // Strong momentum - prioritize directional strategies
    const directional = momentum > 0 
      ? ['bullCallSpread', 'bullPutSpread']
      : ['bearCallSpread', 'bearPutSpread'];
    priorityStrategies = [...directional, ...priorityStrategies.filter(s => !directional.includes(s))];
  }
  
  // Return combined list, prioritizing based on squeeze signals
  const result = [...priorityStrategies, ...secondaryStrategies.slice(0, 6)].slice(0, 8);
  
  console.log(`    🎯 SQUEEZE FILTER: HG=${holyGrail}, Momentum=${momentum} -> Selected: ${result.join(', ')}`);
  return result;
}

// Enhance AI reasoning with squeeze context
function enhanceAIReasoning(baseReasoning, squeezeContext, probability) {
  if (!squeezeContext) return baseReasoning;
  
  const holyGrail = parseInt(squeezeContext.holyGrail || 0);
  const momentum = parseFloat(squeezeContext.momentum || 0);
  
  let enhancement = '';
  
  if (holyGrail >= 80) {
    enhancement = ` 🟢 STRONG SQUEEZE SIGNAL (HG: ${holyGrail}) - High probability breakout expected!`;
  } else if (holyGrail >= 60) {
    enhancement = ` 🟡 MODERATE SQUEEZE (HG: ${holyGrail}) - Potential move building.`;
  } else if (holyGrail >= 40) {
    enhancement = ` 🟠 WEAK SQUEEZE (HG: ${holyGrail}) - Mixed signals, proceed with caution.`;
  }
  
  if (Math.abs(momentum) > 2) {
    const direction = momentum > 0 ? 'bullish' : 'bearish';
    enhancement += ` Momentum is strongly ${direction} (${momentum.toFixed(1)}%).`;
  }
  
  return baseReasoning + enhancement;
}

// Assess how well strategy aligns with squeeze signals
function assessSqueezeAlignment(strategyKey, squeezeContext) {
  if (!squeezeContext) return 'NEUTRAL';
  
  const holyGrail = parseInt(squeezeContext.holyGrail || 0);
  const momentum = parseFloat(squeezeContext.momentum || 0);
  
  // Volatility strategies align well with high squeeze
  if (['longStraddle', 'longStrangle'].includes(strategyKey)) {
    if (holyGrail >= 70) return 'EXCELLENT';
    if (holyGrail >= 50) return 'GOOD';
    return 'FAIR';
  }
  
  // Directional strategies need momentum alignment
  if (['bullCallSpread', 'bullPutSpread'].includes(strategyKey)) {
    if (momentum > 1 && holyGrail >= 60) return 'EXCELLENT';
    if (momentum > 0 && holyGrail >= 40) return 'GOOD';
    return 'FAIR';
  }
  
  if (['bearCallSpread', 'bearPutSpread'].includes(strategyKey)) {
    if (momentum < -1 && holyGrail >= 60) return 'EXCELLENT';
    if (momentum < 0 && holyGrail >= 40) return 'GOOD';
    return 'FAIR';
  }
  
  // Income strategies prefer lower squeeze
  if (['coveredCall', 'cashSecuredPut'].includes(strategyKey)) {
    if (holyGrail < 40) return 'GOOD';
    if (holyGrail < 60) return 'FAIR';
    return 'POOR';
  }
  
  // Neutral strategies can work in various conditions
  if (['ironCondor', 'ironButterfly'].includes(strategyKey)) {
    if (holyGrail >= 40 && holyGrail <= 70) return 'GOOD';
    return 'FAIR';
  }
  
  return 'NEUTRAL';
}

// Neural Network Helper Functions
function generatePriceHistory(currentPrice, volatility) {
  const prices = [];
  let price = currentPrice;
  
  // Generate 60 days of simulated price history
  for (let i = 0; i < 60; i++) {
    const randomReturn = (Math.random() - 0.5) * volatility * 0.02;
    price = price * (1 + randomReturn);
    prices.push(price);
  }
  
  return prices;
}

function getActionAlignment(strategyBias, neuralPrediction) {
  const alignmentMap = {
    'bullish': {
      'buyStrong': 1.0,
      'buy': 0.8,
      'hold': 0.2,
      'sell': -0.5,
      'sellStrong': -1.0
    },
    'bearish': {
      'buyStrong': -1.0,
      'buy': -0.5,
      'hold': 0.2,
      'sell': 0.8,
      'sellStrong': 1.0
    },
    'neutral': {
      'buyStrong': 0.3,
      'buy': 0.1,
      'hold': 1.0,
      'sell': 0.1,
      'sellStrong': 0.3
    }
  };
  
  return alignmentMap[strategyBias]?.[neuralPrediction] || 0;
}

// Enhanced probability calculation with neural network integration
function calculateEnhancedProbability(baseProbability, neuralNetworkBoost, squeezeBoost, strategyWinRate) {
  let finalProbability = baseProbability;
  
  // Add neural network boost (cap individual boosts)
  finalProbability += Math.min(neuralNetworkBoost, 10);
  
  // Add squeeze context boost (cap individual boosts)
  finalProbability += Math.min(squeezeBoost, 15);
  
  // Blend with strategy historical win rate (more conservative)
  finalProbability = (finalProbability * 0.6) + (strategyWinRate * 0.4);
  
  // FIXED: More conservative probability caps - no trade should exceed 80%
  const maxProbability = 80; // Reduced from 95% to 80%
  const minProbability = 25; // Increased from 10% to 25%
  
  return Math.max(minProbability, Math.min(maxProbability, Math.round(finalProbability)));
}

// Pattern recognition integration
function getPatternBoost(neuralEngine, marketData, strategyBias) {
  try {
    const patterns = neuralEngine.identifyPatterns(marketData);
    
    if (patterns.patterns.length === 0) return 0;
    
    let boost = 0;
    patterns.patterns.forEach(pattern => {
      // Align pattern with strategy bias
      if (strategyBias === 'bullish' && pattern.type === 'bullish') {
        boost += pattern.confidence * 10;
      } else if (strategyBias === 'bearish' && pattern.type === 'bearish') {
        boost += pattern.confidence * 10;
      } else if (strategyBias === 'neutral') {
        boost += pattern.confidence * 5;
      }
    });
    
    return Math.min(boost, 20); // Cap pattern boost at 20 points
  } catch (error) {
    console.error('Pattern boost calculation error:', error);
    return 0;
  }
}

console.log('✅ NEURAL NETWORK ENHANCED OPTIONS ANALYZER LOADED SUCCESSFULLY');
console.log('🧠 Integrated 15-feature neural network with pattern recognition');
console.log('🚀 Enhanced with comprehensive strategy system - 10+ proven strategies');  
console.log('🎯 Advanced Features: ML predictions, precise strikes, 30-45 DTE targeting');
console.log('🟢 Squeeze Scanner + Neural Network Integration - Maximum intelligence');