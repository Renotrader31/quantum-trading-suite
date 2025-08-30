import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';

// Standalone Options Strategy Component with no external dependencies
export default function StandaloneOptionsStrategy({ marketData = {}, selectedTrades = [] }) {
  const [isClient, setIsClient] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Strategy templates
  const STRATEGIES = {
    'LONG_CALL': {
      name: 'Long Call',
      type: 'Bullish',
      description: 'Buy call option to profit from upward movement',
      risk: 'Limited to premium',
      reward: 'Unlimited'
    },
    'LONG_PUT': {
      name: 'Long Put', 
      type: 'Bearish',
      description: 'Buy put option to profit from downward movement',
      risk: 'Limited to premium',
      reward: 'Strike minus premium'
    },
    'COVERED_CALL': {
      name: 'Covered Call',
      type: 'Neutral to Bullish',
      description: 'Own stock and sell call option for income',
      risk: 'Stock decline',
      reward: 'Premium plus limited upside'
    },
    'BULL_CALL_SPREAD': {
      name: 'Bull Call Spread',
      type: 'Moderately Bullish',
      description: 'Buy lower strike call, sell higher strike call',
      risk: 'Net premium paid',
      reward: 'Strike difference minus premium'
    },
    'BEAR_PUT_SPREAD': {
      name: 'Bear Put Spread',
      type: 'Moderately Bearish',
      description: 'Buy higher strike put, sell lower strike put',
      risk: 'Net premium paid',
      reward: 'Strike difference minus premium'
    },
    'IRON_CONDOR': {
      name: 'Iron Condor',
      type: 'Neutral',
      description: 'Sell OTM call and put spreads',
      risk: 'Strike width minus credit',
      reward: 'Net credit received'
    }
  };

  const analyzeStock = (symbol) => {
    setLoading(true);
    setSelectedStock(symbol);
    
    // Simulate strategy analysis
    setTimeout(() => {
      const mockStrategies = Object.entries(STRATEGIES).map(([key, strategy]) => ({
        ...strategy,
        symbol: symbol,
        probability: 60 + Math.floor(Math.random() * 30),
        expectedReturn: 5 + Math.floor(Math.random() * 25),
        score: 70 + Math.floor(Math.random() * 25)
      }));
      
      setStrategies(mockStrategies.sort((a, b) => b.score - a.score));
      setLoading(false);
    }, 1000);
  };

  // Prevent SSR issues
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Options Strategy Analysis
        </h2>

        {/* Stock Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Stock for Analysis</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(marketData).length > 0 ? (
              Object.keys(marketData).slice(0, 10).map(symbol => (
                <button
                  key={symbol}
                  onClick={() => analyzeStock(symbol)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedStock === symbol
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  }`}
                >
                  {symbol}
                  {marketData[symbol]?.price && (
                    <span className="ml-2 text-sm text-gray-400">
                      ${marketData[symbol].price.toFixed(2)}
                    </span>
                  )}
                </button>
              ))
            ) : (
              // Default stocks if no market data
              ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY', 'QQQ', 'IWM'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => analyzeStock(symbol)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedStock === symbol
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  }`}
                >
                  {symbol}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Strategy Recommendations */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CircularProgress className="mb-4" />
            <p className="text-gray-400">Analyzing strategies for {selectedStock}...</p>
          </div>
        ) : strategies.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Recommended Strategies for {selectedStock}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.map((strategy, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{strategy.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      strategy.type.includes('Bullish') ? 'bg-green-900 text-green-300' :
                      strategy.type.includes('Bearish') ? 'bg-red-900 text-red-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {strategy.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{strategy.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Probability:</span>
                      <span className={`font-medium ${
                        strategy.probability >= 80 ? 'text-green-400' :
                        strategy.probability >= 65 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {strategy.probability}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expected Return:</span>
                      <span className="text-blue-400 font-medium">
                        {strategy.expectedReturn}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score:</span>
                      <span className="text-purple-400 font-medium">
                        {strategy.score}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Risk:</span>
                        <span className="text-red-400">{strategy.risk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Reward:</span>
                        <span className="text-green-400">{strategy.reward}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                    Select Strategy
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : selectedStock ? (
          <div className="text-center py-12 text-gray-400">
            <p>No strategies analyzed yet</p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Select a stock to see strategy recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
}