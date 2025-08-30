/**
 * 🤖 ML FEEDBACK API
 * 
 * Handles ML feedback for options strategy selections
 * Integrates with IntelligentMLEngine for learning
 */

import IntelligentMLEngine from '../../lib/IntelligentMLEngine';

// Initialize ML engine
let mlEngine;
try {
  mlEngine = new IntelligentMLEngine();
  console.log('✅ ML Engine initialized for strategy feedback');
} catch (error) {
  console.error('❌ Failed to initialize ML Engine:', error);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, userId, symbol, strategy, confidence, reasoning, outcome, timestamp } = req.body;

  try {
    console.log(`🤖 ML Feedback API - Action: ${action}`);

    switch (action) {
      case 'recordStrategySelection':
        if (!mlEngine) {
          throw new Error('ML Engine not initialized');
        }

        // Record the user's strategy selection for learning
        const selectionResult = await mlEngine.recordUserSelection({
          userId: userId || 'anonymous',
          symbol: symbol,
          strategy: strategy,
          confidence: confidence || 0.5,
          reasoning: reasoning,
          timestamp: timestamp || new Date().toISOString(),
          source: 'options_strategy_engine'
        });

        console.log('📊 Strategy selection recorded:', {
          symbol,
          strategy,
          confidence,
          result: selectionResult
        });

        return res.status(200).json({
          success: true,
          message: 'Strategy selection recorded successfully',
          data: selectionResult
        });

      case 'recordStrategyOutcome':
        if (!mlEngine) {
          throw new Error('ML Engine not initialized');
        }

        // Record the actual outcome of a strategy for learning
        const outcomeResult = await mlEngine.recordTradeOutcome({
          userId: userId || 'anonymous',
          symbol: symbol,
          strategy: strategy,
          outcome: outcome, // 'win', 'loss', 'breakeven'
          actualReturn: req.body.actualReturn || 0,
          expectedReturn: req.body.expectedReturn || 0,
          duration: req.body.duration || 0,
          timestamp: timestamp || new Date().toISOString(),
          source: 'options_strategy_engine'
        });

        console.log('📈 Strategy outcome recorded:', {
          symbol,
          strategy,
          outcome,
          result: outcomeResult
        });

        return res.status(200).json({
          success: true,
          message: 'Strategy outcome recorded successfully',
          data: outcomeResult
        });

      case 'getStrategyPerformance':
        if (!mlEngine) {
          throw new Error('ML Engine not initialized');
        }

        // Get performance metrics for strategies
        const performance = await mlEngine.getStrategyPerformance({
          userId: userId || 'anonymous',
          symbol: symbol,
          strategy: strategy,
          timeframe: req.body.timeframe || 'all'
        });

        console.log('📊 Strategy performance retrieved:', performance);

        return res.status(200).json({
          success: true,
          data: performance
        });

      case 'updateStrategyWeights':
        if (!mlEngine) {
          throw new Error('ML Engine not initialized');
        }

        // Update ML weights based on strategy performance
        const weights = await mlEngine.updateStrategyWeights({
          userId: userId || 'anonymous',
          performanceData: req.body.performanceData || {},
          learningRate: req.body.learningRate || 0.1
        });

        console.log('⚖️ Strategy weights updated:', weights);

        return res.status(200).json({
          success: true,
          message: 'Strategy weights updated successfully',
          data: weights
        });

      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: [
            'recordStrategySelection',
            'recordStrategyOutcome', 
            'getStrategyPerformance',
            'updateStrategyWeights'
          ]
        });
    }

  } catch (error) {
    console.error('❌ ML Feedback API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}