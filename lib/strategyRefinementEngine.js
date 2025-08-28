// 🎯 PRIORITY #4: Real-time Strategy Refinement Engine
// Adaptive ML feedback system that learns and optimizes from trade outcomes

import fs from 'fs/promises';
import path from 'path';

export class StrategyRefinementEngine {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'strategy-refinement-data.json');
    this.performanceMetrics = {
      strategyPerformance: {},
      parameterOptimization: {},
      marketRegimeEffectiveness: {},
      mlModelAccuracy: {},
      thresholdOptimization: {
        squeeze: { current: 50, optimal: 50, performance: [] },
        holyGrail: { current: 40, optimal: 40, performance: [] },
        aiScore: { current: 60, optimal: 60, performance: [] },
        probability: { current: 60, optimal: 60, performance: [] }
      }
    };
    
    this.refinementRules = {
      minSampleSize: 10, // Minimum trades before adjusting parameters
      confidenceThreshold: 0.75, // Statistical confidence for changes
      maxAdjustmentPercent: 0.20, // Maximum 20% parameter adjustment per iteration
      learningRate: 0.1, // How quickly to adapt to new data
      performanceLookback: 50 // Number of recent trades to analyze
    };

    this.loadPerformanceData();
  }

  // Load historical performance data
  async loadPerformanceData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);
      this.performanceMetrics = { ...this.performanceMetrics, ...parsed };
      console.log('📊 Strategy refinement data loaded successfully');
    } catch (error) {
      console.log('📊 No existing strategy refinement data, starting fresh');
      await this.savePerformanceData();
    }
  }

  // Save performance data to persistent storage
  async savePerformanceData() {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(this.performanceMetrics, null, 2));
    } catch (error) {
      console.error('❌ Failed to save strategy refinement data:', error);
    }
  }

  // Record trade outcome for strategy learning
  async recordTradeOutcome(tradeData) {
    console.log('📈 Recording trade outcome for strategy refinement...');
    
    const {
      symbol,
      strategy,
      entryPrice,
      exitPrice,
      outcome, // 'win', 'loss', 'breakeven'
      actualReturn,
      expectedReturn,
      maxLoss,
      daysHeld,
      exitReason, // 'profit_target', 'stop_loss', 'time_decay', 'manual'
      originalParameters, // squeeze, holyGrail, aiScore, etc.
      marketConditions
    } = tradeData;

    // Update strategy performance
    if (!this.performanceMetrics.strategyPerformance[strategy]) {
      this.performanceMetrics.strategyPerformance[strategy] = {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        totalReturn: 0,
        avgDaysHeld: 0,
        recentPerformance: [],
        parameterEffectiveness: {}
      };
    }

    const strategyMetrics = this.performanceMetrics.strategyPerformance[strategy];
    strategyMetrics.totalTrades++;
    strategyMetrics.totalReturn += actualReturn;
    
    if (outcome === 'win') {
      strategyMetrics.wins++;
    } else if (outcome === 'loss') {
      strategyMetrics.losses++;
    }

    // Update running average of days held
    strategyMetrics.avgDaysHeld = ((strategyMetrics.avgDaysHeld * (strategyMetrics.totalTrades - 1)) + daysHeld) / strategyMetrics.totalTrades;

    // Add to recent performance for trend analysis
    strategyMetrics.recentPerformance.push({
      timestamp: new Date().toISOString(),
      outcome,
      actualReturn,
      expectedReturn,
      accuracy: Math.abs((actualReturn - expectedReturn) / expectedReturn),
      originalParameters,
      marketConditions
    });

    // Keep only recent trades for analysis
    if (strategyMetrics.recentPerformance.length > this.refinementRules.performanceLookback) {
      strategyMetrics.recentPerformance = strategyMetrics.recentPerformance.slice(-this.refinementRules.performanceLookback);
    }

    // Record parameter effectiveness
    this.recordParameterEffectiveness(originalParameters, outcome, actualReturn);

    // Save updated data
    await this.savePerformanceData();

    console.log(`✅ Trade outcome recorded: ${strategy} - ${outcome} (${actualReturn.toFixed(2)}%)`);
  }

  // Record how well specific parameter values performed
  recordParameterEffectiveness(parameters, outcome, actualReturn) {
    const parameterKeys = ['squeeze', 'holyGrail', 'aiScore', 'probability'];
    
    parameterKeys.forEach(key => {
      if (parameters[key] !== undefined) {
        const threshold = this.performanceMetrics.thresholdOptimization[key];
        if (threshold) {
          threshold.performance.push({
            value: parameters[key],
            outcome,
            actualReturn,
            timestamp: new Date().toISOString()
          });

          // Keep only recent performance data
          if (threshold.performance.length > this.refinementRules.performanceLookback) {
            threshold.performance = threshold.performance.slice(-this.refinementRules.performanceLookback);
          }
        }
      }
    });
  }

  // Generate optimized parameters based on historical performance
  async getOptimizedParameters(currentParameters = {}) {
    console.log('🧠 Calculating optimized parameters based on performance data...');
    
    const optimized = { ...currentParameters };
    
    // Optimize each threshold parameter
    for (const [paramName, paramData] of Object.entries(this.performanceMetrics.thresholdOptimization)) {
      if (paramData.performance.length >= this.refinementRules.minSampleSize) {
        const optimalValue = this.calculateOptimalThreshold(paramData.performance);
        
        if (optimalValue !== null) {
          // Apply learning rate to gradually adjust parameters
          const currentValue = paramData.current;
          const adjustment = (optimalValue - currentValue) * this.refinementRules.learningRate;
          const maxChange = currentValue * this.refinementRules.maxAdjustmentPercent;
          
          // Limit adjustment size
          const limitedAdjustment = Math.max(-maxChange, Math.min(maxChange, adjustment));
          const newValue = Math.round(currentValue + limitedAdjustment);
          
          paramData.optimal = newValue;
          optimized[paramName] = newValue;
          
          console.log(`📊 ${paramName}: ${currentValue} → ${newValue} (optimal: ${optimalValue.toFixed(1)})`);
        }
      }
    }

    return optimized;
  }

  // Calculate optimal threshold value based on performance data
  calculateOptimalThreshold(performanceData) {
    if (performanceData.length < this.refinementRules.minSampleSize) return null;

    // Group performance by threshold value ranges
    const valueRanges = {};
    const rangeSize = 5; // Group values into ranges of 5

    performanceData.forEach(record => {
      const range = Math.floor(record.value / rangeSize) * rangeSize;
      if (!valueRanges[range]) {
        valueRanges[range] = { wins: 0, total: 0, totalReturn: 0 };
      }
      
      valueRanges[range].total++;
      valueRanges[range].totalReturn += record.actualReturn;
      if (record.outcome === 'win') {
        valueRanges[range].wins++;
      }
    });

    // Find range with best risk-adjusted performance
    let bestRange = null;
    let bestScore = -Infinity;

    for (const [range, data] of Object.entries(valueRanges)) {
      if (data.total >= 3) { // Minimum sample size per range
        const winRate = data.wins / data.total;
        const avgReturn = data.totalReturn / data.total;
        
        // Risk-adjusted score: combine win rate and average return
        const score = (winRate * 0.6) + ((avgReturn + 100) / 200 * 0.4);
        
        if (score > bestScore) {
          bestScore = score;
          bestRange = parseInt(range);
        }
      }
    }

    return bestRange !== null ? bestRange + (rangeSize / 2) : null;
  }

  // Get strategy recommendations based on recent performance
  getStrategyRecommendations() {
    const recommendations = [];

    for (const [strategy, metrics] of Object.entries(this.performanceMetrics.strategyPerformance)) {
      if (metrics.totalTrades >= this.refinementRules.minSampleSize) {
        const winRate = metrics.wins / metrics.totalTrades;
        const avgReturn = metrics.totalReturn / metrics.totalTrades;
        const recentWinRate = this.calculateRecentWinRate(metrics.recentPerformance);
        
        // Generate recommendation
        let recommendation = 'MAINTAIN';
        let confidence = 0.5;
        
        if (recentWinRate > winRate + 0.1 && recentWinRate > 0.6) {
          recommendation = 'INCREASE_WEIGHT';
          confidence = Math.min(0.9, recentWinRate);
        } else if (recentWinRate < winRate - 0.1 && recentWinRate < 0.4) {
          recommendation = 'DECREASE_WEIGHT';
          confidence = Math.min(0.9, 1 - recentWinRate);
        }

        recommendations.push({
          strategy,
          recommendation,
          confidence,
          metrics: {
            totalTrades: metrics.totalTrades,
            overallWinRate: winRate,
            recentWinRate,
            avgReturn: avgReturn,
            avgDaysHeld: metrics.avgDaysHeld
          }
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Calculate win rate for recent trades
  calculateRecentWinRate(recentPerformance) {
    if (recentPerformance.length === 0) return 0;
    
    const recentTrades = recentPerformance.slice(-20); // Last 20 trades
    const wins = recentTrades.filter(trade => trade.outcome === 'win').length;
    
    return wins / recentTrades.length;
  }

  // Get market regime effectiveness analysis
  getMarketRegimeAnalysis() {
    const regimeAnalysis = {};
    
    for (const [strategy, metrics] of Object.entries(this.performanceMetrics.strategyPerformance)) {
      metrics.recentPerformance.forEach(trade => {
        const regime = trade.marketConditions?.regime || 'unknown';
        
        if (!regimeAnalysis[regime]) {
          regimeAnalysis[regime] = {};
        }
        if (!regimeAnalysis[regime][strategy]) {
          regimeAnalysis[regime][strategy] = { wins: 0, total: 0 };
        }
        
        regimeAnalysis[regime][strategy].total++;
        if (trade.outcome === 'win') {
          regimeAnalysis[regime][strategy].wins++;
        }
      });
    }

    // Calculate win rates by regime
    const regimeRecommendations = {};
    for (const [regime, strategies] of Object.entries(regimeAnalysis)) {
      regimeRecommendations[regime] = Object.entries(strategies)
        .map(([strategy, data]) => ({
          strategy,
          winRate: data.wins / data.total,
          sampleSize: data.total
        }))
        .filter(item => item.sampleSize >= 5)
        .sort((a, b) => b.winRate - a.winRate);
    }

    return regimeRecommendations;
  }

  // Generate comprehensive refinement report
  generateRefinementReport() {
    return {
      timestamp: new Date().toISOString(),
      optimizedParameters: this.performanceMetrics.thresholdOptimization,
      strategyRecommendations: this.getStrategyRecommendations(),
      marketRegimeAnalysis: this.getMarketRegimeAnalysis(),
      totalTrades: Object.values(this.performanceMetrics.strategyPerformance)
        .reduce((sum, metrics) => sum + metrics.totalTrades, 0),
      overallWinRate: this.calculateOverallWinRate(),
      dataQuality: this.assessDataQuality()
    };
  }

  // Calculate overall win rate across all strategies
  calculateOverallWinRate() {
    let totalWins = 0;
    let totalTrades = 0;

    for (const metrics of Object.values(this.performanceMetrics.strategyPerformance)) {
      totalWins += metrics.wins;
      totalTrades += metrics.totalTrades;
    }

    return totalTrades > 0 ? totalWins / totalTrades : 0;
  }

  // Assess quality and sufficiency of learning data
  assessDataQuality() {
    const totalTrades = Object.values(this.performenceMetrics.strategyPerformance)
      .reduce((sum, metrics) => sum + metrics.totalTrades, 0);

    return {
      totalTrades,
      sufficientData: totalTrades >= this.refinementRules.minSampleSize * 5,
      strategyCoverage: Object.keys(this.performanceMetrics.strategyPerformance).length,
      parameterSamples: Object.values(this.performanceMetrics.thresholdOptimization)
        .map(param => param.performance.length),
      confidenceLevel: totalTrades >= 50 ? 'high' : totalTrades >= 20 ? 'medium' : 'low'
    };
  }

  // Apply refinements to trading pipeline configuration
  async applyRefinements(currentConfig) {
    const optimizedParams = await this.getOptimizedParameters(currentConfig);
    const strategyRecs = this.getStrategyRecommendations();
    
    return {
      ...currentConfig,
      ...optimizedParams,
      strategyWeights: this.calculateOptimalStrategyWeights(strategyRecs),
      universeSize: this.recommendUniverseSize(),
      refinementMetadata: {
        appliedAt: new Date().toISOString(),
        confidence: this.assessDataQuality().confidenceLevel,
        totalTrades: Object.values(this.performanceMetrics.strategyPerformance)
          .reduce((sum, metrics) => sum + metrics.totalTrades, 0)
      }
    };
  }

  // Calculate optimal strategy weights based on performance
  calculateOptimalStrategyWeights(recommendations) {
    const weights = {};
    
    recommendations.forEach(rec => {
      if (rec.recommendation === 'INCREASE_WEIGHT') {
        weights[rec.strategy] = Math.min(1.5, 1 + rec.confidence * 0.5);
      } else if (rec.recommendation === 'DECREASE_WEIGHT') {
        weights[rec.strategy] = Math.max(0.5, 1 - rec.confidence * 0.5);
      } else {
        weights[rec.strategy] = 1.0;
      }
    });

    return weights;
  }

  // Recommend universe size based on performance patterns
  recommendUniverseSize() {
    const totalTrades = Object.values(this.performanceMetrics.strategyPerformance)
      .reduce((sum, metrics) => sum + metrics.totalTrades, 0);

    if (totalTrades < 20) {
      return 'balanced'; // Start with balanced approach
    } else if (this.calculateOverallWinRate() > 0.65) {
      return 'aggressive'; // Expand universe if performing well
    } else if (this.calculateOverallWinRate() < 0.45) {
      return 'conservative'; // Contract universe if struggling
    } else {
      return 'balanced';
    }
  }
}

export default StrategyRefinementEngine;