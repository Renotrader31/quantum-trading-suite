// 🎯 PRIORITY #2: Multi-Strategy Ensemble Engine
// Dynamic weighting system with portfolio-level optimization

export class MultiStrategyEnsemble {
  constructor() {
    this.strategies = {
      // 1. Volatility Expansion Strategies
      'volatilityExpansion': {
        name: 'Volatility Expansion',
        strategies: ['straddle', 'strangle', 'ironButterfly'],
        baseWeight: 0.20, // 20% base allocation
        currentWeight: 0.20,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['low_iv', 'squeeze_setup', 'earnings_approach'],
        riskProfile: 'moderate-aggressive'
      },
      
      // 2. Range-Bound Income Strategies  
      'rangeBoundIncome': {
        name: 'Range-Bound Income',
        strategies: ['ironCondor', 'shortStrangle', 'coveredCall'],
        baseWeight: 0.25, // 25% base allocation
        currentWeight: 0.25,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['high_iv', 'low_volatility', 'sideways_market'],
        riskProfile: 'moderate'
      },
      
      // 3. Directional Momentum Strategies
      'directionalMomentum': {
        name: 'Directional Momentum', 
        strategies: ['callSpread', 'putSpread', 'calendar'],
        baseWeight: 0.20, // 20% base allocation
        currentWeight: 0.20,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['trending_market', 'momentum_breakout', 'squeeze_release'],
        riskProfile: 'moderate'
      },
      
      // 4. High-Probability Income
      'highProbabilityIncome': {
        name: 'High-Probability Income',
        strategies: ['cashSecuredPut', 'coveredCall', 'collar'],
        baseWeight: 0.15, // 15% base allocation  
        currentWeight: 0.15,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['stable_market', 'dividend_season', 'low_beta'],
        riskProfile: 'conservative'
      },
      
      // 5. Volatility Contraction Strategies
      'volatilityContraction': {
        name: 'Volatility Contraction',
        strategies: ['shortStraddle', 'ironCondor', 'butterfly'],
        baseWeight: 0.10, // 10% base allocation
        currentWeight: 0.10,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['high_iv', 'iv_crush_expected', 'post_earnings'],
        riskProfile: 'aggressive'
      },
      
      // 6. Adaptive Momentum Strategies
      'adaptiveMomentum': {
        name: 'Adaptive Momentum',
        strategies: ['ratio', 'backspread', 'diagonal'],
        baseWeight: 0.10, // 10% base allocation
        currentWeight: 0.10,
        performance: { wins: 0, losses: 0, totalReturn: 0 },
        marketConditions: ['volatile_market', 'uncertain_direction', 'gamma_squeeze'],
        riskProfile: 'aggressive'
      }
    };
    
    this.portfolioMetrics = {
      totalAllocated: 0,
      diversificationScore: 0,
      riskConcentration: 0,
      performanceAttribution: {},
      rebalanceHistory: []
    };
    
    this.rebalanceRules = {
      minWeight: 0.05, // Minimum 5% allocation
      maxWeight: 0.40, // Maximum 40% allocation
      rebalanceThreshold: 0.15, // Rebalance when 15% drift from target
      performanceLookback: 30, // Days to look back for performance
      minTradesForWeight: 3 // Minimum trades before adjusting weights
    };
  }

