import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Activity, DollarSign, Target, Calendar, Clock } from 'lucide-react';

export default function PipelineTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  const loadTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getRecordedTrades' })
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
        
        // Calculate summary
        const totalValue = data.trades.reduce((sum, trade) => sum + (trade.initialValue || 0), 0);
        const strategies = [...new Set(data.trades.map(trade => trade.strategy))];
        const symbols = [...new Set(data.trades.map(trade => trade.symbol))];
        
        setSummary({
          totalTrades: data.trades.length,
          totalValue: totalValue,
          uniqueStrategies: strategies.length,
          uniqueSymbols: symbols.length,
          avgAiScore: data.trades.length > 0 ? data.trades.reduce((sum, trade) => sum + (trade.aiScore || 0), 0) / data.trades.length : 0
        });
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDirectionColor = (direction) => {
    switch (direction?.toUpperCase()) {
      case 'BULLISH': return 'text-green-400 bg-green-900/30';
      case 'BEARISH': return 'text-red-400 bg-red-900/30';
      case 'NEUTRAL': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Trading Pipeline</h1>
              <p className="text-sm text-gray-400">Recorded Trade Entries</p>
            </div>
          </div>
          <button
            onClick={loadTrades}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{summary.totalTrades || 0}</div>
                <div className="text-xs text-gray-400">Total Trades</div>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">${(summary.totalValue || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Value</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">{summary.uniqueStrategies || 0}</div>
                <div className="text-xs text-gray-400">Strategies</div>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-400">{summary.uniqueSymbols || 0}</div>
                <div className="text-xs text-gray-400">Symbols</div>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{Math.round(summary.avgAiScore || 0)}</div>
                <div className="text-xs text-gray-400">Avg AI Score</div>
              </div>
              <Activity className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Recorded Trades</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-gray-400">Loading trades...</span>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-400 mb-2">No Trades Recorded</div>
              <div className="text-sm text-gray-500">
                Use the Intelligent Scanner or Squeeze Scanner to record trades
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Trade ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Symbol</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Strategy</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Direction</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Entry Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Quantity</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">AI Score</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Entry Time</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <tr key={trade.tradeId || index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        {trade.tradeId?.split('_')[2] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-400">
                        {trade.strategy}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDirectionColor(trade.direction)}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400">
                        ${trade.entryPrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {trade.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${
                          trade.aiScore >= 80 ? 'text-green-400' : 
                          trade.aiScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                          {trade.aiScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(trade.entryTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {trade.scannerSource?.replace('_', ' ') || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Trading Pipeline - Real-time trade recording and tracking
        </div>
      </div>
    </div>
  );
}