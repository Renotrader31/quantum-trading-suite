/**
 * 📊 ADVANCED OPTIONS STRATEGY ENGINE v3.0
 * 
 * Generates optimal options strategies based on:
 * - Market conditions and volatility analysis
 * - User risk profile (moderate to moderate-aggressive)
 * - 30-45 DTE preference
 * - Greeks analysis and risk management
 * - ML feedback integration for strategy refinement
 */

export default class OptionsStrategyEngine {
  constructor() {
    this.riskProfile = 'moderate-aggressive';
    this.preferredDTE = { min: 30, max: 45 };
    this.maxRiskPerTrade = 0.02; // 2% account risk per trade
    this.strategies = this.initializeStrategies();
  }

  initializeStrategies() {
    return {
      // Basic Strategies
      LONG_CALL: {
        name: 'Long Call',
        type: 'bullish',
        complexity: 'basic',
        maxRisk: 'premium paid',
        maxReward: 'unlimited',
        breakeven: 'strike + premium',
        bestConditions: ['high_volatility', 'strong_bullish', 'earnings_run_up'],
        greeksTarget: { delta: [0.4, 0.7], theta: 'negative', vega: 'positive' }
      },
      LONG_PUT: {
        name: 'Long Put',
        type: 'bearish', 
        complexity: 'basic',
        maxRisk: 'premium paid',
        maxReward: 'strike - premium',
        breakeven: 'strike - premium',
        bestConditions: ['high_volatility', 'strong_bearish', 'market_crash'],
        greeksTarget: { delta: [-0.7, -0.4], theta: 'negative', vega: 'positive' }
      },
      SHORT_CALL: {
        name: 'Short Call (Covered)',
        type: 'neutral_bearish',
        complexity: 'basic',
        maxRisk: 'unlimited (if naked)',
        maxReward: 'premium collected',
        breakeven: 'strike + premium',
        bestConditions: ['high_volatility', 'sideways_bearish', 'iv_crush'],
        greeksTarget: { delta: [-0.3, -0.1], theta: 'positive', vega: 'negative' }
      },
      SHORT_PUT: {
        name: 'Short Put (Cash-Secured)',
        type: 'neutral_bullish',
        complexity: 'basic',
        maxRisk: 'strike - premium',
        maxReward: 'premium collected',
        breakeven: 'strike - premium',
        bestConditions: ['high_volatility', 'sideways_bullish', 'wheel_strategy'],
        greeksTarget: { delta: [0.1, 0.3], theta: 'positive', vega: 'negative' }
      },

      // Spread Strategies
      BULL_CALL_SPREAD: {
        name: 'Bull Call Spread',
        type: 'bullish',
        complexity: 'intermediate',
        maxRisk: 'net debit',
        maxReward: 'spread width - net debit',
        bestConditions: ['moderate_bullish', 'low_to_moderate_iv', 'steady_uptrend'],
        greeksTarget: { delta: [0.2, 0.5], theta: 'slightly_negative', vega: 'negative' }
      },
      BEAR_PUT_SPREAD: {
        name: 'Bear Put Spread',
        type: 'bearish',
        complexity: 'intermediate', 
        maxRisk: 'net debit',
        maxReward: 'spread width - net debit',
        bestConditions: ['moderate_bearish', 'low_to_moderate_iv', 'steady_downtrend'],
        greeksTarget: { delta: [-0.5, -0.2], theta: 'slightly_negative', vega: 'negative' }
      },
      BULL_PUT_SPREAD: {
        name: 'Bull Put Spread',
        type: 'neutral_bullish',
        complexity: 'intermediate',
        maxRisk: 'spread width - net credit',
        maxReward: 'net credit',
        bestConditions: ['high_iv', 'sideways_bullish', 'iv_crush_expected'],
        greeksTarget: { delta: [0.1, 0.4], theta: 'positive', vega: 'negative' }
      },
      BEAR_CALL_SPREAD: {
        name: 'Bear Call Spread', 
        type: 'neutral_bearish',
        complexity: 'intermediate',
        maxRisk: 'spread width - net credit',
        maxReward: 'net credit',
        bestConditions: ['high_iv', 'sideways_bearish', 'iv_crush_expected'],
        greeksTarget: { delta: [-0.4, -0.1], theta: 'positive', vega: 'negative' }
      },

      // Advanced Strategies
      IRON_CONDOR: {
        name: 'Iron Condor',
        type: 'neutral',
        complexity: 'advanced',
        maxRisk: 'spread width - net credit',
        maxReward: 'net credit',
        bestConditions: ['high_iv', 'sideways_market', 'iv_crush_expected'],
        greeksTarget: { delta: 'near_zero', theta: 'positive', vega: 'negative' }
      },
      JADE_LIZARD: {
        name: 'Jade Lizard',
        type: 'neutral_bullish',
        complexity: 'advanced',
        maxRisk: 'call spread width',
        maxReward: 'net credit',
        bestConditions: ['high_iv', 'bullish_bias', 'iv_crush_expected'],
        greeksTarget: { delta: [0.1, 0.3], theta: 'positive', vega: 'negative' }
      },
      SHORT_STRANGLE: {
        name: 'Short Strangle',
        type: 'neutral',
        complexity: 'advanced',
        maxRisk: 'unlimited',
        maxReward: 'net credit',
        bestConditions: ['very_high_iv', 'sideways_market', 'post_earnings'],
        greeksTarget: { delta: 'near_zero', theta: 'positive', vega: 'very_negative' }
      },
      SHORT_STRADDLE: {
        name: 'Short Straddle',
        type: 'neutral',
        complexity: 'advanced',
        maxRisk: 'unlimited',
        maxReward: 'net credit',
        bestConditions: ['extremely_high_iv', 'earnings_crush', 'sideways_expected'],
        greeksTarget: { delta: 'zero', theta: 'very_positive', vega: 'very_negative' }
      },
      BUTTERFLY_SPREAD: {
        name: 'Butterfly Spread',
        type: 'neutral',
        complexity: 'advanced',
        maxRisk: 'net debit',
        maxReward: 'middle strike - wings - net debit',
        bestConditions: ['low_iv', 'sideways_market', 'pinning_expected'],
        greeksTarget: { delta: 'near_zero', theta: 'positive_near_expiry', vega: 'negative' }
      },
      CALENDAR_SPREAD: {
        name: 'Calendar Spread',
        type: 'neutral',
        complexity: 'advanced',
        maxRisk: 'net debit',
        maxReward: 'varies_with_time',
        bestConditions: ['low_front_iv', 'high_back_iv', 'time_decay_advantage'],
        greeksTarget: { delta: 'near_zero', theta: 'positive', vega: 'positive' }
      },
      WHEEL_STRATEGY: {
        name: 'Wheel Strategy',
        type: 'income',
        complexity: 'intermediate',
        maxRisk: 'stock_assignment',
        maxReward: 'premium_collection',
        bestConditions: ['high_iv_stocks', 'income_generation', 'bullish_long_term'],
        greeksTarget: { delta: [0.2, 0.3], theta: 'positive', vega: 'negative' }
      }
    };
  }

