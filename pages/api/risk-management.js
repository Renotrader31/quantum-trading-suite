// 🛡️ Advanced Risk Management API
// Real-time portfolio risk assessment and monitoring

console.log('\n=== RISK MANAGEMENT API STARTUP ===');

export default async function handler(req, res) {
  console.log('\n=== RISK MANAGEMENT REQUEST ===');
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
    const { 
      action,
      positions = [],
      marketData = {},
      portfolioValue = 100000,
      riskProfile = 'moderate'
    } = req.body;

    console.log(`🛡️ Risk Management Action: ${action}`);
    console.log(`📊 Analyzing ${positions.length} positions`);

    // Create simplified risk manager (inline to avoid import issues)
    const riskManager = createRiskManager();

    switch (action) {
      case 'assessPortfolioRisk':
        const riskAssessment = await riskManager.calculatePortfolioRisk(positions, marketData);
        
        console.log(`🛡️ Risk Assessment Complete: ${riskAssessment.riskLevel} (${riskAssessment.overallRiskScore}/100)`);
        
        return res.json({
          success: true,
          riskAssessment,
          timestamp: new Date().toISOString()
        });

      case 'calculatePositionSize':
        const { winRate, avgWin, avgLoss, impliedVolatility = 0.25 } = req.body;
        const kellySize = riskManager.calculateKellyCriterion(winRate, avgWin, avgLoss, portfolioValue);
        const volAdjustedSize = riskManager.calculateVolatilityBasedSize(kellySize, impliedVolatility);
        
        // Calculate additional metrics
        const kellyPercentage = (kellySize / portfolioValue) * 100;
        const recommendedSize = volAdjustedSize || kellySize;
        const maxLoss = recommendedSize * (avgLoss || 0.05); // Default 5% max loss
        
        // Determine risk level
        let riskLevel = 'LOW';
        if (kellyPercentage > 20) riskLevel = 'HIGH';
        else if (kellyPercentage > 10) riskLevel = 'MEDIUM';
        
        return res.json({
          success: true,
          positionSize: {
            kellyOptimal: kellySize,
            volatilityAdjusted: volAdjustedSize,
            optimalSize: recommendedSize,
            kellyPercentage,
            maxLoss,
            riskLevel,
            riskPercentage: (recommendedSize / portfolioValue * 100).toFixed(2) + '%'
          }
        });

      case 'generateHeatMap':
        const heatMapData = riskManager.generatePortfolioHeatMap(positions);
        
        return res.json({
          success: true,
          heatMap: heatMapData,
          timestamp: new Date().toISOString()
        });

      case 'getLiveAlerts':
        const riskAssessmentForAlerts = await riskManager.calculatePortfolioRisk(positions, marketData);
        
        return res.json({
          success: true,
          alerts: riskAssessmentForAlerts.alerts,
          recommendations: riskAssessmentForAlerts.recommendations,
          riskLevel: riskAssessmentForAlerts.riskLevel,
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unknown action. Available actions: assessPortfolioRisk, calculatePositionSize, generateHeatMap, getLiveAlerts' 
        });
    }

  } catch (error) {
    console.error('❌ Risk Management error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Simplified risk manager implementation (inline to avoid import issues)
function createRiskManager() {
  const riskThresholds = {
    maxSectorConcentration: 0.35,
    maxStrategyConcentration: 0.40,
    maxSinglePositionSize: 0.15,
    maxCorrelation: 0.70,
    maxGammaExposure: 50000,
    maxThetaDecay: -500,
    criticalDTE: 7,
    maxDrawdown: 0.20
  };

  return {
    async calculatePortfolioRisk(positions, marketData = {}) {
      const riskAssessment = {
        timestamp: new Date().toISOString(),
        overallRiskScore: 0,
        riskLevel: 'LOW',
        alerts: [],
        concentrationRisks: {},
        greekRisks: {},
        positionRisks: [],
        timeRisks: {},
        correlationRisks: {},
        recommendations: []
      };

      if (!positions || positions.length === 0) {
        return { ...riskAssessment, riskLevel: 'NONE', overallRiskScore: 0 };
      }

      // Calculate concentration risks
      riskAssessment.concentrationRisks = calculateConcentrationRisks(positions);
      
      // Calculate Greeks exposure
      riskAssessment.greekRisks = calculateGreekRisks(positions);
      
      // Analyze individual positions
      riskAssessment.positionRisks = positions.map(pos => analyzePositionRisk(pos, marketData));
      
      // Time decay analysis
      riskAssessment.timeRisks = calculateTimeDecayRisks(positions);
      
      // Correlation analysis
      riskAssessment.correlationRisks = calculateCorrelationRisks(positions);
      
      // Generate alerts
      riskAssessment.alerts = generateRiskAlerts(riskAssessment);
      
      // Generate recommendations
      riskAssessment.recommendations = generateRecommendations(riskAssessment);
      
      // Calculate overall score
      riskAssessment.overallRiskScore = calculateOverallRiskScore(riskAssessment);
      riskAssessment.riskLevel = determineRiskLevel(riskAssessment.overallRiskScore);

      return riskAssessment;
    },

    calculateKellyCriterion(winRate, avgWin, avgLoss, portfolioValue) {
      if (avgLoss === 0 || winRate <= 0 || winRate >= 1) return 0;
      
      const odds = Math.abs(avgWin / avgLoss);
      const lossRate = 1 - winRate;
      const kellyFraction = (odds * winRate - lossRate) / odds;
      const cappedKelly = Math.max(0, Math.min(0.25, kellyFraction));
      
      return cappedKelly * portfolioValue;
    },

    calculateVolatilityBasedSize(baseSize, impliedVolatility, targetVolatility = 0.25) {
      const volAdjustment = targetVolatility / Math.max(impliedVolatility, 0.1);
      return baseSize * Math.max(0.25, Math.min(2.0, volAdjustment));
    },

    generatePortfolioHeatMap(positions) {
      const heatMapData = {
        sectors: {},
        strategies: {},
        timeToExpiration: {}
      };

      positions.forEach(pos => {
        const value = Math.abs(pos.currentValue || pos.positionSize || 0);
        const sector = pos.sector || 'Technology';
        const strategy = pos.strategyName || pos.strategy || 'Unknown';
        const dte = calculateDTE(pos.expirationDate);

        // Sector heat map
        if (!heatMapData.sectors[sector]) {
          heatMapData.sectors[sector] = { value: 0, count: 0, riskScore: 25 };
        }
        heatMapData.sectors[sector].value += value;
        heatMapData.sectors[sector].count += 1;

        // Strategy heat map
        if (!heatMapData.strategies[strategy]) {
          heatMapData.strategies[strategy] = { value: 0, count: 0, riskScore: 30 };
        }
        heatMapData.strategies[strategy].value += value;
        heatMapData.strategies[strategy].count += 1;

        // Time buckets
        const timeBucket = dte <= 7 ? 'Critical' : dte <= 21 ? 'Short' : dte <= 45 ? 'Medium' : 'Long';
        if (!heatMapData.timeToExpiration[timeBucket]) {
          heatMapData.timeToExpiration[timeBucket] = { value: 0, count: 0, avgDTE: dte };
        }
        heatMapData.timeToExpiration[timeBucket].value += value;
        heatMapData.timeToExpiration[timeBucket].count += 1;
      });

      return heatMapData;
    }
  };

  // Helper functions
  function calculateConcentrationRisks(positions) {
    const concentrations = {
      bySector: {},
      byStrategy: {},
      bySymbol: {}
    };

    const totalValue = positions.reduce((sum, pos) => sum + Math.abs(pos.currentValue || pos.positionSize || 1000), 0);

    positions.forEach(pos => {
      const sector = pos.sector || 'Technology';
      const strategy = pos.strategyName || pos.strategy || 'Unknown';
      const symbol = pos.symbol || 'Unknown';
      const value = Math.abs(pos.currentValue || pos.positionSize || 1000);
      const percentage = value / totalValue;

      // Sector concentration
      if (!concentrations.bySector[sector]) {
        concentrations.bySector[sector] = { value: 0, percentage: 0, positions: 0 };
      }
      concentrations.bySector[sector].value += value;
      concentrations.bySector[sector].percentage += percentage;
      concentrations.bySector[sector].positions += 1;

      // Strategy concentration  
      if (!concentrations.byStrategy[strategy]) {
        concentrations.byStrategy[strategy] = { value: 0, percentage: 0, positions: 0 };
      }
      concentrations.byStrategy[strategy].value += value;
      concentrations.byStrategy[strategy].percentage += percentage;
      concentrations.byStrategy[strategy].positions += 1;

      // Symbol concentration
      concentrations.bySymbol[symbol] = { value, percentage };
    });

    return concentrations;
  }

  function calculateGreekRisks(positions) {
    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;

    positions.forEach(pos => {
      const positionValue = Math.abs(pos.currentValue || pos.positionSize || 1000);
      const isCall = pos.strategyName?.toLowerCase().includes('call');
      const dte = calculateDTE(pos.expirationDate);

      if (isCall || pos.strategyName?.toLowerCase().includes('put')) {
        const deltaSign = isCall ? 1 : -1;
        totalDelta += positionValue * 0.5 * deltaSign;
        totalGamma += positionValue * 0.02;
        totalTheta += -positionValue * 0.05 / Math.max(dte, 1);
        totalVega += positionValue * 0.1;
      }
    });

    return {
      totalDelta,
      totalGamma,
      totalTheta,
      totalVega,
      netExposure: Math.abs(totalDelta)
    };
  }

  function calculateTimeDecayRisks(positions) {
    const criticalPositions = [];
    let weeklyThetaDecay = 0;

    positions.forEach(pos => {
      const dte = calculateDTE(pos.expirationDate);
      const positionValue = Math.abs(pos.currentValue || pos.positionSize || 1000);
      const estimatedTheta = -positionValue * 0.05 / Math.max(dte, 1);
      
      weeklyThetaDecay += estimatedTheta * 7;

      if (dte <= riskThresholds.criticalDTE) {
        criticalPositions.push({
          symbol: pos.symbol,
          strategy: pos.strategy,
          dte: dte,
          riskLevel: dte <= 3 ? 'CRITICAL' : 'HIGH'
        });
      }
    });

    return {
      criticalPositions,
      weeklyThetaDecay,
      averageDTE: positions.length > 0 ? 
        positions.reduce((sum, pos) => sum + calculateDTE(pos.expirationDate), 0) / positions.length : 0
    };
  }

  function calculateCorrelationRisks(positions) {
    const sectors = {};
    positions.forEach(pos => {
      const sector = pos.sector || 'Technology';
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push(pos);
    });

    const highCorrelationPairs = [];
    Object.values(sectors).forEach(sectorPositions => {
      if (sectorPositions.length > 1) {
        for (let i = 0; i < sectorPositions.length; i++) {
          for (let j = i + 1; j < sectorPositions.length; j++) {
            highCorrelationPairs.push({
              position1: sectorPositions[i].symbol,
              position2: sectorPositions[j].symbol,
              estimatedCorrelation: 0.75,
              riskLevel: 'MEDIUM'
            });
          }
        }
      }
    });

    const sectorCount = Object.keys(sectors).length;
    const strategyTypes = [...new Set(positions.map(p => p.strategy || p.strategyName))].length;

    return {
      highCorrelationPairs,
      diversificationScore: Math.min(100, (sectorCount * 15) + (strategyTypes * 10))
    };
  }

  function analyzePositionRisk(position, marketData) {
    const dte = calculateDTE(position.expirationDate);
    const positionValue = Math.abs(position.currentValue || position.positionSize || 1000);
    
    const risks = {
      symbol: position.symbol,
      strategy: position.strategyName || position.strategy,
      riskScore: 0,
      riskFactors: [],
      alerts: []
    };

    // Time decay risk
    if (dte <= riskThresholds.criticalDTE) {
      risks.riskFactors.push('CRITICAL_TIME_DECAY');
      risks.alerts.push(`⏰ ${position.symbol}: ${dte} days to expiration`);
      risks.riskScore += 30;
    }

    // Position size risk
    if (positionValue > 15000) { // Assume 15% of 100k portfolio
      risks.riskFactors.push('OVERSIZED_POSITION');
      risks.alerts.push(`📊 ${position.symbol}: Large position size`);
      risks.riskScore += 25;
    }

    // P&L risk
    const unrealizedPnL = position.unrealizedPnL || 0;
    if (unrealizedPnL < -800) {
      risks.riskFactors.push('APPROACHING_MAX_LOSS');
      risks.alerts.push(`🚨 ${position.symbol}: Significant unrealized loss`);
      risks.riskScore += 35;
    }

    return risks;
  }

  function generateRiskAlerts(riskAssessment) {
    const alerts = [];

    // Concentration alerts
    Object.entries(riskAssessment.concentrationRisks.bySector || {}).forEach(([sector, data]) => {
      if (data.percentage > riskThresholds.maxSectorConcentration) {
        alerts.push({
          type: 'SECTOR_CONCENTRATION',
          level: 'HIGH',
          message: `🏭 High sector concentration: ${(data.percentage * 100).toFixed(1)}% in ${sector}`,
          recommendation: 'Consider diversifying across sectors'
        });
      }
    });

    // Time-based alerts
    if (riskAssessment.timeRisks?.criticalPositions?.length > 0) {
      alerts.push({
        type: 'EXPIRATION_WARNING',
        level: 'HIGH',
        message: `📅 ${riskAssessment.timeRisks.criticalPositions.length} positions expiring soon`,
        recommendation: 'Plan exit strategy or roll positions'
      });
    }

    return alerts;
  }

  function generateRecommendations(riskAssessment) {
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

    return recommendations;
  }

  function calculateOverallRiskScore(riskAssessment) {
    let score = 0;
    
    // Concentration risk (40% of total)
    const maxSectorConc = Math.max(...Object.values(riskAssessment.concentrationRisks.bySector || {}).map(s => s.percentage || 0));
    score += Math.min(40, maxSectorConc / riskThresholds.maxSectorConcentration * 40);
    
    // Time risk (30% of total)
    const criticalPositions = riskAssessment.timeRisks?.criticalPositions?.length || 0;
    score += Math.min(30, criticalPositions * 10);
    
    // Position risks (30% of total)
    const avgPositionRisk = riskAssessment.positionRisks?.reduce((sum, pos) => sum + pos.riskScore, 0) / Math.max(1, riskAssessment.positionRisks?.length || 1);
    score += Math.min(30, avgPositionRisk * 0.3);
    
    return Math.round(Math.min(100, score));
  }

  function determineRiskLevel(riskScore) {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    if (riskScore >= 20) return 'LOW';
    return 'MINIMAL';
  }

  function calculateDTE(expirationDate) {
    if (!expirationDate) return 30;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const timeDiff = expDate.getTime() - today.getTime();
    
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }
}

console.log('✅ Risk Management API loaded successfully');