// Trade Outcome Tracker - Properly track real trade results for ML learning
// Separates user preferences from actual trade outcomes

export class TradeTracker {
  constructor() {
    this.activeTrades = new Map(); // Tracks ongoing trades
    this.completedTrades = new Map(); // Tracks finished trades
    this.loadFromStorage();
  }

  // Record when user actually enters a trade (not just selects it)
  recordTradeEntry(tradeData) {
    const tradeId = this.generateTradeId(tradeData);
    
    const activeTradeRecord = {
      id: tradeId,
      symbol: tradeData.symbol,
      strategy: tradeData.strategyName,
      entryDate: new Date().toISOString(),
      entryPrice: tradeData.entryPrice,
      strikes: tradeData.strikes,
      expiration: tradeData.expiration,
      dte: tradeData.dte,
      positionSize: tradeData.positionSize,
      maxLoss: tradeData.maxLoss,
      maxGain: tradeData.maxGain,
      
      // ML Context (for later correlation)
      mlContext: {
        squeezeContext: tradeData.squeezeContext,
        marketConditions: tradeData.marketConditions,
        neuralNetworkPrediction: tradeData.neuralNetworkPrediction,
        aiScore: tradeData.aiScore,
        probability: tradeData.probability
      },
      
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.activeTrades.set(tradeId, activeTradeRecord);
    this.saveToStorage();
    
    console.log(`📋 Trade Entry Recorded: ${tradeData.symbol} ${tradeData.strategyName} (ID: ${tradeId})`);
    
    return tradeId;
  }

  // Record trade outcome - this is what actually trains the ML
  recordTradeOutcome(tradeId, outcomeData) {
    const activeTrade = this.activeTrades.get(tradeId);
    
    if (!activeTrade) {
      throw new Error(`Trade ${tradeId} not found in active trades`);
    }

    const completedTrade = {
      ...activeTrade,
      // Outcome Data
      exitDate: new Date().toISOString(),
      exitPrice: outcomeData.exitPrice,
      actualReturn: outcomeData.actualReturn,
      percentReturn: outcomeData.percentReturn,
      daysHeld: this.calculateDaysHeld(activeTrade.entryDate),
      exitReason: outcomeData.exitReason, // 'profit_target', 'stop_loss', 'expiration', 'manual'
      
      // Performance Metrics
      isWinner: outcomeData.percentReturn > 0,
      actualVsPredicted: {
        predictedReturn: activeTrade.maxGain,
        actualReturn: outcomeData.actualReturn,
        accuracy: this.calculatePredictionAccuracy(activeTrade, outcomeData)
      },
      
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    };

    // Move from active to completed
    this.activeTrades.delete(tradeId);
    this.completedTrades.set(tradeId, completedTrade);
    this.saveToStorage();

    console.log(`✅ Trade Outcome Recorded: ${completedTrade.symbol} ${completedTrade.strategy}`);
    console.log(`📊 Result: ${completedTrade.percentReturn > 0 ? 'WIN' : 'LOSS'} (${completedTrade.percentReturn.toFixed(2)}%)`);

    // Return data for ML training
    return this.formatForMLTraining(completedTrade);
  }

  // Get all active trades (for user dashboard)
  getActiveTrades() {
    return Array.from(this.activeTrades.values())
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
  }

  // Get completed trades for analysis
  getCompletedTrades(limit = 50) {
    return Array.from(this.completedTrades.values())
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit);
  }

  // Get trades ready for ML training (completed with outcomes)
  getMLTrainingData() {
    return this.getCompletedTrades()
      .map(trade => this.formatForMLTraining(trade));
  }

  // Calculate prediction accuracy
  calculatePredictionAccuracy(activeTrade, outcome) {
    const predictedWin = activeTrade.mlContext.probability > 50;
    const actualWin = outcome.percentReturn > 0;
    
    if (predictedWin === actualWin) {
      // Correct direction prediction
      const probabilityAccuracy = activeTrade.mlContext.probability / 100;
      const returnAccuracy = 1 - Math.abs(activeTrade.maxGain - outcome.actualReturn) / activeTrade.maxGain;
      
      return (probabilityAccuracy + Math.max(0, returnAccuracy)) / 2;
    } else {
      // Wrong direction - low accuracy
      return Math.max(0, (50 - activeTrade.mlContext.probability) / 100);
    }
  }

