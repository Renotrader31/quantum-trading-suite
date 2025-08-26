import { useState, useEffect } from 'react';

export default function Dashboard({ marketData, loading, onRefresh, lastUpdate }) {
  const [marketStats, setMarketStats] = useState({
    totalStocks: 0,
    gainers: 0,
    losers: 0,
    avgChange: 0,
    totalVolume: 0,
    marketSentiment: 'neutral'
  });

  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      calculateMarketStats();
    }
  }, [marketData]);

  const calculateMarketStats = () => {
    const stocks = Object.values(marketData);
    const totalStocks = stocks.length;
    const gainers = stocks.filter(stock => stock.changePercent > 0).length;
    const losers = stocks.filter(stock => stock.changePercent < 0).length;
    const avgChange = stocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / totalStocks;
    const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);
    
    // Calculate market sentiment
    let marketSentiment = 'neutral';
    if (avgChange > 1) marketSentiment = 'bullish';
    else if (avgChange < -1) marketSentiment = 'bearish';

    setMarketStats({
      totalStocks,
      gainers,
      losers,
      avgChange,
      totalVolume,
      marketSentiment
    });
  };

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return '🐂';
      case 'bearish': return '🐻';
      default: return '🤖';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-400">Loading market data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Dashboard</h2>
          <p className="text-gray-400">Real-time market overview and top movers</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Total Stocks</div>
              <div className="text-2xl font-bold text-white">{marketStats.totalStocks}</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Gainers</div>
              <div className="text-2xl font-bold text-green-400">{marketStats.gainers}</div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Losers</div>
              <div className="text-2xl font-bold text-red-400">{marketStats.losers}</div>
            </div>
            <div className="text-3xl">📉</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Avg Change</div>
              <div className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
              </div>
            </div>
            <div className="text-3xl">⚖️</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Market Sentiment</div>
              <div className={`text-lg font-bold capitalize ${getSentimentColor(marketStats.marketSentiment)}`}>
                {marketStats.marketSentiment}
              </div>
            </div>
            <div className="text-3xl">{getSentimentIcon(marketStats.marketSentiment)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Volume</div>
          <div className="text-xl font-bold text-blue-400">{formatVolume(marketStats.totalVolume)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Last Update</div>
          <div className="text-xl font-bold text-purple-400">{lastUpdate || 'Never'}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Market Status</div>
          <div className="text-xl font-bold text-green-400">
            {new Date().getDay() >= 1 && new Date().getDay() <= 5 ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>

      {/* Top Movers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Top Movers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Flow Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sector
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {Object.values(marketData)
                .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
                .slice(0, 15)
                .map((stock, index) => (
                  <tr key={stock.symbol} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">{stock.symbol}</div>
                        {index < 3 && (
                          <div className="ml-2 text-xs">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${stock.price?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${(stock.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="mr-1">
                          {(stock.changePercent || 0) >= 0 ? '▲' : '▼'}
                        </span>
                        {(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style<span class="cursor">█</span>
