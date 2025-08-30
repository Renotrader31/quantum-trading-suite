import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, Zap, TrendingUp, Activity, Target, Shield, 
  BarChart3, Eye, Sparkles, Award, AlertCircle, CheckCircle, 
  Clock, DollarSign, Flame, Settings, Play, Pause, RefreshCw, 
  Bell, ArrowUpRight, Filter, Search, LineChart, PieChart,
  Cpu, Heart, TrendingDown, AlertTriangle, Layers, Globe,
  Wifi, WifiOff, ChevronDown, ChevronUp, BarChart, Package
} from 'lucide-react';

/**
 * 🧠 INTELLIGENT TRADING SCANNER v3.0
 * 
 * UNIFIED MULTI-STRATEGY SCANNER WITH ML LEARNING
 * 
 * Features:
 * 1. Multiple scanning strategies (Squeeze, Flow, Gamma, Technical, etc.)
 * 2. ML learning from user selections and trade outcomes
 * 3. Intelligent recommendation ranking based on learned preferences
 * 4. Real-time scanning with live data integration
 * 5. Trade execution tracking and outcome feedback
 * 6. Adaptive strategy weighting based on success rates
 */

export default function IntelligentTradingScanner({ marketData, loading: propsLoading, onRefresh, lastUpdate: propsLastUpdate }) {
  // Core Scanner States
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  // ML Learning States
  const [mlModel, setMlModel] = useState({
    accuracy: 0.0,
    totalTrades: 0,
    winRate: 0.0,
    lastTrained: null,
    isLearning: false,
    preferences: {},
    strategyWeights: {
      ttm_squeeze: 1.0,
      options_flow: 1.0,
      gamma_exposure: 1.0,
      dark_pool: 1.0,
      technical_analysis: 1.0,
      unusual_activity: 1.0
    }
  });
  
  // Scanner Configuration
  const [scanConfig, setScanConfig] = useState({
    strategies: {
      ttm_squeeze: true,
      options_flow: true,
      gamma_exposure: true,
      dark_pool: true,
      technical_analysis: true,
      unusual_activity: true
    },
    filters: {
      minScore: 30, // Lowered for demo data
      maxResults: 50,
      minVolume: 1000, // Lowered for demo data  
      minPrice: 5.0,
      maxPrice: 1000.0,
      sectors: []
    },
    mlSettings: {
      useMLRanking: true,
      learningMode: 'active',
      confidenceThreshold: 0.7,
      adaptiveWeighting: true
    }
  });
  
  // UI States
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortBy, setSortBy] = useState('aiScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterText, setFilterText] = useState('');
  const [alerts, setAlerts] = useState([]);
  
  // Trade Tracking States
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [showTradeTracker, setShowTradeTracker] = useState(false);
  
  // Strategy Analysis States (like SqueezeScanner)
  const [tradeRecommendations, setTradeRecommendations] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [processingTrade, setProcessingTrade] = useState(null);
  const [mlSuccess, setMlSuccess] = useState(null);
  
  // Real-time States
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const scanIntervalRef = useRef(null);
  
  // Available Scanning Strategies
  const scanStrategies = [
    {
      id: 'ttm_squeeze',
      name: 'TTM Squeeze',
      description: 'Bollinger Bands inside Keltner Channels with momentum',
      icon: <Activity className="w-4 h-4" />,
      color: 'text-orange-400',
      weight: mlModel.strategyWeights.ttm_squeeze
    },
    {
      id: 'options_flow',
      name: 'Options Flow',
      description: 'Unusual options activity and large block trades',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-blue-400',
      weight: mlModel.strategyWeights.options_flow
    },
    {
      id: 'gamma_exposure',
      name: 'Gamma Exposure',
      description: 'Market maker gamma positioning and hedging flows',
      icon: <Target className="w-4 h-4" />,
      color: 'text-purple-400',
      weight: mlModel.strategyWeights.gamma_exposure
    },
    {
      id: 'dark_pool',
      name: 'Dark Pool Activity',
      description: 'Hidden institutional order flow and block trades',
      icon: <Eye className="w-4 h-4" />,
      color: 'text-gray-400',
      weight: mlModel.strategyWeights.dark_pool
    },
    {
      id: 'technical_analysis',
      name: 'Technical Patterns',
      description: 'Chart patterns, support/resistance, and momentum',
      icon: <LineChart className="w-4 h-4" />,
      color: 'text-green-400',
      weight: mlModel.strategyWeights.technical_analysis
    },
    {
      id: 'unusual_activity',
      name: 'Unusual Activity',
      description: 'Volume spikes, price anomalies, and news catalysts',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-red-400',
      weight: mlModel.strategyWeights.unusual_activity
    }
  ];
  
  // Initialize component
  useEffect(() => {
    setIsClient(true);
    loadMLModel();
    loadActiveTrades();
  }, []);
  
  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      scanIntervalRef.current = setInterval(() => {
        runIntelligentScan();
      }, 60000); // Scan every minute
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [autoRefresh]);
  
  // Load ML model and preferences
  const loadMLModel = async () => {
    try {
      const response = await fetch('/api/ml-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'get_model_status',
          includeWeights: true 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.modelStats) {
          setMlModel(prev => ({
            ...prev,
            ...data.modelStats,
            strategyWeights: data.strategyWeights || prev.strategyWeights
          }));
        }
      }
    } catch (error) {
      console.error('Error loading ML model:', error);
    }
  };
  
  // Load active trades
  const loadActiveTrades = async () => {
    try {
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getActiveTrades' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Error loading active trades:', error);
    }
  };
  
  // Run intelligent multi-strategy scan
  const runIntelligentScan = async () => {
    setScanning(true);
    setLoading(true);
    setScanProgress(0);
    
    try {
      console.log('🧠 Starting Intelligent Multi-Strategy Scan...');
      
      const enabledStrategies = Object.entries(scanConfig.strategies)
        .filter(([key, enabled]) => enabled)
        .map(([key]) => key);
        
      console.log('📊 Enabled strategies:', enabledStrategies);
      
      // Run parallel scans for each enabled strategy
      const scanPromises = enabledStrategies.map(async (strategy) => {
        return await runStrategyScan(strategy);
      });
      
      const strategyResults = await Promise.all(scanPromises);
      setScanProgress(50);
      
      // Combine and deduplicate results
      const combinedResults = combineStrategyResults(strategyResults);
      setScanProgress(75);
      
      // Apply ML ranking if enabled
      let finalResults = combinedResults;
      if (scanConfig.mlSettings.useMLRanking) {
        finalResults = await applyMLRanking(combinedResults);
      }
      
      // Apply filters
      finalResults = applyFilters(finalResults);
      setScanProgress(90);
      
      // Sort results
      finalResults = sortResults(finalResults);
      
      setScanResults(finalResults);
      setLastScan(new Date().toISOString());
      setScanProgress(100);
      
      console.log(`✅ Intelligent scan complete: ${finalResults.length} opportunities found`);
      
      // Generate alerts for high-confidence opportunities
      generateIntelligentAlerts(finalResults);
      
    } catch (error) {
      console.error('❌ Intelligent scan error:', error);
      addAlert({
        type: 'SCAN_ERROR',
        message: `Scan failed: ${error.message}`,
        severity: 'high'
      });
    } finally {
      setScanning(false);
      setLoading(false);
      setScanProgress(100);
    }
  };
  
  // Run individual strategy scan with live data priority
  const runStrategyScan = async (strategy) => {
    console.log(`🔍 Running ${strategy} scan...`);
    
    try {
      // 🔴 LIVE DATA INTEGRATION: Try live market data first for intelligent scanning
      const liveResponse = await fetch('/api/live-market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'ADBE', 'SOFI', 'PLTR', 'AMD', 'INTC', 'BABA'],
          dataTypes: ['price', 'options', 'gamma', 'flow', 'squeeze'],
          refreshInterval: 15
        })
      });
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        
        if (liveData.success && liveData.data) {
          console.log(`🔴 Using live data for ${strategy} strategy`);
          return processStrategyResults(liveData.data, strategy, 'live_data');
        }
      }
      
      // Fallback to enhanced scan
      console.log(`📡 Falling back to enhanced scan for ${strategy} strategy`);
      let endpoint = '/api/enhanced-scan';
      let requestBody = {
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'ADBE', 'SOFI', 'PLTR', 'AMD', 'INTC', 'BABA'], // Default watchlist
        strategy: strategy,
        integrateLiveData: true,
        maxResults: scanConfig.filters.maxResults
      };
      
      // Strategy-specific configurations
      switch (strategy) {
        case 'ttm_squeeze':
          requestBody.scanType = 'squeeze';
          requestBody.minHolyGrail = 60;
          break;
        case 'options_flow':
          requestBody.scanType = 'flow';
          requestBody.minUnusual = 2.0;
          break;
        case 'gamma_exposure':
          requestBody.scanType = 'gamma';
          requestBody.minGamma = 0.1;
          break;
        case 'dark_pool':
          requestBody.scanType = 'darkpool';
          requestBody.minDarkPool = 0.3;
          break;
        case 'technical_analysis':
          requestBody.scanType = 'technical';
          requestBody.patterns = ['breakout', 'momentum', 'reversal'];
          break;
        case 'unusual_activity':
          requestBody.scanType = 'unusual';
          requestBody.minVolumeSpike = 2.0;
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success && (data.opportunities || data.results)) {
        const results = data.opportunities || data.results || [];
        return processStrategyResults(results, strategy, 'enhanced_scan');
      }
      
      return [];
    } catch (error) {
      console.error(`❌ Error scanning ${strategy}:`, error);
      return [];
    }
  };

  // Process strategy results from either live data or enhanced scan
  const processStrategyResults = (results, strategy, dataSource) => {
    console.log(`📊 Processing ${results.length} results for ${strategy} from ${dataSource}`);
    
    // Add strategy source and weight to each result
    return results.map(result => ({
      ...result,
      detectedBy: strategy,
      dataSource: dataSource,
      isLive: dataSource === 'live_data',
      strategyWeight: mlModel.strategyWeights[strategy] || 1.0,
      strategyScore: calculateStrategyScore(result, strategy),
      liveDataQuality: dataSource === 'live_data' ? result.dataQuality : null
    }));
  };
  
  // Calculate strategy-specific score
  const calculateStrategyScore = (stock, strategy) => {
    switch (strategy) {
      case 'ttm_squeeze':
        return Math.min(100, (stock.holyGrail || 0) + (stock.squeeze || 0) * 0.3);
      case 'options_flow':
        return Math.min(100, (stock.flowAnalysis?.unusual?.multiplier || 1) * 15);
      case 'gamma_exposure':
        return Math.min(100, (stock.gamma || 0) * 10);
      case 'dark_pool':
        return Math.min(100, (stock.darkPool?.ratio || 0) * 100);
      case 'technical_analysis':
        return Math.min(100, (stock.technicalScore || 50));
      case 'unusual_activity':
        return Math.min(100, (stock.unusualScore || 50));
      default:
        return 50;
    }
  };
  
  // Combine results from multiple strategies
  const combineStrategyResults = (strategyResults) => {
    const symbolMap = new Map();
    
    // Flatten all results
    const allResults = strategyResults.flat();
    
    // Group by symbol and combine data
    allResults.forEach(stock => {
      if (symbolMap.has(stock.symbol)) {
        const existing = symbolMap.get(stock.symbol);
        
        // Combine detection strategies
        existing.detectedBy = Array.isArray(existing.detectedBy) 
          ? [...existing.detectedBy, stock.detectedBy]
          : [existing.detectedBy, stock.detectedBy];
          
        // Combine strategy scores
        existing.strategyScores = {
          ...existing.strategyScores,
          [stock.detectedBy]: stock.strategyScore
        };
        
        // Update composite score
        existing.compositeScore = Object.values(existing.strategyScores)
          .reduce((sum, score, index) => sum + score, 0) / Object.keys(existing.strategyScores).length;
          
        // Merge other properties (take the best values)
        existing.holyGrail = Math.max(existing.holyGrail || 0, stock.holyGrail || 0);
        existing.squeeze = Math.max(existing.squeeze || 0, stock.squeeze || 0);
        existing.gamma = Math.max(existing.gamma || 0, stock.gamma || 0);
        
      } else {
        symbolMap.set(stock.symbol, {
          ...stock,
          detectedBy: [stock.detectedBy],
          strategyScores: {
            [stock.detectedBy]: stock.strategyScore
          },
          compositeScore: stock.strategyScore,
          multiStrategy: false
        });
      }
    });
    
    // Mark multi-strategy detections
    const results = Array.from(symbolMap.values()).map(stock => ({
      ...stock,
      multiStrategy: stock.detectedBy.length > 1,
      strategyCount: stock.detectedBy.length
    }));
    
    return results;
  };
  
  // Apply ML-based ranking
  const applyMLRanking = async (results) => {
    if (mlModel.totalTrades === 0 || !mlModel.accuracy) {
      console.log('📊 ML model not trained yet, using default ranking');
      return results.map(stock => ({
        ...stock,
        aiScore: stock.compositeScore,
        mlRanked: false
      }));
    }
    
    try {
      console.log('🧠 Applying ML ranking to results...');
      
      const response = await fetch('/api/ml-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rank_opportunities',
          opportunities: results,
          useUserPreferences: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.rankedOpportunities || results;
      }
      
      return results;
    } catch (error) {
      console.error('❌ ML ranking error:', error);
      return results.map(stock => ({
        ...stock,
        aiScore: stock.compositeScore,
        mlRanked: false
      }));
    }
  };
  
  // Apply user-defined filters
  const applyFilters = (results) => {
    console.log('🔍 Applying filters to', results.length, 'results');
    console.log('📊 Filter settings:', scanConfig.filters);
    console.log('📈 Sample stock data:', results[0]);
    
    const filtered = results.filter(stock => {
      // Score filter
      const score = stock.aiScore || stock.compositeScore || stock.holyGrail || 0;
      if (score < scanConfig.filters.minScore) {
        console.log('❌ Filtered out', stock.symbol, 'score too low:', score, 'min:', scanConfig.filters.minScore);
        return false;
      }
      
      // Volume filter
      if ((stock.volume || 0) < scanConfig.filters.minVolume) {
        console.log('❌ Filtered out', stock.symbol, 'volume too low:', stock.volume, 'min:', scanConfig.filters.minVolume);
        return false;
      }
      
      // Price filters
      const price = stock.price || 0;
      if (price < scanConfig.filters.minPrice || price > scanConfig.filters.maxPrice) {
        return false;
      }
      
      // Sector filter
      if (scanConfig.filters.sectors.length > 0 && 
          !scanConfig.filters.sectors.includes(stock.sector)) {
        return false;
      }
      
      // Text filter
      if (filterText && !stock.symbol.toLowerCase().includes(filterText.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    console.log('✅ Filtering complete:', filtered.length, 'out of', results.length, 'stocks passed filters');
    return filtered;
  };
  
  // Sort results
  const sortResults = (results) => {
    return results.sort((a, b) => {
      let aVal = a[sortBy] || 0;
      let bVal = b[sortBy] || 0;
      
      // Special handling for certain fields
      if (sortBy === 'aiScore' || sortBy === 'compositeScore') {
        aVal = a.aiScore || a.compositeScore || 0;
        bVal = b.aiScore || b.compositeScore || 0;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  };
  
  // Generate intelligent alerts
  const generateIntelligentAlerts = (results) => {
    // High AI score alerts
    const highScoreStocks = results.filter(s => (s.aiScore || s.compositeScore) >= 85);
    if (highScoreStocks.length > 0) {
      addAlert({
        type: 'HIGH_AI_SCORE',
        message: `🧠 ${highScoreStocks.length} high-confidence opportunities detected (AI Score 85+)`,
        severity: 'high',
        stocks: highScoreStocks.slice(0, 3).map(s => s.symbol)
      });
    }
    
    // Multi-strategy alerts
    const multiStrategyStocks = results.filter(s => s.multiStrategy && s.strategyCount >= 3);
    if (multiStrategyStocks.length > 0) {
      addAlert({
        type: 'MULTI_STRATEGY',
        message: `🎯 ${multiStrategyStocks.length} stocks detected by 3+ strategies`,
        severity: 'medium',
        stocks: multiStrategyStocks.slice(0, 3).map(s => s.symbol)
      });
    }
    
    // ML learning opportunities
    if (results.length > 0 && mlModel.totalTrades < 10) {
      addAlert({
        type: 'LEARNING_OPPORTUNITY',
        message: `📚 ${results.length} opportunities found - select trades to improve AI accuracy`,
        severity: 'low'
      });
    }
  };
  
  // Add alert
  const addAlert = (alert) => {
    const newAlert = {
      ...alert,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
  };
  
  // Handle stock selection for comprehensive strategy analysis
  const handleStockSelection = async (stock) => {
    console.log(`🎯 INTELLIGENT STRATEGY ANALYSIS: ${stock.symbol} | AI Score: ${stock.aiScore}`);
    setSelectedStock(stock);
    setShowTradeModal(true);
    setLoadingTrades(true);
    setTradeRecommendations([]);
    
    try {
      // 🚀 UNIFIED STRATEGY INTEGRATION - Same as SqueezeScanner
      console.log(`🧠 INTELLIGENT ANALYSIS: AI=${stock.aiScore}, Strategies=${stock.detectedBy?.join(', ')}`);
      const response = await fetch('/api/unified-strategy-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: [stock.symbol],
          maxTrades: 6, // Get comprehensive strategies
          minProbability: 55, // Quality threshold
          riskTolerance: 'moderate-aggressive',
          maxInvestment: 15000,
          targetDTE: { min: 30, max: 45 },
          precisionMode: true,
          // 🎯 Enhanced context from intelligent scanning
          squeezeContext: {
            // Use AI score as proxy for Holy Grail
            holyGrail: Math.min(90, stock.aiScore || 50),
            squeeze: stock.strategyScores?.ttm_squeeze || 70,
            price: stock.price,
            volume: stock.volume,
            momentum: stock.changePercent || 0,
            gamma: stock.strategyScores?.gamma_exposure || 0.5,
            flow: stock.strategyScores?.options_flow || 60,
            iv: 35, // Default IV
            unusual: stock.strategyScores?.unusual_activity > 70,
            sentiment: stock.strategyScores?.technical_analysis || 50,
            aiScore: stock.aiScore,
            detectedBy: stock.detectedBy
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTradeRecommendations(data.actionableTrades);
        console.log(`✅ INTELLIGENT STRATEGIES: Found ${data.actionableTrades.length} recommendations for ${stock.symbol}`);
        console.log(`📊 Average Probability: ${data.summary?.averageProbability}%, AI Score: ${data.summary?.averageAIScore}`);
      } else {
        console.error('❌ Failed to get strategy recommendations:', data.error);
        setTradeRecommendations([]);
      }
    } catch (error) {
      console.error('❌ Error getting strategy recommendations:', error);
      setTradeRecommendations([]);
    } finally {
      setLoadingTrades(false);
    }
    
    // Record user interest for ML learning
    try {
      await fetch('/api/ml-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_interest',
          symbol: stock.symbol,
          detectedBy: stock.detectedBy,
          aiScore: stock.aiScore || stock.compositeScore,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error recording user interest:', error);
    }
  };
  
  // Handle trade execution (this will feed back to ML)
  const handleTradeExecution = async (stock, strategy, outcome) => {
    console.log(`📋 Recording trade execution: ${stock.symbol} - ${strategy}`);
    
    try {
      // Record trade entry
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordEntry',
          tradeData: {
            symbol: stock.symbol,
            strategy: strategy,
            entryPrice: stock.price,
            detectedBy: stock.detectedBy,
            aiScore: stock.aiScore || stock.compositeScore,
            strategyScores: stock.strategyScores,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Feed to ML learning system
        await fetch('/api/ml-learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'trade_entry',
            trade: {
              symbol: stock.symbol,
              strategy: strategy,
              detectedBy: stock.detectedBy,
              marketData: stock,
              tradeId: data.tradeId
            }
          })
        });
        
        // Update active trades
        loadActiveTrades();
        
        addAlert({
          type: 'TRADE_ENTERED',
          message: `✅ Trade entered: ${stock.symbol} - ${strategy}`,
          severity: 'medium'
        });
      }
    } catch (error) {
      console.error('Error recording trade execution:', error);
    }
  };

  // 🎯 COMPREHENSIVE TRADE SELECTION - Enhanced ML Integration (from SqueezeScanner)
  const handleTradeSelection = async (trade) => {
    console.log(`🎯 INTELLIGENT TRADE SELECTION: ${trade.strategyKey || trade.strategyName} for ${selectedStock.symbol}`);
    
    // Set processing state
    setProcessingTrade(trade.strategyKey || trade.strategyName);
    
    // Calculate additional execution details
    const currentDate = new Date();
    const entryDate = trade.entryDate || currentDate.toISOString().split('T')[0];
    const dte = trade.dte || 35;
    const expirationDate = trade.expirationDate || new Date(Date.now() + (dte * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    try {
      // Construct comprehensive trade data for maximum ML learning effectiveness
      const enhancedTradeData = {
        ...trade,
        symbol: selectedStock.symbol,
        selectionTime: new Date().toISOString(),
        userSelectionId: `${selectedStock.symbol}_${Date.now()}`,
        
        // 🎯 Market Data Context
        marketData: {
          price: selectedStock.price,
          volume: selectedStock.volume,
          change: selectedStock.changePercent,
          changePercent: selectedStock.changePercent,
          aiScore: selectedStock.aiScore,
          detectedBy: selectedStock.detectedBy,
          strategyScores: selectedStock.strategyScores
        },
        
        // 🔥 Intelligent Scanner Context  
        intelligentContext: {
          aiScore: selectedStock.aiScore || 50,
          detectedBy: selectedStock.detectedBy || [],
          strategyScores: selectedStock.strategyScores || {},
          mlWeights: mlModel.strategyWeights,
          scanTimestamp: lastScan,
          compositeScore: selectedStock.compositeScore,
          confidence: selectedStock.confidence || 0.7
        },
        
        // ⚡ Key Levels & Targets
        keyLevels: {
          support: selectedStock.price * 0.95,
          resistance: selectedStock.price * 1.05,
          pivot: selectedStock.price,
          targets: trade.targets || [],
          stopLoss: trade.stopLoss || selectedStock.price * 0.92,
          breakevens: trade.breakevens || []
        },
        
        // 📅 Trade Execution Details
        tradeExecution: {
          entryDate: entryDate,
          expirationDate: expirationDate,
          dte: dte,
          strikes: trade.strikes || [],
          legs: trade.legs || [],
          contractsPerLeg: trade.contractsPerLeg || 1,
          totalContracts: (trade.legs?.length || 1) * (trade.contractsPerLeg || 1),
          estimatedPremium: trade.estimatedPremium || 0,
          commission: trade.commission || 5,
          netDebit: trade.netDebit || 0,
          netCredit: trade.netCredit || 0
        },
        
        // ⚖️ Risk Management
        riskMetrics: {
          maxRisk: Math.abs(trade.maxLoss || 0),
          maxReward: trade.expectedReturn || 0,
          riskRewardRatio: trade.riskReward || 0,
          winProbability: trade.probability || 0,
          kellyPercentage: trade.kellyPercentage || 0,
          portfolioRisk: trade.portfolioRisk || 2,
          positionSizing: 'intelligent_ml_based',
          exitStrategy: trade.exitStrategy || 'profit_target_50_stop_loss_25'
        },
        
        // 🧠 Enhanced ML Learning Features
        learningFeatures: {
          scannerType: 'intelligent_scanner',
          timeOfDay: currentDate.getHours(),
          dayOfWeek: currentDate.getDay(),
          marketSession: currentDate.getHours() >= 9 && currentDate.getHours() <= 16 ? 'market_hours' : 'after_hours',
          aiScoreRange: selectedStock.aiScore >= 80 ? 'high' : selectedStock.aiScore >= 60 ? 'medium' : 'low',
          strategiesDetected: selectedStock.detectedBy?.length || 0,
          multiStrategyAlignment: selectedStock.detectedBy?.length >= 3,
          mlModelAccuracy: mlModel.accuracy,
          userPreferences: mlModel.preferences
        }
      };

      console.log('📊 Feeding intelligent trade data to ML learning system:', {
        symbol: selectedStock.symbol,
        strategy: trade.strategyKey || trade.strategyName,
        aiScore: selectedStock.aiScore,
        probability: trade.probability,
        strategiesDetected: selectedStock.detectedBy?.length
      });

      // 🚀 TRADING PIPELINE CONNECTION - Record trade entry (ALWAYS EXECUTE)
      let mlResult = null;
      let pipelineSuccess = false;
      
      try {
        const tradeEntryData = {
          symbol: selectedStock.symbol,
          strategy: trade.strategyKey || trade.strategyName,
          direction: trade.sentiment || 'NEUTRAL',
          entryTime: new Date().toISOString(),
          entryPrice: selectedStock.price,
          quantity: trade.contractsPerLeg || 1,
          legs: trade.legs,
          strikes: trade.strikes,
          expirationDate: expirationDate,
          dte: dte,
          aiScore: selectedStock.aiScore || 0,
          probability: trade.probability || 0,
          scannerSource: 'intelligent_scanner',
          intelligentContext: enhancedTradeData.intelligentContext
        };

        const API_BASE_URL = window.location.origin;
        const tradeEntryResponse = await fetch(`${API_BASE_URL}/api/trade-entry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recordEntry',
            tradeData: tradeEntryData
          })
        });

        if (tradeEntryResponse.ok) {
          const tradeResult = await tradeEntryResponse.json();
          console.log('🚀 Trade successfully recorded in Trading Pipeline:', tradeResult);
          pipelineSuccess = true;
          
          // Pipeline success notification
          addAlert({
            type: 'PIPELINE_INTEGRATION',
            message: `🚀 ${selectedStock.symbol} ${trade.strategyKey} → Trading Pipeline ✅ | Trade ID: ${tradeResult.tradeId || 'N/A'} | P&L Tracking: Active`,
            severity: 'high',
            timestamp: new Date().toISOString(),
            pipelineResult: tradeResult
          });
          
        } else {
          console.warn('⚠️ Trading Pipeline API returned error:', tradeEntryResponse.status);
        }
      } catch (pipelineError) {
        console.error('❌ Error connecting to Trading Pipeline:', pipelineError);
      }

      // Feed selected trade to ML learning system with enhanced data
      try {
        const mlResponse = await fetch('/api/ml-learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'user_selection',
            trade: enhancedTradeData,
            meta: {
              version: '3.0_intelligent_enhanced',
              dataQuality: 'premium_ai',
              completeness: 'maximum',
              scanner: 'intelligent',
              timestamp: new Date().toISOString()
            }
          })
        });

        if (mlResponse.ok) {
          mlResult = await mlResponse.json();
          console.log('✅ Intelligent trade successfully fed to ML learning system:', mlResult);
          
          // Enhanced success notification with ML feedback
          addAlert({
            type: 'TRADE_SELECTED',
            message: `🧠 ${trade.strategyKey || trade.strategyName} → ML Enhanced | ${selectedStock.symbol} | AI Score: ${selectedStock.aiScore} | Neural Net: ${mlResult.learningResult?.neuralNetworkResults?.modelTrained ? '✅' : '❌'}`,
            severity: 'medium',
            timestamp: new Date().toISOString(),
            mlFeedback: mlResult
          });
          
        } else {
          console.warn('⚠️ ML learning API returned error status:', mlResponse.status);
        }
      } catch (mlError) {
        console.error('❌ Error feeding to ML system:', mlError);
      }

      // Clear processing state and show success feedback
      setProcessingTrade(null);
      setMlSuccess({
        strategy: trade.strategyKey || trade.strategyName,
        symbol: selectedStock.symbol,
        result: mlResult?.learningResult,
        intelligentContext: true,
        pipelineSuccess: pipelineSuccess
      });

      // Keep modal open to show success feedback
      setTimeout(() => {
        setShowTradeModal(false);
        setMlSuccess(null);
      }, 6000); // 6 seconds for intelligent scanner
      
    } catch (error) {
      console.error('❌ Error feeding intelligent trade to ML system:', error);
      setProcessingTrade(null);
      setMlSuccess(null);
      
      addAlert({
        type: 'ERROR',
        message: `Failed to feed ${trade.strategyKey || trade.strategyName} to ML system: ${error.message}`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
      
      setTimeout(() => {
        setShowTradeModal(false);
        setMlSuccess(null);
      }, 2500);
    }
  };
  
  // Filter and sort scan results
  const filteredResults = scanResults.filter(stock => {
    if (filterText && !stock.symbol.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  const sortedResults = [...filteredResults].sort((a, b) => {
    let aVal = a[sortBy] || 0;
    let bVal = b[sortBy] || 0;
    
    if (sortBy === 'aiScore') {
      aVal = a.aiScore || a.compositeScore || 0;
      bVal = b.aiScore || b.compositeScore || 0;
    }
    
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🧠 Intelligent Trading Scanner v3.0
                </h1>
                <p className="text-sm text-gray-400">
                  Multi-Strategy AI Learning Platform • Win Rate: {(mlModel.winRate * 100).toFixed(1)}% • Trades: {mlModel.totalTrades}
                </p>
              </div>
            </div>
            
            {/* ML Status Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              mlModel.accuracy > 0.7 ? 'bg-green-900/50 text-green-400' :
              mlModel.accuracy > 0.5 ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-gray-800 text-gray-400'
            }`}>
              🧠 AI Accuracy: {(mlModel.accuracy * 100).toFixed(1)}%
              {mlModel.isLearning && <span className="ml-1 animate-pulse">●</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Scan Controls */}
            <button
              onClick={runIntelligentScan}
              disabled={scanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                scanning 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              }`}
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning {scanProgress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Intelligent Scan
                </>
              )}
            </button>
            
            {/* Auto-refresh toggle */}
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                autoRefresh 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Scan
            </button>
            
            {/* Configuration */}
            <button 
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
              Config
            </button>
            
            {/* Trade Tracker */}
            <button 
              onClick={() => setShowTradeTracker(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:text-white"
            >
              <Target className="w-4 h-4" />
              Trades ({activeTrades.length})
            </button>
          </div>
        </div>
        
        {/* Strategy Status Bar */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {scanStrategies.map(strategy => (
            <div
              key={strategy.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
                scanConfig.strategies[strategy.id]
                  ? 'bg-green-900/30 text-green-400 border border-green-700'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {strategy.icon}
              <span>{strategy.name}</span>
              <span className="font-mono">
                {(strategy.weight * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-2 overflow-x-auto">
          <div className="flex items-center gap-4">
            <Bell className="w-4 h-4 text-yellow-500 animate-pulse" />
            <div className="flex gap-3">
              {alerts.slice(0, 3).map((alert, i) => (
                <div key={alert.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  alert.severity === 'high' 
                    ? 'bg-red-900/50 text-red-400' 
                    : alert.severity === 'medium'
                    ? 'bg-blue-900/50 text-blue-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {alert.message}
                  {alert.stocks && (
                    <span className="ml-2 font-mono text-xs opacity-75">
                      {alert.stocks.join(', ')}
                    </span>
                  )}
                </div>
              ))}
              {alerts.length > 3 && (
                <span className="text-xs text-gray-400">+{alerts.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-purple-400">{scanResults.length}</div>
            <div className="text-sm text-gray-400">Total Opportunities</div>
            <div className="text-xs text-gray-500">Multi-strategy scan</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400">
              {scanResults.filter(s => s.multiStrategy).length}
            </div>
            <div className="text-sm text-gray-400">Multi-Strategy</div>
            <div className="text-xs text-gray-500">2+ confirmations</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-green-400">
              {scanResults.filter(s => (s.aiScore || s.compositeScore || 0) >= 80).length}
            </div>
            <div className="text-sm text-gray-400">High AI Score</div>
            <div className="text-xs text-gray-500">80+ confidence</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-orange-400">{activeTrades.length}</div>
            <div className="text-sm text-gray-400">Active Trades</div>
            <div className="text-xs text-gray-500">Being tracked</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-yellow-400">
              {(mlModel.winRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xs text-gray-500">{mlModel.totalTrades} trades</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-pink-400">
              {(mlModel.accuracy * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">AI Accuracy</div>
            <div className="text-xs text-gray-500">
              {mlModel.lastTrained ? 'Trained' : 'Learning'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter symbols..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-48"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="aiScore">AI Score</option>
              <option value="compositeScore">Composite Score</option>
              <option value="strategyCount">Strategy Count</option>
              <option value="volume">Volume</option>
              <option value="price">Price</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          
          <div className="text-sm text-gray-400">
            {lastScan && `Last scan: ${new Date(lastScan).toLocaleTimeString()}`}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="text-left p-4">SYMBOL</th>
                  <th className="text-center p-4">AI SCORE</th>
                  <th className="text-right p-4">PRICE</th>
                  <th className="text-center p-4">STRATEGIES</th>
                  <th className="text-center p-4">VOLUME</th>
                  <th className="text-center p-4">SIGNALS</th>
                  <th className="text-center p-4">CONFIDENCE</th>
                  <th className="text-center p-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading && sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-gray-400">
                      {scanning ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Running intelligent multi-strategy scan...
                        </div>
                      ) : (
                        'Click "Start Intelligent Scan" to begin analysis'
                      )}
                    </td>
                  </tr>
                ) : sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-gray-400">
                      No opportunities found matching current criteria
                    </td>
                  </tr>
                ) : (
                  sortedResults.map((stock, index) => (
                    <tr 
                      key={stock.symbol}
                      className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => handleStockSelection(stock)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold text-blue-400 text-lg">
                              {stock.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                              {stock.sector || 'Unknown Sector'}
                            </div>
                          </div>
                          {stock.multiStrategy && (
                            <div className="bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded text-xs">
                              MULTI
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className={`text-2xl font-bold ${
                          (stock.aiScore || stock.compositeScore || 0) >= 85 ? 'text-green-400' :
                          (stock.aiScore || stock.compositeScore || 0) >= 70 ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {Math.round(stock.aiScore || stock.compositeScore || 0)}
                        </div>
                        {stock.mlRanked && (
                          <div className="text-xs text-purple-400">ML Ranked</div>
                        )}
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="text-lg font-medium">${stock.price?.toFixed(2) || 'N/A'}</div>
                        <div className={`text-sm ${
                          (stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(stock.change || 0) >= 0 ? '+' : ''}{(stock.change || 0).toFixed(2)}%
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {stock.strategyCount || 1}
                        </div>
                        <div className="flex justify-center gap-1 mt-1">
                          {stock.detectedBy?.slice(0, 3).map((strategy, i) => {
                            const strategyInfo = scanStrategies.find(s => s.id === strategy);
                            return strategyInfo ? (
                              <div key={i} className={`w-2 h-2 rounded-full ${
                                strategy === 'ttm_squeeze' ? 'bg-orange-400' :
                                strategy === 'options_flow' ? 'bg-blue-400' :
                                strategy === 'gamma_exposure' ? 'bg-purple-400' :
                                strategy === 'dark_pool' ? 'bg-gray-400' :
                                strategy === 'technical_analysis' ? 'bg-green-400' :
                                'bg-red-400'
                              }`} />
                            ) : null;
                          })}
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="text-lg font-medium">
                          {stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.avgVolume ? 
                            `${((stock.volume / stock.avgVolume) || 1).toFixed(1)}x avg` : 
                            'Volume'
                          }
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          {stock.holyGrail && (
                            <div className="text-xs bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded">
                              HG: {stock.holyGrail}
                            </div>
                          )}
                          {stock.squeeze && (
                            <div className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
                              SQ: {stock.squeeze}
                            </div>
                          )}
                          {stock.gamma && (
                            <div className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded">
                              γ: {(stock.gamma || 0).toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className={`text-lg font-bold ${
                          (stock.aiScore || stock.compositeScore || 0) >= 85 ? 'text-green-400' :
                          (stock.aiScore || stock.compositeScore || 0) >= 70 ? 'text-yellow-400' :
                          'text-orange-400'
                        }`}>
                          {(stock.aiScore || stock.compositeScore || 0) >= 85 ? 'HIGH' :
                           (stock.aiScore || stock.compositeScore || 0) >= 70 ? 'MEDIUM' :
                           'LOW'}
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStockSelection(stock);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
                        >
                          <Target className="w-4 h-4" />
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trade Analysis Modal */}
      {showTradeModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">🧠 AI Analysis - {selectedStock.symbol}</h2>
                <p className="text-sm text-gray-400">
                  AI Score: {Math.round(selectedStock.aiScore || selectedStock.compositeScore || 0)} • 
                  Detected by: {selectedStock.detectedBy?.join(', ') || 'Unknown'} • 
                  Strategies: {selectedStock.strategyCount || 1}
                </p>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {loadingTrades ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                  <div className="text-lg font-medium">Analyzing 15 Strategies...</div>
                  <div className="text-sm text-gray-400">Finding optimal trade opportunities</div>
                </div>
              ) : tradeRecommendations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {tradeRecommendations.length} Trade Recommendations
                    </h3>
                    <div className="text-sm text-gray-400">
                      Avg Probability: {Math.round(tradeRecommendations.reduce((sum, t) => sum + t.probability, 0) / tradeRecommendations.length)}%
                    </div>
                  </div>

                  {tradeRecommendations.map((trade, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-colors">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <div className="font-bold text-lg text-purple-400">{trade.strategyKey || trade.strategyName}</div>
                          <div className="text-sm text-gray-400">{trade.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Complexity: <span className="text-blue-400">{trade.complexity}</span> | 
                            DTE: <span className="text-green-400">{trade.dte || 35}</span> | 
                            Risk: <span className="text-yellow-400">{trade.riskProfile || 'Moderate'}</span>
                          </div>
                          
                          {/* Enhanced Trade Execution Details */}
                          {trade.legs && trade.legs.length > 0 && (
                            <div className="mt-2 text-xs">
                              <div className="font-semibold text-gray-300 mb-1">📋 Trade Legs:</div>
                              <div className="space-y-1">
                                {trade.legs.slice(0, 2).map((leg, legIndex) => (
                                  <div key={legIndex} className="bg-gray-900 rounded p-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-1 py-0.5 rounded text-xs ${
                                        leg.action === 'BUY' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                                      }`}>
                                        {leg.action}
                                      </span>
                                      <span className="text-white font-mono">{leg.optionType}</span>
                                      <span className="text-gray-300">${leg.strike}</span>
                                    </div>
                                    <span className="text-gray-400">{leg.quantity}x</span>
                                  </div>
                                ))}
                                {trade.legs.length > 2 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{trade.legs.length - 2} more legs
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 📅 Enhanced Trade Dates & Details */}
                          <div className="mt-3 text-xs bg-gray-800/50 border border-gray-700 rounded p-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-400">Entry:</span>
                                <span className="ml-1 text-green-300">{trade.entryDate || new Date().toISOString().split('T')[0]}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Expiry:</span>
                                <span className="ml-1 text-blue-300">{trade.expirationDate || 'TBD'}</span>
                              </div>
                              {trade.breakevens && trade.breakevens.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Breakevens:</span>
                                  <span className="ml-1 text-yellow-300">
                                    {trade.breakevens.map(be => `$${be.toFixed(2)}`).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 🎯 SURGICAL EXECUTION PLAN */}
                          {trade.executionPlan && (
                            <div className="mt-2 text-xs bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded p-3">
                              <div className="font-bold text-purple-300 mb-2 flex items-center gap-1">
                                🎯 Surgical Execution Plan
                              </div>
                              
                              {/* Entry Strategy */}
                              <div className="mb-2">
                                <div className="text-purple-200 font-medium">📈 Entry Strategy:</div>
                                <div className="text-gray-300 ml-2">
                                  <span className="text-blue-400">{trade.executionPlan.entry?.orderType}</span> order at{' '}
                                  <span className="text-green-400">{trade.executionPlan.entry?.timing}</span>
                                  {trade.executionPlan.entry?.notes && trade.executionPlan.entry.notes[0] && (
                                    <div className="text-yellow-300 text-xs mt-1">💡 {trade.executionPlan.entry.notes[0]}</div>
                                  )}
                                </div>
                              </div>

                              {/* Profit Targets */}
                              {trade.executionPlan.profitTargets && trade.executionPlan.profitTargets.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-purple-200 font-medium">🎯 Profit Targets:</div>
                                  <div className="ml-2 space-y-1">
                                    {trade.executionPlan.profitTargets.slice(0, 2).map((target, idx) => (
                                      <div key={idx} className="text-green-400 text-xs">
                                        {target.percent}% profit → {target.action} (${target.trigger?.toFixed(0)} by day {target.timeLimit})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Risk Management */}
                              {trade.executionPlan.riskManagement && (
                                <div className="mb-2">
                                  <div className="text-purple-200 font-medium">🛡️ Risk Management:</div>
                                  <div className="ml-2 text-red-300 text-xs">
                                    Stop Loss: {trade.executionPlan.riskManagement.stopLoss?.type || 'Dynamic'} 
                                    {trade.executionPlan.riskManagement.stopLoss?.trigger && 
                                      ` at $${Math.abs(trade.executionPlan.riskManagement.stopLoss.trigger).toFixed(0)}`
                                    }
                                  </div>
                                  <div className="ml-2 text-yellow-300 text-xs">
                                    Max Hold: {trade.executionPlan.riskManagement.maxDaysToHold || 21} days
                                  </div>
                                </div>
                              )}

                              {/* Time Stops */}
                              {trade.executionPlan.riskManagement?.timeStops && trade.executionPlan.riskManagement.timeStops.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-purple-200 font-medium">⏰ Time Exits:</div>
                                  <div className="ml-2">
                                    {trade.executionPlan.riskManagement.timeStops.slice(0, 2).map((stop, idx) => (
                                      <div key={idx} className="text-orange-300 text-xs">
                                        {stop.dte} DTE → {stop.action}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Order Management */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="text-gray-400">
                                  Est. Commission: ${trade.executionPlan.orderManagement?.commission?.toFixed(2) || '0.65'}
                                </div>
                                <div className="flex gap-2">
                                  {trade.executionPlan.orderManagement?.bracket && (
                                    <span className="bg-blue-900/50 text-blue-300 px-1 rounded">OCO</span>
                                  )}
                                  {trade.executionPlan.orderManagement?.multiLeg && (
                                    <span className="bg-purple-900/50 text-purple-300 px-1 rounded">Multi-Leg</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            trade.probability >= 80 ? 'text-green-400' : 
                            trade.probability >= 60 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {Math.round(trade.probability)}%
                          </div>
                          <div className="text-xs text-gray-500">Probability</div>
                        </div>

                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            trade.aiScore >= 80 ? 'text-blue-400' : 
                            trade.aiScore >= 60 ? 'text-purple-400' : 'text-gray-400'
                          }`}>
                            {Math.round(trade.aiScore || 0)}
                          </div>
                          <div className="text-xs text-gray-500">AI Score</div>
                        </div>

                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.sentiment === 'BULLISH' ? 'bg-green-800 text-green-200' :
                            trade.sentiment === 'BEARISH' ? 'bg-red-800 text-red-200' :
                            'bg-gray-800 text-gray-300'
                          }`}>
                            {trade.sentiment || 'NEUTRAL'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Direction</div>
                        </div>

                        <div className="text-center">
                          <button
                            onClick={() => handleTradeSelection(trade)}
                            disabled={processingTrade === index}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              processingTrade === index
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : mlSuccess === index
                                  ? 'bg-green-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {processingTrade === index ? (
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                              </div>
                            ) : mlSuccess === index ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Success!
                              </div>
                            ) : (
                              'Select Trade'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center text-sm text-gray-500 mt-6">
                    🧠 Selecting a trade feeds comprehensive data to the ML learning system
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                  <div className="text-lg font-medium mb-2">Intelligent Strategy Analysis</div>
                  <div className="text-gray-400">
                    Click on a stock to see advanced AI-powered trade recommendations
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}