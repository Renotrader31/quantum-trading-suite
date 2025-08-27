import React, { useState, useEffect } from 'react';
import { AlertCircle, Play, Pause, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const SqueezeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

  // Popular tickers to scan for squeezes
  const DEFAULT_TICKERS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
    'SPY', 'QQQ', 'IWM', 'DIA', 'AMD', 'BABA', 'CRM', 'PYPL'
  ];

  const [tickersToScan, setTickersToScan] = useState(DEFAULT_TICKERS);
  const [customTicker, setCustomTicker] = useState('');

  // Add custom ticker to scan list
  const addCustomTicker = () => {
    if (customTicker && !tickersToScan.includes(customTicker.toUpperCase())) {
      setTickersToScan([...tickersToScan, customTicker.toUpperCase()]);
      setCustomTicker('');
    }
  };

  // Remove ticker from scan list
  const removeTicker = (ticker) => {
    setTickersToScan(tickersToScan.filter(t => t !== ticker));
  };

  // Calculate squeeze probability based on Greeks data
  const calculateSqueezeMetrics = (greeksData) => {
    if (!greeksData || greeksData.length === 0) {
      return { squeezeScore: 0, confidence: 'Low', signals: [] };
    }

    let signals = [];
    let squeezeScore = 0;

    // Group by expiry to analyze term structure
    const expiryGroups = greeksData.reduce((acc, item) => {
      if (!acc[item.expiry]) acc[item.expiry] = [];
      acc[item.expiry].push(item);
      return acc;
    }, {});

    // Check for high gamma concentration (squeeze indicator)
    Object.entries(expiryGroups).forEach(([expiry, data]) => {
      const totalGamma = data.reduce((sum, item) => 
        sum + parseFloat(item.call_gamma || 0) + parseFloat(item.put_gamma || 0), 0
      );

      const avgVolatility = data.reduce((sum, item) => 
        sum + (parseFloat(item.call_volatility || 0) + parseFloat(item.put_volatility || 0)) / 2, 0
      ) / data.length;

      if (totalGamma > 5) {
        squeezeScore += 20;
        signals.push(`High gamma concentration (${totalGamma.toFixed(2)}) for ${expiry}`);
      }

      if (avgVolatility > 50) {
        squeezeScore += 15;
        signals.push(`Elevated IV (${avgVolatility.toFixed(1)}%) for ${expiry}`);
      }

      // Check for put/call gamma imbalance
      const callGamma = data.reduce((sum, item) => sum + parseFloat(item.call_gamma || 0), 0);
      const putGamma = data.reduce((sum, item) => sum + parseFloat(item.put_gamma || 0), 0);

      if (Math.abs(callGamma - putGamma) > 3) {
        squeezeScore += 10;
        signals.push(`Gamma imbalance detected for ${expiry}`);
      }
    });

    // Determine confidence level
    let confidence = 'Low';
    if (squeezeScore > 40) confidence = 'High';
    else if (squeezeScore > 20) confidence = 'Medium';

    return {
      squeezeScore: Math.min(squeezeScore, 100),
      confidence,
      signals
    };
  };

  // Fetch Greeks data for a single ticker
  const fetchGreeksData = async (ticker) => {
    try {
      const response = await fetch(`/api/whales?type=greeks&ticker=${ticker}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data?.data) {
        throw new Error('Invalid API response format');
      }

      return result.data.data;
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      throw error;
    }
  };

  // Main scan function
  const performScan = async () => {
    setIsScanning(true);
    setError(null);
    setScanResults([]);
    setScanProgress({ current: 0, total: tickersToScan.length });

    const results = [];

    try {
      for (let i = 0; i < tickersToScan.length; i++) {
        const ticker = tickersToScan[i];
        setScanProgress({ current: i + 1, total: tickersToScan.length });

        try {
          const greeksData = await fetchGreeksData(ticker);
          const metrics = calculateSqueezeMetrics(greeksData);

          results.push({
            ticker,
            ...metrics,
            lastUpdated: new Date().toLocaleTimeString(),
            dataPoints: greeksData.length
          });

          // Small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (tickerError) {
          console.warn(`Failed to scan ${ticker}:`, tickerError);
          results.push({
            ticker,
            squeezeScore: 0,
            confidence: 'Error',
            signals: [`Failed to fetch data: ${tickerError.message}`],
            lastUpdated: new Date().toLocaleTimeString(),
            dataPoints: 0,
            error: true
          });
        }
      }

      // Sort results by squeeze score
      results.sort((a, b) => b.squeezeScore - a.squeezeScore);
      setScanResults(results);
      setLastScanTime(new Date().toLocaleString());

    } catch (error) {
      setError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress({ current: 0, total: 0 });
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (isScanning && scanResults.length > 0) {
      // Refresh every 2 minutes after initial scan
      interval = setInterval(() => {
        performScan();
      }, 120000);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanResults.length]);

  const getScoreColor = (score) => {
    if (score >= 60) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    if (score >= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'High': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'Medium': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'Low': return <TrendingDown className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Options Squeeze Scanner
        </h2>

        {/* Control Panel */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={isScanning ? () => setIsScanning(false) : performScan}
              disabled={tickersToScan.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isScanning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
              }`}
            >
              {isScanning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Scan
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Squeeze Scan
                </>
              )}
            </button>

            {lastScanTime && (
              <span className="text-sm text-gray-500">
                Last scan: {lastScanTime}
              </span>
            )}
          </div>

          {/* Add Custom Ticker */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
              placeholder="Add ticker (e.g., AAPL)"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addCustomTicker()}
            />
            <button
              onClick={addCustomTicker}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Add
            </button>
          </div>

          {/* Ticker List */}
          <div className="flex flex-wrap gap-2">
            {tickersToScan.map(ticker => (
              <span
                key={ticker}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {ticker}
                <button
                  onClick={() => removeTicker(ticker)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  Ã—
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Scan Progress */}
        {isScanning && scanProgress.total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Scanning progress...</span>
              <span>{scanProgress.current} / {scanProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Squeeze Detection Results ({scanResults.length} symbols)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squeeze Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanResults.map((result, index) => (
                  <tr key={result.ticker} className={result.error ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.ticker}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(result.squeezeScore)}`}>
                        {result.error ? 'N/A' : `${result.squeezeScore}/100`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getConfidenceIcon(result.confidence)}
                        <span className="text-sm text-gray-900">{result.confidence}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {result.signals.length > 0 ? (
                          <ul className="space-y-1">
                            {result.signals.slice(0, 2).map((signal, i) => (
                              <li key={i} className="text-xs text-gray-600">â€¢ {signal}</li>
                            ))}
                            {result.signals.length > 2 && (
                              <li className="text-xs text-blue-600">+ {result.signals.length - 2} more</li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-gray-400">No signals detected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.dataPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqueezeScanner;
