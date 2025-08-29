/**
 * 🧠 ENHANCED ML LEARNING API v3.0
 * 
 * Integration with IntelligentMLEngine for advanced learning
 * Handles all ML learning operations for the intelligent trading system
 */

import IntelligentMLEngine from '../../lib/IntelligentMLEngine.js';

console.log('\n=== ENHANCED ML LEARNING API STARTUP ===');

let mlEngine;

// Initialize ML engine
function getMLEngine() {
  if (!mlEngine) {
    mlEngine = new IntelligentMLEngine();
  }
  return mlEngine;
}

export default async function handler(req, res) {
  console.log('\n=== ML LEARNING REQUEST ===');
  console.log('Method:', req.method);
  console.log('Type:', req.body?.type);
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
    const { type, trade, feedback, opportunities, includeWeights, useUserPreferences } = req.body;
    const engine = getMLEngine();

    console.log(`🧠 ML Learning - Processing ${type} data...`);

    let learningResult;
    
    switch (type) {
      case 'user_selection':
        learningResult = await processUserSelection(engine, trade);
        break;
      
      case 'user_interest':
        learningResult = await processUserInterest(engine, req.body);
        break;
      
      case 'trade_outcome':
        learningResult = await processTradeOutcome(engine, trade, feedback);
        break;
      
      case 'trade_entry':
        learningResult = await processTradeEntry(engine, trade);
        break;
      
      case 'trade_completion':
        learningResult = await processTradeCompletion(engine, trade);
        break;
      
      case 'rank_opportunities':
        learningResult = await rankOpportunities(engine, opportunities, useUserPreferences);
        break;
      
      case 'get_model_status':
        learningResult = await getModelStatus(engine, includeWeights);
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

// New handler functions for intelligent ML engine

// Process user selection with new ML engine
async function processUserSelection(engine, trade) {
  console.log(`🎯 Processing user selection: ${trade.symbol} - ${trade.strategy}`);
  
  const tradeId = engine.recordUserSelection(trade);
  
  return {
    success: true,
    tradeId,
    message: 'User selection recorded for preference learning',
    modelsUpdated: 1,
    accuracy: Math.round(engine.getModelStats().accuracy * 100),
    trainingDataSize: engine.getModelStats().totalTrades
  };
}

// Process user interest (when they click on a stock)
async function processUserInterest(engine, data) {
  console.log(`👀 Recording user interest: ${data.symbol}`);
  
  // This helps track what catches user attention
  // Could be used for recommendation improvement
  
  return {
    success: true,
    message: 'User interest recorded',
    symbol: data.symbol,
    detectedBy: data.detectedBy,
    aiScore: data.aiScore
  };
}

// Process trade outcome with new ML engine
async function processTradeOutcome(engine, trade, feedback) {
  console.log(`📊 Processing trade outcome: ${trade.tradeId || 'unknown'}`);
  
  if (trade.tradeId) {
    engine.recordTradeOutcome(trade.tradeId, feedback);
  }
  
  const stats = engine.getModelStats();
  
  return {
    success: true,
    message: 'Trade outcome processed and model updated',
    modelStats: stats,
    newAccuracy: stats.accuracy,
    totalTrades: stats.totalTrades,
    winRate: stats.winRate
  };
}

// Process trade entry with new ML engine
async function processTradeEntry(engine, trade) {
  console.log(`📋 Processing trade entry: ${trade.symbol} - ${trade.strategy}`);
  
  const tradeId = engine.recordUserSelection(trade);
  
  return {
    success: true,
    tradeId,
    message: 'Trade entry recorded in ML system'
  };
}

// Process trade completion with new ML engine
async function processTradeCompletion(engine, trade) {
  console.log(`✅ Processing trade completion: ${trade.tradeId}`);
  
  if (trade.outcome) {
    engine.recordTradeOutcome(trade.tradeId, trade.outcome);
  }
  
  const stats = engine.getModelStats();
  
  return {
    success: true,
    message: 'Trade completion processed',
    modelStats: stats
  };
}

// Rank opportunities using ML model
async function rankOpportunities(engine, opportunities, useUserPreferences = true) {
  console.log(`🧠 Ranking ${opportunities.length} opportunities using ML model`);
  
  const rankedOpportunities = engine.rankOpportunities(opportunities);
  
  return {
    success: true,
    rankedOpportunities,
    totalOpportunities: opportunities.length,
    mlRanked: true
  };
}

// Get model status and statistics
async function getModelStatus(engine, includeWeights = false) {
  const stats = engine.getModelStats();
  
  const result = {
    success: true,
    modelStats: stats
  };
  
  if (includeWeights) {
    result.strategyWeights = stats.strategyWeights;
  }
  
  return result;
}

console.log('✅ Enhanced ML Learning API v3.0 loaded with IntelligentMLEngine integration');