  // 🎯 Main ensemble decision engine
  async generateEnsembleRecommendations(marketData, availableStrategies, portfolioContext) {
    console.log('🎯 Multi-Strategy Ensemble Engine Starting...');
    console.log(`📊 Input: ${availableStrategies?.length || 0} strategies, ${Object.keys(marketData || {}).length} market data points`);
    
    try {
      // 1. Assess current market regime
      const marketRegime = this.assessMarketRegime(marketData);
      console.log(`📊 Market Regime: ${marketRegime.primary} (confidence: ${marketRegime.confidence}%)`);
      
      // 2. Update strategy weights based on performance and market conditions
      this.updateDynamicWeights(marketRegime, portfolioContext);
      
      // 3. Generate weighted strategy recommendations
      const ensembleRecommendations = this.generateWeightedRecommendations(
        availableStrategies, 
        marketRegime, 
        portfolioContext
      );
      console.log(`📊 Generated ${ensembleRecommendations.length} ensemble recommendations`);
      
      // 4. Apply portfolio-level optimization
      const optimizedRecommendations = this.applyPortfolioOptimization(
        ensembleRecommendations,
        portfolioContext
      );
      console.log(`📊 Optimized to ${optimizedRecommendations.length} final recommendations`);
      
      // 5. Calculate diversification and risk metrics
      this.updatePortfolioMetrics(optimizedRecommendations);
      
      console.log(`✅ Ensemble generated ${optimizedRecommendations.length} optimized recommendations`);
      
      return {
        recommendations: optimizedRecommendations,
        ensembleWeights: this.getCurrentWeights(),
        marketRegime: marketRegime,
        portfolioMetrics: this.portfolioMetrics,
        rebalanceSignals: this.checkRebalanceSignals()
      };
    } catch (error) {
      console.error('❌ Ensemble engine error:', error);
      // Return original strategies with minimal ensemble metadata
      return {
        recommendations: availableStrategies || [],
        ensembleWeights: this.getCurrentWeights(),
        marketRegime: { primary: 'unknown', confidence: 0, scores: {}, marketMetrics: {} },
        portfolioMetrics: this.portfolioMetrics,
        rebalanceSignals: []
      };
    }
  }

