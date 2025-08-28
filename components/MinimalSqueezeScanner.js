import React, { useState } from 'react';
import { Play, Target, Loader, TrendingUp, Zap, CheckCircle, DollarSign, TrendingDown, AlertCircle, Activity, BarChart3 } from 'lucide-react';

export default function MinimalSqueezeScanner() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced scan function with better UX
  const runScan = async () => {
    console.log('🚀 Starting minimal squeeze scan...');
    setLoading(true);
    setStocks([]);
    setScanComplete(false);
    setError(null);
    setSelectedStock(null);
    setStrategies([]);

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
        setScanComplete(true);
      } else {
        console.error('❌ Scan failed:', data);
        setError('Scan failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      setError('Network error: ' + error.message);
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
        
        {/* Header with Status */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            Quantum Trading Suite - Core Flow
          </h1>
          <p className="text-gray-400">Premium Data Integration → Strategy Generation → Actionable Trades</p>
          
          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              scanComplete ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {scanComplete ? <CheckCircle className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              Scanner: {scanComplete ? 'Ready' : 'Idle'}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              strategies.length > 0 ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {strategies.length > 0 ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              Strategies: {strategies.length > 0 ? 'Loaded' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Enhanced Scan Section */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Step 1: Squeeze Scanner
            </h3>
            
            <button
              onClick={runScan}
              disabled={loading}
              className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-3 text-lg transition-all ${
                loading 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : scanComplete
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : scanComplete ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {loading ? 'Scanning Premium Markets...' : scanComplete ? 'Scan Complete - Run Again' : 'Start Premium Squeeze Scan'}
            </button>
            
            {loading && (
              <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" />
                Fetching live data from FMP, Polygon, and Yahoo Finance...
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-600 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Enhanced Results */}
        {stocks.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Step 2: Premium Market Data ({stocks.length} stocks detected)
            </h2>
            
            <div className="grid gap-4">
              {stocks.map(stock => {
                const isSelected = selectedStock?.symbol === stock.symbol;
                const holyGrailScore = parseInt(stock.holyGrail);
                const scoreColor = holyGrailScore >= 80 ? 'text-green-400' : holyGrailScore >= 60 ? 'text-yellow-400' : 'text-red-400';
                
                return (
                  <div 
                    key={stock.symbol} 
                    className={`rounded-lg p-4 border-2 transition-all ${
                      isSelected 
                        ? 'bg-blue-900/50 border-blue-500' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{stock.symbol}</div>
                          {isSelected && <div className="text-xs text-blue-400 mt-1">SELECTED</div>}
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">${stock.price}</div>
                          <div className="text-xs text-gray-400">Live Price</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg">{stock.volume?.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Volume</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-lg font-bold ${scoreColor}`}>{stock.holyGrail}</div>
                          <div className="text-xs text-gray-400">Holy Grail</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg text-orange-400">{stock.squeeze}</div>
                          <div className="text-xs text-gray-400">Squeeze</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => getStrategies(stock)}
                        disabled={loadingStrategies && isSelected}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                          loadingStrategies && isSelected
                            ? 'bg-gray-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/25'
                        }`}
                      >
                        {loadingStrategies && isSelected ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                        {loadingStrategies && isSelected ? 'Analyzing...' : 'Get Strategies'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Strategies */}
        {selectedStock && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Step 3: AI Strategy Generation for {selectedStock.symbol}
            </h2>
            
            {loadingStrategies ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                Loading strategies...
              </div>
            ) : strategies.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {strategies.length} actionable strategies generated with 30-45 DTE targeting
                </div>
                
                {strategies.map((strategy, index) => {
                  const probability = parseInt(strategy.probability);
                  const probColor = probability >= 75 ? 'text-green-400' : probability >= 60 ? 'text-yellow-400' : 'text-orange-400';
                  
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-5 border border-gray-600 hover:border-gray-500 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-lg text-green-400 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          {strategy.strategy}
                        </div>
                        <div className={`font-bold ${probColor}`}>
                          {strategy.probability}% Success
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-300">${strategy.maxGain}</div>
                          <div className="text-xs text-gray-400">Max Gain</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-300">${strategy.maxLoss}</div>
                          <div className="text-xs text-gray-400">Max Loss</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-300">
                            {((strategy.maxGain / Math.abs(strategy.maxLoss)) * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-400">Risk/Reward</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300 bg-gray-800 rounded p-3">
                        {strategy.description}
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Execute Trade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8 flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                Click "Get Strategies" on a stock above to generate AI-powered options strategies
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}