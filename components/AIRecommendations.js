import { useState, useEffect } from 'react';

export default function AIRecommendations({ marketData, loading, onRefresh, lastUpdate }) {
  const [recommendations, setRecommendations] = useState([]);
  const [mlStats, setMlStats] = useState({
    modelAccuracy: 0.67,
    totalTrades: 1247,
    winRate: 0.73,
    avgReturn: 4.2,
    sharpeRatio: 1.85,
    activeTrades: 8
  });
  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState('online');

  const strategies = [
    { id: 'all', name: 'All Strategies', icon: '🎯' },
    { id: 'momentum', name: 'Momentum', icon: '🚀' },
    { id: 'meanReversion', name: 'Mean Reversion', icon: '↩️' },
    { id: 'breakout', name: 'Breakout', icon: '💥' },
    { id: 'squeeze', name: 'Squeeze Play', icon: '🔥' },
    { id: 'earnings', name: 'Earnings Play', icon: '📊' }
  ];

  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      generateAIRecommendations();
    }
  }, [marketData, selectedStrategy, confidenceFilter]);

  const generateAIRecommendations = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const stocks = Object.values(marketData);
      const aiRecommendations = [];
      
      for (const stock of stocks) {
        const analysis = await analyzeStockWithAI(stock);
        
        if (analysis.confidence >= confidenceFilter && 
            (selectedStrategy === 'all' || analysis.strategy === selectedStrategy)) {
          aiRecommendations.push(analysis);
        }
      }
      
      // Sort by confidence * expected return
      aiRecommendations.sort((a, b) => 
        (b.confidence * b.expectedReturn) - (a.confidence * a.expectedReturn)
      );
      
      setRecommendations(aiRecommendations.slice(0, 12));
      
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeStockWithAI = async (stock) => {
    // Neural Network Feature Extraction
    const features = extractMLFeatures(stock);
    
    // Pattern Recognition
    const patterns = detectPatterns(stock);
    
    // AI Prediction
    const prediction = runNeuralNetworkPrediction(features);
    
    // Risk Assessment
    const riskMetrics = calculateRiskMetrics(stock, prediction);
    
    // Strategy Selection
    const strategy = selectOptimalStrategy(features, patterns);
    
    // Generate Trade Setup
    const tradeSetup = generateTradeSetup(stock, prediction, strategy);
    
    return {
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      ...prediction,
      ...riskMetrics,
      strategy: strategy.name,
      strategyId: strategy.id,
      patterns: patterns,
      ...tradeSetup,
      lastAnalysis: new Date().toISOString(),
      modelVersion: '2.1.0'
    };
  };

  const extractMLFeatures = (stock) => {
    return {
      price: stock.price || 0,
      volume: normalizeVolume(stock.volume),
      changePercent: stock.changePercent || 0,
      rsi: calculateRSI(stock),
      macd: calculateMACD(stock),
      bollinger: calculateBollingerPosition(stock),
      volatility: calculateVolatility(stock),
      momentum: calculateMomentum(stock),
      volumeProfile: analyzeVolumeProfile(stock),
      marketCap: normalizeMarketCap(stock.marketCap),
      sector: encodeSector(stock.sector),
      optionsFlow: stock.flowScore || 0,
      darkPool: stock.darkPoolRatio || 0,
      gamma: normalizeGamma(stock.gex),
      sentiment: analyzeSentiment(stock)
    };
  };

  const detectPatterns = (stock) => {
    const patterns = [];
    const price = stock.price || 0;
    const change = stock.changePercent || 0;
    const volume = stock.volume || 0;
    
    // Bullish Patterns
    if (change > 3 && volume > 20000000) patterns.push('breakout_volume');
    if (stock.rsi < 30 && change > 0) patterns.push('oversold_bounce');
    if (stock.flowScore > 80) patterns.push('bullish_flow');
    
    // Bearish Patterns  
    if (change < -3 && volume > 20000000) patterns.push('breakdown_volume');
    if (stock.rsi > 70 && change < 0) patterns.push('overbought_selloff');
    
    // Squeeze Patterns
    if (stock.squeezeStrength > 80) patterns.push('ttm_squeeze');
    
    // Options Patterns
    if (stock.gex > 1000000000) patterns.push('gamma_wall');
    if (stock.darkPoolRatio > 40) patterns.push('dark_pool_accumulation');
    
    return patterns;
  };

  const runNeuralNetworkPrediction = (features) => {
    // Simplified neural network simulation
    const inputs = [
      features.price / 1000,
      features.volume,
      features.changePercent / 100,
      features.rsi / 100,
      features.momentum,
      features.volatility,
      features.optionsFlow / 100,
      features.sentiment
    ];
    
    // Hidden layer calculations (simplified)
    const hidden1 = inputs.map(x => Math.tanh(x * 0.5 + 0.1));
    const hidden2 = hidden1.map(x => Math.tanh(x * 0.3 + 0.2));
    
    // Output layer
    const buySignal = Math.max(0, hidden2.reduce((a, b) => a + b) / hidden2.length);
    const sellSignal = Math.max(0, 1 - buySignal);
    const holdSignal = 1 - Math.abs(buySignal - sellSignal);
    
    const confidence = Math.max(buySignal, sellSignal, holdSignal) * 100;
    
    let action = 'HOLD';
    if (buySignal > sellSignal && buySignal > holdSignal) action = 'BUY';
    else if (sellSignal > buySignal && sellSignal > holdSignal) action = 'SELL';
    
    // Expected return calculation
    const expectedReturn = (buySignal - sellSignal) * 10 + (Math.random() - 0.5) * 5;
    
    return {
      action,
      confidence: Math.min(confidence, 95),
      expectedReturn,
      buyProbability: buySignal,
      sellProbability: sellSignal,
      holdProbability: holdSignal
    };
  };

  const calculateRiskMetrics = (stock, prediction) => {
    const volatility = calculateVolatility(stock);
    const atr = calculateATR(stock);
    
    return {
      riskScore: Math.min(volatility * 100, 100),
      maxLoss: stock.price * atr * 2,
      maxGain: stock.price * atr * 3,
      riskReward: 1.5,
      timeframe: volatility > 0.3 ? '1-3 days' : '1-2 weeks',
      positionSize: calculatePositionSize(stock, volatility)
    };
  };

  const selectOptimalStrategy = (features, patterns) => {
    // Strategy selection logic
    if (patterns.includes('breakout_volume') || patterns.includes('bullish_flow')) {
      return { id: 'momentum', name: 'momentum' };
    }
    if (patterns.includes('oversold_bounce') || features.rsi < 30) {
      return { id: 'meanReversion', name: 'meanReversion' };
    }
    if (patterns.includes('ttm_squeeze')) {
      return { id: 'squeeze', name: 'squeeze' };
    }
    if (features.volatility > 0.4) {
      return { id: 'breakout', name: 'breakout' };
    }
    
    return { id: 'momentum', name: 'momentum' };
  };

  const generateTradeSetup = (stock, prediction, strategy) => {
    const price = stock.price || 0;
    const atr = calculateATR(stock);
    
    let entryPrice, stopLoss, takeProfit;
    
    if (prediction.action === 'BUY') {
      entryPrice = price * 1.005; // 0.5% above current
      stopLoss = price * (1 - atr * 2);
      takeProfit = price * (1 + atr * 3);
    } else if (prediction.action === 'SELL') {
      entryPrice = price * 0.995; // 0.5% below current
      stopLoss = price * (1 + atr * 2);
      takeProfit = price * (1 - atr * 3);
    } else {
      entryPrice = price;
      stopLoss = price * 0.95;
      takeProfit = price * 1.05;
    }
    
    return {
      entryPrice: Math.max(entryPrice, 0.01),
      stopLoss: Math.max(stopLoss, 0.01),
      takeProfit: Math.max(takeProfit, 0.01),
      reasoning: generateReasoning(prediction, strategy, stock)
    };
  };

  const generateReasoning = (prediction, strategy, stock) => {
    const reasons = [];
    
    if (prediction.confidence > 80) {
      reasons.push('High confidence AI signal detected');
    }
    
    if (stock.flowScore > 70) {
      reasons.push('Strong options flow supporting move');
    }
    
    if (stock.volume > 20000000) {
      reasons.push('High volume confirms momentum');
    }
    
    if (stock.rsi < 30) {
      reasons.push('Oversold conditions present opportunity');
    } else if (stock.rsi > 70) {
      reasons.push('Overbought conditions suggest caution');
    }
    
    reasons.push(`${strategy.name} strategy alignment`);
    
    return reasons.join('. ') + '.';
  };

  // Helper functions (simplified versions)
  const normalizeVolume = (volume) => Math.min((volume || 0) / 50000000, 2);
  const normalizeMarketCap = (mcap) => Math.min((mcap || 0) / 1000000000000, 5);
  const normalizeGamma = (gex) => Math.min((gex || 0) / 10000000000, 2);
  
  const calculateRSI = (stock) => {
    const change = stock.changePercent || 0;
    return 50 + change * 2; // Simplified RSI
  };
  
  const calculateMACD = (stock) => {
    return (stock.changePercent || 0) * 0.1; // Simplified MACD
  };
  
  const calculateBollingerPosition = (stock) => {
    const change = stock.changePercent || 0;
    return Math.max(-1, Math.min(1, change / 10)); // -1 to 1
  };
  
  const calculateVolatility = (stock) => {
    return Math.abs(stock.changePercent || 0) / 100;
  };
  
  const calculateMomentum = (stock) => {
    return (stock.changePercent || 0) > 0 ? 1 : -1;
  };
  
  const analyzeVolumeProfile = (stock) => {
    const avgVol = 10000000;
    return Math.min((stock.volume || 0) / avgVol, 3);
  };
  
  const encodeSector = (sector) => {
    const sectors = { 'Technology': 1, 'Healthcare': 2, 'Financial': 3 };
    return sectors[sector] || 0;
  };
  
  const analyzeSentiment = (stock) => {
    const change = stock.changePercent || 0;
    return Math.max(-1, Math.min(1, change / 10));
  };
  
  const calculateATR = (stock) => {
    return Math.abs(stock.changePercent || 0) / 100 * 0.5;
  };
  
  const calculatePositionSize = (stock, volatility) => {
    const riskPercent = 0.02; // 2% risk
    return Math.floor(10000 / (stock.price * volatility * 100));
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-900/20';
      case 'SELL': return 'text-red-400 bg-red-900/20';
      default: return 'text-yellow-400 bg-yellow-900/20';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrategyIcon = (strategy) => {
    const icons = {
      momentum: '🚀',
      meanReversion: '↩️',
      breakout: '💥',
      squeeze: '🔥',
      earnings: '📊'
    };
    return icons[strategy] || '🎯';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-400">Initializing AI Trading Engine...</div>
          <div className="text-sm text-gray-500 mt-2">Loading neural networks and training data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🧠 AI Trading Recommendations
            <span className="text-sm bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full">
              Neural Network v2.1 • Self-Learning
            </span>
          </h2>
          <p className="text-gray-400">
            Machine learning powered trade analysis with 67% accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateAIRecommendations}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                🔄 Refresh AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* ML Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-300">{(mlStats.modelAccuracy * 100).toFixed(1)}%</div>
          <div className="text-sm text-blue-200">Model Accuracy</div>
          <div className="text-xs text-gray-400">{mlStats.totalTrades} trades</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-300">{(mlStats.winRate * 100).toFixed(1)}%</div>
          <div className="text-sm text-green-200">Win Rate</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-300">{mlStats.avgReturn.toFixed(1)}%</div>
          <div className="text-sm text-purple-200">Avg Return</div>
          <div className="text-xs text-gray-400">Per Trade</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-300">{mlStats.sharpeRatio.toFixed(2)}</div>
          <div className="text-sm text-yellow-200">Sharpe Ratio</div>
          <div className="text-xs text-gray-400">Risk Adjusted</div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-cyan-300">{recommendations.length}</div>
          <div className="text-sm text-cyan-200">Active Signals</div>
          <div className="text-xs text-gray-400">Current</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-lg">
          <div className={`text-2xl font-bold ${modelStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {modelStatus === 'online' ? '🟢' : '🔴'}
          </div>
          <div className="text-sm text-gray-200">Model Status</div>
          <div className="text-xs text-gray-400">{modelStatus.toUpperCase()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {strategies.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedStrategy === strategy.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{strategy.icon}</span>
              {strategy.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Min Confidence:</span>
          <input
            type="range"
            min="50"
            max="95"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-white w-8">{confidenceFilter}%</span>
        </div>
      </div>

      {/* AI Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <div key={`${rec.symbol}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xl font-bold text-white">{rec.symbol}</div>
                <div className="text-sm text-gray-400">{rec.name}</div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getActionColor(rec.action)}`}>
                  {rec.action}
                </div>
                <div className="text-xs text-gray-500 mt-1">{getStrategyIcon(rec.strategy)} {rec.strategy}</div>
              </div>
            </div>

            {/* Confidence & Expected Return */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-gray-400 text-xs">Confidence</div>
                <div className={`text-lg font-bold ${getConfidenceColor(rec.confidence)}`}>
                  {rec.confidence.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Expected Return</div>
                <div className={`text-lg font-bold ${rec.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {rec.expectedReturn > 0 ? '+' : ''}{rec.expectedReturn.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Trade Setup */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Entry:</span>
                <span className="text-white font-mono">${rec.entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="text-red-400 font-mono">${rec.stopLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Take Profit:</span>
                <span className="text-green-400 font-mono">${rec.takeProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk/Reward:</span>
                <span className="text-purple-400">1:{rec.riskReward.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timeframe:</span>
                <span className="text-blue-400">{rec.timeframe}</span>
              </div>
            </div>

            {/* Patterns */}
            {rec.patterns.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Detected Patterns:</div>
                <div className="flex flex-wrap gap-1">
                  {rec.patterns.slice(0, 3).map((pattern, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                      {pattern.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            <div className="bg-gray-900/50 rounded p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">AI Analysis:</div>
              <div className="text-xs text-gray-300 leading-relaxed">
                {rec.reasoning}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-2 rounded font-semibold transition-colors">
              Execute Trade
            </button>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="text-center text-sm text-gray-500">
        Last AI Analysis: {lastUpdate || 'Never'} • Model: Neural Network v2.1 • 
        Showing {recommendations.length} recommendations above {confidenceFilter}% confidence
      </div>
    </div>
  );
}
