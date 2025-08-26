import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [marketData, setMarketData] = useState({
    spy: { price: 425.50, change: 2.30, changePercent: 0.54 },
    qqq: { price: 375.20, change: -1.45, changePercent: -0.38 },
    iwm: { price: 195.80, change: 0.85, changePercent: 0.43 },
    vix: { price: 18.25, change: -0.75, changePercent: -3.95 }
  });
  const [topMovers, setTopMovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/stocks?endpoint=market-overview');
      const data = await response.json();
      
      if (data.indices) {
        setMarketData(data.indices);
      }
      if (data.topMovers) {
        setTopMovers(data.topMovers);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Use fallback data
      setTopMovers([
        { symbol: 'AAPL', price: 175.50, change: 2.30, changePercent: 1.33, volume: 45000000 },
        { symbol: 'TSLA', price: 245.80, change: -5.20, changePercent: -2.07, volume: 38000000 },
        { symbol: 'NVDA', price: 485.20, change: 12.50, changePercent: 2.64, volume: 42000000 },
        { symbol: 'MSFT', price: 375.90, change: 1.80, changePercent: 0.48, volume: 28000000 },
        { symbol: 'GOOGL', price: 135.40, change: -2.10, changePercent: -1.53, volume: 31000000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Market Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time market overview and statistics</p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(marketData).map(([symbol, data]) => (
            <div key={symbol} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{symbol.toUpperCase()}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{formatPrice(data.price)}</p>
                </div>
                <div className={`text-right ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <p className="text-sm">{formatChange(data.change, data.changePercent)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Movers */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Top Movers</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-3">Symbol</th>
                    <th className="text-left py-3">Price</th>
                    <th className="text-left py-3">Change</th>
                    <th className="text-left py-3">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {topMovers.map((stock, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-4">
                        <span className="font-semibold text-white">{stock.symbol}</span>
                      </td>
                      <td className="py-4 text-white">{formatPrice(stock.price)}</td>
                      <td className={`py-4 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatChange(stock.change, stock.changePercent)}
                      </td>
                      <td className="py-4 text-gray-300">{stock.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
