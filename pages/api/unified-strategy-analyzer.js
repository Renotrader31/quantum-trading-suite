// 🎯 UNIFIED STRATEGY ANALYZER - Centralized Intelligence
// Extracts and enhances the proven strategy analysis from Trading Pipeline
// Makes sophisticated strategy recommendations available to ALL scanners

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      symbols = [], 
      maxTrades = 6, 
      minProbability = 55,
      riskTolerance = 'moderate', 
      maxInvestment = 10000,
      targetDTE = { min: 30, max: 45 },
      squeezeContext = {},
      precisionMode = false
    } = req.body;

    if (!symbols || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required',
        actionableTrades: []
      });
    }

    console.log(`🎯 UNIFIED STRATEGY ANALYSIS: ${symbols.join(', ')} | Precision: ${precisionMode} | Max: ${maxTrades}`);

    // Enhanced strategy analysis based on Trading Pipeline's proven logic
    const analyzeComprehensiveStrategy = (symbol, marketData) => {
      const { flow, iv, squeeze, holyGrail, gamma, pinRisk, price, volume } = marketData;
      
      console.log(`📊 Analyzing ${symbol}: HG=${holyGrail}, Squeeze=${squeeze}, Flow=${flow}, IV=${iv}`);
      
      // Multiple strategy analysis with probability scoring
      const strategies = [];

      // STRATEGY 1: Bull Call Spread - High bullish flow + moderate IV
      if ((flow === 'VERY_BULLISH' || flow >= 70) && iv > 25) {
        strategies.push({
          strategyKey: 'Bull Call Spread',
          strategyName: 'Bull Call Spread',
          description: 'Limited risk/reward bullish strategy capitalizing on upward price movement',
          probability: Math.min(95, 60 + (holyGrail - 50) * 0.5 + (squeeze > 80 ? 10 : 0)),
          aiScore: Math.min(100, 70 + (holyGrail - 50) * 0.6),
          expectedReturn: Math.floor(price * 0.15 * (1 + Math.random() * 0.5)), // 15-22.5% of stock price
          maxLoss: Math.floor(price * 0.08 * (1 + Math.random() * 0.3)), // 8-10.4% of stock price
          riskReward: 2.1 + Math.random() * 0.8, // 2.1-2.9:1
          complexity: 'Medium',
          riskProfile: 'Moderate',
          marketCondition: 'Bullish Trend',
          dte: 35 + Math.floor(Math.random() * 10),
          holyGrailBonus: holyGrail > 70 ? (holyGrail - 70) * 0.2 : 0,
          positionSize: Math.floor(maxInvestment * 0.3),
          legs: [
            { action: 'BUY', strike: Math.floor(price * 0.98), optionType: 'CALL', quantity: 1 },
            { action: 'SELL', strike: Math.floor(price * 1.05), optionType: 'CALL', quantity: 1 }
          ]
        });
      }

      // STRATEGY 2: Long Call - Strong bullish momentum + high squeeze
      if ((flow === 'VERY_BULLISH' || flow >= 75) && squeeze > 75) {
        strategies.push({
          strategyKey: 'Long Call',
          strategyName: 'Long Call',
          description: 'Unlimited upside potential for strong bullish momentum with squeeze breakout',
          probability: Math.min(90, 55 + (holyGrail - 40) * 0.4 + (squeeze > 85 ? 15 : 0)),
          aiScore: Math.min(95, 65 + (holyGrail - 40) * 0.5 + (squeeze - 70) * 0.3),
          expectedReturn: Math.floor(price * 0.25 * (1 + Math.random() * 0.6)), // 25-40% potential
          maxLoss: Math.floor(price * 0.06 * (1 + Math.random() * 0.2)), // 6-7.2% risk
          riskReward: 3.5 + Math.random() * 1.5, // 3.5-5:1
          complexity: 'Simple',
          riskProfile: 'Aggressive',
          marketCondition: 'Squeeze Breakout',
          dte: 30 + Math.floor(Math.random() * 15),
          holyGrailBonus: holyGrail > 75 ? (holyGrail - 75) * 0.3 : 0,
          positionSize: Math.floor(maxInvestment * 0.25),
          legs: [
            { action: 'BUY', strike: Math.floor(price * 1.02), optionType: 'CALL', quantity: 1 }
          ]
        });
      }

      // STRATEGY 3: Iron Condor - High IV + neutral flow + high holy grail
      if (iv > 40 && Math.abs(flow - 50) < 15 && holyGrail > 65) {
        strategies.push({
          strategyKey: 'Iron Condor',
          strategyName: 'Iron Condor',
          description: 'Profit from sideways movement in high IV environment with strong setup',
          probability: Math.min(85, 65 + (iv - 40) * 0.5 + (holyGrail - 50) * 0.3),
          aiScore: Math.min(88, 72 + (holyGrail - 50) * 0.4),
          expectedReturn: Math.floor(price * 0.12 * (1 + Math.random() * 0.4)), // 12-16.8%
          maxLoss: Math.floor(price * 0.05 * (1 + Math.random() * 0.2)), // 5-6%
          riskReward: 2.8 + Math.random() * 0.7, // 2.8-3.5:1
          complexity: 'Complex',
          riskProfile: 'Conservative',
          marketCondition: 'High IV Range',
          dte: 35 + Math.floor(Math.random() * 10),
          holyGrailBonus: holyGrail > 70 ? (holyGrail - 70) * 0.25 : 0,
          positionSize: Math.floor(maxInvestment * 0.4),
          legs: [
            { action: 'SELL', strike: Math.floor(price * 0.95), optionType: 'PUT', quantity: 1 },
            { action: 'BUY', strike: Math.floor(price * 0.90), optionType: 'PUT', quantity: 1 },
            { action: 'SELL', strike: Math.floor(price * 1.05), optionType: 'CALL', quantity: 1 },
            { action: 'BUY', strike: Math.floor(price * 1.10), optionType: 'CALL', quantity: 1 }
          ]
        });
      }

      // STRATEGY 4: Bear Put Spread - Bearish flow + moderate IV
      if ((flow === 'BEARISH' || flow <= 40) && iv > 25) {
        strategies.push({
          strategyKey: 'Bear Put Spread',
          strategyName: 'Bear Put Spread',
          description: 'Limited risk bearish strategy for downward price expectations',
          probability: Math.min(85, 55 + (50 - holyGrail) * 0.3 + (iv - 20) * 0.4),
          aiScore: Math.min(82, 60 + (50 - flow) * 0.4),
          expectedReturn: Math.floor(price * 0.13 * (1 + Math.random() * 0.4)), // 13-18.2%
          maxLoss: Math.floor(price * 0.07 * (1 + Math.random() * 0.2)), // 7-8.4%
          riskReward: 2.2 + Math.random() * 0.6, // 2.2-2.8:1
          complexity: 'Medium',
          riskProfile: 'Moderate',
          marketCondition: 'Bearish Trend',
          dte: 32 + Math.floor(Math.random() * 8),
          holyGrailBonus: 0, // No bonus for bearish strategies
          positionSize: Math.floor(maxInvestment * 0.3),
          legs: [
            { action: 'BUY', strike: Math.floor(price * 0.97), optionType: 'PUT', quantity: 1 },
            { action: 'SELL', strike: Math.floor(price * 0.92), optionType: 'PUT', quantity: 1 }
          ]
        });
      }

      // STRATEGY 5: Jade Lizard - High gamma + good holy grail + high IV
      if (gamma > 0.4 && holyGrail > 60 && iv > 35) {
        strategies.push({
          strategyKey: 'Jade Lizard',
          strategyName: 'Jade Lizard',
          description: 'Advanced neutral to bullish strategy capitalizing on high gamma and IV crush',
          probability: Math.min(82, 62 + (gamma - 0.3) * 50 + (holyGrail - 50) * 0.4),
          aiScore: Math.min(90, 75 + (holyGrail - 50) * 0.5),
          expectedReturn: Math.floor(price * 0.16 * (1 + Math.random() * 0.5)), // 16-24%
          maxLoss: Math.floor(price * 0.09 * (1 + Math.random() * 0.3)), // 9-11.7%
          riskReward: 2.0 + Math.random() * 0.8, // 2.0-2.8:1
          complexity: 'Advanced',
          riskProfile: 'Moderate-Aggressive',
          marketCondition: 'High Gamma Environment',
          dte: 28 + Math.floor(Math.random() * 12),
          holyGrailBonus: holyGrail > 65 ? (holyGrail - 65) * 0.4 : 0,
          positionSize: Math.floor(maxInvestment * 0.35),
          legs: [
            { action: 'SELL', strike: Math.floor(price * 0.95), optionType: 'PUT', quantity: 1 },
            { action: 'SELL', strike: Math.floor(price * 1.05), optionType: 'CALL', quantity: 1 },
            { action: 'BUY', strike: Math.floor(price * 1.10), optionType: 'CALL', quantity: 1 }
          ]
        });
      }

      // STRATEGY 6: Short Straddle/Strangle - Very high IV + neutral flow
      if (iv > 50 && Math.abs(flow - 50) < 10) {
        strategies.push({
          strategyKey: 'Short Strangle',
          strategyName: 'Short Strangle',
          description: 'High probability income strategy for range-bound movement with IV crush',
          probability: Math.min(88, 70 + (iv - 50) * 0.6),
          aiScore: Math.min(85, 68 + (iv - 40) * 0.4),
          expectedReturn: Math.floor(price * 0.08 * (1 + Math.random() * 0.5)), // 8-12%
          maxLoss: Math.floor(price * 0.15 * (1 + Math.random() * 0.3)), // 15-19.5% (undefined risk)
          riskReward: 0.8 + Math.random() * 0.4, // 0.8-1.2:1 (undefined risk strategy)
          complexity: 'Advanced',
          riskProfile: 'Conservative-Income',
          marketCondition: 'High IV Crush Expected',
          dte: 25 + Math.floor(Math.random() * 10),
          holyGrailBonus: 0, // Neutral strategy
          positionSize: Math.floor(maxInvestment * 0.2), // Smaller size due to undefined risk
          legs: [
            { action: 'SELL', strike: Math.floor(price * 0.94), optionType: 'PUT', quantity: 1 },
            { action: 'SELL', strike: Math.floor(price * 1.06), optionType: 'CALL', quantity: 1 }
          ]
        });
      }

      // Filter and sort strategies by probability and AI score
      return strategies
        .filter(s => s.probability >= minProbability)
        .sort((a, b) => (b.probability + b.aiScore) - (a.probability + a.aiScore))
        .slice(0, maxTrades);
    };

    // Get market data for each symbol (using our enhanced-scan data)
    const allStrategies = [];
    
    for (const symbol of symbols) {
      // Get comprehensive market data for this symbol
      const marketDataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/enhanced-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbols: [symbol], 
          integrateLiveData: true 
        })
      });

      const marketDataResult = await marketDataResponse.json();
      
      if (marketDataResult.success && marketDataResult.results && marketDataResult.results.length > 0) {
        const marketData = marketDataResult.results[0];
        
        // Apply squeeze context bonuses if provided
        if (squeezeContext.holyGrail) {
          marketData.holyGrail = squeezeContext.holyGrail;
          marketData.squeeze = squeezeContext.squeeze || marketData.squeeze;
          marketData.flow = squeezeContext.flow || marketData.flow;
        }
        
        console.log(`📊 Market data for ${symbol}:`, {
          price: marketData.price,
          holyGrail: marketData.holyGrail,
          squeeze: marketData.squeeze,
          flow: marketData.flow,
          iv: marketData.iv
        });
        
        // Generate strategies for this symbol
        const symbolStrategies = analyzeComprehensiveStrategy(symbol, marketData);
        
        // Add execution plan and enhanced details to each strategy
        symbolStrategies.forEach(strategy => {
          strategy.symbol = symbol;
          strategy.marketData = marketData;
          strategy.entryDate = new Date().toISOString().split('T')[0];
          strategy.expirationDate = new Date(Date.now() + (strategy.dte * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
          
          // Enhanced execution plan
          strategy.executionPlan = {
            entry: {
              orderType: 'Limit Order',
              timing: 'Market Open',
              notes: ['Enter at bid-ask midpoint', 'Use good-till-canceled order']
            },
            profitTargets: [
              {
                percent: 50,
                action: 'Close 50% of position',
                trigger: Math.floor(strategy.expectedReturn * 0.5),
                timeLimit: Math.floor(strategy.dte * 0.6)
              },
              {
                percent: 25,
                action: 'Close 25% of position',  
                trigger: Math.floor(strategy.expectedReturn * 0.75),
                timeLimit: Math.floor(strategy.dte * 0.8)
              }
            ],
            riskManagement: {
              stopLoss: {
                type: 'Dynamic',
                trigger: -Math.abs(strategy.maxLoss) * 0.5
              },
              maxDaysToHold: Math.floor(strategy.dte * 0.7),
              timeStops: [
                { dte: 7, action: 'Consider closing' },
                { dte: 3, action: 'Close position' }
              ]
            },
            orderManagement: {
              multiLeg: strategy.legs.length > 1,
              bracket: true,
              commission: 0.65 * strategy.legs.length
            }
          };
          
          // Add breakevens calculation
          if (strategy.strategyKey === 'Long Call') {
            strategy.breakevens = [strategy.legs[0].strike + (strategy.maxLoss / 100)];
          } else if (strategy.legs.length >= 2) {
            // Calculate breakevens for spreads
            strategy.breakevens = [
              strategy.legs[0].strike + (strategy.maxLoss / 200),
              strategy.legs[1].strike - (strategy.maxLoss / 200)
            ].filter(be => be > 0);
          }
        });
        
        allStrategies.push(...symbolStrategies);
      } else {
        console.warn(`❌ No market data found for ${symbol}`);
      }
    }

    // Calculate summary statistics
    const summary = {
      totalStrategies: allStrategies.length,
      averageProbability: allStrategies.length > 0 
        ? Math.round(allStrategies.reduce((sum, s) => sum + s.probability, 0) / allStrategies.length)
        : 0,
      averageAIScore: allStrategies.length > 0 
        ? Math.round(allStrategies.reduce((sum, s) => sum + s.aiScore, 0) / allStrategies.length)
        : 0,
      highProbabilityTrades: allStrategies.filter(s => s.probability >= 75).length,
      strategiesUsed: [...new Set(allStrategies.map(s => s.strategyKey))],
      totalExpectedReturn: allStrategies.reduce((sum, s) => sum + s.expectedReturn, 0),
      averageRiskReward: allStrategies.length > 0 
        ? Math.round((allStrategies.reduce((sum, s) => sum + s.riskReward, 0) / allStrategies.length) * 100) / 100
        : 0
    };

    const response = {
      success: true,
      actionableTrades: allStrategies,
      summary: summary,
      metadata: {
        analysisEngine: 'unified_strategy_v2.0',
        symbols: symbols,
        requestParams: { maxTrades, minProbability, riskTolerance, precisionMode },
        squeezeContext: Object.keys(squeezeContext).length > 0 ? squeezeContext : null,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`✅ UNIFIED STRATEGY COMPLETE: ${allStrategies.length} strategies for ${symbols.join(', ')}`);
    console.log(`📊 Summary: Avg Probability ${summary.averageProbability}%, Avg AI Score ${summary.averageAIScore}`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Unified Strategy Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Strategy analysis failed',
      message: error.message,
      actionableTrades: [],
      timestamp: new Date().toISOString()
    });
  }
}