  /**
   * Analyze stock and generate top 3-4 optimal strategies
   */
  async analyzeStrategies(stockData, marketConditions = {}) {
    console.log(`🎯 Analyzing options strategies for ${stockData.symbol}`);
    
    const analysis = this.analyzeMarketConditions(stockData, marketConditions);
    const optionsChain = await this.getOptionsChain(stockData.symbol, stockData.price);
    
    // Score all strategies based on current conditions
    const strategyScores = this.scoreStrategies(stockData, analysis, optionsChain);
    
    // Get top 4 strategies
    const topStrategies = strategyScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    
    // Generate detailed recommendations for each
    const recommendations = await Promise.all(
      topStrategies.map(strategy => this.generateStrategyRecommendation(
        strategy, stockData, optionsChain, analysis
      ))
    );

    return {
      symbol: stockData.symbol,
      currentPrice: stockData.price,
      analysis: analysis,
      recommendations: recommendations,
      timestamp: new Date().toISOString(),
      marketConditions: marketConditions
    };
  }

  /**
   * Analyze current market conditions for the stock
   */
  analyzeMarketConditions(stockData, marketConditions) {
    const iv = stockData.iv || 30;
    const price = stockData.price;
    const volume = stockData.volume || 0;
    
    // Determine market sentiment
    let sentiment = 'neutral';
    if (stockData.flow === 'VERY_BULLISH' || stockData.sentiment === 'STRONG_POSITIVE') {
      sentiment = 'strong_bullish';
    } else if (stockData.flow === 'BULLISH' || stockData.sentiment === 'POSITIVE') {
      sentiment = 'moderate_bullish';
    } else if (stockData.flow === 'BEARISH' || stockData.sentiment === 'NEGATIVE') {
      sentiment = 'moderate_bearish';
    } else if (stockData.flow === 'VERY_BEARISH' || stockData.sentiment === 'STRONG_NEGATIVE') {
      sentiment = 'strong_bearish';
    }

    // Determine IV environment
    let ivEnvironment = 'moderate_iv';
    if (iv > 50) {
      ivEnvironment = 'high_iv';
    } else if (iv > 70) {
      ivEnvironment = 'very_high_iv';
    } else if (iv < 20) {
      ivEnvironment = 'low_iv';
    }

    // Determine volatility trend
    let volatilityTrend = 'stable';
    if (stockData.unusual && stockData.gamma > 0.5) {
      volatilityTrend = 'increasing';
    }

    return {
      sentiment,
      ivEnvironment,
      volatilityTrend,
      currentIV: iv,
      unusualActivity: stockData.unusual || false,
      gamma: stockData.gamma || 0,
      squeeze: stockData.squeeze || 0,
      holyGrail: stockData.holyGrail || 0,
      darkPoolActivity: stockData.darkPool || 0,
      earningsExpected: this.checkEarningsCalendar(stockData.symbol),
      timeToEarnings: 'unknown'
    };
  }

