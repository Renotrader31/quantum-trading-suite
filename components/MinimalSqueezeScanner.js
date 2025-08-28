import React, { useState } from 'react';
import { Play, Target, Loader, TrendingUp, Zap } from 'lucide-react';

export default function MinimalSqueezeScanner() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);

  // Simple scan function
  const runScan = async () => {
    console.log('🚀 Starting minimal squeeze scan...');
    setLoading(true);
    setStocks([]);

    try {
      const response = await fetch('/api/enhanced-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'],
          integrateLiveData: true
        })
      });

      const data = await response.json();
      console.log('✅ Scan response:', data.success, data.results?.length);

      if (data.success && data.results) {
        console.log('📊 First stock:', data.results[0]);
        setStocks(data.results);
      } else {
        console.error('❌ Scan failed:', data);
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple strategy fetch
  const getStrategies = async (stock) => {
    console.log(`🎯 Getting strategies for ${stock.symbol}...`);
    setSelectedStock(stock);
    setLoadingStrategies(true);
    setStrategies([]);

    try {
      const response = await fetch('/api/options-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: [stock.symbol],
          maxTrades: 3,
          minProbability: 55,
          riskTolerance: 'moderate-aggressive',
          maxInvestment: 10000,
          targetDTE: { min: 30, max: 45 }
        })
      });

      const data = await response.json();
      console.log('✅ Strategies response:', data.success, data.actionableTrades?.length);

      if (data.success && data.actionableTrades) {
        setStrategies(data.actionableTrades);
      } else {
        console.error('❌ Strategies failed:', data);
      }
    } catch (error) {
      console.error('❌ Strategy error:', error);
    } finally {
      setLoadingStrategies(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🚀 Minimal Squeeze Scanner</h1>
          <p className="text-gray-400">Clean, working squeeze scanner → strategy generator</p>
        </div>

        {/* Scan Button */}
        <div className="mb-6">
          <button
            onClick={runScan}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {loading ? 'Scanning...' : 'Start Squeeze Scan'}
          </button>
        </div>

        {/* Results */}
        {stocks.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Squeeze Results ({stocks.length} stocks)
            </h2>
            
            <div className="grid gap-4">
              {stocks.map(stock => (
                <div key={stock.symbol} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-blue-400">{stock.symbol}</div>
                    <div>
                      <div className="text-lg">${stock.price}</div>
                      <div className="text-sm text-gray-400">Volume: {stock.volume?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Holy Grail: {stock.holyGrail}</div>
                      <div className="text-sm text-gray-300">Squeeze: {stock.squeeze}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => getStrategies(stock)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Get Strategies
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategies */}
        {selectedStock && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Strategies for {selectedStock.symbol}
            </h2>
            
            {loadingStrategies ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                Loading strategies...
              </div>
            ) : strategies.length > 0 ? (
              <div className="grid gap-4">
                {strategies.map((strategy, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="font-semibold text-green-400 mb-2">{strategy.strategy}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Probability:</span> {strategy.probability}%
                      </div>
                      <div>
                        <span className="text-gray-400">Max Gain:</span> ${strategy.maxGain}
                      </div>
                      <div>
                        <span className="text-gray-400">Max Loss:</span> ${strategy.maxLoss}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">{strategy.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">Click "Get Strategies" on a stock to see recommendations</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}