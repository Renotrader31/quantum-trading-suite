import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Activity, DollarSign, Target, Calendar, Clock } from 'lucide-react';

export default function PipelineTradesView() {
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
          uniqueSymbols: symbols.length
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Trading Pipeline Records
              </h1>
              <p className="text-gray-400">Complete history of all trades processed through the intelligent pipeline</p>
            </div>
            <button
              onClick={loadTrades}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Trades</p>
                  <p className="text-2xl font-bold">{summary.totalTrades || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Strategies Used</p>
                  <p className="text-2xl font-bold">{summary.uniqueStrategies || 0}</p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unique Symbols</p>
                  <p className="text-2xl font-bold">{summary.uniqueSymbols || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-850 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strategy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strike/Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contracts</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      Loading trades...
                    </td>
                  </tr>
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                      No trades recorded yet. Start scanning to populate this view.
                    </td>
                  </tr>
                ) : (
                  trades.map((trade, index) => (
                    <tr key={index} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {formatDate(trade.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{trade.symbol}</div>
                        <div className="text-xs text-gray-400">{trade.confidence}% confidence</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trade.strategy.includes('Call') ? 'bg-green-900 text-green-300' :
                          trade.strategy.includes('Put') ? 'bg-red-900 text-red-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {trade.strategy}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>${trade.strike}</div>
                        <div className="text-xs text-gray-400">{trade.expiry}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{trade.contracts}</td>
                      <td className="px-4 py-3 text-sm">${trade.entryPrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(trade.initialValue)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          trade.riskLevel === 'Low' ? 'text-green-400' :
                          trade.riskLevel === 'Medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {trade.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${trade.mlScore || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{trade.mlScore || 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {trades.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {trades.length} recorded trades • Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}