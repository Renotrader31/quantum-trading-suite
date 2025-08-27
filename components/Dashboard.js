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
    { name: 'Energy', symbol: 'XLE', performance: 2.1, volume: 32000000 },
    { name: 'Consumer Disc', symbol: 'XLY', performance: 0.5, volume: 22000000 },
    { name: 'Industrials', symbol: 'XLI', performance: -0.1, volume: 18000000 },
    { name: 'Materials', symbol: 'XLB', performance: 1.5, volume: 15000000 },
    { name: 'Utilities', symbol: 'XLU', performance: -0.8, volume: 12000000 }
  ]);

  const [marketStats, setMarketStats] = useState({
    advanceDecline: { advancing: 1845, declining: 1523, unchanged: 182 },
    newHighsLows: { newHighs: 127, newLows: 45 },
    marketCap: { total: 45.8, change: 1.2 },
    optionsFlow: { callVolume: 12500000, putVolume: 8900000, ratio: 0.71 }
  });

  const [topMovers, setTopMovers] = useState([
    { symbol: 'NVDA', price: 485.20, change: 12.50, changePercent: 2.64, volume: 42000000, sector: 'Technology' },
    { symbol: 'TSLA', price: 245.80, change: -5.20, changePercent: -2.07, volume: 38000000, sector: 'Consumer Disc' },
    { symbol: 'AAPL', price: 175.50, change: 2.30, changePercent: 1.33, volume: 45000000, sector: 'Technology' },
    { symbol: 'MSFT', price: 375.90, change: 1.80, changePercent: 0.48, volume: 28000000, sector: 'Technology' },
    { symbol: 'GOOGL', price: 135.40, change: -2.10, changePercent: -1.53, volume: 31000000, sector: 'Technology' },
    { symbol: 'META', price: 295.60, change: 8.90, changePercent: 3.11, volume: 35000000, sector: 'Technology' },
    { symbol: 'AMD', price: 145.30, change: -3.40, changePercent: -2.29, volume: 55000000, sector: 'Technology' },
    { symbol: 'AMZN', price: 155.80, change: 2.70, changePercent: 1.76, volume: 41000000, sector: 'Consumer Disc' }
  ]);

  const [economicEvents, setEconomicEvents] = useState([
    { time: '08:30', event: 'CPI Data Release', impact: 'HIGH', currency: 'USD' },
    { time: '10:00', event: 'Consumer Confidence', impact: 'MEDIUM', currency: 'USD' },
    { time: '14:00', event: 'Fed Minutes', impact: 'HIGH', currency: 'USD' },
    { time: '16:30', event: 'Oil Inventory', impact: 'MEDIUM', currency: 'USD' }
  ]);

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      // Simulate live data updates
      const response = await fetch('/api/stocks?endpoint=market-overview');
      if (response.ok) {
        const data = await response.json();
        if (data.indices) setMarketData(data.indices);
        if (data.topMovers) setTopMovers(data.topMovers);
        if (data.sectors) setSectorData(data.sectors);
      }
      
      // Update with simulated real-time data
      setMarketData(prev => ({
        spy: { ...prev.spy, price: prev.spy.price + (Math.random() - 0.5) * 2 },
        qqq: { ...prev.qqq, price: prev.qqq.price + (Math.random() - 0.5) * 2 },
        iwm: { ...prev.iwm, price: prev.iwm.price + (Math.random() - 0.5) * 1 },
        vix: { ...prev.vix, price: prev.vix.price + (Math.random() - 0.5) * 0.5 }
      }));

    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const getSectorColor = (performance) => {
    if (performance > 1) return 'bg-green-500';
    if (performance > 0) return 'bg-green-400';
    if (performance > -1) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'HIGH': return 'text-red-400 bg-red-900/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20';
      case 'LOW': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Market Dashboard</h1>
            <p className="text-gray-400 mt-2">Advanced market intelligence and real-time analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-sm text-gray-400">
                {loading ? 'Updating...' : 'Live Data'}
              </span>
            </div>
            <div className="text-right text-sm text-gray-400">
              Last Update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(marketData).map(([symbol, data]) => (
            <div key={symbol} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-400 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{symbol.toUpperCase()}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{formatPrice(data.price)}</p>
                </div>
                <div className={`text-right ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <p className="text-sm font-medium">{formatChange(data.change, data.changePercent)}</p>
                  <div className={`w-2 h-2 rounded-full mt-1 ml-auto ${data.change >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Market Breadth</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-400">Advancing:</span>
                <span className="text-white font-semibold">{marketStats.advanceDecline.advancing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Declining:</span>
                <span className="text-white font-semibold">{marketStats.advanceDecline.declining}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(marketStats.advanceDecline.advancing / (marketStats.advanceDecline.advancing + marketStats.advanceDecline.declining)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">New Highs/Lows</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-400">New Highs:</span>
                <span className="text-white font-semibold">{marketStats.newHighsLows.newHighs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">New Lows:</span>
                <span className="text-white font-semibold">{marketStats.newHighsLows.newLows}</span>
              </div>
              <div className="text-center mt-3">
                <span className="text-blue-400 font-bold text-lg">
                  {(marketStats.newHighsLows.newHighs / marketStats.newHighsLows.newLows).toFixed(1)}:1
                </span>
                <div className="text-xs text-gray-400">Ratio</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Options Flow</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-400">Call Volume:</span>
                <span className="text-white font-semibold">{(marketStats.optionsFlow.callVolume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Put Volume:</span>
                <span className="text-white font-semibold">{(marketStats.optionsFlow.putVolume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="text-center mt-3">
                <span className="text-purple-400 font-bold text-lg">
                  {marketStats.optionsFlow.ratio.toFixed(2)}
                </span>
                <div className="text-xs text-gray-400">Put/Call Ratio</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Market Cap</h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${marketStats.marketCap.total}T
              </div>
              <div className={`text-sm mt-1 ${marketStats.marketCap.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.marketCap.change >= 0 ? '+' : ''}{marketStats.marketCap.change}% Today
              </div>
            </div>
          </div>
        </div>

        {/* Sector Performance Heat Map */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sector Performance Heat Map</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectorData.map((sector) => (
              <div 
                key={sector.symbol}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                  sector.performance > 0 
                    ? 'border-green-400 bg-green-900/20' 
                    : 'border-red-400 bg-red-900/20'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-white text-sm">{sector.name}</h4>
                  <div className="text-gray-400 text-xs">{sector.symbol}</div>
                  <div className={`text-lg font-bold mt-2 ${
                    sector.performance > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Vol: {(sector.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers and Economic Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Movers */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Top Movers</h2>
            <div className="space-y-3">
              {topMovers.slice(0, 6).map((stock, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-semibold">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatPrice(stock.price)}</div>
                    <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatChange(stock.change, stock.changePercent)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {(stock.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Calendar */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Economic Calendar</h2>
            <div className="space-y-3">
              {economicEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-400 font-mono text-sm">{event.time}</div>
                    <div className="text-white text-sm">{event.event}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getImpactColor(event.impact)}`}>
                      {event.impact}
                    </span>
                    <span className="text-gray-400 text-xs">{event.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Market Sentiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">😨</div>
              <h4 className="font-semibold text-white mb-2">Fear & Greed Index</h4>
              <div className="text-2xl font-bold text-yellow-400">52</div>
              <div className="text-sm text-gray-400">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h4 className="font-semibold text-white mb-2">Market Volatility</h4>
              <div className="text-2xl font-bold text-blue-400">{marketData.vix.price.toFixed(1)}</div>
              <div className="text-sm text-gray-400">VIX Level</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-semibold text-white mb-2">Market Momentum</h4>
              <div className="text-2xl font-bold text-green-400">Bullish</div>
              <div className="text-sm text-gray-400">Short Term</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
