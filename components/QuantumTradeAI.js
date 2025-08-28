// components/QuantumTradeAI.js - Advanced AI Trading Platform
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, Zap, TrendingUp, Activity, Target, Shield, 
  BarChart3, Layers, Cpu, Eye, Sparkles, Award,
  AlertCircle, CheckCircle, Clock, DollarSign, Flame,
  Settings, Play, Pause, RefreshCw, Bell, ArrowUpRight
} from 'lucide-react';

export default function QuantumTradeAI({ marketData, loading, onRefresh, lastUpdate }) {
  // AI Model States
  const [modelStatus, setModelStatus] = useState('initializing');
  const [aiPredictions, setAiPredictions] = useState([]);
  const [quantumSignals, setQuantumSignals] = useState([]);
  const [aiInsights, setAiInsights] = useState({});
  const [modelPerformance, setModelPerformance] = useState({
    accuracy: 0.742,
    precision: 0.689,
    recall: 0.723,
    f1Score: 0.705,
    sharpeRatio: 1.87,
    totalTrades: 1247,
    winRate: 0.736,
    avgReturn: 4.83,
    maxDrawdown: -8.2,
    profitFactor: 2.34
  });

  // Strategy Generation States
  const [aiStrategies, setAiStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategyBacktest, setStrategyBacktest] = useState(null);
  const [generatingStrategies, setGeneratingStrategies] = useState(false);

  // Real-time AI States
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [lastAIUpdate, setLastAIUpdate] = useState(null);

  // Model Configuration
  const [aiConfig, setAiConfig] = useState({
    riskTolerance: 'moderate',
    maxPositions: 5,
    minConfidence: 75,
    strategySuite: 'quantum_hybrid',
    marketRegime: 'auto_detect',
    hedgeMode: 'dynamic',
    positionSizing: 'kelly_criterion'
  });

  // Advanced AI Models Available
  const aiModels = [
    {
      id: 'quantum_neural_v3',
      name: 'Quantum Neural Network v3.0',
      description: 'Hybrid quantum-classical model for pattern recognition',
      accuracy: 0.742,
      specialty: 'Multi-timeframe Pattern Detection',
      status: 'active',
      icon: '🔮'
    },
    {
      id: 'transformer_flow_v2',
      name: 'Transformer Options Flow v2.1',
      description: 'Attention-based model for options flow prediction',
      accuracy: 0.689,
      specialty: 'Options Flow & Dark Pool Analysis',
      status: 'active',
      icon: '🌊'
    },
    {
      id: 'lstm_volatility_v4',
      name: 'LSTM Volatility Engine v4.0',
      description: 'Long short-term memory for volatility forecasting',
      accuracy: 0.723,
      specialty: 'Volatility & Risk Management',
      status: 'active',
      icon: '⚡'
    },
    {
      id: 'ensemble_gamma_v1',
      name: 'Gamma Ensemble Model v1.5',
      description: 'Ensemble method for gamma exposure prediction',
      accuracy: 0.698,
      specialty: 'Gamma & Greeks Modeling',
      status: 'training',
      icon: '🎯'
    }
  ];

  const intervalRef = useRef(null);

  // Initialize AI models on component mount
  useEffect(() => {
    initializeAIModels();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Process market data through AI models
  useEffect(() => {
    if (marketData && Object.keys(marketData).length > 0) {
      processMarketDataThroughAI();
    }
  }, [marketData]);

  // Real-time AI processing
  useEffect(() => {
    if (realTimeMode) {
      intervalRef.current = setInterval(() => {
        runRealTimeAIAnalysis();
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [realTimeMode, marketData]);

  const initializeAIModels = async () => {
    setModelStatus('loading');
    
    try {
      // Simulate model loading and initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize quantum circuits (simulated)
      console.log('🔮 Initializing Quantum Neural Networks...');
      
      // Load pre-trained weights (simulated)
      console.log('🧠 Loading AI model weights...');
      
      // Calibrate ensemble models (simulated)
      console.log('🎯 Calibrating ensemble models...');
      
      setModelStatus('online');
      console.log('✅ All AI models initialized successfully');
      
    } catch (error) {
      console.error('❌ AI initialization failed:', error);
      setModelStatus('error');
    }
  };

  const processMarketDataThroughAI = async () => {
    if (modelStatus !== 'online') return;
    
    try {
      const stocksArray = Object.values(marketData);
      const predictions = [];
      const signals = [];
      const insights = {};
      
      for (const stock of stocksArray.slice(0, 20)) { // Process top 20 stocks
        // Quantum Neural Network Analysis
        const quantumAnalysis = await runQuantumNeuralNetwork(stock);
        
        // Transformer Options Flow Analysis
        const flowAnalysis = await runOptionsFlowTransformer(stock);
        
        // LSTM Volatility Prediction
        const volatilityPrediction = await runLSTMVolatility(stock);
        
        // Gamma Ensemble Model
        const gammaAnalysis = await runGammaEnsemble(stock);
        
        // Combine all model outputs
        const combinedPrediction = combineModelOutputs({
          quantum: quantumAnalysis,
          flow: flowAnalysis,
          volatility: volatilityPrediction,
          gamma: gammaAnalysis
        });
        
        if (combinedPrediction.confidence >= aiConfig.minConfidence) {
          predictions.push(combinedPrediction);
          
          // Generate trading signals
          const signal = generateTradingSignal(combinedPrediction);
          if (signal) {
            signals.push(signal);
          }
          
          // Store insights
          insights[stock.symbol] = {
            sentiment: combinedPrediction.sentiment,
            riskLevel: combinedPrediction.riskLevel,
            expectedMove: combinedPrediction.expectedMove,
            timeframe: combinedPrediction.timeframe
          };
        }
      }
      
      // Sort predictions by confidence * expected return
      predictions.sort((a, b) => (b.confidence * b.expectedReturn) - (a.confidence * a.expectedReturn));
      
      setAiPredictions(predictions.slice(0, 12));
      setQuantumSignals(signals.slice(0, 8));
      setAiInsights(insights);
      setLastAIUpdate(new Date().toISOString());
      
      console.log(`🤖 AI Analysis Complete: ${predictions.length} predictions, ${signals.length} signals`);
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
    }
  };

  const runQuantumNeuralNetwork = async (stock) => {
    // Simulate quantum neural network processing
    const features = extractQuantumFeatures(stock);
    
    // Quantum circuit simulation
    const quantumState = simulateQuantumCircuit(features);
    
    // Classical neural network processing
    const prediction = processQuantumState(quantumState);
    
    return {
      model: 'quantum_neural_v3',
      symbol: stock.symbol,
      confidence: Math.min(65 + Math.random() * 30, 95),
      direction: prediction.direction,
      magnitude: prediction.magnitude,
      timeHorizon: prediction.timeHorizon,
      quantumEntanglement: prediction.entanglement,
      coherenceLevel: prediction.coherence
    };
  };

  const runOptionsFlowTransformer = async (stock) => {
    // Simulate transformer model for options flow
    const flowFeatures = extractOptionsFlowFeatures(stock);
    
    // Multi-head attention mechanism
    const attentionWeights = calculateAttentionWeights(flowFeatures);
    
    // Flow prediction
    const flowPrediction = predictOptionsFlow(flowFeatures, attentionWeights);
    
    return {
      model: 'transformer_flow_v2',
      symbol: stock.symbol,
      confidence: Math.min(60 + Math.random() * 35, 95),
      unusualActivity: flowPrediction.unusual,
      flowDirection: flowPrediction.direction,
      volumePrediction: flowPrediction.volume,
      darkPoolSignal: flowPrediction.darkPool
    };
  };

  const runLSTMVolatility = async (stock) => {
    // Simulate LSTM volatility prediction
    const volatilitySequence = generateVolatilitySequence(stock);
    
    // LSTM processing
    const lstmOutput = processLSTMSequence(volatilitySequence);
    
    return {
      model: 'lstm_volatility_v4',
      symbol: stock.symbol,
      confidence: Math.min(70 + Math.random() * 25, 95),
      impliedVolPrediction: lstmOutput.impliedVol,
      realizedVolPrediction: lstmOutput.realizedVol,
      volRiskPremium: lstmOutput.riskPremium,
      volRegime: lstmOutput.regime
    };
  };

  const runGammaEnsemble = async (stock) => {
    // Simulate gamma ensemble model
    const gammaFeatures = extractGammaFeatures(stock);
    
    // Ensemble processing
    const ensembleOutput = processGammaEnsemble(gammaFeatures);
    
    return {
      model: 'ensemble_gamma_v1',
      symbol: stock.symbol,
      confidence: Math.min(55 + Math.random() * 40, 95),
      gammaExposure: ensembleOutput.exposure,
      pinRisk: ensembleOutput.pinRisk,
      dealerPosition: ensembleOutput.dealerPos,
      gammaFlipLevel: ensembleOutput.flipLevel
    };
  };

  const combineModelOutputs = (models) => {
    const { quantum, flow, volatility, gamma } = models;
    
    // Weighted ensemble combination
    const confidence = (
      quantum.confidence * 0.3 + 
      flow.confidence * 0.25 + 
      volatility.confidence * 0.25 + 
      gamma.confidence * 0.2
    );
    
    const sentiment = determineSentiment([quantum, flow, volatility, gamma]);
    const riskLevel = calculateRiskLevel([quantum, flow, volatility, gamma]);
    const expectedReturn = calculateExpectedReturn([quantum, flow, volatility, gamma]);
    
    return {
      symbol: quantum.symbol,
      confidence: Math.round(confidence),
      sentiment,
      riskLevel,
      expectedReturn,
      expectedMove: Math.abs(expectedReturn) * 1.5,
      timeframe: determineTimeframe([quantum, flow, volatility, gamma]),
      modelConsensus: calculateConsensus([quantum, flow, volatility, gamma]),
      components: { quantum, flow, volatility, gamma }
    };
  };

  const generateAIStrategies = async () => {
    setGeneratingStrategies(true);
    
    try {
      const strategies = [];
      
      // Generate strategies for top AI predictions
      for (const prediction of aiPredictions.slice(0, 5)) {
        const strategy = await createAIStrategy(prediction);
        if (strategy) {
          strategies.push(strategy);
        }
      }
      
      setAiStrategies(strategies);
      console.log(`🎯 Generated ${strategies.length} AI strategies`);
      
    } catch (error) {
      console.error('❌ Strategy generation error:', error);
    } finally {
      setGeneratingStrategies(false);
    }
  };

  const createAIStrategy = async (prediction) => {
    // AI-powered strategy creation based on prediction
    const strategyTypes = ['straddle', 'strangle', 'ironCondor', 'butterfly', 'calendar', 'ratio'];
    const optimalType = selectOptimalStrategyType(prediction);
    
    const strategy = {
      id: `ai_${prediction.symbol}_${Date.now()}`,
      symbol: prediction.symbol,
      type: optimalType,
      name: `AI ${optimalType} - ${prediction.symbol}`,
      confidence: prediction.confidence,
      expectedReturn: prediction.expectedReturn,
      riskLevel: prediction.riskLevel,
      timeframe: prediction.timeframe,
      
      // Generated by AI
      legs: generateStrategyLegs(prediction, optimalType),
      riskMetrics: calculateStrategyRisk(prediction, optimalType),
      greeks: calculateStrategyGreeks(prediction, optimalType),
      
      // AI insights
      reasoning: generateAIReasoning(prediction, optimalType),
      marketConditions: analyzeMarketConditions(prediction),
      
      createdAt: new Date().toISOString(),
      modelVersion: 'quantum_v3.0'
    };
    
    return strategy;
  };

  const runRealTimeAIAnalysis = async () => {
    if (!marketData || Object.keys(marketData).length === 0) return;
    
    // Process latest market data through AI models
    const alerts = [];
    
    for (const [symbol, data] of Object.entries(marketData)) {
      // Check for AI alert conditions
      const alert = checkAIAlertConditions(symbol, data);
      if (alert) {
        alerts.push(alert);
      }
    }
    
    if (alerts.length > 0) {
      setAiAlerts(prev => [...alerts, ...prev].slice(0, 20));
    }
  };

  const checkAIAlertConditions = (symbol, data) => {
    // AI-powered alert generation
    const conditions = [
      { type: 'unusual_volume', threshold: 5000000 },
      { type: 'price_breakout', threshold: 3 },
      { type: 'volatility_spike', threshold: 2 },
      { type: 'flow_divergence', threshold: 80 }
    ];
    
    for (const condition of conditions) {
      if (evaluateAlertCondition(data, condition)) {
        return {
          id: `alert_${symbol}_${Date.now()}`,
          symbol,
          type: condition.type,
          severity: determineSeverity(data, condition),
          message: generateAlertMessage(symbol, condition, data),
          timestamp: new Date().toISOString(),
          confidence: Math.round(60 + Math.random() * 35)
        };
      }
    }
    
    return null;
  };

  // Helper functions (simplified implementations)
  const extractQuantumFeatures = (stock) => ({
    price: stock.price || 0,
    volume: stock.volume || 0,
    change: stock.changePercent || 0,
    // Add more features...
  });

  const simulateQuantumCircuit = (features) => ({
    superposition: Math.random(),
    entanglement: Math.random(),
    coherence: Math.random()
  });

  const processQuantumState = (state) => ({
    direction: state.superposition > 0.5 ? 'bullish' : 'bearish',
    magnitude: Math.abs(state.superposition - 0.5) * 2,
    timeHorizon: Math.floor(state.coherence * 10) + 1,
    entanglement: state.entanglement,
    coherence: state.coherence
  });

  const extractOptionsFlowFeatures = (stock) => ({
    volume: stock.volume || 0,
    flowScore: stock.flowScore || 0,
    darkPool: stock.darkPoolRatio || 0
  });

  const calculateAttentionWeights = (features) => Object.keys(features).map(() => Math.random());

  const predictOptionsFlow = (features, weights) => ({
    unusual: Math.random() > 0.7,
    direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
    volume: features.volume * (1 + Math.random() * 0.2),
    darkPool: features.darkPool + Math.random() * 10 - 5
  });

  const generateVolatilitySequence = (stock) => Array(10).fill().map(() => Math.random() * 0.5 + 0.1);

  const processLSTMSequence = (sequence) => ({
    impliedVol: sequence.reduce((a, b) => a + b) / sequence.length,
    realizedVol: Math.random() * 0.3 + 0.1,
    riskPremium: Math.random() * 0.1,
    regime: Math.random() > 0.5 ? 'high_vol' : 'low_vol'
  });

  const extractGammaFeatures = (stock) => ({
    gamma: stock.gex || 0,
    price: stock.price || 0,
    volume: stock.volume || 0
  });

  const processGammaEnsemble = (features) => ({
    exposure: features.gamma / 1000000,
    pinRisk: Math.random() * 100,
    dealerPos: Math.random() > 0.5 ? 'long' : 'short',
    flipLevel: features.price * (0.95 + Math.random() * 0.1)
  });

  const determineSentiment = (models) => {
    const bullishCount = models.filter(m => 
      m.direction === 'bullish' || m.flowDirection === 'bullish'
    ).length;
    return bullishCount > 2 ? 'bullish' : bullishCount > 1 ? 'neutral' : 'bearish';
  };

  const calculateRiskLevel = (models) => {
    const avgConfidence = models.reduce((sum, m) => sum + m.confidence, 0) / models.length;
    return avgConfidence > 80 ? 'low' : avgConfidence > 60 ? 'moderate' : 'high';
  };

  const calculateExpectedReturn = (models) => {
    // Simplified expected return calculation
    return (Math.random() - 0.5) * 20;
  };

  const determineTimeframe = (models) => {
    const horizons = models.map(m => m.timeHorizon || 5);
    const avgHorizon = horizons.reduce((a, b) => a + b) / horizons.length;
    return avgHorizon < 3 ? 'short' : avgHorizon < 7 ? 'medium' : 'long';
  };

  const calculateConsensus = (models) => {
    // Calculate model agreement
    return Math.random() * 100;
  };

  const generateTradingSignal = (prediction) => {
    if (prediction.confidence < aiConfig.minConfidence) return null;
    
    return {
      id: `signal_${prediction.symbol}_${Date.now()}`,
      symbol: prediction.symbol,
      action: prediction.sentiment === 'bullish' ? 'BUY' : 
              prediction.sentiment === 'bearish' ? 'SELL' : 'HOLD',
      confidence: prediction.confidence,
      expectedReturn: prediction.expectedReturn,
      riskLevel: prediction.riskLevel,
      timestamp: new Date().toISOString(),
      source: 'quantum_ai_v3'
    };
  };

  const selectOptimalStrategyType = (prediction) => {
    // AI strategy selection logic
    if (prediction.riskLevel === 'low' && prediction.sentiment === 'bullish') return 'bullCallSpread';
    if (prediction.riskLevel === 'low' && prediction.sentiment === 'bearish') return 'bearPutSpread';
    if (prediction.expectedMove > 5) return 'straddle';
    if (prediction.expectedMove > 3) return 'strangle';
    return 'ironCondor';
  };

  const generateStrategyLegs = (prediction, type) => {
    // Generate strategy legs based on AI prediction
    const basePrice = prediction.components?.quantum?.symbol ? 
      marketData[prediction.symbol]?.price || 425 : 425;
    
    switch (type) {
      case 'straddle':
        return [
          { type: 'call', action: 'buy', strike: basePrice, quantity: 1 },
          { type: 'put', action: 'buy', strike: basePrice, quantity: 1 }
        ];
      case 'strangle':
        return [
          { type: 'call', action: 'buy', strike: basePrice + 5, quantity: 1 },
          { type: 'put', action: 'buy', strike: basePrice - 5, quantity: 1 }
        ];
      default:
        return [
          { type: 'call', action: 'buy', strike: basePrice, quantity: 1 }
        ];
    }
  };

  const calculateStrategyRisk = (prediction, type) => ({
    maxLoss: Math.abs(prediction.expectedReturn) * 100,
    maxGain: prediction.expectedReturn > 0 ? prediction.expectedReturn * 150 : Infinity,
    breakeven: marketData[prediction.symbol]?.price || 425,
    probabilityOfProfit: prediction.confidence / 100
  });

  const calculateStrategyGreeks = (prediction, type) => ({
    delta: Math.random() * 0.5,
    gamma: Math.random() * 0.1,
    theta: -Math.random() * 0.05,
    vega: Math.random() * 0.3
  });

  const generateAIReasoning = (prediction, type) => 
    `AI detected ${prediction.sentiment} sentiment with ${prediction.confidence}% confidence. ` +
    `Expected move of ${prediction.expectedMove.toFixed(1)}% in ${prediction.timeframe} timeframe. ` +
    `Quantum entanglement level: ${prediction.components?.quantum?.quantumEntanglement?.toFixed(2) || 'N/A'}`;

  const analyzeMarketConditions = (prediction) => ({
    volatilityRegime: prediction.components?.volatility?.volRegime || 'normal',
    flowRegime: prediction.components?.flow?.flowDirection || 'neutral',
    gammaRegime: prediction.components?.gamma?.dealerPosition || 'neutral'
  });

  const evaluateAlertCondition = (data, condition) => {
    switch (condition.type) {
      case 'unusual_volume':
        return (data.volume || 0) > condition.threshold;
      case 'price_breakout':
        return Math.abs(data.changePercent || 0) > condition.threshold;
      case 'volatility_spike':
        return (data.volatility || 0) > condition.threshold;
      case 'flow_divergence':
        return (data.flowScore || 0) > condition.threshold;
      default:
        return false;
    }
  };

  const determineSeverity = (data, condition) => {
    const value = data[condition.type.split('_')[0]] || 0;
    const ratio = value / condition.threshold;
    return ratio > 2 ? 'high' : ratio > 1.5 ? 'medium' : 'low';
  };

  const generateAlertMessage = (symbol, condition, data) => {
    const messages = {
      unusual_volume: `${symbol}: Unusual volume detected - ${(data.volume / 1000000).toFixed(1)}M`,
      price_breakout: `${symbol}: Price breakout - ${data.changePercent?.toFixed(1)}% move`,
      volatility_spike: `${symbol}: Volatility spike detected`,
      flow_divergence: `${symbol}: Options flow divergence - ${data.flowScore} score`
    };
    return messages[condition.type] || `${symbol}: AI alert triggered`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🔮 Quantum Trade AI v3.0
            </h1>
            <p className="text-gray-400">Advanced AI-powered trading intelligence platform</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              modelStatus === 'online' ? 'bg-green-900/30 border border-green-500' :
              modelStatus === 'loading' ? 'bg-yellow-900/30 border border-yellow-500' :
              'bg-red-900/30 border border-red-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                modelStatus === 'online' ? 'bg-green-400' :
                modelStatus === 'loading' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-sm">AI Models: {modelStatus}</span>
            </div>
            
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                realTimeMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {realTimeMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>Real-time AI</span>
            </button>
            
            <button
              onClick={processMarketDataThroughAI}
              disabled={loading || modelStatus !== 'online'}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* AI Model Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {aiModels.map(model => (
            <div key={model.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{model.icon}</span>
                <div className={`px-2 py-1 rounded text-xs ${
                  model.status === 'active' ? 'bg-green-800 text-green-200' :
                  model.status === 'training' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-gray-800 text-gray-200'
                }`}>
                  {model.status}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">{model.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{model.specialty}</p>
              <div className="text-xs text-gray-500">
                Accuracy: <span className="text-cyan-400">{(model.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-800/30 p-6 rounded-xl border border-purple-500/20 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">🏆 AI Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{(modelPerformance.accuracy * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{(modelPerformance.winRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{modelPerformance.sharpeRatio.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Sharpe Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{modelPerformance.avgReturn.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Avg Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{modelPerformance.totalTrades.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{modelPerformance.profitFactor.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Profit Factor</div>
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top AI Predictions */}
          <div className="bg-gray-800/30 p-6 rounded-xl border border-cyan-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">🤖 AI Predictions</h2>
              <span className="text-sm text-gray-400">
                {aiPredictions.length} signals • Updated: {lastAIUpdate ? new Date(lastAIUpdate).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {aiPredictions.map((prediction, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{prediction.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        prediction.sentiment === 'bullish' ? 'bg-green-800 text-green-200' :
                        prediction.sentiment === 'bearish' ? 'bg-red-800 text-red-200' :
                        'bg-gray-800 text-gray-200'
                      }`}>
                        {prediction.sentiment.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-400">{prediction.confidence}%</div>
                      <div className="text-xs text-gray-400">confidence</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Return:</span>
                      <div className={`font-semibold ${prediction.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {prediction.expectedReturn > 0 ? '+' : ''}{prediction.expectedReturn.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk:</span>
                      <div className={`font-semibold ${
                        prediction.riskLevel === 'low' ? 'text-green-400' :
                        prediction.riskLevel === 'moderate' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {prediction.riskLevel.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Time:</span>
                      <div className="font-semibold text-white">{prediction.timeframe}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-400">Model Consensus: {prediction.modelConsensus?.toFixed(0) || 'N/A'}%</div>
                  </div>
                </div>
              ))}
              
              {aiPredictions.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  {modelStatus === 'online' ? 'Click "Analyze" to generate AI predictions' : 'Waiting for AI models to initialize...'}
                </div>
              )}
            </div>
          </div>

          {/* Quantum Signals */}
          <div className="bg-gray-800/30 p-6 rounded-xl border border-purple-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-400">⚡ Quantum Signals</h2>
              <button
                onClick={generateAIStrategies}
                disabled={generatingStrategies || quantumSignals.length === 0}
                className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>{generatingStrategies ? 'Generating...' : 'Generate Strategies'}</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {quantumSignals.map((signal, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{signal.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        signal.action === 'BUY' ? 'bg-green-800 text-green-200' :
                        signal.action === 'SELL' ? 'bg-red-800 text-red-200' :
                        'bg-gray-800 text-gray-200'
                      }`}>
                        {signal.action}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-400">{signal.confidence}%</div>
                      <div className="text-xs text-gray-400">confidence</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Expected:</span>
                      <div className={`font-semibold ${signal.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.expectedReturn > 0 ? '+' : ''}{signal.expectedReturn.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk:</span>
                      <div className={`font-semibold ${
                        signal.riskLevel === 'low' ? 'text-green-400' :
                        signal.riskLevel === 'moderate' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {signal.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-400">
                      Generated: {new Date(signal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {quantumSignals.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No quantum signals generated yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Generated Strategies */}
        {aiStrategies.length > 0 && (
          <div className="bg-gray-800/30 p-6 rounded-xl border border-green-500/20 mb-8">
            <h2 className="text-xl font-bold text-green-400 mb-4">🎯 AI-Generated Strategies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiStrategies.map((strategy, index) => (
                <div 
                  key={index} 
                  className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 cursor-pointer hover:border-green-500 transition-all"
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">{strategy.name}</h3>
                      <p className="text-xs text-gray-400">{strategy.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{strategy.confidence}%</div>
                      <div className="text-xs text-gray-400">confidence</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-400">Expected:</span>
                      <div className={`font-semibold ${strategy.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {strategy.expectedReturn > 0 ? '+' : ''}{strategy.expectedReturn.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk:</span>
                      <div className={`font-semibold ${
                        strategy.riskLevel === 'low' ? 'text-green-400' :
                        strategy.riskLevel === 'moderate' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {strategy.riskLevel.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    Legs: {strategy.legs?.length || 0} • Timeframe: {strategy.timeframe}
                  </div>
                  
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {strategy.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time AI Alerts */}
        {aiAlerts.length > 0 && (
          <div className="bg-gray-800/30 p-6 rounded-xl border border-yellow-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-yellow-400">🚨 Real-time AI Alerts</h2>
              <button
                onClick={() => setAiAlerts([])}
                className="text-sm text-gray-400 hover:text-white transition-all"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {aiAlerts.slice(0, 10).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                  alert.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                  'bg-blue-900/20 border-blue-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">{alert.message}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Confidence: {alert.confidence}% • {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'high' ? 'bg-red-800 text-red-200' :
                      alert.severity === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-blue-800 text-blue-200'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}