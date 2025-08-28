// ML Learning API - Receives and processes user trade selections for continuous learning
console.log('\n=== ML LEARNING API STARTUP ===');

export default async function handler(req, res) {
  console.log('\n=== ML LEARNING REQUEST ===');
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
    const { type, trade, feedback } = req.body;

    console.log(`🧠 ML Learning - Processing ${type} data...`);

    let learningResult;
    
    switch (type) {
      case 'user_selection':
        learningResult = await processUserSelection(trade);
        break;
      case 'trade_outcome':
        learningResult = await processTradeOutcome(trade, feedback);
        break;
      case 'strategy_feedback':
        learningResult = await processStrategyFeedback(trade, feedback);
        break;
      default:
        throw new Error(`Unknown learning type: ${type}`);
    }

    res.json({
      success: true,
      type,
      learningResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ML Learning error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Process user trade selection for learning
async function processUserSelection(trade) {
  console.log(`🎯 User selected: ${trade.strategyName} for ${trade.symbol}`);
  
  // Simulate ML processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Extract learning patterns
  const patterns = {
    strategy_preference: trade.strategyName,
    probability_threshold: trade.probability,
    risk_tolerance: categorizeRiskTolerance(trade),
    market_condition: trade.marketCondition || 'NEUTRAL',
    squeeze_context: trade.squeezeContext
  };
  
  // Update model weights (simulated)
  const modelUpdate = {
    strategy_weights: updateStrategyWeights(trade.strategyName, trade.probability),
    risk_adjustment: adjustRiskParameters(trade),
    pattern_recognition: enhancePatternRecognition(patterns),
    confidence_boost: trade.probability >= 75 ? 0.05 : -0.02
  };
  
  // Store learning data (in production, this would go to a database)
  const learningEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    type: 'user_selection',
    symbol: trade.symbol,
    strategy: trade.strategyName,
    probability: trade.probability,
    aiScore: trade.aiScore,
    patterns,
    modelUpdate,
    status: 'processed'
  };
  
  console.log(`✅ Learning processed: ${trade.strategyName} pattern enhanced`);
  
  return {
    learningEntry,
    patternsDetected: Object.keys(patterns).length,
    modelAccuracyImprovement: Math.abs(modelUpdate.confidence_boost) * 100,
    strategiesLearned: [trade.strategyName],
    nextRecommendations: generateEnhancedRecommendations(patterns)
  };
}

// Process trade outcome feedback
async function processTradeOutcome(trade, feedback) {
  console.log(`📊 Processing outcome for ${trade.symbol}: ${feedback.outcome}`);
  
  const isWin = feedback.outcome === 'win';
  const actualReturn = feedback.actualReturn || 0;
  const timeToExpiry = feedback.timeToExpiry || 30;
  
  // Calculate prediction accuracy
  const predictionAccuracy = calculatePredictionAccuracy(trade, feedback);
  
  // Update ML models based on outcome
  const modelUpdates = {
    strategy_accuracy: updateStrategyAccuracy(trade.strategyName, isWin),
    probability_calibration: calibrateProbability(trade.probability, isWin),
    return_prediction: adjustReturnPrediction(trade.expectedReturn, actualReturn),
    volatility_model: updateVolatilityModel(trade, feedback)
  };
  
  return {
    outcome: feedback.outcome,
    predictionAccuracy: Math.round(predictionAccuracy * 100),
    modelUpdates,
    learningValue: isWin ? 'positive' : 'negative',
    confidenceAdjustment: calculateConfidenceAdjustment(trade, feedback)
  };
}

// Process strategy feedback
async function processStrategyFeedback(trade, feedback) {
  console.log(`💡 Processing strategy feedback for ${trade.strategyName}`);
  
  const sentiment = feedback.rating >= 4 ? 'positive' : feedback.rating >= 3 ? 'neutral' : 'negative';
  
  return {
    sentiment,
    rating: feedback.rating,
    comments: feedback.comments,
    strategyAdjustment: sentiment === 'positive' ? 'boost' : 'reduce',
    userPreferences: extractUserPreferences(feedback)
  };
}

// Helper functions for ML processing
function updateStrategyWeights(strategyName, probability) {
  const weights = {
    'Long Straddle': 0.85,
    'Long Strangle': 0.80,
    'Iron Condor': 0.75,
    'Bull Call Spread': 0.82,
    'Bull Put Spread': 0.78
  };
  
  // Boost weight based on selection and probability
  const currentWeight = weights[strategyName] || 0.70;
  const adjustment = (probability >= 75) ? 0.05 : 0.02;
  
  return Math.min(0.95, currentWeight + adjustment);
}

function adjustRiskParameters(trade) {
  const riskLevel = trade.maxLoss < -2000 ? 'high' : 
                   trade.maxLoss < -1000 ? 'medium' : 'low';
  
  return {
    risk_level: riskLevel,
    position_sizing_adjustment: trade.riskReward > 2 ? 'increase' : 'maintain',
    kelly_fraction_update: calculateKellyAdjustment(trade)
  };
}

function enhancePatternRecognition(patterns) {
  const detectedPatterns = [];
  
  if (patterns.squeeze_context.holyGrail > 80) {
    detectedPatterns.push('high_conviction_squeeze');
  }
  
  if (patterns.probability_threshold > 75) {
    detectedPatterns.push('high_probability_preference');
  }
  
  if (patterns.market_condition === 'HIGH_VOLATILITY') {
    detectedPatterns.push('volatility_trading');
  }
  
  return detectedPatterns;
}

function generateEnhancedRecommendations(patterns) {
  const recommendations = [];
  
  // Strategy recommendations based on learned patterns
  if (patterns.squeeze_context.holyGrail > 75) {
    recommendations.push({
      type: 'strategy',
      message: 'Consider volatility strategies for high Holy Grail stocks',
      strategies: ['Long Straddle', 'Long Strangle'],
      confidence: 85
    });
  }
  
  if (patterns.probability_threshold > 70) {
    recommendations.push({
      type: 'filtering',
      message: 'Focus on trades with 70%+ probability based on your preferences',
      threshold: 70,
      confidence: 90
    });
  }
  
  return recommendations;
}

function calculatePredictionAccuracy(trade, feedback) {
  const isWin = feedback.outcome === 'win';
  const expectedWinRate = trade.probability / 100;
  
  // Simplified accuracy calculation
  return isWin ? expectedWinRate : (1 - expectedWinRate);
}

function updateStrategyAccuracy(strategyName, isWin) {
  // Simulate strategy accuracy tracking
  const baseAccuracy = 0.65;
  const adjustment = isWin ? 0.02 : -0.01;
  
  return Math.max(0.3, Math.min(0.9, baseAccuracy + adjustment));
}

function calibrateProbability(predictedProb, isWin) {
  const actualOutcome = isWin ? 100 : 0;
  const error = Math.abs(predictedProb - actualOutcome);
  
  return {
    prediction_error: error,
    calibration_adjustment: error > 30 ? 'high' : error > 15 ? 'medium' : 'low',
    confidence_penalty: error > 25 ? 0.1 : 0
  };
}

function adjustReturnPrediction(expectedReturn, actualReturn) {
  const returnAccuracy = 1 - Math.abs(expectedReturn - actualReturn) / Math.abs(expectedReturn);
  
  return {
    return_accuracy: Math.max(0, returnAccuracy),
    prediction_bias: actualReturn > expectedReturn ? 'conservative' : 'aggressive',
    adjustment_factor: Math.abs(actualReturn - expectedReturn) / Math.abs(expectedReturn)
  };
}

function updateVolatilityModel(trade, feedback) {
  return {
    implied_vs_realized: feedback.realizedVolatility / (trade.impliedVolatility || 0.25),
    model_adjustment: 'calibrate_iv_predictions',
    accuracy: Math.random() * 0.2 + 0.7 // 70-90% simulated accuracy
  };
}

function calculateConfidenceAdjustment(trade, feedback) {
  const isWin = feedback.outcome === 'win';
  const probDiff = Math.abs(trade.probability - (isWin ? 100 : 0));
  
  if (probDiff > 30) return 'major_recalibration';
  if (probDiff > 15) return 'moderate_adjustment';
  return 'minor_tuning';
}

function categorizeRiskTolerance(trade) {
  const lossRatio = Math.abs(trade.maxLoss) / trade.positionSize;
  
  if (lossRatio > 0.8) return 'high_risk';
  if (lossRatio > 0.4) return 'moderate_risk';
  return 'low_risk';
}

function calculateKellyAdjustment(trade) {
  // Simplified Kelly Criterion adjustment
  const winRate = trade.probability / 100;
  const avgWin = trade.maxGain;
  const avgLoss = Math.abs(trade.maxLoss);
  
  if (avgLoss === 0) return 0;
  
  const kelly = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
  return Math.max(0, Math.min(0.25, kelly));
}

function extractUserPreferences(feedback) {
  return {
    complexity_preference: feedback.complexityRating || 'intermediate',
    time_horizon: feedback.timeHorizon || 'medium_term',
    risk_appetite: feedback.riskAppetite || 'moderate'
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

console.log('✅ ML Learning API loaded successfully');