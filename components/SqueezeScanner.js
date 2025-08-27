// components/SqueezeScanner.js - Professional TTM Squeeze Scanner with Real Unusual Whales Integration
import { useState, useEffect } from 'react';

export default function SqueezeScanner() {
  const [scanResults, setScanResults] = useState([]);
  const [darkPoolData, setDarkPoolData] = useState([]);
  const [optionsFlow, setOptionsFlow] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('');

  // Professional watchlist for scanning
  const watchlist = [
    'SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX',
    'NVDA', 'AMD', 'INTC', 'JPM', 'BAC', 'XOM', 'JNJ', 'PG', 'KO', 'DIS',
    'V', 'MA', 'PYPL', 'CRM', 'ORCL', 'ADBE', 'COIN', 'SQ', 'ROKU', 'ZM'
  ];

  const startScan = async () => {
    setScanning(true);
    setScanResults([]);

    try {
      console.log('ðŸ” Starting TTM Squeeze scan with real Unusual Whales data...');

      const results = [];

      // Scan each ticker in the watchlist
      for (const ticker of watchlist) {
        try {
          console.log(`ðŸ“Š Scanning ${ticker}...`);

          // Get stock data first
          const stockResponse = await fetch(`/api/stocks?ticker=${ticker}&timeframe=1D&limit=50`);
          const stockData = await stockResponse.json();

          if (stockData.success && stockData.data?.length > 20) {
            const prices = stockData.data;
            const squeezeResult = calculateTTMSqueeze(prices, ticker);

            if (squeezeResult.inSqueeze || squeezeResult.momentum > 0.7) {
              // Get Unusual Whales data for promising candidates
              const [darkPoolRes, optionsRes, gexRes] = await Promise.all([
                fetch(`/api/whales?type=darkpools&ticker=${ticker}`).catch(() => null),
                fetch(`/api/whales?type=options&ticker=${ticker}`).catch(() => null),
                fetch(`/api/whales?type=gex&ticker=${ticker}`).catch(() => null)
              ]);

              let darkPoolInfo = {};
              let optionsInfo = {};
              let gexInfo = {};

              // Parse Dark Pool data with real API fields
              if (darkPoolRes) {
                const darkPoolData = await darkPoolRes.json();
                if (darkPoolData.success && darkPoolData.data?.length > 0) {
                  const latest = darkPoolData.data[0];
                  darkPoolInfo = {
                    volume: latest.volume || 0,
                    premium: latest.premium || 0,
                    size: latest.size || 0,
                    price: latest.price || 0,
                    market_center: latest.market_center || 'N/A',
                    executed_at: latest.executed_at
                  };
                }
              }

              // Parse Options Flow data with real API fields  
              if (optionsRes) {
                const optionsData = await optionsRes.json();
                if (optionsData.success && optionsData.data?.length > 0) {
                  const recentFlow = optionsData.data.slice(0, 5);
                  optionsInfo = {
                    totalPremium: recentFlow.reduce((sum, opt) => sum + (opt.premium || 0), 0),
                    avgDelta: recentFlow.reduce((sum, opt) => sum + (opt.delta || 0), 0) / recentFlow.length,
                    avgGamma: recentFlow.reduce((sum, opt) => sum + (opt.gamma || 0), 0) / recentFlow.length,
                    totalVolume: recentFlow.reduce((sum, opt) => sum + (opt.volume || 0), 0),
                    callRatio: recentFlow.filter(opt => opt.option_type === 'call').length / recentFlow.length,
                    avgIV: recentFlow.reduce((sum, opt) => sum + (opt.implied_volatility || 0), 0) / recentFlow.length
                  };
                }
              }

              // Parse GEX data with real API fields
              if (gexRes) {
                const gexData = await gexRes.json();
                if (gexData.success && gexData.data?.length > 0) {
                  const latest = gexData.data[0];
                  gexInfo = {
                    gamma_exposure: latest.gamma_per_one_percent_move_dir || 0,
                    vanna_exposure: latest.vanna_per_one_percent_move_dir || 0,
                    net_gamma: (latest.call_gamma_oi || 0) - Math.abs(latest.put_gamma_oi || 0)
                  };
                }
              }

              // Calculate Holy Grail Score with real data
              const holyGrailScore = calculateHolyGrailScore(
                squeezeResult, 
                darkPoolInfo, 
                optionsInfo, 
                gexInfo, 
                prices
              );

              results.push({
                ticker,
                ...squeezeResult,
                darkPool: darkPoolInfo,
                options: optionsInfo,
                gex: gexInfo,
                holyGrailScore,
                lastPrice: prices[0]?.close || 0,
                timestamp: new Date().toLocaleTimeString()
              });
            }
          }

          // Brief delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (tickerError) {
          console.error(`âŒ Error scanning ${ticker}:`, tickerError);
        }
      }

      // Sort by Holy Grail Score descending
      results.sort((a, b) => b.holyGrailScore - a.holyGrailScore);
      setScanResults(results);

      console.log(`âœ… Scan completed! Found ${results.length} squeeze candidates`);

    } catch (error) {
      console.error('âŒ Scan error:', error);
    }

    setScanning(false);
  };

  const calculateTTMSqueeze = (prices, ticker) => {
    if (prices.length < 20) {
      return { inSqueeze: false, momentum: 0, signal: 'insufficient_data' };
    }

    try {
      // Calculate Bollinger Bands (20, 2)
      const closes = prices.map(p => parseFloat(p.close)).slice(0, 20);
      const sma20 = closes.reduce((a, b) => a + b, 0) / 20;
      const variance = closes.reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      const upperBB = sma20 + (2 * stdDev);
      const lowerBB = sma20 - (2 * stdDev);

      // Calculate Keltner Channels (20, 1.5)
      const highs = prices.map(p => parseFloat(p.high)).slice(0, 20);
      const lows = prices.map(p => parseFloat(p.low)).slice(0, 20);
      const tr = [];

      for (let i = 1; i < Math.min(20, prices.length); i++) {
        const high = highs[i-1];
        const low = lows[i-1];
        const prevClose = closes[i];
        tr.push(Math.max(
          high - low,
          Math.abs(high - prevClose),
          Math.abs(low - prevClose)
        ));
      }

      const atr = tr.reduce((a, b) => a + b, 0) / tr.length;
      const upperKC = sma20 + (1.5 * atr);
      const lowerKC = sma20 - (1.5 * atr);

      // TTM Squeeze condition: Bollinger Bands inside Keltner Channels
      const inSqueeze = (upperBB < upperKC) && (lowerBB > lowerKC);

      // Calculate momentum (Linear Regression of closing prices)
      const xValues = Array.from({length: 20}, (_, i) => i);
      const yValues = closes;
      const n = 20;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
      const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const momentum = Math.abs(slope) / sma20; // Normalized momentum

      // Determine signal
      let signal = 'neutral';
      if (inSqueeze) {
        signal = 'squeeze_building';
      } else if (momentum > 0.01) {
        signal = slope > 0 ? 'bullish_breakout' : 'bearish_breakout';
      }

      return {
        inSqueeze,
        momentum: momentum * 100, // Convert to percentage
        signal,
        currentPrice: closes[0],
        sma20,
        atr,
        slope: slope * 100,
        bbWidth: ((upperBB - lowerBB) / sma20) * 100,
        kcWidth: ((upperKC - lowerKC) / sma20) * 100
      };

    } catch (error) {
      console.error(`Error calculating TTM Squeeze for ${ticker}:`, error);
      return { inSqueeze: false, momentum: 0, signal: 'error' };
    }
  };

  const calculateHolyGrailScore = (squeeze, darkPool, options, gex, prices) => {
    let score = 0;

    // Price Action & Technical (30%)
    if (squeeze.inSqueeze) score += 15;
    if (squeeze.momentum > 1) score += 10;
    if (squeeze.signal.includes('bullish')) score += 5;

    // Volume Analysis (25%) - using real dark pool data
    if (darkPool.volume && darkPool.volume > 100000) score += 10;
    if (darkPool.premium && darkPool.premium > 50000) score += 8;
    if (darkPool.size && darkPool.size > 1000) score += 7;

    // Options Flow (20%) - using real Unusual Whales options data
    if (options.totalPremium && options.totalPremium > 100000) score += 8;
    if (options.avgDelta && Math.abs(options.avgDelta) > 0.3) score += 6;
    if (options.callRatio && options.callRatio > 0.6) score += 6;

    // Technical Indicators (15%)
    if (squeeze.bbWidth < squeeze.kcWidth * 0.8) score += 8;
    if (squeeze.atr && squeeze.atr > 0.5) score += 7;

    // Market Cap & Liquidity (10%) - using GEX as proxy
    if (gex.gamma_exposure && Math.abs(gex.gamma_exposure) > 100000) score += 5;
    if (gex.net_gamma && Math.abs(gex.net_gamma) > 50000) score += 5;

    return Math.min(100, score); // Cap at 100
  };

  const fetchDetailedData = async (ticker) => {
    setSelectedTicker(ticker);

    try {
      // Fetch detailed dark pool and options flow data for selected ticker
      const [darkPoolRes, optionsRes] = await Promise.all([
        fetch(`/api/whales?type=darkpools&ticker=${ticker}`),
        fetch(`/api/whales?type=options&ticker=${ticker}`)
      ]);

      const darkPoolData = await darkPoolRes.json();
      const optionsData = await optionsRes.json();

      if (darkPoolData.success) {
        setDarkPoolData(darkPoolData.data || []);
      }

      if (optionsData.success) {
        setOptionsFlow(optionsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching detailed data:', error);
    }
  };

  const getSignalColor = (signal) => {
    switch(signal) {
      case 'squeeze_building': return 'text-yellow-400';
      case 'bullish_breakout': return 'text-green-400';
      case 'bearish_breakout': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSignalIcon = (signal) => {
    switch(signal) {
      case 'squeeze_building': return 'âš¡';
      case 'bullish_breakout': return 'ðŸš€';
      case 'bearish_breakout': return 'ðŸ“‰';
      default: return 'ðŸ”';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
            âš¡ TTM Squeeze Scanner
          </h1>
          <p className="text-xl text-purple-300 mb-6">Professional squeeze detection with real-time Unusual Whales integration</p>

          <button
            onClick={startScan}
            disabled={scanning}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {scanning ? 'ðŸ”„ Scanning...' : 'ðŸ” Start Squeeze Scan'}
          </button>
        </div>

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-purple-400 mb-6">ðŸŽ¯ Squeeze Candidates (Holy Grail Ranked)</h2>

            <div className="grid gap-4">
              {scanResults.map((result, index) => (
                <div
                  key={result.ticker}
                  className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
                  onClick={() => fetchDetailedData(result.ticker)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                      <span className="text-3xl font-bold text-white">{result.ticker}</span>
                      <span className={`text-2xl ${getSignalColor(result.signal)}`}>
                        {getSignalIcon(result.signal)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSignalColor(result.signal)} bg-gray-700`}>
                        {result.signal.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">${result.lastPrice?.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">{result.timestamp}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Holy Grail Score</div>
                      <div className={`text-xl font-bold ${
                        result.holyGrailScore > 80 ? 'text-green-400' :
                        result.holyGrailScore > 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.holyGrailScore}/100
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Momentum</div>
                      <div className="text-lg font-bold text-blue-400">{result.momentum?.toFixed(2)}%</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">In Squeeze</div>
                      <div className={`text-lg font-bold ${result.inSqueeze ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {result.inSqueeze ? 'YES âš¡' : 'NO'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Dark Pool Volume</div>
                      <div className="text-lg font-bold text-purple-400">
                        {result.darkPool?.volume?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Real Unusual Whales Data Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700/30 p-3 rounded">
                      <div className="text-purple-300 font-bold mb-1">ðŸ‹ Dark Pool</div>
                      <div className="space-y-1">
                        <div>Premium: ${result.darkPool?.premium?.toLocaleString() || 'N/A'}</div>
                        <div>Size: {result.darkPool?.size?.toLocaleString() || 'N/A'}</div>
                        <div>Center: {result.darkPool?.market_center || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 p-3 rounded">
                      <div className="text-green-300 font-bold mb-1">ðŸ“ˆ Options Flow</div>
                      <div className="space-y-1">
                        <div>Premium: ${result.options?.totalPremium?.toLocaleString() || 'N/A'}</div>
                        <div>Avg Delta: {result.options?.avgDelta?.toFixed(3) || 'N/A'}</div>
                        <div>Call Ratio: {((result.options?.callRatio || 0) * 100)?.toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 p-3 rounded">
                      <div className="text-cyan-300 font-bold mb-1">ðŸŒŠ Gamma Exposure</div>
                      <div className="space-y-1">
                        <div>Exposure: {result.gex?.gamma_exposure?.toLocaleString() || 'N/A'}</div>
                        <div>Vanna: {result.gex?.vanna_exposure?.toLocaleString() || 'N/A'}</div>
                        <div>Net: {result.gex?.net_gamma?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Data for Selected Ticker */}
        {selectedTicker && (darkPoolData.length > 0 || optionsFlow.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dark Pool Details */}
            {darkPoolData.length > 0 && (
              <div className="bg-gray-800/30 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-400 mb-6">ðŸ‹ {selectedTicker} Dark Pool Activity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-purple-300">Time</th>
                        <th className="text-right py-2 text-purple-300">Price</th>
                        <th className="text-right py-2 text-purple-300">Size</th>
                        <th className="text-right py-2 text-purple-300">Premium</th>
                        <th className="text-center py-2 text-purple-300">Center</th>
                      </tr>
                    </thead>
                    <tbody>
                      {darkPoolData.slice(0, 10).map((trade, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="py-2 text-gray-300">
                            {trade.executed_at ? new Date(trade.executed_at).toLocaleTimeString() : 'N/A'}
                          </td>
                          <td className="py-2 text-right text-yellow-400 font-mono">${trade.price?.toFixed(4) || 'N/A'}</td>
                          <td className="py-2 text-right text-green-400 font-mono">{trade.size?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 text-right text-purple-400 font-mono">${trade.premium?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 text-center text-cyan-400">{trade.market_center || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Options Flow Details */}
            {optionsFlow.length > 0 && (
              <div className="bg-gray-800/30 p-6 rounded-xl border border-green-500/20">
                <h3 className="text-2xl font-bold text-green-400 mb-6">ðŸ“ˆ {selectedTicker} Options Flow</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-green-300">Strike</th>
                        <th className="text-left py-2 text-green-300">Type</th>
                        <th className="text-right py-2 text-green-300">Premium</th>
                        <th className="text-right py-2 text-green-300">Delta</th>
                        <th className="text-right py-2 text-green-300">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsFlow.slice(0, 10).map((flow, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="py-2 text-white font-mono">${flow.strike?.toFixed(0) || 'N/A'}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              flow.option_type === 'call' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {flow.option_type?.toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2 text-right text-yellow-400 font-mono">${flow.premium?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 text-right text-blue-400 font-mono">{flow.delta?.toFixed(3) || 'N/A'}</td>
                          <td className="py-2 text-right text-purple-400 font-mono">{flow.volume?.toLocaleString() || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanning Status */}
        {scanning && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/20 border border-purple-500 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
              <span className="text-purple-300">Scanning {watchlist.length} tickers with live Unusual Whales data...</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            âš¡ TTM Squeeze Scanner â€¢ ðŸ‹ Powered by Unusual Whales API â€¢ Real-time dark pool & options flow integration
          </p>
        </div>
      </div>
    </div>
  );
}
