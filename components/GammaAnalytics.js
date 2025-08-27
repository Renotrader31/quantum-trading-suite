// components/GammaAnalytics.js - Real-time Gamma Analytics with Unusual Whales Integration
import { useState, useEffect } from 'react';

export default function GammaAnalytics() {

  const [greeksData, setGreeksData] = useState([]);
  const [ticker, setTicker] = useState('SPY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGammaData = async (symbol) => {
    setLoading(true);
    setError('');

    try {
      console.log(`ðŸ” Fetching GEX data for ${symbol}...`);

      // Fetch GEX data with real Unusual Whales API
      const gexResponse = await fetch(`/api/whales?type=gex&ticker=${symbol}`);
      const gexResult = await gexResponse.json();

      if (gexResult.success) {
        setGexData(gexResult.data || []);
        console.log('âœ… GEX data loaded:', gexResult.data?.length || 0, 'entries');
      } else {
        console.log('âš ï¸ GEX data error:', gexResult.error);
        setError(`GEX API Error: ${gexResult.error}`);
      }

      // Fetch Greeks data
      const greeksResponse = await fetch(`/api/whales?type=greeks&ticker=${symbol}`);
      const greeksResult = await greeksResponse.json();

      if (greeksResult.success) {
        setGreeksData(greeksResult.data || []);
        console.log('âœ… Greeks data loaded:', greeksResult.data?.length || 0, 'entries');
      } else {
        console.log('âš ï¸ Greeks data error:', greeksResult.error);
      }

    } catch (err) {
      console.error('âŒ Gamma data fetch error:', err);
      setError(`Network Error: ${err.message}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGammaData(ticker);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGammaData(ticker);
  };

  // Calculate gamma exposure metrics using real API fields
  const calculateGammaMetrics = () => {
    if (!gexData || gexData.length === 0) return {};

    const latest = gexData[0] || {};

    return {
      totalGammaDir: latest.gamma_per_one_percent_move_dir || 0,
      totalGammaOI: latest.gamma_per_one_percent_move_oi || 0,
      totalGammaVol: latest.gamma_per_one_percent_move_vol || 0,
      callGamma: latest.call_gamma_oi || 0,
      putGamma: latest.put_gamma_oi || 0,
      netGamma: (latest.call_gamma_oi || 0) - Math.abs(latest.put_gamma_oi || 0),
      currentPrice: latest.price || 0,

      // Vanna exposure
      totalVannaDir: latest.vanna_per_one_percent_move_dir || 0,
      totalVannaOI: latest.vanna_per_one_percent_move_oi || 0,

      // Charm exposure  
      totalCharmDir: latest.charm_per_one_percent_move_dir || 0,
      totalCharmOI: latest.charm_per_one_percent_move_oi || 0
    };
  };

  // Calculate Greeks summary using real API fields
  const calculateGreeksSummary = () => {
    if (!greeksData || greeksData.length === 0) return {};

    const latest = greeksData[0] || {};

    return {
      totalCallDelta: latest.call_delta || 0,
      totalPutDelta: latest.put_delta || 0,
      totalCallGamma: latest.call_gamma || 0,
      totalPutGamma: latest.put_gamma || 0,
      netDelta: (latest.call_delta || 0) + (latest.put_delta || 0),
      netGamma: (latest.call_gamma || 0) + (latest.put_gamma || 0),

      // Flow metrics
      deltaFlow: latest.total_delta_flow || 0,
      vegaFlow: latest.total_vega_flow || 0,
      transactions: latest.transactions || 0,
      volume: latest.volume || 0
    };
  };

  const gammaMetrics = calculateGammaMetrics();
  const greeksSummary = calculateGreeksSummary();

  // Determine gamma flip point
  const gammaFlipPoint = gammaMetrics.currentPrice + (gammaMetrics.netGamma / 1000000);
  const isAboveFlip = gammaMetrics.currentPrice > gammaFlipPoint;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ðŸŒŠ Gamma Analytics
          </h1>
          <p className="text-xl text-blue-300 mb-6">Real-time Gamma Exposure & Options Flow Analysis</p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker (e.g., SPY, AAPL)"
              className="px-6 py-3 bg-gray-800 border border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'ðŸ”„ Loading...' : 'ðŸ“Š Analyze Gamma'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-center">
            <p className="text-red-300">âš ï¸ {error}</p>
          </div>
        )}

        {/* Gamma Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Gamma Exposure */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-4">ðŸ“Š Total Gamma Exposure</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Direction:</span>
                <span className="font-mono text-green-400">{gammaMetrics.totalGammaDir?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Open Interest:</span>
                <span className="font-mono text-blue-400">{gammaMetrics.totalGammaOI?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Volume:</span>
                <span className="font-mono text-purple-400">{gammaMetrics.totalGammaVol?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Call vs Put Gamma */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-4">ðŸ“ˆ Call vs Put Gamma</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Call Gamma:</span>
                <span className="font-mono text-green-400">{gammaMetrics.callGamma?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Put Gamma:</span>
                <span className="font-mono text-red-400">{Math.abs(gammaMetrics.putGamma)?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Net Gamma:</span>
                <span className={`font-mono ${gammaMetrics.netGamma >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gammaMetrics.netGamma?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Gamma Flip Point */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-4">ðŸŽ¯ Gamma Flip Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Current Price:</span>
                <span className="font-mono text-yellow-400">${gammaMetrics.currentPrice?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Flip Point:</span>
                <span className="font-mono text-purple-400">${gammaFlipPoint?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Position:</span>
                <span className={`font-bold ${isAboveFlip ? 'text-green-400' : 'text-red-400'}`}>
                  {isAboveFlip ? 'ðŸŸ¢ Above Flip' : 'ðŸ”´ Below Flip'}
                </span>
              </div>
            </div>
          </div>

          {/* Vanna Exposure */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">ðŸŒŠ Vanna Exposure</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Direction:</span>
                <span className="font-mono text-cyan-400">{gammaMetrics.totalVannaDir?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Open Interest:</span>
                <span className="font-mono text-blue-400">{gammaMetrics.totalVannaOI?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Charm Exposure */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-400 mb-4">âš¡ Charm Exposure</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Direction:</span>
                <span className="font-mono text-orange-400">{gammaMetrics.totalCharmDir?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Open Interest:</span>
                <span className="font-mono text-yellow-400">{gammaMetrics.totalCharmOI?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Greeks Flow Summary */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-pink-500/30">
            <h3 className="text-xl font-bold text-pink-400 mb-4">ðŸ”„ Flow Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Delta Flow:</span>
                <span className={`font-mono ${greeksSummary.deltaFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {greeksSummary.deltaFlow?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Vega Flow:</span>
                <span className={`font-mono ${greeksSummary.vegaFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {greeksSummary.vegaFlow?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Transactions:</span>
                <span className="font-mono text-blue-400">{greeksSummary.transactions?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GEX Data Table */}
          <div className="bg-gray-800/30 p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-2xl font-bold text-blue-400 mb-6">ðŸ“Š GEX Data (Latest Entries)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-blue-300">Time</th>
                    <th className="text-right py-2 text-blue-300">Price</th>
                    <th className="text-right py-2 text-blue-300">Gamma (Dir)</th>
                    <th className="text-right py-2 text-blue-300">Vanna (Dir)</th>
                  </tr>
                </thead>
                <tbody>
                  {gexData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-2 text-gray-300">{item.time ? new Date(item.time).toLocaleTimeString() : 'N/A'}</td>
                      <td className="py-2 text-right text-yellow-400 font-mono">${item.price?.toFixed(2) || 'N/A'}</td>
                      <td className="py-2 text-right text-green-400 font-mono">{item.gamma_per_one_percent_move_dir?.toLocaleString() || 'N/A'}</td>
                      <td className="py-2 text-right text-purple-400 font-mono">{item.vanna_per_one_percent_move_dir?.toLocaleString() || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gexData.length === 0 && (
                <p className="text-center text-gray-400 py-8">No GEX data available</p>
              )}
            </div>
          </div>

          {/* Greeks Flow Table */}
          <div className="bg-gray-800/30 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-2xl font-bold text-purple-400 mb-6">ðŸ”¢ Greeks Flow (Latest Entries)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-purple-300">Date</th>
                    <th className="text-right py-2 text-purple-300">Call Delta</th>
                    <th className="text-right py-2 text-purple-300">Put Delta</th>
                    <th className="text-right py-2 text-purple-300">Net Gamma</th>
                  </tr>
                </thead>
                <tbody>
                  {greeksData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-2 text-gray-300">{item.date || item.timestamp ? new Date(item.date || item.timestamp).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-2 text-right text-green-400 font-mono">{item.call_delta?.toLocaleString() || 'N/A'}</td>
                      <td className="py-2 text-right text-red-400 font-mono">{item.put_delta?.toLocaleString() || 'N/A'}</td>
                      <td className="py-2 text-right text-blue-400 font-mono">{((item.call_gamma || 0) + (item.put_gamma || 0))?.toLocaleString() || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {greeksData.length === 0 && (
                <p className="text-center text-gray-400 py-8">No Greeks data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            ðŸ‹ Powered by Unusual Whales API â€¢ Real-time gamma exposure and options flow analysis
          </p>
        </div>
      </div>
    </div>
  );
}
