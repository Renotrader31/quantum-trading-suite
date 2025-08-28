// 🛡️ PRIORITY #3: Advanced Portfolio Risk Management System
// Real-time risk monitoring, position sizing, and portfolio optimization

export class AdvancedRiskManager {
  constructor() {
    this.riskThresholds = {
      maxSectorConcentration: 0.35, // Max 35% in any sector
      maxStrategyConcentration: 0.40, // Max 40% in any strategy type
      maxSinglePositionSize: 0.15, // Max 15% in single position
      maxCorrelation: 0.70, // Max 70% correlation between positions
      maxGammaExposure: 50000, // Maximum gamma exposure
      maxThetaDecay: -500, // Maximum daily theta decay
      maxVegaRisk: 10000, // Maximum vega exposure
      criticalDTE: 7, // Alert when positions have < 7 DTE
      maxDrawdown: 0.20 // Maximum 20% portfolio drawdown
    };

    this.alertLevels = {
      LOW: { color: 'yellow', threshold: 0.7 },
      MEDIUM: { color: 'orange', threshold: 0.85 },
      HIGH: { color: 'red', threshold: 1.0 }
    };

    this.riskMetrics = {
      portfolioValue: 0,
      totalExposure: 0,
      availableCash: 0,
      unrealizedPnL: 0,
      dailyPnL: 0,
      maxDrawdownCurrent: 0,
      sharpeRatio: 0,
      volatility: 0,
      beta: 1.0
    };
  }

  // 📊 Calculate comprehensive portfolio risk assessment
  async calculatePortfolioRisk(positions, marketData = {}) {
    console.log('🛡️ Calculating comprehensive portfolio risk assessment...');
    
    const riskAssessment = {
      timestamp: new Date().toISOString(),
      overallRiskScore: 0,
      riskLevel: 'LOW',
      alerts: [],
      concentrationRisks: {},
      greekRisks: {},
      positionRisks: [],
      recommendations: []
    };

    if (!positions || positions.length === 0) {
      return { ...riskAssessment, riskLevel: 'NONE', overallRiskScore: 0 };
    }

    // 1. Calculate concentration risks
    const concentrationRisks = this.calculateConcentrationRisks(positions);
    riskAssessment.concentrationRisks = concentrationRisks;

    // 2. Calculate Greeks exposure
    const greekRisks = this.calculateGreekRisks(positions);
    riskAssessment.greekRisks = greekRisks;

    // 3. Analyze individual position risks
    const positionRisks = positions.map(pos => this.analyzePositionRisk(pos, marketData));
    riskAssessment.positionRisks = positionRisks;

    // 4. Calculate correlation risks
    const correlationRisks = this.calculateCorrelationRisks(positions, marketData);
    riskAssessment.correlationRisks = correlationRisks;

    // 5. Time decay analysis
    const timeRisks = this.calculateTimeDecayRisks(positions);
    riskAssessment.timeRisks = timeRisks;

    // 6. Generate alerts and recommendations
    riskAssessment.alerts = this.generateRiskAlerts(riskAssessment);
    riskAssessment.recommendations = this.generateRecommendations(riskAssessment);

    // 7. Calculate overall risk score (0-100)
    riskAssessment.overallRiskScore = this.calculateOverallRiskScore(riskAssessment);
    riskAssessment.riskLevel = this.determineRiskLevel(riskAssessment.overallRiskScore);

    console.log(`🛡️ Portfolio risk assessment complete: ${riskAssessment.riskLevel} (${riskAssessment.overallRiskScore}/100)`);
    
    return riskAssessment;
  }

