import React, { useState, useEffect } from 'react';
import { TradeTracker } from '../lib/tradeTracker.js';

const TradeTrackerComponent = () => {
  const [tradeTracker] = useState(() => new TradeTracker());
  const [activeTrades, setActiveTrades] = useState([]);
  const [completedTrades, setCompletedTrades] = useState([]);
  const [performanceStats, setPerformanceStats] = useState({});
  const [strategyStats, setStrategyStats] = useState({});
  const [activeTab, setActiveTab] = useState('active');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [exitPrice, setExitPrice] = useState('');
  const [exitReason, setExitReason] = useState('manual');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [manualTrade, setManualTrade] = useState({
    symbol: '',
    strategyName: '',
    entryPrice: '',
    expiration: '',
    positionSize: 1,
    maxLoss: '',
    maxGain: ''
  });

  // Load data on component mount and when refreshTrigger changes
  useEffect(() => {
    loadTradeData();
  }, [refreshTrigger]);

  const loadTradeData = async () => {
    try {
      // First try to fetch from server API
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getPerformance' })
      });

      if (response.ok) {
        const serverData = await response.json();
        console.log('📊 Loaded trade data from server:', serverData);
        
        if (serverData.success) {
          // Use server data if available
          if (serverData.performanceStats) setPerformanceStats(serverData.performanceStats);
          if (serverData.strategyStats) setStrategyStats(serverData.strategyStats);
          if (serverData.completedTrades) setCompletedTrades(serverData.completedTrades);
        }

        // Get active trades separately
        const activeResponse = await fetch('/api/trade-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getActiveTrades' })
        });

        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          if (activeData.success && activeData.activeTrades) {
            setActiveTrades(activeData.activeTrades);
            console.log('📋 Loaded active trades from server:', activeData.activeTrades.length);
          }
        }
      }
    } catch (error) {
      console.error('Error loading trade data from server:', error);
      
      // Fallback to local storage
      console.log('📱 Falling back to local storage...');
      setActiveTrades(tradeTracker.getActiveTrades());
      setCompletedTrades(tradeTracker.getCompletedTrades(20));
      setPerformanceStats(tradeTracker.getPerformanceStats());
      setStrategyStats(tradeTracker.getStrategyPerformance());
    }
  };

  const handleCloseTrade = (trade) => {
    setSelectedTrade(trade);
    setExitPrice(trade.entryPrice); // Default to entry price
    setShowCloseModal(true);
  };

  const executeTradeClose = async () => {
    if (!selectedTrade || !exitPrice) return;

    const entryPrice = parseFloat(selectedTrade.entryPrice);
    const exit = parseFloat(exitPrice);
    const percentReturn = ((exit - entryPrice) / entryPrice) * 100;
    const actualReturn = (exit - entryPrice) * (selectedTrade.positionSize || 1);

    const outcomeData = {
      exitPrice: exit,
      actualReturn: actualReturn,
      percentReturn: percentReturn,
      exitReason: exitReason
    };

    try {
      // Record the trade outcome
      const mlTrainingData = tradeTracker.recordTradeOutcome(selectedTrade.id, outcomeData);
      
      // Send to ML for learning
      await fetch('/api/ml-learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'OUTCOME_LEARNING',
          tradeData: mlTrainingData
        })
      });

      // Refresh data
      setRefreshTrigger(prev => prev + 1);
      setShowCloseModal(false);
      setSelectedTrade(null);
      setExitPrice('');

      console.log('✅ Trade closed and ML updated with real outcome');
    } catch (error) {
      console.error('Error closing trade:', error);
      alert('Error closing trade. Please try again.');
    }
  };

  const addManualTrade = async () => {
    if (!manualTrade.symbol || !manualTrade.strategyName || !manualTrade.entryPrice) {
      alert('Please fill in Symbol, Strategy, and Entry Price at minimum');
      return;
    }

    const tradeData = {
      symbol: manualTrade.symbol.toUpperCase(),
      strategyName: manualTrade.strategyName,
      entryPrice: parseFloat(manualTrade.entryPrice),
      strikes: [],
      expiration: manualTrade.expiration || new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      dte: manualTrade.expiration ? Math.ceil((new Date(manualTrade.expiration) - new Date()) / (1000 * 60 * 60 * 24)) : 30,
      positionSize: manualTrade.positionSize,
      maxLoss: parseFloat(manualTrade.maxLoss) || 0,
      maxGain: parseFloat(manualTrade.maxGain) || 0,
      squeezeContext: { source: 'manual_entry' },
      marketConditions: { source: 'manual_entry' },
      neuralNetworkPrediction: 0,
      aiScore: 50,
      probability: 50
    };

    try {
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordEntry',
          tradeData: tradeData
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manual trade added:', result.tradeId);
        setRefreshTrigger(prev => prev + 1);
        setShowAddTradeModal(false);
        
        // Reset form
        setManualTrade({
          symbol: '',
          strategyName: '',
          entryPrice: '',
          expiration: '',
          positionSize: 1,
          maxLoss: '',
          maxGain: ''
        });
        
        alert(`✅ ${tradeData.symbol} ${tradeData.strategyName} added to portfolio!\nTrade ID: ${result.tradeId}`);
      }
    } catch (error) {
      console.error('Error adding manual trade:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    const color = value >= 0 ? 'text-green-400' : 'text-red-400';
    const sign = value >= 0 ? '+' : '';
    return <span className={color}>{sign}{value.toFixed(2)}%</span>;
  };

  const getDaysHeld = (entryDate) => {
    const entry = new Date(entryDate);
    const now = new Date();
    return Math.floor((now - entry) / (1000 * 60 * 60 * 24));
  };

  const getTimeRemaining = (expiration) => {
    const exp = new Date(expiration);
    const now = new Date();
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return <span className="text-red-400">EXPIRED</span>;
    if (days === 0) return <span className="text-yellow-400">TODAY</span>;
    if (days <= 3) return <span className="text-orange-400">{days}d</span>;
    return <span className="text-gray-300">{days}d</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎯 Trade Tracker
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRefreshTrigger(prev => prev + 1);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/trade-entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'debug' })
                  });
                  const data = await response.json();
                  console.log('🐛 Debug data:', data);
                  alert(`Debug Info:\nActive: ${data.debug?.activeTradesCount || 0}\nCompleted: ${data.debug?.completedTradesCount || 0}\nFile exists: ${data.debug?.fileExists}\n\nCheck console for full details.`);
                } catch (error) {
                  console.error('Debug error:', error);
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              🐛 Debug
            </button>
            <button
              onClick={() => setShowAddTradeModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              + Add External Trade
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Trades</div>
            <div className="text-2xl font-bold">{performanceStats.totalTrades || 0}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">
              {(performanceStats.winRate || 0).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Return</div>
            <div className={`text-2xl font-bold ${(performanceStats.totalReturn || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(performanceStats.totalReturn || 0)}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">ML Accuracy</div>
            <div className="text-2xl font-bold text-blue-400">
              {((performanceStats.avgPredictionAccuracy || 0) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Active Trades ({activeTrades.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'completed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Completed Trades ({completedTrades.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Strategy Analytics
          </button>
        </div>

        {/* Active Trades Tab */}
        {activeTab === 'active' && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              🔄 Active Trades
              <span className="ml-2 text-sm text-gray-400">
                (Click to close early)
              </span>
            </h2>
            
            {activeTrades.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📭</div>
                <div className="text-xl">No active trades</div>
                <div className="text-sm mt-2">Trades from SqueezeScanner will appear here automatically</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-left py-2">Strategy</th>
                      <th className="text-left py-2">Entry</th>
                      <th className="text-left py-2">Days Held</th>
                      <th className="text-left py-2">Expires</th>
                      <th className="text-left py-2">AI Score</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 font-bold text-blue-400">{trade.symbol}</td>
                        <td className="py-3">{trade.strategy}</td>
                        <td className="py-3">{formatCurrency(trade.entryPrice)}</td>
                        <td className="py-3">{getDaysHeld(trade.entryDate)}d</td>
                        <td className="py-3">{getTimeRemaining(trade.expiration)}</td>
                        <td className="py-3">
                          <span className="text-purple-400 font-bold">
                            {trade.mlContext?.aiScore || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleCloseTrade(trade)}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Close Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Completed Trades Tab */}
        {activeTab === 'completed' && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Completed Trades</h2>
            
            {completedTrades.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📈</div>
                <div className="text-xl">No completed trades yet</div>
                <div className="text-sm mt-2">Close some active trades to see performance history</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-left py-2">Strategy</th>
                      <th className="text-left py-2">Return</th>
                      <th className="text-left py-2">Days Held</th>
                      <th className="text-left py-2">Exit Reason</th>
                      <th className="text-left py-2">ML Accuracy</th>
                      <th className="text-left py-2">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 font-bold text-blue-400">{trade.symbol}</td>
                        <td className="py-3">{trade.strategy}</td>
                        <td className="py-3 font-bold">{formatPercent(trade.percentReturn)}</td>
                        <td className="py-3">{trade.daysHeld}d</td>
                        <td className="py-3 capitalize">{trade.exitReason}</td>
                        <td className="py-3">
                          <span className="text-purple-400">
                            {((trade.actualVsPredicted?.accuracy || 0) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(trade.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Strategy Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">🎯 Strategy Performance</h2>
            
            {Object.keys(strategyStats).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📋</div>
                <div className="text-xl">No strategy data yet</div>
                <div className="text-sm mt-2">Complete some trades to see strategy performance breakdown</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(strategyStats).map(([strategy, stats]) => (
                  <div key={strategy} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <h3 className="text-lg font-bold mb-3 text-blue-400">{strategy}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trades:</span>
                        <span className="font-bold">{stats.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="font-bold text-green-400">{stats.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Return:</span>
                        <span className={`font-bold ${stats.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(stats.avgReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Factor:</span>
                        <span className="font-bold text-purple-400">{stats.profitFactor.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close Trade Modal */}
      {showCloseModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Close Trade: {selectedTrade.symbol}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Exit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter exit price"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Exit Reason</label>
                <select
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="profit_target">Profit Target</option>
                  <option value="stop_loss">Stop Loss</option>
                  <option value="expiration">Expiration</option>
                  <option value="manual">Manual Close</option>
                </select>
              </div>

              {exitPrice && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Projected Return:</div>
                  <div className={`text-lg font-bold ${
                    ((parseFloat(exitPrice) - selectedTrade.entryPrice) / selectedTrade.entryPrice * 100) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {formatPercent((parseFloat(exitPrice) - selectedTrade.entryPrice) / selectedTrade.entryPrice * 100)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={executeTradeClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                disabled={!exitPrice}
              >
                Close Trade & Train ML
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedTrade(null);
                  setExitPrice('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Trade Entry Modal */}
      {showAddTradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add External Trade</h3>
            <div className="text-sm text-gray-400 mb-4">
              For trades taken on other platforms (Robinhood, TD Ameritrade, etc.)
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Symbol *</label>
                  <input
                    type="text"
                    value={manualTrade.symbol}
                    onChange={(e) => setManualTrade({...manualTrade, symbol: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white uppercase"
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Strategy *</label>
                  <select
                    value={manualTrade.strategyName}
                    onChange={(e) => setManualTrade({...manualTrade, strategyName: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="">Select Strategy</option>
                    
                    {/* Basic Options Strategies */}
                    <optgroup label="📈 Basic Options">
                      <option value="Buy Call">Buy Call (Bullish)</option>
                      <option value="Buy Put">Buy Put (Bearish)</option>
                      <option value="Sell Call">Sell Call (Neutral/Bearish)</option>
                      <option value="Sell Put">Sell Put (Neutral/Bullish)</option>
                    </optgroup>
                    
                    {/* Single Leg Strategies */}
                    <optgroup label="🎯 Single Leg">
                      <option value="Long Call">Long Call</option>
                      <option value="Long Put">Long Put</option>
                      <option value="Short Call">Short Call</option>
                      <option value="Short Put">Short Put</option>
                      <option value="Covered Call">Covered Call</option>
                      <option value="Cash Secured Put">Cash Secured Put</option>
                    </optgroup>
                    
                    {/* Spreads */}
                    <optgroup label="📊 Spreads">
                      <option value="Bull Call Spread">Bull Call Spread</option>
                      <option value="Bear Call Spread">Bear Call Spread</option>
                      <option value="Bull Put Spread">Bull Put Spread</option>
                      <option value="Bear Put Spread">Bear Put Spread</option>
                      <option value="Calendar Spread">Calendar Spread</option>
                      <option value="Diagonal Spread">Diagonal Spread</option>
                    </optgroup>
                    
                    {/* Multi-Leg Strategies */}
                    <optgroup label="🔄 Multi-Leg">
                      <option value="Iron Condor">Iron Condor</option>
                      <option value="Iron Butterfly">Iron Butterfly</option>
                      <option value="Straddle">Long Straddle</option>
                      <option value="Short Straddle">Short Straddle</option>
                      <option value="Strangle">Long Strangle</option>
                      <option value="Short Strangle">Short Strangle</option>
                      <option value="Jade Lizard">Jade Lizard</option>
                      <option value="Big Lizard">Big Lizard</option>
                    </optgroup>
                    
                    {/* Stock Strategies */}
                    <optgroup label="📈 Stocks">
                      <option value="Stock Purchase">Stock Purchase (Long)</option>
                      <option value="Stock Sale">Stock Sale (Short)</option>
                      <option value="Buy and Hold">Buy and Hold</option>
                    </optgroup>
                    
                    {/* Other */}
                    <optgroup label="🔧 Other">
                      <option value="Custom Strategy">Custom Strategy</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Entry Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTrade.entryPrice}
                    onChange={(e) => setManualTrade({...manualTrade, entryPrice: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Position Size</label>
                  <input
                    type="number"
                    value={manualTrade.positionSize}
                    onChange={(e) => setManualTrade({...manualTrade, positionSize: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={manualTrade.expiration}
                  onChange={(e) => setManualTrade({...manualTrade, expiration: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTrade.maxLoss}
                    onChange={(e) => setManualTrade({...manualTrade, maxLoss: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="500.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Gain</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTrade.maxGain}
                    onChange={(e) => setManualTrade({...manualTrade, maxGain: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="1500.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addManualTrade}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                disabled={!manualTrade.symbol || !manualTrade.strategyName || !manualTrade.entryPrice}
              >
                Add to Portfolio
              </button>
              <button
                onClick={() => {
                  setShowAddTradeModal(false);
                  setManualTrade({
                    symbol: '',
                    strategyName: '',
                    entryPrice: '',
                    expiration: '',
                    positionSize: 1,
                    maxLoss: '',
                    maxGain: ''
                  });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeTrackerComponent;