import React, { useState, useEffect } from 'react';

const GammaAnalytics = () => {
  const [gexData, setGexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');

  useEffect(() => {
    fetchGexData();
    const interval = setInterval(fetchGexData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const fetchGexData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/whales?endpoint=gex&symbol=${selectedSymbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch GEX data');
      }
      
      const data = await response.json();
      setGexData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      // Fallback data for development
      setGexData({
        symbol: selectedSymbol,
        current_price: 425.50,
        net_gex: 1250000000,
        gex_flip_point: 420.00,
        total_call_gex: 2100000000,
        total_put_gex: -850000000,
        largest_gamma_strike: 425,
        gamma_walls: [
          { strike: 420, gamma: 850000000, type: 'support' },
          { strike: 425, gamma: 1200000000, type: 'resistance' },
          { strike: 430, gamma: 650000000, type: 'resistance' },
          { strike: 415, gamma: 420000000, type: 'support' }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatGamma = (value) => {
    if (Math.abs(value) >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  };

  const getGexStatus = (netGex) => {
    if (netGex > 0) {
      return { status: 'Positive Gamma', color: 'text-green-400', bg: 'bg-green-900/20' };
    } else {
      return { status: 'Negative Gamma', color: 'text-red-400', bg: 'bg-red-900/20' };
    }
  };

  if (loading && !gexData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-4 text-lg">Loading Gamma Analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !gexData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={fetchGexData}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const gexStatus = getGexStatus(gexData?.net_gex || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Gamma Analytics</h1>
            <p className="text-gray-400 mt-2">Real-time Gamma Exposure & Market Structure Analysis</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="SPY">SPY</option>
              <option value="QQQ">QQQ</option>
              <option value="IWM">IWM</option>
              <option value="SPX">SPX</option>
            </select>
            
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            )}
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Current Price</h3>
            <p className="text-2xl font-bold text-white mt-1">
              ${gexData?.current_price?.toFixed(2)}
            </p>
          </div>

          <div className={`rounded-lg p-6 border border-gray-700 ${gexStatus.bg}`}>
            <h3 className="text-gray-400 text-sm font-medium">Net GEX</h3>
            <p className={`text-2xl font-bold mt-1 ${gexStatus.color}`}>
              {formatGamma(gexData?.net_gex || 0)}
            </p>
            <p className={`text-sm mt-1 ${gexStatus.color}`}>
              {gexStatus.status}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">GEX Flip Point</h3>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              ${gexData?.gex_flip_point?.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">Zero Gamma Level</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Largest Gamma Strike</h3>
            <p className="text-2xl font-bold text-purple-400 mt-1">
              ${gexData?.largest_gamma_strike}
            </p>
          </div>
        </div>

        {/* Call vs Put GEX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Call GEX</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Call Gamma:</span>
                <span className="text-green-400 font-bold">
                  {formatGamma(gexData?.total_call_gex || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-400 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.abs(gexData?.total_call_gex || 0) / 50000000)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Put GEX</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Put Gamma:</span>
                <span className="text-red-400 font-bold">
                  {formatGamma(gexData?.total_put_gex || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-red-400 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, Math.abs(gexData?.total_put_gex || 0) / 50000000)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gamma Walls */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-6">Gamma Walls - Support & Resistance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gexData?.gamma_walls?.map((wall, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  wall.type === 'support' 
                    ? 'bg-green-900/20 border-green-800' 
                    : 'bg-red-900/20 border-red-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">${wall.strike}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    wall.type === 'support' 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-red-800 text-red-200'
                  }`}>
                    {wall.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  Gamma: {formatGamma(wall.gamma)}
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      wall.type === 'support' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.abs(wall.gamma) / 20000000)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Market Structure Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {gexData?.net_gex > 0 ? '🛡️' : '⚡'}
              </div>
              <h4 className="font-semibold text-white mb-2">Market Regime</h4>
              <p className="text-sm text-gray-400">
                {gexData?.net_gex > 0 
                  ? 'Positive gamma suggests lower volatility and mean reversion behavior'
                  : 'Negative gamma indicates higher volatility and momentum trends'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-white mb-2">Key Level</h4>
              <p className="text-sm text-gray-400">
                Watch ${gexData?.gex_flip_point?.toFixed(2)} as the critical gamma flip point where market behavior changes
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-white mb-2">Gamma Walls</h4>
              <p className="text-sm text-gray-400">
                {gexData?.gamma_walls?.filter(w => w.type === 'support').length} support levels and {gexData?.gamma_walls?.filter(w => w.type === 'resistance').length} resistance levels identified
              </p>
            </div>
          </div>
        </div>

        {/* Data Timestamp */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Last updated: {new Date(gexData?.timestamp || Date.now()).toLocaleString()}
          {error && <span className="text-yellow-400 ml-4">⚠️ Using fallback data</span>}
        </div>
      </div>
    </div>
  );
};

export default GammaAnalytics;