  // 🎯 Calculate concentration risks by sector, strategy, position size
  calculateConcentrationRisks(positions) {
    const concentrations = {
      bySector: {},
      byStrategy: {},
      bySymbol: {},
      largestPositions: []
    };

    const totalValue = positions.reduce((sum, pos) => sum + Math.abs(pos.currentValue || pos.positionSize || 0), 0);

    if (totalValue === 0) return concentrations;

    // Sector concentration
    positions.forEach(pos => {
      const sector = pos.sector || 'Unknown';
      const value = Math.abs(pos.currentValue || pos.positionSize || 0);
      const percentage = value / totalValue;

      if (!concentrations.bySector[sector]) {
        concentrations.bySector[sector] = { value: 0, percentage: 0, positions: 0 };
      }
      concentrations.bySector[sector].value += value;
      concentrations.bySector[sector].percentage += percentage;
      concentrations.bySector[sector].positions += 1;
    });

    // Strategy concentration
    positions.forEach(pos => {
      const strategy = pos.strategyName || pos.strategy || 'Unknown';
      const value = Math.abs(pos.currentValue || pos.positionSize || 0);
      const percentage = value / totalValue;

      if (!concentrations.byStrategy[strategy]) {
        concentrations.byStrategy[strategy] = { value: 0, percentage: 0, positions: 0 };
      }
      concentrations.byStrategy[strategy].value += value;
      concentrations.byStrategy[strategy].percentage += percentage;
      concentrations.byStrategy[strategy].positions += 1;
    });

    // Symbol concentration
    positions.forEach(pos => {
      const symbol = pos.symbol || 'Unknown';
      const value = Math.abs(pos.currentValue || pos.positionSize || 0);
      const percentage = value / totalValue;

      concentrations.bySymbol[symbol] = { value, percentage };
    });

    // Largest positions
    concentrations.largestPositions = positions
      .map(pos => ({
        symbol: pos.symbol,
        strategy: pos.strategyName || pos.strategy,
        value: Math.abs(pos.currentValue || pos.positionSize || 0),
        percentage: Math.abs(pos.currentValue || pos.positionSize || 0) / totalValue
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    return concentrations;
  }

  // ⚡ Calculate Greeks exposure risks
  calculateGreekRisks(positions) {
    const greeks = {
      totalDelta: 0,
      totalGamma: 0,
      totalTheta: 0,
      totalVega: 0,
      netExposure: 0,
      deltaHedgeRatio: 0
    };

    positions.forEach(pos => {
      // Estimate Greeks based on position type (simplified calculation)
      const positionValue = pos.currentValue || pos.positionSize || 0;
      const isCall = pos.strategyName?.toLowerCase().includes('call');
      const isPut = pos.strategyName?.toLowerCase().includes('put');
      const dte = pos.dte || this.calculateDTE(pos.expirationDate);

      if (isCall || isPut) {
        // Simplified Greek estimates (in production, would use Black-Scholes)
        const deltaSign = isCall ? 1 : -1;
        greeks.totalDelta += positionValue * 0.5 * deltaSign; // Approximate ATM delta
        greeks.totalGamma += Math.abs(positionValue) * 0.02; // Approximate gamma
        greeks.totalTheta += -Math.abs(positionValue) * 0.05 / Math.max(dte, 1); // Time decay
        greeks.totalVega += Math.abs(positionValue) * 0.1; // Volatility sensitivity
      }
    });

    greeks.netExposure = Math.abs(greeks.totalDelta);
    greeks.deltaHedgeRatio = greeks.netExposure / Math.max(1, positions.length);

    return greeks;
  }

  // 🔍 Analyze individual position risk
  analyzePositionRisk(position, marketData) {
    const dte = this.calculateDTE(position.expirationDate);
    const positionValue = Math.abs(position.currentValue || position.positionSize || 0);
    
    const risks = {
      symbol: position.symbol,
      strategy: position.strategyName || position.strategy,
      riskScore: 0,
      riskFactors: [],
      alerts: []
    };

    // Time decay risk
    if (dte <= this.riskThresholds.criticalDTE) {
      risks.riskFactors.push('CRITICAL_TIME_DECAY');
      risks.alerts.push(`⏰ ${position.symbol}: ${dte} days to expiration`);
      risks.riskScore += 30;
    } else if (dte <= 14) {
      risks.riskFactors.push('HIGH_TIME_DECAY');
      risks.riskScore += 15;
    }

    // Position size risk
    const portfolioTotal = 100000; // Would calculate from actual portfolio
    const positionPercentage = positionValue / portfolioTotal;
    
    if (positionPercentage > this.riskThresholds.maxSinglePositionSize) {
      risks.riskFactors.push('OVERSIZED_POSITION');
      risks.alerts.push(`📊 ${position.symbol}: ${(positionPercentage * 100).toFixed(1)}% of portfolio`);
      risks.riskScore += 25;
    }

    // Volatility risk
    const marketEntry = marketData[position.symbol];
    if (marketEntry && marketEntry.impliedVolatility > 0.5) {
      risks.riskFactors.push('HIGH_VOLATILITY');
      risks.riskScore += 20;
    }

    // Liquidity risk
    if (position.liquidityScore && position.liquidityScore < 70) {
      risks.riskFactors.push('LOW_LIQUIDITY');
      risks.riskScore += 15;
    }

    // P&L risk
    const unrealizedPnL = position.unrealizedPnL || 0;
    const maxLoss = position.maxLoss || -1000;
    
    if (unrealizedPnL < maxLoss * 0.8) {
      risks.riskFactors.push('APPROACHING_MAX_LOSS');
      risks.alerts.push(`🚨 ${position.symbol}: Near maximum loss threshold`);
      risks.riskScore += 35;
    }

    risks.riskScore = Math.min(100, risks.riskScore);
    return risks;
  }

  // 🔗 Calculate correlation risks between positions
  calculateCorrelationRisks(positions, marketData) {
    const correlations = {
      highCorrelationPairs: [],
      sectorOverlap: {},
      diversificationScore: 0
    };

    // Simplified correlation analysis based on sector and strategy
    const sectors = {};
    positions.forEach(pos => {
      const sector = pos.sector || 'Unknown';
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push(pos);
    });

    // Find high correlation pairs (same sector + similar strategy)
    Object.values(sectors).forEach(sectorPositions => {
      if (sectorPositions.length > 1) {
        for (let i = 0; i < sectorPositions.length; i++) {
          for (let j = i + 1; j < sectorPositions.length; j++) {
            const pos1 = sectorPositions[i];
            const pos2 = sectorPositions[j];
            
            // Calculate estimated correlation
            let correlation = 0.6; // Base sector correlation
            
            if (pos1.strategy === pos2.strategy) correlation += 0.2;
            if (Math.abs((pos1.dte || 30) - (pos2.dte || 30)) < 7) correlation += 0.1;
            
            if (correlation >= this.riskThresholds.maxCorrelation) {
              correlations.highCorrelationPairs.push({
                position1: pos1.symbol,
                position2: pos2.symbol,
                estimatedCorrelation: correlation,
                riskLevel: correlation > 0.8 ? 'HIGH' : 'MEDIUM'
              });
            }
          }
        }
      }
    });

    // Calculate diversification score
    const sectorCount = Object.keys(sectors).length;
    const strategyTypes = [...new Set(positions.map(p => p.strategy))].length;
    correlations.diversificationScore = Math.min(100, (sectorCount * 15) + (strategyTypes * 10));

    return correlations;
  }

  // ⏰ Calculate time decay risks
  calculateTimeDecayRisks(positions) {
    const timeRisks = {
      criticalPositions: [],
      weeklyThetaDecay: 0,
      averageDTE: 0,
      expirationCalendar: {}
    };

    let totalDTE = 0;
    let totalTheta = 0;

    positions.forEach(pos => {
      const dte = this.calculateDTE(pos.expirationDate);
      totalDTE += dte;
      
      // Estimate theta decay
      const positionValue = Math.abs(pos.currentValue || pos.positionSize || 0);
      const estimatedTheta = -positionValue * 0.05 / Math.max(dte, 1);
      totalTheta += estimatedTheta;

      if (dte <= this.riskThresholds.criticalDTE) {
        timeRisks.criticalPositions.push({
          symbol: pos.symbol,
          strategy: pos.strategy,
          dte: dte,
          estimatedTheta: estimatedTheta,
          riskLevel: dte <= 3 ? 'CRITICAL' : 'HIGH'
        });
      }

      // Expiration calendar
      const expirationDate = pos.expirationDate || new Date(Date.now() + dte * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (!timeRisks.expirationCalendar[expirationDate]) {
        timeRisks.expirationCalendar[expirationDate] = [];
      }
      timeRisks.expirationCalendar[expirationDate].push({
        symbol: pos.symbol,
        strategy: pos.strategy,
        value: positionValue
      });
    });

    timeRisks.averageDTE = positions.length > 0 ? totalDTE / positions.length : 0;
    timeRisks.weeklyThetaDecay = totalTheta * 7; // Weekly theta exposure

    return timeRisks;
  }

  // 🚨 Generate risk alerts based on thresholds
  generateRiskAlerts(riskAssessment) {
    const alerts = [];

    // Concentration alerts
    Object.entries(riskAssessment.concentrationRisks.bySector || {}).forEach(([sector, data]) => {
      if (data.percentage > this.riskThresholds.maxSectorConcentration) {
        alerts.push({
          type: 'SECTOR_CONCENTRATION',
          level: 'HIGH',
          message: `🏭 High sector concentration: ${(data.percentage * 100).toFixed(1)}% in ${sector}`,
          recommendation: 'Consider diversifying across sectors'
        });
      }
    });

    Object.entries(riskAssessment.concentrationRisks.byStrategy || {}).forEach(([strategy, data]) => {
      if (data.percentage > this.riskThresholds.maxStrategyConcentration) {
        alerts.push({
          type: 'STRATEGY_CONCENTRATION',
          level: 'MEDIUM',
          message: `📊 High strategy concentration: ${(data.percentage * 100).toFixed(1)}% in ${strategy}`,
          recommendation: 'Consider diversifying strategy types'
        });
      }
    });

    // Greeks alerts
    if (Math.abs(riskAssessment.greekRisks?.totalGamma || 0) > this.riskThresholds.maxGammaExposure) {
      alerts.push({
        type: 'GAMMA_EXPOSURE',
        level: 'HIGH',
        message: `⚡ High gamma exposure: ${Math.abs(riskAssessment.greekRisks.totalGamma).toFixed(0)}`,
        recommendation: 'Consider delta hedging or reducing gamma exposure'
      });
    }

    if ((riskAssessment.greekRisks?.totalTheta || 0) < this.riskThresholds.maxThetaDecay) {
      alerts.push({
        type: 'THETA_DECAY',
        level: 'MEDIUM',
        message: `⏰ High theta decay: $${Math.abs(riskAssessment.greekRisks.totalTheta).toFixed(0)}/day`,
        recommendation: 'Monitor time decay closely, consider rolling positions'
      });
    }

    // Time-based alerts
    if (riskAssessment.timeRisks?.criticalPositions?.length > 0) {
      alerts.push({
        type: 'EXPIRATION_WARNING',
        level: 'HIGH',
        message: `📅 ${riskAssessment.timeRisks.criticalPositions.length} positions expiring within ${this.riskThresholds.criticalDTE} days`,
        recommendation: 'Plan exit strategy or roll positions'
      });
    }

    return alerts;
  }

  // 💡 Generate actionable recommendations
  generateRecommendations(riskAssessment) {
    const recommendations = [];
    const riskScore = riskAssessment.overallRiskScore;

    if (riskScore > 80) {
      recommendations.push({
        priority: 'HIGH',
        action: 'REDUCE_RISK',
        message: 'Portfolio risk is critically high - consider closing highest-risk positions',
        impact: 'Protect capital from major losses'
      });
    } else if (riskScore > 60) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'HEDGE_EXPOSURE',
        message: 'Consider adding hedge positions to reduce directional risk',
        impact: 'Lower portfolio volatility'
      });
    } else if (riskScore < 30) {
      recommendations.push({
        priority: 'LOW',
        action: 'INCREASE_EXPOSURE',
        message: 'Portfolio risk is low - consider adding selective positions',
        impact: 'Potentially increase returns'
      });
    }

    // Diversification recommendations
    const diversificationScore = riskAssessment.correlationRisks?.diversificationScore || 0;
    if (diversificationScore < 50) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'DIVERSIFY',
        message: 'Improve diversification across sectors and strategies',
        impact: 'Reduce correlation risk and improve risk-adjusted returns'
      });
    }

    return recommendations;
  }

  // 📊 Calculate Kelly Criterion optimal position size
  calculateKellyCriterion(winRate, avgWin, avgLoss, portfolioValue) {
    // Kelly Formula: f = (bp - q) / b
    // Where: b = odds (avgWin/avgLoss), p = win rate, q = loss rate
    
    if (avgLoss === 0 || winRate <= 0 || winRate >= 1) return 0;
    
    const odds = Math.abs(avgWin / avgLoss);
    const lossRate = 1 - winRate;
    
    const kellyFraction = (odds * winRate - lossRate) / odds;
    
    // Cap Kelly fraction at reasonable limits (max 25% of portfolio)
    const cappedKelly = Math.max(0, Math.min(0.25, kellyFraction));
    
    return cappedKelly * portfolioValue;
  }

  // 📏 Calculate volatility-based position sizing
  calculateVolatilityBasedSize(baseSize, impliedVolatility, targetVolatility = 0.25) {
    const volAdjustment = targetVolatility / Math.max(impliedVolatility, 0.1);
    return baseSize * Math.max(0.25, Math.min(2.0, volAdjustment));
  }

  // 🎯 Determine overall risk level
  determineRiskLevel(riskScore) {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    if (riskScore >= 20) return 'LOW';
    return 'MINIMAL';
  }

  // 📊 Calculate overall risk score (0-100)
  calculateOverallRiskScore(riskAssessment) {
    let score = 0;
    
    // Concentration risk (30% of total score)
    const maxSectorConc = Math.max(...Object.values(riskAssessment.concentrationRisks.bySector || {}).map(s => s.percentage || 0));
    score += Math.min(30, maxSectorConc / this.riskThresholds.maxSectorConcentration * 30);
    
    // Greeks risk (25% of total score)
    const gammaRisk = Math.abs(riskAssessment.greekRisks?.totalGamma || 0) / this.riskThresholds.maxGammaExposure * 25;
    score += Math.min(25, gammaRisk);
    
    // Time risk (20% of total score)
    const criticalPositions = riskAssessment.timeRisks?.criticalPositions?.length || 0;
    score += Math.min(20, criticalPositions * 5);
    
    // Correlation risk (15% of total score)
    const correlationPairs = riskAssessment.correlationRisks?.highCorrelationPairs?.length || 0;
    score += Math.min(15, correlationPairs * 3);
    
    // Position-specific risks (10% of total score)
    const avgPositionRisk = riskAssessment.positionRisks?.reduce((sum, pos) => sum + pos.riskScore, 0) / Math.max(1, riskAssessment.positionRisks?.length || 1);
    score += Math.min(10, avgPositionRisk / 10);
    
    return Math.round(Math.min(100, score));
  }

  // 📅 Calculate days to expiration
  calculateDTE(expirationDate) {
    if (!expirationDate) return 30; // Default assumption
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const timeDiff = expDate.getTime() - today.getTime();
    
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }

  // 🎨 Generate portfolio heat map data
  generatePortfolioHeatMap(positions) {
    const heatMapData = {
      sectors: {},
      strategies: {},
      riskLevels: {},
      timeToExpiration: {}
    };

    positions.forEach(pos => {
      const value = Math.abs(pos.currentValue || pos.positionSize || 0);
      const sector = pos.sector || 'Unknown';
      const strategy = pos.strategyName || pos.strategy || 'Unknown';
      const dte = this.calculateDTE(pos.expirationDate);
      const posRisk = this.analyzePositionRisk(pos);

      // Sector heat map
      if (!heatMapData.sectors[sector]) {
        heatMapData.sectors[sector] = { value: 0, count: 0, riskScore: 0 };
      }
      heatMapData.sectors[sector].value += value;
      heatMapData.sectors[sector].count += 1;
      heatMapData.sectors[sector].riskScore = Math.max(heatMapData.sectors[sector].riskScore, posRisk.riskScore);

      // Strategy heat map
      if (!heatMapData.strategies[strategy]) {
        heatMapData.strategies[strategy] = { value: 0, count: 0, riskScore: 0 };
      }
      heatMapData.strategies[strategy].value += value;
      heatMapData.strategies[strategy].count += 1;
      heatMapData.strategies[strategy].riskScore = Math.max(heatMapData.strategies[strategy].riskScore, posRisk.riskScore);

      // Time buckets
      const timeBucket = dte <= 7 ? 'Critical' : dte <= 21 ? 'Short' : dte <= 45 ? 'Medium' : 'Long';
      if (!heatMapData.timeToExpiration[timeBucket]) {
        heatMapData.timeToExpiration[timeBucket] = { value: 0, count: 0, avgDTE: 0 };
      }
      heatMapData.timeToExpiration[timeBucket].value += value;
      heatMapData.timeToExpiration[timeBucket].count += 1;
      heatMapData.timeToExpiration[timeBucket].avgDTE = (heatMapData.timeToExpiration[timeBucket].avgDTE + dte) / 2;
    });

    return heatMapData;
  }
}

export default AdvancedRiskManager;