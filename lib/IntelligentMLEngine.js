/**
 * 🧠 INTELLIGENT ML ENGINE v3.0
 * 
 * Advanced machine learning system that learns from:
 * 1. User trade selections (preference learning)
 * 2. Trade outcomes (success/failure patterns)
 * 3. Market conditions at time of trades
 * 4. Strategy effectiveness over time
 * 
 * This engine continuously improves recommendation accuracy
 * by analyzing what types of setups lead to profitable trades
 */

import fs from 'fs';
import path from 'path';

class IntelligentMLEngine {
  constructor() {
    this.modelPath = path.join(process.cwd(), 'ml-model-data.json');
    this.tradesPath = path.join(process.cwd(), 'trade-history.json');
    
    // Model state
    this.model = {
      version: '3.0',
      accuracy: 0.0,
      totalTrades: 0,
      successfulTrades: 0,
      winRate: 0.0,
      lastTrained: null,
      
      // Strategy performance tracking
      strategyPerformance: {
        ttm_squeeze: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 },
        options_flow: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 },
        gamma_exposure: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 },
        dark_pool: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 },
        technical_analysis: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 },
        unusual_activity: { trades: 0, wins: 0, winRate: 0.0, avgReturn: 0.0 }
      },
      
      // Dynamic strategy weights (updated based on performance)
      strategyWeights: {
        ttm_squeeze: 1.0,
        options_flow: 1.0,
        gamma_exposure: 1.0,
        dark_pool: 1.0,
        technical_analysis: 1.0,
        unusual_activity: 1.0
      },
      
      // User preference patterns
      userPreferences: {
        preferredStrategies: [],
        preferredSectors: [],
        preferredPriceRanges: [],
        preferredVolumes: [],
        riskTolerance: 'moderate'
      },
      
      // Market condition patterns
      marketConditionPatterns: {
        bullish: { trades: 0, wins: 0, winRate: 0.0 },
        bearish: { trades: 0, wins: 0, winRate: 0.0 },
        sideways: { trades: 0, wins: 0, winRate: 0.0 },
        high_volatility: { trades: 0, wins: 0, winRate: 0.0 },
        low_volatility: { trades: 0, wins: 0, winRate: 0.0 }
      },
      
      // Neural network weights (simplified representation)
      neuralWeights: {
        input_hidden: [],
        hidden_output: [],
        bias_hidden: [],
        bias_output: []
      }
    };
    
    this.tradeHistory = [];
    this.loadModel();
    this.loadTradeHistory();
  }
  
  // Load existing model or create new one
  loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const data = fs.readFileSync(this.modelPath, 'utf8');
        const loadedModel = JSON.parse(data);
        
        // Merge with default structure (in case new fields were added)
        this.model = {
          ...this.model,
          ...loadedModel,
          strategyPerformance: {
            ...this.model.strategyPerformance,
            ...loadedModel.strategyPerformance
          },
          strategyWeights: {
            ...this.model.strategyWeights,
            ...loadedModel.strategyWeights
          },
          userPreferences: {
            ...this.model.userPreferences,
            ...loadedModel.userPreferences
          },
          marketConditionPatterns: {
            ...this.model.marketConditionPatterns,
            ...loadedModel.marketConditionPatterns
          }
        };
        
        console.log('🧠 ML Model loaded successfully');
        console.log(`📊 Model stats: ${this.model.totalTrades} trades, ${(this.model.winRate * 100).toFixed(1)}% win rate`);
      } else {
        console.log('🧠 Creating new ML model');
        this.initializeNeuralNetwork();
      }
    } catch (error) {
      console.error('❌ Error loading ML model:', error);
      this.initializeNeuralNetwork();
    }
  }
  
  // Load trade history
  loadTradeHistory() {
    try {
      if (fs.existsSync(this.tradesPath)) {
        const data = fs.readFileSync(this.tradesPath, 'utf8');
        this.tradeHistory = JSON.parse(data);
        console.log(`📋 Loaded ${this.tradeHistory.length} historical trades`);
      }
    } catch (error) {
      console.error('❌ Error loading trade history:', error);
      this.tradeHistory = [];
    }
  }
  
  // Save model to disk
  saveModel() {
    try {
      fs.writeFileSync(this.modelPath, JSON.stringify(this.model, null, 2));
      console.log('💾 ML Model saved successfully');
    } catch (error) {
      console.error('❌ Error saving ML model:', error);
    }
  }
  
  // Save trade history
  saveTradeHistory() {
    try {
      fs.writeFileSync(this.tradesPath, JSON.stringify(this.tradeHistory, null, 2));
      console.log('💾 Trade history saved successfully');
    } catch (error) {
      console.error('❌ Error saving trade history:', error);
    }
  }
  
  // Initialize neural network with random weights
  initializeNeuralNetwork() {
    const inputSize = 15; // Number of input features
    const hiddenSize = 8;
    const outputSize = 1;
    
    this.model.neuralWeights = {
      input_hidden: Array(inputSize).fill(null).map(() => 
        Array(hiddenSize).fill(null).map(() => (Math.random() - 0.5) * 2)
      ),
      hidden_output: Array(hiddenSize).fill(null).map(() => (Math.random() - 0.5) * 2),
      bias_hidden: Array(hiddenSize).fill(null).map(() => (Math.random() - 0.5) * 2),
      bias_output: (Math.random() - 0.5) * 2
    };
    
    console.log('🧠 Neural network initialized with random weights');
  }
  
  // Record user selection (preference learning)
  recordUserSelection(trade) {
    console.log(`🎯 Recording user preference: ${trade.symbol} - ${trade.strategy}`);
    
    // Update user preferences
    if (trade.detectedBy) {
      trade.detectedBy.forEach(strategy => {
        if (!this.model.userPreferences.preferredStrategies.includes(strategy)) {
          this.model.userPreferences.preferredStrategies.push(strategy);
        }
      });
    }
    
    if (trade.marketData?.sector && !this.model.userPreferences.preferredSectors.includes(trade.marketData.sector)) {
      this.model.userPreferences.preferredSectors.push(trade.marketData.sector);
    }
    
    // Add to trade history (without outcome initially)
    const tradeRecord = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      symbol: trade.symbol,
      strategy: trade.strategy || 'unknown',
      detectedBy: trade.detectedBy || [],
      entryPrice: trade.marketData?.price || 0,
      marketData: trade.marketData,
      squeezeContext: trade.squeezeContext,
      aiScore: trade.aiScore || trade.compositeScore || 0,
      
      // To be filled when outcome is recorded
      exitPrice: null,
      outcome: null,
      return: null,
      daysHeld: null,
      success: null,
      completedAt: null
    };
    
    this.tradeHistory.push(tradeRecord);
    this.saveTradeHistory();
    this.saveModel();
    
    return tradeRecord.id;
  }
  
  // Record trade outcome (learning from results)
  recordTradeOutcome(tradeId, outcome) {
    console.log(`📊 Recording trade outcome: ${tradeId} - ${outcome.success ? 'WIN' : 'LOSS'}`);
    
    const trade = this.tradeHistory.find(t => t.id === tradeId);
    if (!trade) {
      console.error(`❌ Trade ${tradeId} not found in history`);
      return;
    }
    
    // Update trade record
    trade.exitPrice = outcome.exitPrice;
    trade.outcome = outcome.outcome; // 'win', 'loss', 'breakeven'
    trade.return = outcome.return; // Percentage return
    trade.daysHeld = outcome.daysHeld;
    trade.success = outcome.success;
    trade.completedAt = new Date().toISOString();
    
    // Update model statistics
    this.model.totalTrades++;
    if (outcome.success) {
      this.model.successfulTrades++;
    }
    this.model.winRate = this.model.successfulTrades / this.model.totalTrades;
    
    // Update strategy performance
    trade.detectedBy.forEach(strategy => {
      if (this.model.strategyPerformance[strategy]) {
        const perf = this.model.strategyPerformance[strategy];
        perf.trades++;
        if (outcome.success) {
          perf.wins++;
        }
        perf.winRate = perf.wins / perf.trades;
        
        // Update average return
        const currentAvg = perf.avgReturn;
        const tradeReturn = outcome.return || 0;
        perf.avgReturn = (currentAvg * (perf.trades - 1) + tradeReturn) / perf.trades;
      }
    });
    
    // Update market condition patterns
    const marketCondition = this.determineMarketCondition(trade.marketData);
    if (this.model.marketConditionPatterns[marketCondition]) {
      const pattern = this.model.marketConditionPatterns[marketCondition];
      pattern.trades++;
      if (outcome.success) {
        pattern.wins++;
      }
      pattern.winRate = pattern.wins / pattern.trades;
    }
    
    // Retrain neural network with new data
    this.trainNeuralNetwork();
    
    // Update strategy weights based on recent performance
    this.updateStrategyWeights();
    
    // Update model accuracy
    this.calculateModelAccuracy();
    
    this.model.lastTrained = new Date().toISOString();
    this.saveTradeHistory();
    this.saveModel();
    
    console.log(`✅ Model updated: ${this.model.totalTrades} trades, ${(this.model.winRate * 100).toFixed(1)}% win rate`);
  }
  
  // Determine market condition from market data
  determineMarketCondition(marketData) {
    if (!marketData) return 'unknown';
    
    const change = marketData.changePercent || marketData.change || 0;
    
    if (change > 2) return 'bullish';
    if (change < -2) return 'bearish';
    
    // Check volatility indicators
    const volume = marketData.volume || 0;
    const avgVolume = marketData.avgVolume || volume;
    const volumeRatio = volume / avgVolume;
    
    if (volumeRatio > 2) return 'high_volatility';
    if (volumeRatio < 0.5) return 'low_volatility';
    
    return 'sideways';
  }
  
  // Train neural network with historical data
  trainNeuralNetwork() {
    const completedTrades = this.tradeHistory.filter(t => t.success !== null);
    if (completedTrades.length < 5) {
      console.log('🧠 Not enough completed trades for neural network training');
      return;
    }
    
    console.log(`🧠 Training neural network with ${completedTrades.length} completed trades...`);
    
    // Simple gradient descent training (simplified implementation)
    const learningRate = 0.01;
    const epochs = 10;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      completedTrades.forEach(trade => {
        const features = this.extractFeatures(trade);
        const target = trade.success ? 1 : 0;
        
        // Forward pass
        const prediction = this.forwardPass(features);
        const error = target - prediction;
        totalError += Math.abs(error);
        
        // Backward pass (simplified)
        this.backwardPass(features, error, learningRate);
      });
      
      if (epoch % 5 === 0) {
        console.log(`🧠 Epoch ${epoch}: Average error = ${(totalError / completedTrades.length).toFixed(4)}`);
      }
    }
    
    console.log('✅ Neural network training completed');
  }
  
  // Extract features from trade for neural network
  extractFeatures(trade) {
    const features = [
      // Market data features
      (trade.marketData?.price || 0) / 1000, // Normalized price
      (trade.marketData?.volume || 0) / 10000000, // Normalized volume
      (trade.marketData?.changePercent || 0) / 100, // Price change
      
      // Strategy features
      trade.detectedBy?.includes('ttm_squeeze') ? 1 : 0,
      trade.detectedBy?.includes('options_flow') ? 1 : 0,
      trade.detectedBy?.includes('gamma_exposure') ? 1 : 0,
      trade.detectedBy?.includes('dark_pool') ? 1 : 0,
      trade.detectedBy?.includes('technical_analysis') ? 1 : 0,
      trade.detectedBy?.includes('unusual_activity') ? 1 : 0,
      
      // Squeeze context features
      (trade.squeezeContext?.holyGrail || 0) / 100,
      (trade.squeezeContext?.squeeze || 0) / 100,
      (trade.squeezeContext?.gamma || 0) / 10,
      
      // AI score
      (trade.aiScore || 0) / 100,
      
      // Multi-strategy bonus
      trade.detectedBy?.length || 1,
      
      // Time features (normalized hour)
      new Date(trade.timestamp).getHours() / 24
    ];
    
    return features;
  }
  
  // Forward pass through neural network
  forwardPass(features) {
    const weights = this.model.neuralWeights;
    
    // Input to hidden layer
    const hiddenLayer = weights.input_hidden[0].map((_, j) => {
      let sum = weights.bias_hidden[j];
      for (let i = 0; i < features.length; i++) {
        sum += features[i] * weights.input_hidden[i][j];
      }
      return this.sigmoid(sum);
    });
    
    // Hidden to output layer
    let output = weights.bias_output;
    for (let j = 0; j < hiddenLayer.length; j++) {
      output += hiddenLayer[j] * weights.hidden_output[j];
    }
    
    return this.sigmoid(output);
  }
  
  // Simplified backward pass
  backwardPass(features, error, learningRate) {
    // This is a very simplified version of backpropagation
    // In a real implementation, you'd calculate gradients properly
    
    const weights = this.model.neuralWeights;
    
    // Update output weights
    for (let j = 0; j < weights.hidden_output.length; j++) {
      weights.hidden_output[j] += learningRate * error * 0.1; // Simplified
    }
    weights.bias_output += learningRate * error * 0.1;
    
    // Update hidden weights (simplified)
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < weights.input_hidden[i].length; j++) {
        weights.input_hidden[i][j] += learningRate * error * features[i] * 0.01;
      }
    }
  }
  
  // Sigmoid activation function
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  // Update strategy weights based on performance
  updateStrategyWeights() {
    console.log('⚖️ Updating strategy weights based on performance...');
    
    const totalPerformance = Object.values(this.model.strategyPerformance)
      .reduce((sum, perf) => sum + perf.winRate, 0);
    
    if (totalPerformance === 0) return;
    
    // Normalize weights based on win rate
    Object.keys(this.model.strategyWeights).forEach(strategy => {
      const perf = this.model.strategyPerformance[strategy];
      if (perf && perf.trades >= 3) { // Only adjust if we have enough data
        // Weight = (strategy win rate / average win rate)
        const avgWinRate = totalPerformance / Object.keys(this.model.strategyPerformance).length;
        this.model.strategyWeights[strategy] = Math.max(0.1, Math.min(2.0, perf.winRate / avgWinRate));
      }
    });
    
    console.log('📊 Updated strategy weights:', this.model.strategyWeights);
  }
  
  // Calculate overall model accuracy
  calculateModelAccuracy() {
    const completedTrades = this.tradeHistory.filter(t => t.success !== null);
    if (completedTrades.length === 0) {
      this.model.accuracy = 0;
      return;
    }
    
    let correctPredictions = 0;
    
    completedTrades.forEach(trade => {
      const features = this.extractFeatures(trade);
      const prediction = this.forwardPass(features);
      const predicted = prediction > 0.5;
      const actual = trade.success;
      
      if (predicted === actual) {
        correctPredictions++;
      }
    });
    
    this.model.accuracy = correctPredictions / completedTrades.length;
    console.log(`🎯 Model accuracy: ${(this.model.accuracy * 100).toFixed(1)}%`);
  }
  
  // Rank opportunities using ML model
  rankOpportunities(opportunities) {
    console.log(`🧠 Ranking ${opportunities.length} opportunities using ML model...`);
    
    const rankedOpportunities = opportunities.map(stock => {
      // Extract features for this opportunity
      const features = this.extractFeaturesFromStock(stock);
      
      // Get ML prediction
      const mlPrediction = this.forwardPass(features);
      
      // Calculate AI score combining multiple factors
      const baseScore = stock.compositeScore || 0;
      const mlBonus = mlPrediction * 20; // ML prediction contributes up to 20 points
      const strategyBonus = this.calculateStrategyBonus(stock);
      const userPreferenceBonus = this.calculateUserPreferenceBonus(stock);
      
      const aiScore = Math.min(100, baseScore + mlBonus + strategyBonus + userPreferenceBonus);
      
      return {
        ...stock,
        aiScore: Math.round(aiScore),
        mlPrediction: mlPrediction,
        mlRanked: true,
        mlBonus: Math.round(mlBonus),
        strategyBonus: Math.round(strategyBonus),
        userPreferenceBonus: Math.round(userPreferenceBonus)
      };
    });
    
    // Sort by AI score
    rankedOpportunities.sort((a, b) => b.aiScore - a.aiScore);
    
    console.log(`✅ Opportunities ranked. Top 3 AI scores: ${
      rankedOpportunities.slice(0, 3).map(s => `${s.symbol}:${s.aiScore}`).join(', ')
    }`);
    
    return rankedOpportunities;
  }
  
  // Extract features from stock opportunity
  extractFeaturesFromStock(stock) {
    return [
      (stock.price || 0) / 1000,
      (stock.volume || 0) / 10000000,
      (stock.change || 0) / 100,
      stock.detectedBy?.includes('ttm_squeeze') ? 1 : 0,
      stock.detectedBy?.includes('options_flow') ? 1 : 0,
      stock.detectedBy?.includes('gamma_exposure') ? 1 : 0,
      stock.detectedBy?.includes('dark_pool') ? 1 : 0,
      stock.detectedBy?.includes('technical_analysis') ? 1 : 0,
      stock.detectedBy?.includes('unusual_activity') ? 1 : 0,
      (stock.holyGrail || 0) / 100,
      (stock.squeeze || 0) / 100,
      (stock.gamma || 0) / 10,
      (stock.compositeScore || 0) / 100,
      stock.detectedBy?.length || 1,
      new Date().getHours() / 24
    ];
  }
  
  // Calculate strategy performance bonus
  calculateStrategyBonus(stock) {
    if (!stock.detectedBy) return 0;
    
    let bonus = 0;
    stock.detectedBy.forEach(strategy => {
      const perf = this.model.strategyPerformance[strategy];
      if (perf && perf.trades >= 3) {
        bonus += (perf.winRate - 0.5) * 10; // Bonus based on above-average performance
      }
    });
    
    return Math.max(-10, Math.min(10, bonus));
  }
  
  // Calculate user preference bonus
  calculateUserPreferenceBonus(stock) {
    let bonus = 0;
    
    // Strategy preference bonus
    if (stock.detectedBy) {
      const matchingStrategies = stock.detectedBy.filter(s => 
        this.model.userPreferences.preferredStrategies.includes(s)
      );
      bonus += matchingStrategies.length * 2;
    }
    
    // Sector preference bonus
    if (stock.sector && this.model.userPreferences.preferredSectors.includes(stock.sector)) {
      bonus += 3;
    }
    
    return Math.min(10, bonus);
  }
  
  // Get model statistics
  getModelStats() {
    return {
      ...this.model,
      completedTrades: this.tradeHistory.filter(t => t.success !== null).length,
      activeTrades: this.tradeHistory.filter(t => t.success === null).length,
      recentWinRate: this.calculateRecentWinRate(),
      bestStrategy: this.getBestPerformingStrategy(),
      worstStrategy: this.getWorstPerformingStrategy()
    };
  }
  
  // Calculate recent win rate (last 20 trades)
  calculateRecentWinRate() {
    const recentTrades = this.tradeHistory
      .filter(t => t.success !== null)
      .slice(-20);
      
    if (recentTrades.length === 0) return 0;
    
    const wins = recentTrades.filter(t => t.success).length;
    return wins / recentTrades.length;
  }
  
  // Get best performing strategy
  getBestPerformingStrategy() {
    let bestStrategy = null;
    let bestWinRate = 0;
    
    Object.entries(this.model.strategyPerformance).forEach(([strategy, perf]) => {
      if (perf.trades >= 3 && perf.winRate > bestWinRate) {
        bestWinRate = perf.winRate;
        bestStrategy = strategy;
      }
    });
    
    return bestStrategy ? { strategy: bestStrategy, winRate: bestWinRate } : null;
  }
  
  // Get worst performing strategy
  getWorstPerformingStrategy() {
    let worstStrategy = null;
    let worstWinRate = 1;
    
    Object.entries(this.model.strategyPerformance).forEach(([strategy, perf]) => {
      if (perf.trades >= 3 && perf.winRate < worstWinRate) {
        worstWinRate = perf.winRate;
        worstStrategy = strategy;
      }
    });
    
    return worstStrategy ? { strategy: worstStrategy, winRate: worstWinRate } : null;
  }
}

export default IntelligentMLEngine;