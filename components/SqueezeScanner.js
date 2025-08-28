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
        console.log('🔍 DEBUG: First stock data:', JSON.stringify(data.results[0], null, 2));
        console.log('🔍 DEBUG: Data source:', data.dataSource);
        setStocks(data.results);
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
        data.results.forEach(stock => {
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
      // Get trade recommendations for this specific stock
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
          precisionMode: true // Enable enhanced features
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTradeRecommendations(data.actionableTrades);
        console.log(`✅ Found ${data.actionableTrades.length} trade recommendations for ${stock.symbol}`);
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
                  <h2 className="text-xl font-bold">Trade Analysis - {selectedStock.symbol}</h2>
                  <p className="text-sm text-gray-400">
                    Price: ${selectedStock.price} • Holy Grail: {selectedStock.holyGrail} • Squeeze: {selectedStock.squeeze}
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
                          <div className="font-bold text-lg text-orange-400">{trade.strategyName}</div>
                          <div className="text-sm text-gray-400">{trade.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Complexity: <span className="text-blue-400">{trade.complexity}</span>
                          </div>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Select Trade
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional Trade Details */}
                      <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Position Size:</span>
                          <span className="ml-2 text-white">${(trade.positionSize).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Risk/Reward:</span>
                          <span className="ml-2 text-yellow-400">{trade.riskReward}:1</span>
                        </div>
                        <div>
                          <span className="text-gray-400">AI Score:</span>
                          <span className="ml-2 text-purple-400">{trade.aiScore}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Market Condition:</span>
                          <span className="ml-2 text-blue-400">{trade.marketCondition}</span>
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

// Handle individual stock analysis
const handleIndividualAnalysis = async (symbol) => {
  console.log(`🔍 Individual analysis for ${symbol}...`);
  
  try {
    // First get squeeze data for this stock
    const scanResponse = await fetch(`${API_BASE_URL}/api/scan/${symbol}`);
    const scanData = await scanResponse.json();
    
    if (scanData.success) {
      // Use the scanned stock data for trade analysis
      handleStockClick(scanData.data, { stopPropagation: () => {} });
      
      // Add to alerts
      addAlert({
        type: 'INDIVIDUAL_ANALYSIS',
        symbol: symbol,
        message: `Individual analysis started for ${symbol}`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Failed to scan individual stock:', scanData.error);
    }
    
  } catch (error) {
    console.error('❌ Error in individual analysis:', error);
  }
};

// Handle trade selection and feed to ML
const handleTradeSelection = async (trade) => {
  console.log(`🎯 Trade selected: ${trade.strategyName} for ${selectedStock.symbol}`);
  
  try {
    // Feed selected trade to ML learning system
    const mlResponse = await fetch(`${API_BASE_URL}/api/ml-learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_selection',
        trade: {
          ...trade,
          symbol: selectedStock.symbol,
          selectionTime: new Date().toISOString(),
          squeezeContext: {
            holyGrail: selectedStock.holyGrail,
            squeeze: selectedStock.squeeze,
            gamma: selectedStock.gamma,
            flow: selectedStock.flow
          }
        }
      })
    });

    if (mlResponse.ok) {
      console.log('✅ Trade fed to ML learning system');
      
      // Show success notification
      addAlert({
        type: 'TRADE_SELECTED',
        symbol: selectedStock.symbol,
        message: `${trade.strategyName} selected for ${selectedStock.symbol} - Fed to ML system`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }
    
    // Close modal
    setShowTradeModal(false);
    
  } catch (error) {
    console.error('❌ Error feeding trade to ML system:', error);
  }
};
