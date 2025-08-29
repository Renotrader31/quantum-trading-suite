/**
 * 🚀 SIMPLE OPTIONS STRATEGY ENGINE
 * Browser-compatible version for client-side usage
 */

class SimpleOptionsEngine {
  constructor() {
    this.strategies = [
      {
        name: 'Long Call',
        type: 'bullish',
        complexity: 'basic',
        description: 'Buy call option to profit from upward price movement',
        maxRisk: 'Premium paid',
        maxReward: 'Unlimited',
        bestFor: 'Strong bullish outlook, high volatility'
      },
      {
        name: 'Long Put', 
        type: 'bearish',
        complexity: 'basic',
        description: 'Buy put option to profit from downward price movement',
        maxRisk: 'Premium paid',
        maxReward: 'Strike price - premium',
        bestFor: 'Strong bearish outlook, high volatility'
      },
      {
        name: 'Bull Call Spread',
        type: 'bullish',
        complexity: 'intermediate',
        description: 'Buy lower strike call, sell higher strike call',
        maxRisk: 'Net debit paid',
        maxReward: 'Spread width - net debit',
        bestFor: 'Moderate bullish outlook, limited risk'
      },
      {
        name: 'Cash-Secured Put',
        type: 'neutral_bullish',
        complexity: 'basic',
        description: 'Sell put option with cash to cover assignment',
        maxRisk: 'Strike price - premium received',
        maxReward: 'Premium received',
        bestFor: 'Income generation, willing to own stock'
      }
    ];
  }

  async analyzeStrategies(stockData, marketConditions = {}) {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const analysis = this.analyzeMarket(stockData, marketConditions);
    const scoredStrategies = this.scoreStrategies(stockData, analysis);
    
    // Generate recommendations
    const recommendations = scoredStrategies.map(strategy => ({
      strategy: strategy.name,
      strategyKey: strategy.name.replace(/\s+/g, '_').toUpperCase(),
      type: strategy.type,
      complexity: strategy.complexity,
      score: strategy.score,
      reasoning: strategy.reasoning,
      
      // Setup details
      setup: this.generateSetup(strategy, stockData),
      positionSize: this.calculatePositionSize(stockData),
      
      // Risk management
      maxRisk: strategy.maxRisk,
      maxReward: strategy.maxReward,
      breakeven: this.calculateBreakeven(strategy, stockData),
      probabilityOfProfit: Math.floor(50 + (strategy.score - 50) * 0.4),
      
      // Greeks (simplified)
      netDelta: this.calculateDelta(strategy),
      netTheta: this.calculateTheta(strategy),
      netVega: this.calculateVega(strategy),
      netGamma: this.calculateGamma(strategy),
      
      // Execution details
      entryPrice: stockData.price * (0.02 + Math.random() * 0.04),
      targetPrice: stockData.price * (1 + (Math.random() * 0.1)),
      stopLoss: stockData.price * (1 - (Math.random() * 0.1)),
      
      // Timing
      daysToExpiration: 30 + Math.floor(Math.random() * 15),
      expirationDate: this.getExpirationDate(30 + Math.floor(Math.random() * 15)),
      
      // Actions
      actions: this.generateActions(strategy, stockData),
      
      bestConditions: [strategy.bestFor],
      timestamp: new Date().toISOString()
    }));

    return {
      symbol: stockData.symbol,
      currentPrice: stockData.price,
      analysis: analysis,
      recommendations: recommendations.slice(0, 4), // Top 4
      timestamp: new Date().toISOString(),
      marketConditions: marketConditions
    };
  }

