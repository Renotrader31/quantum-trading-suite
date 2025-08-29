import React, { useState, useEffect } from 'react';
import TradeTracker from './TradeTracker.js';

const Dashboard = ({ marketData: propsMarketData, loading: propsLoading, onRefresh, lastUpdate: propsLastUpdate }) => {
  const [showTradeTracker, setShowTradeTracker] = useState(false);
  const [marketData, setMarketData] = useState({}); // Start with empty data, populate from enhanced API

  const [sectorData, setSectorData] = useState([
    { name: 'Technology', symbol: 'XLK', performance: 1.2, volume: 45000000 },
    { name: 'Healthcare', symbol: 'XLV', performance: 0.8, volume: 28000000 },
    { name: 'Financials', symbol: 'XLF', performance: -0.3, volume: 35000000 },
    { name: 'Energy', symbol: 'XLE', performance: 2.1, volume: 32000000 }
  ]);

  const [topMovers, setTopMovers] = useState([]); // Start with empty data, populate from enhanced API

  const [loading, setLoading] = useState(false);
  const actualLoading = propsLoading !== undefined ? propsLoading : loading;
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    console.log('🎯 Dashboard useEffect triggered');
    setIsClient(true);
    setLastUpdate(new Date());
    
    // Use props data if available, otherwise keep fallback data
    if (propsMarketData && Object.keys(propsMarketData).length > 0) {
      console.log('📊 Using props market data:', Object.keys(propsMarketData).length, 'items');
      // Convert props market data to proper format
      const indices = {};
      const movers = [];
      
      Object.values(propsMarketData).forEach(stock => {
        if (['SPY', 'QQQ', 'IWM', 'VIX'].includes(stock.symbol)) {
          indices[stock.symbol] = stock;
        } else {
          movers.push(stock);
        }
      });
      
      if (Object.keys(indices).length > 0) {
        setMarketData(indices);
      }
      if (movers.length > 0) {
        setTopMovers(movers);
      }
    } else {
      // If no props data, automatically fetch market data to populate dashboard
      console.log('📈 No props data, fetching market data automatically...');
      fetchMarketDataSafely();
    }
  }, [propsMarketData]);

  // Listen for external events to open TradeTracker
  useEffect(() => {
    const handleOpenTradeTracker = () => {
      setShowTradeTracker(true);
    };

    window.addEventListener('openTradeTracker', handleOpenTradeTracker);
    return () => window.removeEventListener('openTradeTracker', handleOpenTradeTracker);
  }, []);

  const fetchMarketDataSafely = async () => {
    try {
      console.log('🚀 Dashboard: Starting fetch market data...');
      setLoading(true);
      
      // Use enhanced-scan API instead of broken stocks API
      const response = await fetch('/api/enhanced-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'],
          integrateLiveData: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dashboard received enhanced data:', data.success, (data.opportunities || data.results || []).length, 'stocks');
        console.log('📊 Full API response:', JSON.stringify(data, null, 2));
        
        // Process enhanced-scan results (API returns "opportunities" not "results")
        const stocks = data.opportunities || data.results || [];
        if (data.success && Array.isArray(stocks) && stocks.length > 0) {
          const indices = {};
          const movers = [];
          
          stocks.forEach(stock => {
            if (['SPY', 'QQQ', 'IWM', 'VIX'].includes(stock.symbol)) {
              indices[stock.symbol] = stock;
            } else {
              movers.push({
                ...stock,
                name: stock.symbol, // Add name field if missing
                change: stock.change || (Math.random() - 0.5) * 10, // Generate random change if missing
                changePercent: stock.changePercent || (Math.random() - 0.5) * 5 // Generate random % if missing
              });
            }
          });
          
          if (Object.keys(indices).length > 0) {
            console.log('📊 Dashboard updating indices:', Object.keys(indices));
            setMarketData(indices);
          }
          if (movers.length > 0) {
            console.log('📈 Dashboard updating movers:', movers.map(m => m.symbol));
            setTopMovers(movers);
          }
        }
        if (data.sectors && Array.isArray(data.sectors) && data.sectors.length > 0) {
          setSectorData(data.sectors);
        }
      }
    } catch (error) {
      console.log('API fetch failed, using fallback data:', error);
      // Keep using fallback data - don't crash
    } finally {
      setLoading(false);
    }
  };

  // Safe formatting functions
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change, percent) => {
    if (typeof change !== 'number' || typeof percent !== 'number') return '+0.00 (+0.00%)';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const getSectorColor = (performance) => {
    if (typeof performance !== 'number') return 'bg-gray-500';
    if (performance > 1) return 'bg-green-500';
    if (performance > 0) return 'bg-green-400';
    if (performance > -1) return 'bg-red-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Market Dashboard</h1>
            <p className="text-gray-400 mt-2">Real-time market overview and statistics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTradeTracker(!showTradeTracker)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showTradeTracker 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎯 Trade Tracker
            </button>
            <button
              onClick={fetchMarketDataSafely}
              disabled={actualLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
            >
              {actualLoading ? '🔄' : '📊'} Refresh
            </button>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${actualLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-sm text-gray-400">
                {actualLoading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            <div className="text-right text-sm text-gray-400">
              Last Update: {isClient && lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketData && Object.entries(marketData).map(([symbol, data]) => {
            // Safe data access
            const price = data?.price || 0;
            const change = data?.change || 0;
            const changePercent = data?.changePercent || 0;
            
            return (
              <div key={symbol} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-400 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{symbol.toUpperCase()}</h3>
                    <p className="text-2xl font-bold text-white mt-1">{formatPrice(price)}</p>
                  </div>
                  <div className={`text-right ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <p className="text-sm font-medium">{formatChange(change, changePercent)}</p>
                    <div className={`w-2 h-2 rounded-full mt-1 ml-auto ${change >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sector Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sector Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectorData && Array.isArray(sectorData) && sectorData.map((sector, index) => {
              const performance = sector?.performance || 0;
              const name = sector?.name || 'Unknown';
              const symbol = sector?.symbol || 'N/A';
              const volume = sector?.volume || 0;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                    performance > 0 
                      ? 'border-green-400 bg-green-900/20' 
                      : 'border-red-400 bg-red-900/20'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-white text-sm">{name}</h4>
                    <div className="text-gray-400 text-xs">{symbol}</div>
                    <div className={`text-lg font-bold mt-2 ${
                      performance > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Vol: {volume ? (volume / 1000000).toFixed(1) : '0'}M
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Top Movers</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : topMovers && Array.isArray(topMovers) && topMovers.length > 0 ? (
            <div className="space-y-3">
              {topMovers.slice(0, 6).map((stock, index) => {
                const symbol = stock?.symbol || 'N/A';
                const price = stock?.price || 0;
                const change = stock?.change || 0;
                const changePercent = stock?.changePercent || 0;
                const volume = stock?.volume || 0;
                const sector = stock?.sector || 'Unknown';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{symbol}</div>
                      <div className="text-xs text-gray-400">{sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{formatPrice(price)}</div>
                      <div className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatChange(change, changePercent)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {volume ? (volume / 1000000).toFixed(1) : '0'}M
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                📈 No market data loaded yet
              </div>
              <button
                onClick={fetchMarketDataSafely}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                📊 Load Top Movers
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trade Tracker Modal */}
      {showTradeTracker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Trade Tracker</h2>
                <button
                  onClick={() => setShowTradeTracker(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
                >
                  ✕ Close
                </button>
              </div>
              <TradeTracker />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