  /**
   * Score all strategies based on current market conditions
   */
  scoreStrategies(stockData, analysis, optionsChain) {
    const scores = [];
    
    Object.entries(this.strategies).forEach(([key, strategy]) => {
      let score = 50; // Base score
      
      // Score based on market sentiment alignment
      score += this.scoreSentimentAlignment(strategy, analysis);
      
      // Score based on IV environment
      score += this.scoreIVAlignment(strategy, analysis);
      
      // Score based on user preferences (30-45 DTE, moderate-aggressive)
      score += this.scoreUserPreferences(strategy, analysis);
      
      // Score based on Greeks targets
      score += this.scoreGreeksAlignment(strategy, optionsChain, analysis);
      
      // Score based on risk/reward profile
      score += this.scoreRiskReward(strategy, stockData, optionsChain);

      scores.push({
        strategyKey: key,
        strategy: strategy,
        score: Math.max(0, Math.min(100, score)),
        reasoning: this.generateScoreReasoning(strategy, analysis, score)
      });
    });

    return scores;
  }

  scoreSentimentAlignment(strategy, analysis) {
    let score = 0;
    
    if (analysis.sentiment.includes('bullish') && strategy.type.includes('bullish')) {
      score += 20;
    } else if (analysis.sentiment.includes('bearish') && strategy.type.includes('bearish')) {
      score += 20;
    } else if (analysis.sentiment === 'neutral' && strategy.type.includes('neutral')) {
      score += 15;
    }

    return score;
  }

  scoreIVAlignment(strategy, analysis) {
    let score = 0;
    
    // High IV favors premium selling strategies
    if (analysis.ivEnvironment === 'high_iv' || analysis.ivEnvironment === 'very_high_iv') {
      if (strategy.greeksTarget.vega === 'negative' || strategy.greeksTarget.theta === 'positive') {
        score += 15;
      }
    }
    
    // Low IV favors premium buying strategies
    if (analysis.ivEnvironment === 'low_iv') {
      if (strategy.greeksTarget.vega === 'positive') {
        score += 10;
      }
    }

    return score;
  }

  scoreUserPreferences(strategy, analysis) {
    let score = 0;
    
    // Moderate-aggressive profile prefers intermediate to advanced strategies
    if (strategy.complexity === 'intermediate') {
      score += 10;
    } else if (strategy.complexity === 'advanced') {
      score += 15;
    }
    
    // Favor strategies good for 30-45 DTE
    if (strategy.greeksTarget.theta === 'positive' || strategy.greeksTarget.theta === 'slightly_negative') {
      score += 10;
    }

    return score;
  }

  scoreGreeksAlignment(strategy, optionsChain, analysis) {
    // This would analyze actual options chain data
    // For now, return a moderate score
    return 5;
  }

  scoreRiskReward(strategy, stockData, optionsChain) {
    // Analyze risk/reward based on strategy and current market
    let score = 0;
    
    // Favor defined risk strategies for moderate-aggressive profile
    if (!strategy.maxRisk.includes('unlimited')) {
      score += 10;
    }
    
    return score;
  }