  analyzeMarket(stockData, marketConditions) {
    const sentiment = stockData.flow === 'VERY_BULLISH' ? 'strong_bullish' :
                     stockData.flow === 'BULLISH' ? 'moderate_bullish' :
                     stockData.flow === 'BEARISH' ? 'moderate_bearish' :
                     stockData.flow === 'VERY_BEARISH' ? 'strong_bearish' : 'neutral';

    return {
      sentiment: sentiment,
      ivEnvironment: stockData.iv > 40 ? 'high_iv' : stockData.iv > 25 ? 'moderate_iv' : 'low_iv',
      volatility: stockData.iv > 40 ? 'high' : 'moderate',
      currentIV: stockData.iv || 30,
      trend: sentiment.includes('bullish') ? 'uptrend' : sentiment.includes('bearish') ? 'downtrend' : 'sideways'
    };
  }

  scoreStrategies(stockData, analysis) {
    return this.strategies.map(strategy => {
      let score = 50; // Base score
      
      // Score based on sentiment alignment
      if (analysis.sentiment.includes('bullish') && strategy.type.includes('bullish')) {
        score += 30;
      } else if (analysis.sentiment.includes('bearish') && strategy.type.includes('bearish')) {
        score += 30;
      } else if (analysis.sentiment === 'neutral' && strategy.type.includes('neutral')) {
        score += 20;
      }
      
      // Score based on IV environment
      if (analysis.ivEnvironment === 'high_iv' && strategy.name.includes('Put')) {
        score += 15; // High IV favors selling premium
      }
      
      // Score based on complexity preference (moderate-aggressive likes intermediate)
      if (strategy.complexity === 'intermediate') {
        score += 10;
      }
      
      return {
        ...strategy,
        score: Math.max(20, Math.min(95, score + (Math.random() * 10 - 5))),
        reasoning: this.generateReasoning(strategy, analysis, score)
      };
    }).sort((a, b) => b.score - a.score);
  }

  generateReasoning(strategy, analysis, score) {
    const reasons = [];
    if (analysis.sentiment.includes('bullish') && strategy.type.includes('bullish')) {
      reasons.push('Bullish market sentiment aligns with strategy');
    }
    if (strategy.complexity === 'intermediate') {
      reasons.push('Intermediate complexity matches risk profile');
    }
    return reasons.join('. ') || 'Market conditions analyzed';
  }

  generateSetup(strategy, stockData) {
    const price = stockData.price;
    return {
      dte: 30 + Math.floor(Math.random() * 15),
      expirationDate: this.getExpirationDate(35),
      entryPrice: price * 0.03,
      maxRisk: price * 0.02,
      maxReward: price * 0.08,
      breakeven: price,
      probabilityOfProfit: 65 + Math.floor(Math.random() * 20)
    };
  }

  calculatePositionSize(stockData) {
    return {
      contracts: Math.floor(2000 / (stockData.price * 0.03)) || 1,
      capitalRequired: Math.floor(stockData.price * 0.03 * 100),
      maxRiskAmount: 2000,
      percentOfAccount: 2,
      riskPerContract: stockData.price * 0.02
    };
  }

  calculateBreakeven(strategy, stockData) {
    return stockData.price + (Math.random() * 10 - 5);
  }

  calculateDelta(strategy) {
    return strategy.type.includes('bullish') ? 0.3 + Math.random() * 0.4 : -0.7 + Math.random() * 0.4;
  }

  calculateTheta(strategy) {
    return strategy.name.includes('Sell') || strategy.name.includes('Put') ? 0.02 + Math.random() * 0.04 : -0.02 - Math.random() * 0.04;
  }

  calculateVega(strategy) {
    return Math.random() * 0.2 - 0.1;
  }

  calculateGamma(strategy) {
    return Math.random() * 0.05;
  }

  getExpirationDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  generateActions(strategy, stockData) {
    return [
      {
        order: 1,
        action: strategy.name.includes('Long') ? 'BUY TO OPEN' : 'SELL TO OPEN',
        instrument: `${strategy.name} Option`,
        quantity: 1,
        expiration: this.getExpirationDate(35)
      }
    ];
  }
}

export default SimpleOptionsEngine;