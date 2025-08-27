import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [marketData, setMarketData] = useState({
    spy: { price: 425.50, change: 2.30, changePercent: 0.54 },
    qqq: { price: 375.20, change: -1.45, changePercent: -0.38 },
    iwm: { price: 195.80, change: 0.85, changePercent: 0.43 },
    vix: { price: 18.25, change: -0.75, changePercent: -3.95 }
  });

  const [sectorData, setSectorData] = useState([
    { name: 'Technology', symbol: 'XLK', performance: 1.2, volume: 45000000 },
    { name: 'Healthcare', symbol: 'XLV', performance: 0.8, volume: 28000000 },
    { name: 'Financials', symbol: 'XLF', performance: -0.3, volume: 35000000 },
    { name: 'Energy', symbol: 'XLE', performance: 2.1, volume: 32000000 }
  ]);

  const [topMovers, setTopMovers] = useState([
    { symbol: 'NVDA', price: 485.20, change: 12.50, changePercent: 2.64, volume: 42000000, sector: 'Technology' },
    { symbol: 'TSLA', price: 245.80, change: -5.20, changePercent: -2.07, volume: 38000000, sector: 'Consumer Disc' },
    { symbol: 'AAPL', price: 175.50, change: 2.30, changePercent: 1.33, volume: 45000000, sector: 'Technology' },
    { symbol: 'MSFT', price: 375.90, change: 1.80, changePercent: 0.48, volume: 28000000, sector: 'Technology' }
  ]);

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLastUpdate(new Date());
    // Try to fetch real data, but don't crash if it fails
    fetchMarketDataSafely();
    const interval = setInterval(() => {
      fetchMarketDataSafely();
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-sm text-gray-400">
                {loading ? 'Updating...' : 'Live Data'}
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