  // 🌍 Assess current market regime
  assessMarketRegime(marketData) {
    const regimes = {
      'low_volatility': 0,
      'high_volatility': 0, 
      'trending_bullish': 0,
      'trending_bearish': 0,
      'range_bound': 0,
      'volatility_expansion': 0,
      'momentum_breakout': 0
    };

    // Volatility assessment
    const avgIV = Object.values(marketData).reduce((sum, stock) => 
      sum + (stock.impliedVolatility || 0.25), 0) / Object.keys(marketData).length;
    
    if (avgIV > 0.35) {
      regimes.high_volatility += 40;
      regimes.volatility_contraction += 20;
    } else if (avgIV < 0.20) {
      regimes.low_volatility += 40;
      regimes.volatility_expansion += 30;
    }
    
    // Trend assessment
    const avgChange = Object.values(marketData).reduce((sum, stock) => 
      sum + (stock.changePercent || 0), 0) / Object.keys(marketData).length;
    
    if (avgChange > 1.5) {
      regimes.trending_bullish += 35;
      regimes.momentum_breakout += 25;
    } else if (avgChange < -1.5) {
      regimes.trending_bearish += 35;
      regimes.momentum_breakout += 20;
    } else {
      regimes.range_bound += 30;
    }
    
    // Squeeze context assessment
    const squeezeCount = Object.values(marketData).filter(stock => 
      stock.holyGrail && stock.holyGrail >= 60).length;
    
    if (squeezeCount > Object.keys(marketData).length * 0.3) {
      regimes.volatility_expansion += 25;
      regimes.momentum_breakout += 20;
    }
    
    // Volume assessment
    const highVolumeCount = Object.values(marketData).filter(stock => 
      stock.volume > (stock.avgVolume || stock.volume) * 1.5).length;
    
    if (highVolumeCount > Object.keys(marketData).length * 0.4) {
      regimes.momentum_breakout += 15;
      regimes.trending_bullish += 10;
    }

    // Find dominant regime
    const dominantRegime = Object.entries(regimes)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      primary: dominantRegime[0],
      confidence: Math.min(100, dominantRegime[1]),
      scores: regimes,
      marketMetrics: { avgIV, avgChange, squeezeCount, highVolumeCount }
    };
  }

  // ⚖️ Update dynamic strategy weights
  updateDynamicWeights(marketRegime, portfolioContext) {
    console.log('⚖️ Updating dynamic strategy weights...');
    
    Object.keys(this.strategies).forEach(strategyGroup => {
      const strategy = this.strategies[strategyGroup];
      let newWeight = strategy.baseWeight;
      
      // Performance-based adjustment
      const performanceMultiplier = this.calculatePerformanceMultiplier(strategy);
      
      // Market regime adjustment  
      const regimeMultiplier = this.calculateRegimeMultiplier(strategy, marketRegime);
      
      // Risk concentration adjustment
      const riskMultiplier = this.calculateRiskMultiplier(strategy, portfolioContext);
      
      // Apply adjustments
      newWeight = strategy.baseWeight * performanceMultiplier * regimeMultiplier * riskMultiplier;
      
      // Enforce min/max constraints
      newWeight = Math.max(this.rebalanceRules.minWeight, 
                  Math.min(this.rebalanceRules.maxWeight, newWeight));
      
      strategy.currentWeight = newWeight;
      
      console.log(`  ${strategy.name}: ${(newWeight * 100).toFixed(1)}% (perf: ${performanceMultiplier.toFixed(2)}, regime: ${regimeMultiplier.toFixed(2)}, risk: ${riskMultiplier.toFixed(2)})`);
    });
    
    // Normalize weights to sum to 1.0
    this.normalizeWeights();
  }

  // 📈 Calculate performance-based multiplier
  calculatePerformanceMultiplier(strategy) {
    const { wins, losses, totalReturn } = strategy.performance;
    const totalTrades = wins + losses;
    
    if (totalTrades < this.rebalanceRules.minTradesForWeight) {
      return 1.0; // No adjustment until enough data
    }
    
    const winRate = wins / totalTrades;
    const avgReturn = totalReturn / totalTrades;
    
    // Performance score: 50% win rate, 50% average return
    const performanceScore = (winRate * 0.5) + ((avgReturn + 100) / 200 * 0.5);
    
    // Convert to multiplier: 0.7x to 1.3x range
    return 0.7 + (performanceScore * 0.6);
  }

  // 🌍 Calculate market regime multiplier
  calculateRegimeMultiplier(strategy, marketRegime) {
    const regimeScore = marketRegime.scores;
    let multiplier = 1.0;
    
    // Check if strategy's preferred conditions are present
    strategy.marketConditions.forEach(condition => {
      switch (condition) {
        case 'low_iv':
          if (regimeScore.low_volatility > 20) multiplier += 0.2;
          break;
        case 'high_iv':
          if (regimeScore.high_volatility > 20) multiplier += 0.2;
          break;
        case 'trending_market':
          if (regimeScore.trending_bullish > 20 || regimeScore.trending_bearish > 20) multiplier += 0.15;
          break;
        case 'squeeze_setup':
          if (regimeScore.volatility_expansion > 15) multiplier += 0.25;
          break;
        case 'momentum_breakout':
          if (regimeScore.momentum_breakout > 20) multiplier += 0.3;
          break;
        case 'sideways_market':
          if (regimeScore.range_bound > 25) multiplier += 0.2;
          break;
      }
    });
    
    return Math.max(0.5, Math.min(1.5, multiplier));
  }

  // 🎲 Calculate risk concentration multiplier
  calculateRiskMultiplier(strategy, portfolioContext) {
    if (!portfolioContext || !portfolioContext.activeTrades) return 1.0;
    
    // Count how many active trades are from this strategy group
    const activeInGroup = portfolioContext.activeTrades.filter(trade => 
      strategy.strategies.includes(trade.strategyKey || trade.strategy?.toLowerCase())
    ).length;
    
    const totalActive = portfolioContext.activeTrades.length;
    
    if (totalActive === 0) return 1.0;
    
    const concentrationRatio = activeInGroup / totalActive;
    
    // Reduce weight if over-concentrated (>40%)
    if (concentrationRatio > 0.4) {
      return 0.6; // Significant reduction
    } else if (concentrationRatio > 0.25) {
      return 0.8; // Moderate reduction
    }
    
    return 1.0; // No adjustment
  }

  // ⚖️ Normalize weights to sum to 1.0
  normalizeWeights() {
    const totalWeight = Object.values(this.strategies).reduce((sum, strategy) => 
      sum + strategy.currentWeight, 0);
    
    Object.keys(this.strategies).forEach(key => {
      this.strategies[key].currentWeight /= totalWeight;
    });
  }

  // 🎯 Generate weighted recommendations
  generateWeightedRecommendations(availableStrategies, marketRegime, portfolioContext) {
    const weightedRecommendations = [];
    
    console.log(`🎯 Processing ${availableStrategies.length} available strategies:`, 
      availableStrategies.map(s => s.strategy || s.strategyKey));
    
    // Group strategies by ensemble category
    Object.keys(this.strategies).forEach(groupKey => {
      const group = this.strategies[groupKey];
      
      // Filter available strategies that belong to this group
      const groupStrategies = availableStrategies.filter(strategy => {
        const strategyName = (strategy.strategy || strategy.strategyKey || '').toLowerCase().replace(/\s+/g, '');
        const strategyType = strategy.strategy || strategy.strategyKey || '';
        
        return group.strategies.some(groupStrategy => {
          const groupStrategyClean = groupStrategy.toLowerCase().replace(/\s+/g, '');
          
          // Direct matching
          if (strategyName.includes(groupStrategyClean) || groupStrategyClean.includes(strategyName)) {
            return true;
          }
          
          // Specific strategy mappings
          if (groupStrategy === 'straddle' && (strategyType.toLowerCase().includes('straddle'))) return true;
          if (groupStrategy === 'strangle' && (strategyType.toLowerCase().includes('strangle'))) return true;
          if (groupStrategy === 'ironCondor' && (strategyType.toLowerCase().includes('condor'))) return true;
          if (groupStrategy === 'callSpread' && (strategyType.toLowerCase().includes('call') && strategyType.toLowerCase().includes('spread'))) return true;
          if (groupStrategy === 'putSpread' && (strategyType.toLowerCase().includes('put') && strategyType.toLowerCase().includes('spread'))) return true;
          if (groupStrategy === 'ironButterfly' && (strategyType.toLowerCase().includes('butterfly'))) return true;
          if (groupStrategy === 'shortStrangle' && (strategyType.toLowerCase().includes('strangle'))) return true;
          if (groupStrategy === 'coveredCall' && (strategyType.toLowerCase().includes('covered'))) return true;
          if (groupStrategy === 'cashSecuredPut' && (strategyType.toLowerCase().includes('secured'))) return true;
          if (groupStrategy === 'collar' && (strategyType.toLowerCase().includes('collar'))) return true;
          if (groupStrategy === 'shortStraddle' && (strategyType.toLowerCase().includes('straddle'))) return true;
          if (groupStrategy === 'butterfly' && (strategyType.toLowerCase().includes('butterfly'))) return true;
          if (groupStrategy === 'calendar' && (strategyType.toLowerCase().includes('calendar'))) return true;
          if (groupStrategy === 'ratio' && (strategyType.toLowerCase().includes('ratio'))) return true;
          if (groupStrategy === 'backspread' && (strategyType.toLowerCase().includes('backspread'))) return true;
          if (groupStrategy === 'diagonal' && (strategyType.toLowerCase().includes('diagonal'))) return true;
          
          return false;
        });
      });
      
      console.log(`📊 Group "${group.name}": Found ${groupStrategies.length} matching strategies:`, 
        groupStrategies.map(s => s.strategy || s.strategyKey));
      
      if (groupStrategies.length === 0) return;
      
      // Calculate how many strategies to select from this group
      const targetCount = Math.ceil(group.currentWeight * 10); // Scale to reasonable numbers
      
      // Sort group strategies by AI score and select top performers
      const selectedStrategies = groupStrategies
        .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
        .slice(0, Math.max(1, targetCount));
      
      // Add ensemble metadata to each selected strategy
      selectedStrategies.forEach(strategy => {
        weightedRecommendations.push({
          ...strategy,
          ensembleGroup: group.name,
          ensembleWeight: group.currentWeight,
          groupRank: selectedStrategies.indexOf(strategy) + 1,
          totalInGroup: selectedStrategies.length,
          ensembleScore: this.calculateEnsembleScore(strategy, group, marketRegime)
        });
      });
    });
    
    return weightedRecommendations;
  }

  // 🎯 Calculate ensemble-enhanced score
  calculateEnsembleScore(strategy, group, marketRegime) {
    let ensembleScore = strategy.aiScore || 50;
    
    // Boost score based on ensemble weight
    ensembleScore += group.currentWeight * 30; // Up to +12 points
    
    // Market regime alignment bonus
    const regimeAlignment = this.assessRegimeAlignment(group, marketRegime);
    ensembleScore += regimeAlignment * 20; // Up to +20 points
    
    // Performance history bonus
    const { wins, losses } = group.performance;
    if (wins + losses > 0) {
      const winRate = wins / (wins + losses);
      ensembleScore += (winRate - 0.5) * 40; // ±20 points based on win rate
    }
    
    return Math.max(0, Math.min(100, Math.round(ensembleScore)));
  }

  // 🎯 Assess how well group aligns with current market regime
  assessRegimeAlignment(group, marketRegime) {
    let alignmentScore = 0;
    const regimeScores = marketRegime.scores;
    
    group.marketConditions.forEach(condition => {
      switch (condition) {
        case 'low_iv':
          alignmentScore += regimeScores.low_volatility / 100;
          break;
        case 'high_iv':
          alignmentScore += regimeScores.high_volatility / 100;
          break;
        case 'trending_market':
          alignmentScore += Math.max(regimeScores.trending_bullish, regimeScores.trending_bearish) / 100;
          break;
        case 'squeeze_setup':
          alignmentScore += regimeScores.volatility_expansion / 100;
          break;
        case 'momentum_breakout':
          alignmentScore += regimeScores.momentum_breakout / 100;
          break;
        case 'sideways_market':
          alignmentScore += regimeScores.range_bound / 100;
          break;
      }
    });
    
    return alignmentScore / group.marketConditions.length; // Normalize by number of conditions
  }

  // 🎯 Apply portfolio-level optimization
  applyPortfolioOptimization(recommendations, portfolioContext) {
    // Sort by ensemble score
    const optimized = recommendations.sort((a, b) => (b.ensembleScore || 0) - (a.ensembleScore || 0));
    
    // Apply diversification constraints
    const diversified = this.applyDiversificationConstraints(optimized, portfolioContext);
    
    // Add portfolio allocation suggestions
    return diversified.map(rec => ({
      ...rec,
      portfolioAllocation: this.calculatePortfolioAllocation(rec, diversified.length),
      diversificationNote: this.generateDiversificationNote(rec)
    }));
  }

  // 🎲 Apply diversification constraints
  applyDiversificationConstraints(recommendations, portfolioContext) {
    const maxPerGroup = Math.ceil(recommendations.length / Object.keys(this.strategies).length * 1.5);
    const groupCounts = {};
    
    return recommendations.filter(rec => {
      const group = rec.ensembleGroup;
      groupCounts[group] = (groupCounts[group] || 0) + 1;
      return groupCounts[group] <= maxPerGroup;
    });
  }

  // 💼 Calculate suggested portfolio allocation
  calculatePortfolioAllocation(recommendation, totalRecommendations) {
    const baseAllocation = 1 / totalRecommendations;
    const weightMultiplier = recommendation.ensembleWeight || 0.2;
    const scoreMultiplier = (recommendation.ensembleScore || 50) / 100;
    
    return Math.round((baseAllocation * weightMultiplier * scoreMultiplier * 100) * 100) / 100;
  }

  // 📝 Generate diversification note
  generateDiversificationNote(recommendation) {
    const group = recommendation.ensembleGroup;
    const weight = (recommendation.ensembleWeight * 100).toFixed(1);
    
    return `${group} strategy (${weight}% ensemble weight) - Rank #${recommendation.groupRank} in group`;
  }

  // 📊 Update portfolio metrics
  updatePortfolioMetrics(recommendations) {
    // Calculate diversification score
    const groupDistribution = {};
    recommendations.forEach(rec => {
      groupDistribution[rec.ensembleGroup] = (groupDistribution[rec.ensembleGroup] || 0) + 1;
    });
    
    const totalRecs = recommendations.length;
    const groupCount = Object.keys(groupDistribution).length;
    const maxGroupSize = Math.max(...Object.values(groupDistribution));
    
    this.portfolioMetrics.diversificationScore = Math.round(
      (groupCount / Object.keys(this.strategies).length) * 
      (1 - (maxGroupSize / totalRecs)) * 100
    );
    
    this.portfolioMetrics.totalAllocated = totalRecs;
    this.portfolioMetrics.riskConcentration = Math.round((maxGroupSize / totalRecs) * 100);
  }

  // ⚖️ Check if rebalancing is needed
  checkRebalanceSignals() {
    const signals = [];
    
    Object.keys(this.strategies).forEach(key => {
      const strategy = this.strategies[key];
      const drift = Math.abs(strategy.currentWeight - strategy.baseWeight);
      
      if (drift > this.rebalanceRules.rebalanceThreshold) {
        signals.push({
          strategy: strategy.name,
          drift: (drift * 100).toFixed(1),
          currentWeight: (strategy.currentWeight * 100).toFixed(1),
          baseWeight: (strategy.baseWeight * 100).toFixed(1),
          action: strategy.currentWeight > strategy.baseWeight ? 'REDUCE' : 'INCREASE'
        });
      }
    });
    
    return signals;
  }

  // 📈 Record strategy performance (called when trades are closed)
  recordStrategyPerformance(strategyKey, isWin, returnPercent) {
    // Find which ensemble group this strategy belongs to
    const group = Object.values(this.strategies).find(group => 
      group.strategies.some(strategy => 
        strategyKey.toLowerCase().includes(strategy)
      )
    );
    
    if (group) {
      if (isWin) {
        group.performance.wins++;
      } else {
        group.performance.losses++;
      }
      group.performance.totalReturn += returnPercent;
      
      console.log(`📊 Strategy performance recorded: ${group.name} - ${isWin ? 'WIN' : 'LOSS'} (${returnPercent.toFixed(2)}%)`);
    }
  }

  // 📊 Get current ensemble weights
  getCurrentWeights() {
    const weights = {};
    Object.keys(this.strategies).forEach(key => {
      weights[this.strategies[key].name] = {
        current: (this.strategies[key].currentWeight * 100).toFixed(1),
        base: (this.strategies[key].baseWeight * 100).toFixed(1),
        performance: this.strategies[key].performance
      };
    });
    return weights;
  }

  // 🔄 Reset weights to base allocation
  resetWeights() {
    Object.keys(this.strategies).forEach(key => {
      this.strategies[key].currentWeight = this.strategies[key].baseWeight;
    });
  }

  // 📊 Get ensemble summary
  getEnsembleSummary() {
    return {
      strategies: Object.keys(this.strategies).length,
      totalTrades: Object.values(this.strategies).reduce((sum, s) => 
        sum + s.performance.wins + s.performance.losses, 0),
      overallWinRate: this.calculateOverallWinRate(),
      diversificationScore: this.portfolioMetrics.diversificationScore,
      activeRebalanceSignals: this.checkRebalanceSignals().length
    };
  }

  // 📈 Calculate overall ensemble win rate
  calculateOverallWinRate() {
    let totalWins = 0;
    let totalTrades = 0;
    
    Object.values(this.strategies).forEach(strategy => {
      totalWins += strategy.performance.wins;
      totalTrades += strategy.performance.wins + strategy.performance.losses;
    });
    
    return totalTrades > 0 ? (totalWins / totalTrades * 100).toFixed(1) : '0.0';
  }
}

export default MultiStrategyEnsemble;