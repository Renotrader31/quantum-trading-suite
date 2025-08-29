import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  TrendingUp, AlertCircle, Zap, Activity, BarChart3, 
  Target, Eye, Waves, ArrowUpRight, ArrowDownRight, Filter,
  Shield, Brain, RefreshCw, Flame, LineChart, DollarSign,
  Clock, ChevronDown, ChevronUp, Search, BarChart, Settings,
  Bell, TrendingDown, AlertTriangle, Sparkles, Award,
  PieChart, Globe, Cpu, Heart, Plane, ShoppingCart, Building2,
  Banknote, Droplet, Battery, Package, Wrench, Play, Pause, Loader,
  Wifi, WifiOff, CheckCircle
} from 'lucide-react';

// Configuration - Update this when you deploy to Vercel
const API_BASE_URL = ''; // Leave empty for same-origin requests

export default function SqueezeScanner({ marketData, loading: propsLoading, onRefresh, lastUpdate: propsLastUpdate }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [sortBy, setSortBy] = useState('holyGrail');
  const [sortOrder, setSortOrder] = useState('desc');
  const [scanProgress, setScanProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeRecommendations, setTradeRecommendations] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [processingTrade, setProcessingTrade] = useState(null); // Track which trade is being processed
  const [mlSuccess, setMlSuccess] = useState(null); // Track successful ML processing
  const eventSourceRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Advanced filters - Adjusted for better results
  const [advancedFilters, setAdvancedFilters] = useState({
    minHolyGrail: 5,   // Very low threshold to show more results
    minUnusual: 0.5,   // Very low threshold for unusual activity  
    minSweeps: 0,      // Allow stocks without sweeps
    minFlow: 10,       // Very low flow threshold
    minGamma: 0.001,   // Very low gamma threshold
    maxDTC: 50,        // Much higher DTC allowance
    minShortInterest: 0  // No short interest requirement
  });

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Integrate with existing market data from Dashboard
  useEffect(() => {
    if (marketData && Object.keys(marketData).length > 0 && stocks.length === 0) {
      console.log('🔄 Integrating with existing market data:', Object.keys(marketData).length, 'symbols');
      
      // Pre-populate scanner with market data symbols for quick analysis
      const symbolsToScan = Object.keys(marketData).filter(symbol => 
        !['SPY', 'QQQ', 'IWM', 'VIX'].includes(symbol) // Exclude indices
      );
      
      if (symbolsToScan.length > 0) {
        console.log('📊 Suggesting symbols for squeeze analysis:', symbolsToScan.slice(0, 5));
        // You could auto-scan these symbols or just show a suggestion
      }
    }
  }, [marketData, stocks]);

  // Connect to SSE stream for real-time updates
  const connectToStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_BASE_URL}/api/stream-updates`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to real-time stream');
    };

    eventSource.addEventListener('flow', (event) => {
      const flowData = JSON.parse(event.data);
      processRealtimeFlow(flowData);
    });

    eventSource.addEventListener('connected', (event) => {
      console.log('Stream connected:', event.data);
    });

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      setIsConnected(false);
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (autoRefresh) {
          connectToStream();
        }
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [autoRefresh]);

  // Process real-time flow updates
  const processRealtimeFlow = (flowData) => {
    if (!flowData) return;

    // Check if this stock is in our list
    const stockIndex = stocks.findIndex(s => s.symbol === flowData.symbol);
    if (stockIndex === -1) return;

    // Update the stock with new flow info
    setStocks(prevStocks => {
      const newStocks = [...prevStocks];
      const stock = newStocks[stockIndex];
      
      // Add to recent flows
      if (!stock.recentFlows) stock.recentFlows = [];
      stock.recentFlows.unshift({
        type: flowData.type,
        strike: flowData.strike,
        premium: flowData.premium,
        volume: flowData.volume,
        time: new Date().toLocaleTimeString(),
        unusual: flowData.unusual
      });
      stock.recentFlows = stock.recentFlows.slice(0, 10); // Keep last 10
      
      stock.lastUpdate = new Date().toISOString();
      
      return newStocks;
    });

    // Check for alerts
    if (flowData.unusual && flowData.multiplier >= advancedFilters.minUnusual) {
      addAlert({
        type: 'UNUSUAL_FLOW',
        symbol: flowData.symbol,
        message: `${flowData.symbol}: ${flowData.multiplier.toFixed(1)}x unusual ${flowData.type} activity`,
        severity: flowData.multiplier >= 4 ? 'high' : 'medium',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Add alert
  const addAlert = (alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 20)); // Keep last 20 alerts
  };

  // Scan single stock
  const scanStock = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scan/${symbol}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to scan stock');
      }
    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error);
      setErrors(prev => [...prev, { symbol, error: error.message }]);
      return null;
    }
  };

  // Bulk scan function - Updated to use enhanced API with live data
  const startBulkScan = async () => {
    setScanning(true);
    setLoading(true);
    setScanProgress(0);
    setErrors([]);
    
    try {
      console.log('🚀 Starting enhanced squeeze scan with live data integration...');
      const response = await fetch(`${API_BASE_URL}/api/enhanced-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbols: undefined, // Will use default from API (enhanced symbols)
          batchSize: 10,
          integrateLiveData: true // Enable live data integration
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Enhanced scan complete: ${data.scanned} stocks scanned, ${data.liveDataCount} with live data`);
        const results = data.opportunities || data.results || [];
        console.log('🔍 DEBUG: First stock data:', JSON.stringify(results[0], null, 2));
        console.log('🔍 DEBUG: Data source:', data.dataSource);
        setStocks(results);
        setLastUpdate(new Date().toISOString());
        
        // Show success alert with enhanced data info
        if (data.liveDataIntegrated && data.liveDataCount > 0) {
          addAlert({
            type: 'SCAN_SUCCESS',
            symbol: 'SYSTEM',
            message: `Enhanced scan complete: ${data.scanned} stocks, ${data.liveDataCount} with LIVE data integration`,
            severity: 'medium',
            timestamp: new Date().toISOString()
          });
        }
        
        // Check for high holy grail scores
        results.forEach(stock => {
          if (stock.holyGrail >= 85) {
            addAlert({
              type: 'HOLY_GRAIL',
              symbol: stock.symbol,
              message: `${stock.symbol}: Holy Grail score ${stock.holyGrail} - STRONG signal`,
              severity: 'high',
              timestamp: new Date().toISOString()
            });
          }
        });
      }
      
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    } catch (error) {
      console.error('Bulk scan error:', error);
      setErrors([{ error: 'Bulk scan failed: ' + error.message }]);
    } finally {
      setScanning(false);
      setLoading(false);
      setScanProgress(100);
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      // Connect to stream
      connectToStream();
      
      // Set up periodic full refresh
      refreshIntervalRef.current = setInterval(() => {
        startBulkScan();
      }, 300000); // 5 minutes
    } else {
      // Disconnect stream
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsConnected(false);
      }
      
      // Clear interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, connectToStream]);

  // Filtering logic
  const filteredStocks = stocks.filter(stock => {
    if (searchTerm && !stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filter === 'unusual' && stock.flowAnalysis.unusual.multiplier < 2) return false;
    if (filter === 'sweeps' && stock.flowAnalysis.sweeps.count === 0) return false;
    if (filter === 'bullish' && stock.flowAnalysis.sentiment.score < 60) return false;
    if (filter === 'squeeze' && stock.squeeze < 85) return false;
    
    // Advanced filters
    if (stock.holyGrail < advancedFilters.minHolyGrail) return false;
    if (stock.flowAnalysis.unusual.multiplier < advancedFilters.minUnusual) return false;
    if (stock.flowAnalysis.sweeps.count < advancedFilters.minSweeps) return false;
    if (stock.flow < advancedFilters.minFlow) return false;
    if (stock.gamma < advancedFilters.minGamma) return false;
    if (stock.dtc > advancedFilters.maxDTC) return false;
    
    return true;
  });

  // Sorting logic
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'unusual') {
      aVal = a.flowAnalysis.unusual.multiplier;
      bVal = b.flowAnalysis.unusual.multiplier;
    }
    if (sortBy === 'sentiment') {
      aVal = a.flowAnalysis.sentiment.score;
      bVal = b.flowAnalysis.sentiment.score;
    }
    
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleRowExpansion = (symbol) => {
    setExpandedRows(prev => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  // Scan single stock
  const handleSingleScan = async (symbol) => {
    const result = await scanStock(symbol);
    if (result) {
      setStocks(prev => {
        const filtered = prev.filter(s => s.symbol !== symbol);
        return [result, ...filtered];
      });
    }
  };

  // Handle stock click for trade analysis
  const handleStockClick = async (stock, event) => {
    // Prevent triggering row expansion
    event.stopPropagation();
    
    console.log(`🎯 Analyzing trade opportunities for ${stock.symbol}...`);
    setSelectedStock(stock);
    setShowTradeModal(true);
    setLoadingTrades(true);
    
    try {
      // Get trade recommendations with SQUEEZE CONTEXT integration 🎯
      console.log(`🟢 SQUEEZE INTEGRATION: HG=${stock.holyGrail}, Squeeze=${stock.squeeze}, Momentum=${stock.change || 0}`);
      const response = await fetch(`${API_BASE_URL}/api/options-analyzer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: [stock.symbol],
          maxTrades: 8, // Get more trades for this specific stock
          minProbability: 55, // Lower threshold for more recommendations
          riskTolerance: 'moderate-aggressive', // Enhanced risk profile
          maxInvestment: 15000, // Higher investment limit
          targetDTE: { min: 30, max: 45 }, // Enhanced DTE targeting
          precisionMode: true, // Enable enhanced features
          // 🚀 NEW: Pass squeeze context for intelligent strategy filtering
          squeezeContext: {
            holyGrail: stock.holyGrail,
            squeeze: stock.squeeze,
            price: stock.price,
            volume: stock.volume,
            momentum: stock.change || 0,
            gamma: stock.gamma || 0,
            flow: stock.flow || 0,
            unusual: stock.unusual || 0,
            sentiment: stock.flowAnalysis?.sentiment?.score || 50
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTradeRecommendations(data.actionableTrades);
        console.log(`✅ SQUEEZE-ENHANCED: Found ${data.actionableTrades.length} trade recommendations for ${stock.symbol}`);
        console.log(`📊 Average Probability: ${data.summary?.averageProbability}%, AI Score: ${data.summary?.averageAIScore}`);
        
        // Show squeeze context impact
        if (data.actionableTrades.length > 0) {
          const avgBonus = data.actionableTrades.reduce((sum, t) => sum + (t.holyGrailBonus || 0), 0) / data.actionableTrades.length;
          console.log(`🟢 Holy Grail Bonus: +${avgBonus.toFixed(1)} average probability boost`);
        }
      } else {
        console.error('❌ Failed to get trade recommendations:', data.error);
        setTradeRecommendations([]);
      }
      
    } catch (error) {
      console.error('❌ Error getting trade recommendations:', error);
      setTradeRecommendations([]);
    } finally {
      setLoadingTrades(false);
    }
  };

  // Handle trade selection and feed to ML with MAXIMUM data capture
  const handleTradeSelection = async (trade) => {
    console.log(`🎯 ENHANCED TRADE SELECTION: ${trade.strategyKey || trade.strategyName} for ${selectedStock.symbol}`);
    
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
          change: selectedStock.change,
          changePercent: selectedStock.changePercent,
          marketCap: selectedStock.marketCap,
          avgVolume: selectedStock.avgVolume,
          beta: selectedStock.beta,
          peRatio: selectedStock.peRatio,
          eps: selectedStock.eps,
          dividend: selectedStock.dividend,
          sector: selectedStock.sector,
          industry: selectedStock.industry
        },
        
        // 🔥 Comprehensive Squeeze Context  
        squeezeContext: {
          holyGrail: selectedStock.holyGrail,
          squeeze: selectedStock.squeeze,
          gamma: selectedStock.gamma,
          flow: selectedStock.flow,
          dix: selectedStock.dix,
          gex: selectedStock.gex,
          darkPool: selectedStock.darkPool,
          shortInterest: selectedStock.shortInterest,
          institutionalOwnership: selectedStock.institutionalOwnership,
          optionsMetrics: selectedStock.optionsMetrics,
          recentFlows: selectedStock.recentFlows?.slice(0, 10), // Last 10 flows
          technicals: {
            rsi: selectedStock.rsi,
            macd: selectedStock.macd,
            ema20: selectedStock.ema20,
            sma50: selectedStock.sma50,
            bollinger: selectedStock.bollinger,
            vwap: selectedStock.vwap
          }
        },
        
        // 📊 Options Strategy Details
        strategyDetails: {
          strategyName: trade.strategyKey || trade.strategyName,
          complexity: trade.complexity,
          riskProfile: trade.riskProfile,
          probability: trade.probability,
          aiScore: trade.aiScore,
          holyGrailBonus: trade.holyGrailBonus || 0,
          expectedReturn: trade.expectedReturn,
          maxLoss: trade.maxLoss,
          riskReward: trade.riskReward,
          positionSize: trade.positionSize,
          marketCondition: trade.marketCondition
        },
        
        // ⚡ Key Levels & Targets
        keyLevels: {
          support: trade.support || selectedStock.support,
          resistance: trade.resistance || selectedStock.resistance,
          pivot: trade.pivot || selectedStock.pivot,
          targets: trade.targets || [],
          stopLoss: trade.stopLoss || selectedStock.stopLoss,
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
          portfolioRisk: trade.portfolioRisk || 2, // Default 2% portfolio risk
          positionSizing: 'kelly_criterion',
          exitStrategy: trade.exitStrategy || 'profit_target_50_stop_loss_25'
        },
        
        // 🧠 ML Learning Features
        learningFeatures: {
          timeOfDay: currentDate.getHours(),
          dayOfWeek: currentDate.getDay(),
          marketSession: currentDate.getHours() >= 9 && currentDate.getHours() <= 16 ? 'market_hours' : 'after_hours',
          volatilityRegime: selectedStock.optionsMetrics?.ivRank > 50 ? 'high_iv' : 'low_iv',
          marketTrend: selectedStock.change > 0 ? 'bullish' : 'bearish',
          squeezeStrength: selectedStock.holyGrail >= 75 ? 'strong' : selectedStock.holyGrail >= 50 ? 'moderate' : 'weak',
          volumeProfile: selectedStock.volume > selectedStock.avgVolume * 1.5 ? 'high_volume' : 'normal_volume',
          gammaExposure: selectedStock.gex > 0 ? 'positive_gamma' : 'negative_gamma'
        }
      };

      console.log('📊 Feeding comprehensive trade data to ML learning system:', {
        symbol: selectedStock.symbol,
        strategy: trade.strategyKey || trade.strategyName,
        dataPoints: Object.keys(enhancedTradeData).length,
        holyGrail: selectedStock.holyGrail,
        probability: trade.probability
      });

      // Feed selected trade to ML learning system with maximum data
      const mlResponse = await fetch(`${API_BASE_URL}/api/ml-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_selection',
          trade: enhancedTradeData,
          meta: {
            version: '3.0_enhanced',
            dataQuality: 'premium',
            completeness: 'maximum',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        console.log('✅ Trade successfully fed to ML learning system:', mlResult);
        
        // Enhanced success notification with ML feedback
        if (typeof addAlert === 'function') {
          addAlert({
            type: 'TRADE_SELECTED',
            symbol: selectedStock.symbol,
            message: `🧠 ${trade.strategyKey || trade.strategyName} → ML Learning | ${selectedStock.symbol} | Accuracy: ${mlResult.learningResult?.accuracy || 'N/A'}% | Models: ${mlResult.learningResult?.modelsUpdated || 0} | Neural Net: ${mlResult.learningResult?.neuralNetworkResults?.modelTrained ? '✅ Trained' : '❌'}`,
            severity: 'medium',
            timestamp: new Date().toISOString(),
            mlFeedback: mlResult
          });
        }

        // Log ML learning effectiveness
        console.log('🎯 ML Learning Stats:', {
          modelsUpdated: mlResult.learningResult?.modelsUpdated || 0,
          accuracy: mlResult.learningResult?.accuracy || 'N/A',
          patternsLearned: mlResult.learningResult?.patternsLearned || 0,
          trainingDataSize: mlResult.learningResult?.trainingDataSize || 0,
          neuralNetwork: mlResult.learningResult?.neuralNetworkResults
        });

        // Clear processing state and show success feedback
        setProcessingTrade(null);
        setMlSuccess({
          strategy: trade.strategyKey || trade.strategyName,
          symbol: selectedStock.symbol,
          result: mlResult.learningResult
        });
        
        // 🎯 ALSO RECORD TRADE ENTRY for Trade Tracker
        try {
          const tradeEntryData = {
            symbol: selectedStock.symbol,
            strategyName: trade.strategyKey || trade.strategyName,
            entryPrice: selectedStock.price || 0,
            strikes: enhancedTradeData.tradeExecution.strikes,
            expiration: enhancedTradeData.tradeExecution.expirationDate,
            dte: enhancedTradeData.tradeExecution.dte,
            positionSize: enhancedTradeData.strategyDetails.positionSize || 1,
            maxLoss: enhancedTradeData.strategyDetails.maxLoss || 0,
            maxGain: enhancedTradeData.strategyDetails.expectedReturn || 0,
            
            // ML Context for correlation tracking
            squeezeContext: enhancedTradeData.squeezeContext,
            marketConditions: enhancedTradeData.marketData,
            neuralNetworkPrediction: mlResult.learningResult?.neuralNetworkResults?.confidence || 0,
            aiScore: enhancedTradeData.strategyDetails.aiScore || 0,
            probability: enhancedTradeData.strategyDetails.probability || 0
          };

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
            console.log('📋 Trade entry recorded in TradeTracker:', tradeResult.tradeId);
            
            // Update ML success with trade tracking info
            setMlSuccess({
              strategy: trade.strategyKey || trade.strategyName,
              symbol: selectedStock.symbol,
              result: {
                ...mlResult.learningResult,
                tradeTracked: true,
                tradeId: tradeResult.tradeId,
                activeTrades: tradeResult.activeTrades
              }
            });
          } else {
            console.warn('⚠️ Trade entry recording failed:', tradeEntryResponse.status);
          }
        } catch (tradeTrackError) {
          console.error('❌ Error recording trade entry:', tradeTrackError);
          // Don't fail the whole process if trade tracking fails
          // Update ML success to show partial success
          setMlSuccess({
            strategy: trade.strategyKey || trade.strategyName,
            symbol: selectedStock.symbol,
            result: {
              ...mlResult.learningResult,
              tradeTracked: false,
              tradeTrackingError: tradeTrackError.message
            }
          });
        }

        // Keep modal open much longer to show success feedback
        setTimeout(() => {
          setShowTradeModal(false);
          setMlSuccess(null); // Clear success state when modal closes
        }, 8000); // Keep modal open for 8 seconds to show success feedback
        
      } else {
        console.warn('⚠️ ML learning API returned error status:', mlResponse.status);
        setProcessingTrade(null);
        setMlSuccess(null);
        
        // Show error and close modal after delay
        setTimeout(() => {
          setShowTradeModal(false);
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error feeding trade to ML system:', error);
      setProcessingTrade(null);
      setMlSuccess(null);
      
      // Add error alert
      if (typeof addAlert === 'function') {
        addAlert({
          type: 'ERROR',
          symbol: selectedStock.symbol,
          message: `Failed to feed ${trade.strategyKey || trade.strategyName} to ML system: ${error.message}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
      
      // Close modal after showing error
      setTimeout(() => {
        setShowTradeModal(false);
        setMlSuccess(null);
      }, 2500);
    }
  };

  // Handle individual stock analysis
  const handleIndividualAnalysis = async (symbol) => {
    console.log(`🔍 Individual analysis for ${symbol}...`);
    
    try {
      // First get squeeze data for this stock
      const scanResponse = await fetch(`${API_BASE_URL}/api/enhanced-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: [symbol],
          integrateLiveData: true
        })
      });
      
      const scanData = await scanResponse.json();
      
      if (scanData.success && (scanData.opportunities || scanData.results) && (scanData.opportunities || scanData.results).length > 0) {
        const results = scanData.opportunities || scanData.results;
        const stockData = results[0];
        
        // Use the scanned stock data for trade analysis
        handleStockClick(stockData, { stopPropagation: () => {} });
        
        // Add to alerts if available
        if (typeof addAlert === 'function') {
          addAlert({
            type: 'INDIVIDUAL_ANALYSIS',
            symbol: symbol,
            message: `Individual analysis started for ${symbol} | Holy Grail: ${stockData.holyGrail || 'N/A'}`,
            severity: 'medium',
            timestamp: new Date().toISOString()
          });
        }
        
        console.log(`✅ Individual analysis complete for ${symbol}:`, stockData);
      } else {
        console.error('❌ Failed to scan individual stock:', scanData.error || 'No data returned');
        alert(`❌ Could not analyze ${symbol}. Please try again or check if the symbol is valid.`);
      }
      
    } catch (error) {
      console.error('❌ Error in individual analysis:', error);
      alert(`❌ Error analyzing ${symbol}: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">Professional Squeeze Scanner 3.0</h1>
              <p className="text-sm text-gray-400">LEGENDARY EDITION - Real-Time Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Individual Ticker Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter ticker (e.g. AAPL)"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-40 uppercase"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const symbol = e.target.value.trim().toUpperCase();
                    if (symbol) {
                      handleIndividualAnalysis(symbol);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="ticker"]');
                  const symbol = input.value.trim().toUpperCase();
                  if (symbol) {
                    handleIndividualAnalysis(symbol);
                    input.value = '';
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                title="Analyze individual stock"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>

            {/* Scan Controls */}
            <button
              onClick={startBulkScan}
              disabled={scanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                scanning 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {scanning ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Scan
                </>
              )}
            </button>
            
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                autoRefresh ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            
            <div className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-full">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Live Stream Active</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Stream Disconnected</span>
                </>
              )}
            </div>
            
            {lastUpdate && isClient && (
              <span className="text-sm text-gray-400">
                Updated: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-2 overflow-x-auto">
          <div className="flex items-center gap-4">
            <Bell className="w-4 h-4 text-yellow-500" />
            <div className="flex gap-3">
              {alerts.slice(0, 3).map((alert, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  alert.severity === 'high' 
                    ? 'bg-red-900/50 text-red-400' 
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {alert.message}
                </div>
              ))}
              {alerts.length > 3 && (
                <span className="text-xs text-gray-400">+{alerts.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 px-6 py-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Scan errors: {errors.length} symbols failed</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Market Overview Cards */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold">{stocks.length}</div>
            <div className="text-sm text-gray-400">Scanned</div>
            <div className="text-xs text-gray-500">Total stocks</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold">{sortedStocks.length}</div>
            <div className="text-sm text-gray-400">Filtered</div>
            <div className="text-xs text-gray-500">Matching criteria</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-orange-400">
              {stocks.filter(s => s.holyGrail >= 85).length}
            </div>
            <div className="text-sm text-gray-400">High Score</div>
            <div className="text-xs text-gray-500">Holy Grail 85+</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-yellow-400">
              {stocks.filter(s => s.flowAnalysis.unusual.multiplier >= 3).length}
            </div>
            <div className="text-sm text-gray-400">Very Unusual</div>
            <div className="text-xs text-gray-500">3x+ activity</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-purple-400">
              {stocks.reduce((sum, s) => sum + s.flowAnalysis.sweeps.count, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Sweeps</div>
            <div className="text-xs text-gray-500">Aggressive orders</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-blue-400">
              {alerts.length}
            </div>
            <div className="text-sm text-gray-400">Active Alerts</div>
            <div className="text-xs text-gray-500">This session</div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Stocks' },
              { id: 'squeeze', label: 'High Squeeze', icon: Activity },
              { id: 'unusual', label: 'Unusual Activity', icon: Flame },
              { id: 'sweeps', label: 'Sweep Orders', icon: Zap },
              { id: 'bullish', label: 'Bullish Flow', icon: TrendingUp }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  filter === f.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {f.icon && <f.icon className="w-3 h-3" />}
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-48"
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="text-left p-4">SYMBOL</th>
                  <th className="text-center p-4 cursor-pointer hover:text-white" onClick={() => handleSort('holyGrail')}>
                    HOLY GRAIL {sortBy === 'holyGrail' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-right p-4">PRICE</th>
                  <th className="text-center p-4 cursor-pointer hover:text-white" onClick={() => handleSort('squeeze')}>
                    SQUEEZE {sortBy === 'squeeze' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-center p-4 cursor-pointer hover:text-white" onClick={() => handleSort('gamma')}>
                    GAMMA {sortBy === 'gamma' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-center p-4">FLOW</th>
                  <th className="text-center p-4 cursor-pointer hover:text-white" onClick={() => handleSort('unusual')}>
                    UNUSUAL {sortBy === 'unusual' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-center p-4">DARK POOL</th>
                  <th className="text-center p-4 cursor-pointer hover:text-white" onClick={() => handleSort('sentiment')}>
                    SENTIMENT {sortBy === 'sentiment' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-center p-4">PIN RISK</th>
                  <th className="text-center p-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading && !scanning ? (
                  <tr>
                    <td colSpan="11" className="text-center p-8 text-gray-400">
                      Click Start Scan to begin analysis...
                    </td>
                  </tr>
                ) : sortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center p-8 text-gray-400">
                      No stocks match current filters
                    </td>
                  </tr>
                ) : (
                  sortedStocks.map(stock => (
                    <React.Fragment key={stock.symbol}>
                      <tr 
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => toggleRowExpansion(stock.symbol)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleStockClick(stock, e)}
                              className="font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 px-2 py-1 rounded transition-colors"
                              title="Click to analyze trade opportunities"
                            >
                              {stock.symbol}
                            </button>
                            {stock.lastUpdate && new Date(stock.lastUpdate).getTime() > Date.now() - 60000 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Recently updated" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-2xl font-bold">{stock.holyGrail}</div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            stock.holyGrailStatus === 'STRONG' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {stock.holyGrailStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-medium">${stock.price.toFixed(2)}</div>
                          <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-xl font-bold text-red-400">{stock.squeeze}</div>
                          <div className="text-xs text-gray-500">DTC: {stock.dtc.toFixed(1)}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-xl font-bold text-purple-400">{stock.gamma.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">GEX: ${stock.gex.toFixed(0)}M</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className={`text-xl font-bold ${
                            stock.flow >= 60 ? 'text-green-400' : stock.flow <= 40 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {stock.flow}%
                          </div>
                          <div className="text-xs text-gray-500">
                            P/C: {stock.optionsMetrics.putCallRatio.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-xl font-bold text-orange-400">
                            {stock.flowAnalysis.unusual.multiplier.toFixed(1)}x
                          </div>
                          {stock.flowAnalysis.sweeps.count > 0 && (
                            <span className="bg-orange-900/50 text-orange-400 px-1.5 py-0.5 rounded text-xs">
                              {stock.flowAnalysis.sweeps.count} SWEEP
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {(stock.darkPool.ratio * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {(stock.darkPool.volume / 1000000).toFixed(1)}M
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className={`text-lg font-bold ${
                            stock.flowAnalysis.sentiment.score >= 70 ? 'text-green-400' : 
                            stock.flowAnalysis.sentiment.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {stock.flowAnalysis.sentiment.score}%
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            stock.flowAnalysis.sentiment.overall === 'BULLISH'
                              ? 'bg-green-900/50 text-green-400'
                              : stock.flowAnalysis.sentiment.overall === 'BEARISH'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {stock.flowAnalysis.sentiment.overall}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            stock.pinRisk > 80 ? 'bg-red-600 text-white' : 
                            stock.pinRisk > 60 ? 'bg-yellow-600 text-white' : 
                            'bg-green-600 text-white'
                          }`}>
                            {stock.pinRisk > 80 ? 'HIGH' : stock.pinRisk > 60 ? 'MED' : 'LOW'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button 
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStockClick(stock, e);
                              }}
                              title="Get trade strategies for this stock"
                            >
                              <Target className="w-3 h-3" />
                              Get Strategies
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {expandedRows[stock.symbol] && (
                        <tr className="bg-gray-900/50">
                          <td colSpan="11" className="p-6">
                            <div className="grid grid-cols-5 gap-4">
                              <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold mb-3">Options Flow Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Total Volume</span>
                                    <span>{stock.optionsMetrics.totalVolume.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Vol/OI Ratio</span>
                                    <span className="text-orange-400">{stock.optionsMetrics.volumeOIRatio?.toFixed(2) || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Net Premium</span>
                                    <span className={stock.optionsMetrics.netPremium > 0 ? 'text-green-400' : 'text-red-400'}>
                                      ${(stock.optionsMetrics.netPremium / 1000000).toFixed(1)}M
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">IV Rank</span>
                                    <span>{stock.optionsMetrics.ivRank}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold mb-3">Key Levels</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Max Pain</span>
                                    <span className="text-yellow-400">${stock.keyLevels.maxPain}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Gamma Wall</span>
                                    <span className="text-purple-400">${stock.keyLevels.gammaWall}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Put Wall</span>
                                    <span className="text-red-400">${stock.keyLevels.putWall}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Call Wall</span>
                                    <span className="text-green-400">${stock.keyLevels.callWall}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold mb-3">Flow Analysis</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Unusual Score</span>
                                    <span>{stock.flowAnalysis.unusual.percentile}th percentile</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Bullish Sweeps</span>
                                    <span className="text-green-400">{stock.flowAnalysis.sweeps.bullish}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Bearish Sweeps</span>
                                    <span className="text-red-400">{stock.flowAnalysis.sweeps.bearish}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Block Trades</span>
                                    <span>{stock.flowAnalysis.blocks?.count || 0}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-bold mb-3">Dark Pool Activity</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">DP Ratio</span>
                                    <span>{(stock.darkPool.ratio * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">DP Volume</span>
                                    <span>{(stock.darkPool.volume / 1000000).toFixed(2)}M</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">DP Trades</span>
                                    <span>{stock.darkPool.trades.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Avg Size</span>
                                    <span>{Math.round(stock.darkPool.volume / stock.darkPool.trades || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                                <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold mb-3">IV & Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">IV Rank</span>
                    <span>{stock.optionsMetrics.ivRank || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ATM IV</span>
                    <span>{stock.optionsMetrics.atmIV ? `${stock.optionsMetrics.atmIV.toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skew</span>
                    <span>{stock.optionsMetrics.skew ? stock.optionsMetrics.skew.toFixed(1) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Term</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      stock.optionsMetrics.term === 'CONTANGO'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {stock.optionsMetrics.term || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
                              </div>
                            
                            {/* Recent Flows if available */}
                            {stock.recentFlows && stock.recentFlows.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-bold mb-2">Recent Option Flows</h4>
                                <div className="space-y-2">
                                  {stock.recentFlows.slice(0, 5).map((flow, i) => (
                                    <div key={i} className="bg-gray-800 rounded p-2 text-sm grid grid-cols-5 gap-2">
                                      <div>
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                          flow.type === 'CALL' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                        }`}>
                                          {flow.type}
                                        </span>
                                        <span className="ml-2">${flow.strike}</span>
                                      </div>
                                      <div>${(flow.premium / 1000000).toFixed(2)}M</div>
                                      <div>{flow.volume.toLocaleString()} contracts</div>
                                      <div className="flex gap-1">
                                        {flow.unusual && <span className="bg-purple-900/50 text-purple-400 px-1 rounded text-xs">UNUSUAL</span>}
                                      </div>
                                      <div className="text-right text-gray-400">{flow.time}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold">🎯 Squeeze-Enhanced Analysis - {selectedStock.symbol}</h2>
                  <p className="text-sm text-gray-400">
                    Price: ${selectedStock.price} • Holy Grail: {selectedStock.holyGrail} • Squeeze: {selectedStock.squeeze}
                  </p>
                  <p className="text-xs text-blue-300">
                    🟢 Intelligent strategy filtering based on squeeze signals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            {/* ML Success Banner - PROMINENT FEEDBACK */}
            {mlSuccess && (
              <div className="bg-gradient-to-r from-green-900/60 to-green-800/60 border-2 border-green-500 px-6 py-6 mx-4 mt-4 rounded-xl shadow-2xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-green-400 text-3xl animate-bounce">🧠✅</div>
                    <div>
                      <div className="text-green-200 font-bold text-lg">
                        ML TRAINING + PORTFOLIO TRACKING SUCCESSFUL!
                      </div>
                      <div className="text-green-300 font-semibold text-base">
                        {mlSuccess.strategy} → Neural Network Enhanced
                      </div>
                      <div className="text-green-400 text-sm mt-2 grid grid-cols-2 gap-4">
                        <div>
                          🎯 Symbol: <span className="font-semibold text-white">{mlSuccess.symbol}</span>
                        </div>
                        <div>
                          📊 Accuracy: <span className="font-semibold text-white">{mlSuccess.result?.accuracy || 'N/A'}%</span>
                        </div>
                        <div>
                          🔧 Models Updated: <span className="font-semibold text-white">{mlSuccess.result?.modelsUpdated || 0}</span>
                        </div>
                        <div>
                          🧠 Neural Net: <span className="font-semibold text-white">
                            {mlSuccess.result?.neuralNetworkResults?.modelTrained ? 
                              `✅ Trained (${mlSuccess.result.neuralNetworkResults.features} features)` : '❌ Error'}
                          </span>
                        </div>
                      </div>
                      <div className="text-green-500 text-sm mt-2 bg-green-900/40 rounded p-2">
                        📈 Training Data: <span className="text-white font-semibold">{mlSuccess.result?.trainingDataSize || 0}</span> samples • 
                        Patterns: <span className="text-white font-semibold">{mlSuccess.result?.patternsLearned || 0}</span> learned • 
                        Architecture: <span className="text-white font-semibold">{mlSuccess.result?.neuralNetworkResults?.architecture || 'N/A'}</span>
                      </div>
                      
                      {/* Trade Tracking Status */}
                      {mlSuccess.result?.tradeTracked && (
                        <div className="text-blue-400 text-sm mt-2 bg-blue-900/40 rounded p-2 flex items-center gap-2">
                          🎯 <span className="font-semibold">Trade Automatically Added to Portfolio Tracker!</span>
                          <div className="text-blue-300 text-xs">
                            ID: {mlSuccess.result.tradeId?.slice(-8) || 'N/A'} • Active Trades: {mlSuccess.result.activeTrades || 0}
                          </div>
                        </div>
                      )}
                      
                      {/* Trade Tracking Warning */}
                      {mlSuccess.result?.tradeTracked === false && mlSuccess.result?.tradeTrackingError && (
                        <div className="text-yellow-400 text-sm mt-2 bg-yellow-900/40 rounded p-2 flex items-center gap-2">
                          ⚠️ <span className="font-semibold">ML Training Successful, Portfolio Tracking Failed</span>
                          <div className="text-yellow-300 text-xs">
                            Error: {mlSuccess.result.tradeTrackingError} • Check Portfolio Tracker manually
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm">Modal closes in:</div>
                    <div className="text-green-200 text-2xl font-bold">8s</div>
                    <div className="text-green-500 text-xs mt-1">Reading time...</div>
                  </div>
                </div>
              </div>
            )}

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
                          <div className="font-bold text-lg text-orange-400">{trade.strategyKey || trade.strategyName}</div>
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
                                        leg.action?.toUpperCase() === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                      }`}>
                                        {leg.action?.toUpperCase() || 'BUY'}
                                      </span>
                                      <span className="text-white font-mono text-xs">
                                        {leg.strike !== 'N/A' ? `$${leg.strike}` : 'Stock'} {leg.optionType || leg.type || 'CALL'}
                                      </span>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                      {trade.expirationDate || 'TBD'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Entry & Exit Details */}
                          <div className="mt-2 text-xs bg-gray-900 rounded p-2">
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
                          <div className={`text-xl font-bold ${
                            trade.probability >= 80 ? 'text-green-400' : 
                            trade.probability >= 65 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {trade.probability}%
                          </div>
                          <div className="text-xs text-gray-400">Success Probability</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-400">
                            ${(trade.expectedReturn / 100).toFixed(1)}K
                          </div>
                          <div className="text-xs text-gray-400">Expected Return</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-400">
                            ${Math.abs(trade.maxLoss / 100).toFixed(1)}K
                          </div>
                          <div className="text-xs text-gray-400">Max Risk</div>
                        </div>
                        
                        <div className="text-center">
                          <button
                            onClick={() => handleTradeSelection(trade)}
                            disabled={processingTrade === (trade.strategyKey || trade.strategyName)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                              processingTrade === (trade.strategyKey || trade.strategyName) 
                                ? 'bg-yellow-600 text-white cursor-wait scale-95' 
                                : `hover:scale-105 ${
                                    trade.aiScore >= 85 ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg' :
                                    trade.aiScore >= 70 ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md' :
                                    'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                                  }`
                            }`}
                            title={
                              processingTrade === (trade.strategyKey || trade.strategyName)
                                ? "Processing ML training..."
                                : `Feed comprehensive trade data to ML Learning System (AI Score: ${trade.aiScore || 0}/100)`
                            }
                          >
                            {processingTrade === (trade.strategyKey || trade.strategyName) ? (
                              <>
                                ⏳ Training ML...
                                <div className="text-xs opacity-75 mt-0.5">
                                  Processing 25+ features
                                </div>
                              </>
                            ) : (
                              <>
                                🧠 Select & Learn
                                <div className="text-xs opacity-75 mt-0.5">
                                  Feed to ML
                                </div>
                              </>
                            )}
                          </button>
                          
                          {/* Enhanced feedback indicators */}
                          <div className="flex items-center justify-center gap-1 mt-2">
                            {trade.holyGrailBonus > 0 && (
                              <div className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                                +{trade.holyGrailBonus} HG
                              </div>
                            )}
                            {trade.aiScore >= 85 && (
                              <div className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded">
                                HIGH AI
                              </div>
                            )}
                            {trade.probability >= 80 && (
                              <div className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">
                                HIGH P
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Trade Details */}
                      <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                        {/* Primary metrics */}
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Position Size:</span>
                            <span className="ml-2 text-white font-semibold">${(trade.positionSize).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Risk/Reward:</span>
                            <span className={`ml-2 font-semibold ${
                              trade.riskReward >= 3 ? 'text-green-400' : 
                              trade.riskReward >= 2 ? 'text-yellow-400' : 'text-orange-400'
                            }`}>
                              {trade.riskReward}:1
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">AI Score:</span>
                            <span className={`ml-2 font-semibold ${
                              trade.aiScore >= 85 ? 'text-purple-400' : 
                              trade.aiScore >= 70 ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {trade.aiScore}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Market Condition:</span>
                            <span className="ml-2 text-blue-400">{trade.marketCondition}</span>
                          </div>
                        </div>
                        
                        {/* Execution Details */}
                        <div className="bg-gray-900 rounded p-3">
                          <div className="text-xs font-semibold text-gray-300 mb-2">📋 Execution Plan</div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400">Entry Method:</span>
                              <span className="ml-1 text-green-300">Market Order</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Fill Target:</span>
                              <span className="ml-1 text-blue-300">Mid Price</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Commission:</span>
                              <span className="ml-1 text-yellow-300">~$5-15</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Profit Target:</span>
                              <span className="ml-1 text-green-300">50% Max Profit</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Stop Loss:</span>
                              <span className="ml-1 text-red-300">25% Max Loss</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Kelly %:</span>
                              <span className="ml-1 text-purple-300">{((trade.probability/100) * 0.15 * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* ML Learning Indicators */}
                        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded p-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">🧠 ML Learning Value:</span>
                              <span className={`font-semibold ${
                                (trade.probability + (selectedStock.holyGrail || 0)) > 140 ? 'text-green-400' :
                                (trade.probability + (selectedStock.holyGrail || 0)) > 100 ? 'text-yellow-400' : 'text-gray-400'
                              }`}>
                                {(trade.probability + (selectedStock.holyGrail || 0)) > 140 ? 'HIGH' :
                                 (trade.probability + (selectedStock.holyGrail || 0)) > 100 ? 'MEDIUM' : 'STANDARD'}
                              </span>
                            </div>
                            <div className="text-gray-400">
                              Data Points: <span className="text-blue-300">25+</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-400">No trade recommendations available</div>
                  <div className="text-sm text-gray-500">Try adjusting the analysis parameters</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




