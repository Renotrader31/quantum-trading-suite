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
  const eventSourceRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Advanced filters - Adjusted for better results
  const [advancedFilters, setAdvancedFilters] = useState({
    minHolyGrail: 10,  // Allow lower scores to show more results
    minUnusual: 1,     // Lower threshold for unusual activity  
    minSweeps: 0,      // Allow stocks without sweeps
    minFlow: 20,       // Lower flow threshold
    minGamma: 1,       // Lower gamma threshold
    maxDTC: 20,        // Higher DTC allowance
    minShortInterest: 5  // Lower short interest threshold
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
                            <div className="font-bold text-blue-400">{stock.symbol}</div>
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
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSingleScan(stock.symbol);
                              }}
                            >
                              Refresh
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
    </div>
  );
}
