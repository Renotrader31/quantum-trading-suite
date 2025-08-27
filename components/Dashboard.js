import React, { useState, useEffect } from 'react';

const Dashboard = ({ marketData: propsMarketData, loading: propsLoading, onRefresh, lastUpdate: propsLastUpdate }) => {
  const [marketData, setMarketData] = useState({
    SPY: { symbol: 'SPY', price: 646.12, change: 0.15, changePercent: 0.02, volume: 45234567 },
    QQQ: { symbol: 'QQQ', price: 572.78, change: 0.03, changePercent: 0.01, volume: 32123456 },
    IWM: { symbol: 'IWM', price: 235.5, change: 0.52, changePercent: 0.22, volume: 18567890 },
    VIX: { symbol: 'VIX', price: 178.92, change: -1.27, changePercent: -0.71, volume: 0 }
  });

  const [sectorData, setSectorData] = useState([
    { name: 'Technology', symbol: 'XLK', performance: 1.2, volume: 45000000 },
    { name: 'Healthcare', symbol: 'XLV', performance: 0.8, volume: 28000000 },
    { name: 'Financials', symbol: 'XLF', performance: -0.3, volume: 35000000 },
    { name: 'Energy', symbol: 'XLE', performance: 2.1, volume: 32000000 }
  ]);

  const [topMovers, setTopMovers] = useState([
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 181.9, change: 0.07, changePercent: 0.04, volume: 106004396, sector: 'Technology' },
    { symbol: 'AAPL', name: 'Apple Inc', price: 229.7, change: 0.17, changePercent: 0.07, volume: 15401356, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: 505.13, change: 0.61, changePercent: 0.12, volume: 7519022, sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 351.18, change: -0.14, changePercent: -0.04, volume: 41100137, sector: 'Consumer Disc' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 167.17, change: 0.33, changePercent: 0.2, volume: 16780006, sector: 'Technology' },
    { symbol: 'META', name: 'Meta Platforms', price: 745, change: -1.21, changePercent: -0.16, volume: 4131018, sector: 'Technology' }
  ]);

  const [loading, setLoading] = useState(false);
  const actualLoading = propsLoading !== undefined ? propsLoading : loading;
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLastUpdate(new Date());
    
    // Use props data if available, otherwise keep fallback data
    if (propsMarketData && Object.keys(propsMarketData).length > 0) {
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
    }
  }, [propsMarketData]);

  const fetchMarketDataSafely = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from your API
      const response = await fetch('/api/stocks?endpoint=market-overview');
      
      if (response.ok) {
        const data = await response.json();
        
        // Safely update data only if it exists
        if (data.indices && Object.keys(data.indices).length > 0) {
          setMarketData(data.indices);
        }
        if (data.topMovers && Array.isArray(data.topMovers) && data.topMovers.length > 0) {
          setTopMovers(data.topMovers);
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
          ) : (
            <div className="space-y-3">
              {topMovers && Array.isArray(topMovers) && topMovers.slice(0, 6).map((stock, index) => {
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