  generateScoreReasoning(strategy, analysis, score) {
    const reasons = [];
    
    if (analysis.sentiment.includes('bullish') && strategy.type.includes('bullish')) {
      reasons.push('Bullish market sentiment aligns with strategy');
    }
    
    if (analysis.ivEnvironment === 'high_iv' && strategy.greeksTarget.theta === 'positive') {
      reasons.push('High IV environment favors premium selling');
    }
    
    if (strategy.complexity === 'advanced') {
      reasons.push('Advanced strategy matches aggressive profile');
    }

    return reasons.join('. ');
  }

  /**
   * Generate detailed strategy recommendation
   */
  async generateStrategyRecommendation(strategyScore, stockData, optionsChain, analysis) {
    const strategy = strategyScore.strategy;
    const currentPrice = stockData.price;
    
    // Calculate optimal strikes and expiration
    const optimalSetup = this.calculateOptimalSetup(
      strategyScore.strategyKey, 
      currentPrice, 
      optionsChain, 
      analysis
    );

    // Calculate position sizing
    const positionSize = this.calculatePositionSize(
      strategyScore.strategyKey,
      optimalSetup,
      currentPrice
    );

    return {
      strategy: strategy.name,
      strategyKey: strategyScore.strategyKey,
      type: strategy.type,
      complexity: strategy.complexity,
      score: strategyScore.score,
      reasoning: strategyScore.reasoning,
      
      // Setup Details
      setup: optimalSetup,
      positionSize: positionSize,
      
      // Risk Management
      maxRisk: optimalSetup.maxRisk,
      maxReward: optimalSetup.maxReward,
      breakeven: optimalSetup.breakeven,
      probabilityOfProfit: optimalSetup.probabilityOfProfit,
      
      // Greeks
      netDelta: optimalSetup.netDelta,
      netTheta: optimalSetup.netTheta,
      netVega: optimalSetup.netVega,
      netGamma: optimalSetup.netGamma,
      
      // Execution
      entryPrice: optimalSetup.entryPrice,
      targetPrice: optimalSetup.targetPrice,
      stopLoss: optimalSetup.stopLoss,
      
      // Timing
      daysToExpiration: optimalSetup.dte,
      expirationDate: optimalSetup.expirationDate,
      timeDecayRate: optimalSetup.timeDecayRate,
      
      // Action Plan
      actions: this.generateActionPlan(strategyScore.strategyKey, optimalSetup),
      
      // Conditions
      bestConditions: strategy.bestConditions,
      currentConditionMatch: this.evaluateConditionMatch(strategy.bestConditions, analysis),
      
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate optimal strike prices and expiration for strategy
   */
  calculateOptimalSetup(strategyKey, currentPrice, optionsChain, analysis) {
    // This is where we'd do complex options math
    // For now, providing realistic sample calculations
    
    const dte = Math.floor(Math.random() * (45 - 30) + 30); // 30-45 DTE
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + dte);

    let setup = {
      dte: dte,
      expirationDate: expirationDate.toISOString().split('T')[0]
    };

    switch (strategyKey) {
      case 'LONG_CALL':
        setup = {
          ...setup,
          longStrike: Math.round(currentPrice * 1.02), // Slightly OTM
          entryPrice: currentPrice * 0.03, // ~3% of stock price for premium
          maxRisk: currentPrice * 0.03,
          maxReward: 'Unlimited',
          breakeven: Math.round(currentPrice * 1.05),
          probabilityOfProfit: 45,
          netDelta: 0.6,
          netTheta: -0.05,
          netVega: 0.15,
          netGamma: 0.03
        };
        break;
        
      case 'IRON_CONDOR':
        const wingWidth = Math.round(currentPrice * 0.05); // 5% wing width
        setup = {
          ...setup,
          shortPutStrike: Math.round(currentPrice * 0.90),
          longPutStrike: Math.round(currentPrice * 0.85),
          shortCallStrike: Math.round(currentPrice * 1.10),
          longCallStrike: Math.round(currentPrice * 1.15),
          entryPrice: currentPrice * 0.015, // Net credit ~1.5%
          maxRisk: wingWidth - (currentPrice * 0.015),
          maxReward: currentPrice * 0.015,
          breakeven: `${Math.round(currentPrice * 0.915)} / ${Math.round(currentPrice * 1.085)}`,
          probabilityOfProfit: 68,
          netDelta: 0.05,
          netTheta: 0.08,
          netVega: -0.12,
          netGamma: 0.01
        };
        break;

      case 'JADE_LIZARD':
        setup = {
          ...setup,
          shortPutStrike: Math.round(currentPrice * 0.95),
          shortCallStrike: Math.round(currentPrice * 1.05),
          longCallStrike: Math.round(currentPrice * 1.10),
          entryPrice: currentPrice * 0.02, // Net credit ~2%
          maxRisk: 5, // Call spread width
          maxReward: currentPrice * 0.02,
          breakeven: Math.round(currentPrice * 0.93),
          probabilityOfProfit: 72,
          netDelta: 0.15,
          netTheta: 0.06,
          netVega: -0.10,
          netGamma: 0.02
        };
        break;

      default:
        // Default setup for other strategies
        setup = {
          ...setup,
          entryPrice: currentPrice * 0.02,
          maxRisk: currentPrice * 0.02,
          maxReward: 'Variable',
          breakeven: currentPrice,
          probabilityOfProfit: 50,
          netDelta: 0,
          netTheta: 0,
          netVega: 0,
          netGamma: 0
        };
    }

    // Add common fields
    setup.targetPrice = typeof setup.entryPrice === 'number' ? setup.entryPrice * 0.5 : setup.entryPrice;
    setup.stopLoss = typeof setup.entryPrice === 'number' ? setup.entryPrice * 2 : setup.entryPrice;
    setup.timeDecayRate = setup.netTheta;

    return setup;
  }

  /**
   * Calculate position sizing based on risk management
   */
  calculatePositionSize(strategyKey, setup, currentPrice) {
    const accountSize = 100000; // Assume $100k account for demo
    const maxRiskAmount = accountSize * this.maxRiskPerTrade; // 2% max risk
    
    let contracts = 1;
    let capitalRequired = 0;
    
    if (typeof setup.maxRisk === 'number') {
      contracts = Math.floor(maxRiskAmount / (setup.maxRisk * 100));
      capitalRequired = setup.maxRisk * contracts * 100;
    } else {
      // For strategies with unlimited risk or complex calculations
      contracts = 1;
      capitalRequired = currentPrice * 100; // Assume stock assignment risk
    }

    return {
      contracts: Math.max(1, contracts),
      capitalRequired: capitalRequired,
      maxRiskAmount: maxRiskAmount,
      percentOfAccount: (capitalRequired / accountSize) * 100,
      riskPerContract: setup.maxRisk,
      rewardPerContract: setup.maxReward
    };
  }

  /**
   * Generate step-by-step action plan
   */
  generateActionPlan(strategyKey, setup) {
    const actions = [];
    
    switch (strategyKey) {
      case 'LONG_CALL':
        actions.push({
          order: 1,
          action: 'BUY TO OPEN',
          instrument: `${setup.longStrike} Call`,
          quantity: 1,
          expiration: setup.expirationDate,
          estimatedPrice: setup.entryPrice
        });
        break;

      case 'IRON_CONDOR':
        actions.push({
          order: 1,
          action: 'SELL TO OPEN',
          instrument: `${setup.shortPutStrike} Put`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        actions.push({
          order: 2,
          action: 'BUY TO OPEN', 
          instrument: `${setup.longPutStrike} Put`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        actions.push({
          order: 3,
          action: 'SELL TO OPEN',
          instrument: `${setup.shortCallStrike} Call`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        actions.push({
          order: 4,
          action: 'BUY TO OPEN',
          instrument: `${setup.longCallStrike} Call`, 
          quantity: 1,
          expiration: setup.expirationDate
        });
        break;

      case 'JADE_LIZARD':
        actions.push({
          order: 1,
          action: 'SELL TO OPEN',
          instrument: `${setup.shortPutStrike} Put`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        actions.push({
          order: 2,
          action: 'SELL TO OPEN',
          instrument: `${setup.shortCallStrike} Call`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        actions.push({
          order: 3,
          action: 'BUY TO OPEN',
          instrument: `${setup.longCallStrike} Call`,
          quantity: 1,
          expiration: setup.expirationDate
        });
        break;

      default:
        actions.push({
          order: 1,
          action: 'EXECUTE STRATEGY',
          instrument: 'As defined',
          quantity: 1,
          expiration: setup.expirationDate
        });
    }

    return actions;
  }

  /**
   * Evaluate how well current conditions match strategy requirements
   */
  evaluateConditionMatch(requiredConditions, analysis) {
    let matches = 0;
    let total = requiredConditions.length;
    
    requiredConditions.forEach(condition => {
      switch (condition) {
        case 'high_volatility':
          if (analysis.ivEnvironment === 'high_iv' || analysis.ivEnvironment === 'very_high_iv') matches++;
          break;
        case 'strong_bullish':
          if (analysis.sentiment === 'strong_bullish') matches++;
          break;
        case 'moderate_bullish':
          if (analysis.sentiment.includes('bullish')) matches++;
          break;
        case 'sideways_market':
          if (analysis.sentiment === 'neutral') matches++;
          break;
        case 'iv_crush_expected':
          if (analysis.earningsExpected && analysis.ivEnvironment === 'high_iv') matches++;
          break;
      }
    });

    return {
      matchPercentage: (matches / total) * 100,
      matchedConditions: matches,
      totalConditions: total,
      rating: matches / total >= 0.7 ? 'Excellent' : 
              matches / total >= 0.5 ? 'Good' : 
              matches / total >= 0.3 ? 'Fair' : 'Poor'
    };
  }

  /**
   * Get simulated options chain data
   */
  async getOptionsChain(symbol, currentPrice) {
    // In production, this would fetch real options data
    // For now, return simulated chain
    
    const expirations = [];
    for (let i = 30; i <= 45; i += 7) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + i);
      expirations.push({
        date: expDate.toISOString().split('T')[0],
        dte: i,
        strikes: this.generateStrikes(currentPrice)
      });
    }

    return {
      symbol: symbol,
      currentPrice: currentPrice,
      expirations: expirations,
      lastUpdate: new Date().toISOString()
    };
  }

  generateStrikes(currentPrice) {
    const strikes = [];
    const baseStrike = Math.round(currentPrice / 5) * 5; // Round to nearest $5
    
    for (let i = -10; i <= 10; i++) {
      const strike = baseStrike + (i * 5);
      if (strike > 0) {
        strikes.push({
          strike: strike,
          call: {
            bid: Math.max(0.05, currentPrice * 0.02 * Math.random()),
            ask: Math.max(0.10, currentPrice * 0.03 * Math.random()),
            iv: 30 + (Math.random() * 20),
            delta: Math.max(0.01, Math.min(0.99, 0.5 + (i * 0.05))),
            theta: -0.05 - (Math.random() * 0.05),
            vega: 0.1 + (Math.random() * 0.1),
            gamma: 0.01 + (Math.random() * 0.03)
          },
          put: {
            bid: Math.max(0.05, currentPrice * 0.02 * Math.random()),
            ask: Math.max(0.10, currentPrice * 0.03 * Math.random()),
            iv: 32 + (Math.random() * 20),
            delta: Math.max(-0.99, Math.min(-0.01, -0.5 + (i * 0.05))),
            theta: -0.05 - (Math.random() * 0.05),
            vega: 0.1 + (Math.random() * 0.1),
            gamma: 0.01 + (Math.random() * 0.03)
          }
        });
      }
    }
    
    return strikes;
  }

  /**
   * Check if earnings are expected soon
   */
  checkEarningsCalendar(symbol) {
    // In production, this would check actual earnings calendar
    // For demo, randomly assign earnings expectation
    return Math.random() > 0.7; // 30% chance of earnings in next 2 weeks
  }

  /**
   * Integration with ML Learning system
   */
  async recordStrategyOutcome(strategyData, outcome, mlEngine) {
    try {
      // Feed strategy performance back to ML system
      const strategyFeedback = {
        strategy: strategyData.strategyKey,
        symbol: strategyData.symbol,
        entryDate: strategyData.timestamp,
        outcome: outcome, // 'win', 'loss', 'breakeven'
        profitLoss: outcome.profitLoss,
        daysHeld: outcome.daysHeld,
        maxDrawdown: outcome.maxDrawdown,
        conditions: strategyData.marketConditions,
        score: strategyData.score
      };

      // Update ML model with strategy success rates
      if (mlEngine && typeof mlEngine.recordStrategyPerformance === 'function') {
        await mlEngine.recordStrategyPerformance(strategyFeedback);
      }

      console.log('📊 Strategy outcome recorded for ML learning:', strategyFeedback);
      return true;
    } catch (error) {
      console.error('❌ Error recording strategy outcome:', error);
      return false;
    }
  }
}