  // Format completed trade for ML training
  formatForMLTraining(completedTrade) {
    return {
      symbol: completedTrade.symbol,
      strategy: completedTrade.strategy,
      
      // Input features (what ML saw when making prediction)
      marketData: completedTrade.mlContext.marketConditions,
      squeezeContext: completedTrade.mlContext.squeezeContext,
      
      // Actual outcome (what ML should learn from)
      result: {
        percentReturn: completedTrade.percentReturn,
        actualReturn: completedTrade.actualReturn,
        isWinner: completedTrade.isWinner,
        daysHeld: completedTrade.daysHeld,
        exitReason: completedTrade.exitReason
      },
      
      // Prediction accuracy for model calibration
      predictionAccuracy: completedTrade.actualVsPredicted.accuracy,
      
      timestamp: completedTrade.completedAt
    };
  }

  // Performance analytics
  getPerformanceStats() {
    const completed = this.getCompletedTrades();
    
    if (completed.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgReturn: 0,
        totalReturn: 0,
        avgDaysHeld: 0,
        bestTrade: null,
        worstTrade: null
      };
    }

    const winners = completed.filter(t => t.isWinner);
    const totalReturn = completed.reduce((sum, t) => sum + t.percentReturn, 0);
    
    return {
      totalTrades: completed.length,
      winRate: (winners.length / completed.length) * 100,
      avgReturn: totalReturn / completed.length,
      totalReturn: totalReturn,
      avgDaysHeld: completed.reduce((sum, t) => sum + t.daysHeld, 0) / completed.length,
      bestTrade: completed.reduce((best, t) => 
        !best || t.percentReturn > best.percentReturn ? t : best, null),
      worstTrade: completed.reduce((worst, t) => 
        !worst || t.percentReturn < worst.percentReturn ? t : worst, null),
      
      // ML Accuracy Stats
      avgPredictionAccuracy: completed.reduce((sum, t) => 
        sum + (t.actualVsPredicted?.accuracy || 0), 0) / completed.length
    };
  }

  // Strategy-specific performance
  getStrategyPerformance() {
    const completed = this.getCompletedTrades();
    const strategyStats = {};

    completed.forEach(trade => {
      if (!strategyStats[trade.strategy]) {
        strategyStats[trade.strategy] = {
          trades: [],
          totalTrades: 0,
          winners: 0,
          totalReturn: 0
        };
      }

      const stats = strategyStats[trade.strategy];
      stats.trades.push(trade);
      stats.totalTrades++;
      if (trade.isWinner) stats.winners++;
      stats.totalReturn += trade.percentReturn;
    });

    // Calculate performance metrics for each strategy
    Object.keys(strategyStats).forEach(strategy => {
      const stats = strategyStats[strategy];
      stats.winRate = (stats.winners / stats.totalTrades) * 100;
      stats.avgReturn = stats.totalReturn / stats.totalTrades;
      stats.profitFactor = this.calculateProfitFactor(stats.trades);
    });

    return strategyStats;
  }

  calculateProfitFactor(trades) {
    const winners = trades.filter(t => t.isWinner);
    const losers = trades.filter(t => !t.isWinner);
    
    const grossProfit = winners.reduce((sum, t) => sum + Math.abs(t.percentReturn), 0);
    const grossLoss = losers.reduce((sum, t) => sum + Math.abs(t.percentReturn), 0);
    
    return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  }

  calculateDaysHeld(entryDate) {
    const entry = new Date(entryDate);
    const now = new Date();
    return Math.floor((now - entry) / (1000 * 60 * 60 * 24));
  }

  generateTradeId(tradeData) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${tradeData.symbol}_${tradeData.strategy}_${timestamp}_${random}`.replace(/\s+/g, '_');
  }

  // Persistence
  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = {
          activeTrades: Array.from(this.activeTrades.entries()),
          completedTrades: Array.from(this.completedTrades.entries())
        };
        localStorage.setItem('tradeTracker', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving trade tracker:', error);
    }
  }

  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('tradeTracker');
        if (saved) {
          const data = JSON.parse(saved);
          this.activeTrades = new Map(data.activeTrades || []);
          this.completedTrades = new Map(data.completedTrades || []);
          
          console.log(`📊 Trade Tracker Loaded: ${this.activeTrades.size} active, ${this.completedTrades.size} completed`);
        }
      }
    } catch (error) {
      console.error('Error loading trade tracker:', error);
    }
  }

  // Clear all data (for testing)
  clearAll() {
    this.activeTrades.clear();
    this.completedTrades.clear();
    this.saveToStorage();
    console.log('🗑️ Trade tracker cleared');
  }
}

export default TradeTracker;