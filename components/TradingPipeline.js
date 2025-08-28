// components/TradingPipeline.js - Intelligent Trading Pipeline Dashboard
import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, TrendingUp, Activity, Target, Shield, 
  BarChart3, Layers, Cpu, Eye, Sparkles, Award,
  AlertCircle, CheckCircle, Clock, DollarSign, Flame,
  Settings, Play, Pause, RefreshCw, Bell, ArrowUpRight,
  ArrowRight, ChevronRight, Filter, Search, Download
} from 'lucide-react';

export default function TradingPipeline({ marketData, loading, onRefresh, lastUpdate }) {
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResults, setPipelineResults] = useState(null);
  const [actionableTrades, setActionableTrades] = useState([]);
  const [pipelineConfig, setPipelineConfig] = useState({
    squeezeThreshold: 75,
    holyGrailThreshold: 65,
    maxSymbols: 8,
    maxTrades: 4,
    riskTolerance: 'moderate',
    maxInvestment: 10000,
    enableMLLearning: true
  });
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Auto-run pipeline when market data is available
    if (marketData && Object.keys(marketData).length > 0 && !pipelineResults) {
      setTimeout(() => runTradingPipeline(), 2000);
    }
  }, [marketData]);

  const runTradingPipeline = async () => {
    setPipelineRunning(true);
    
    try {
      console.log('🚀 Starting Intelligent Trading Pipeline...');
      
      const response = await fetch('/api/trading-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelineConfig)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPipelineResults(data);
        setActionableTrades(data.actionableTrades || []);
        console.log('✅ Pipeline completed successfully!', data.summary);
      } else {
        console.error('❌ Pipeline failed:', data.error);
      }
      
    } catch (error) {
      console.error('❌ Pipeline error:', error);
    } finally {
      setPipelineRunning(false);
    }
  };

  const getStepStatus = (step) => {
    if (!pipelineResults?.pipeline?.steps) return 'pending';
    const pipelineStep = pipelineResults.pipeline.steps.find(s => s.step === step);
    return pipelineStep?.status || 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000 || amount <= -1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-green-400';
    if (prob >= 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMLScoreColor = (score) => {
    if (score >= 85) return 'bg-green-600 text-white';
    if (score >= 70) return 'bg-yellow-600 text-white';
    if (score >= 55) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold">Intelligent Trading Pipeline</h1>
              <p className="text-sm text-gray-400">
                Squeeze Scanner → Options Analyzer → ML Engine → Actionable Trades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={runTradingPipeline}
              disabled={pipelineRunning}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
                pipelineRunning 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {pipelineRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Pipeline
                </>
              )}
            </button>
            
            {pipelineResults && (
              <div className="text-sm text-gray-400">
                Last Run: {new Date(pipelineResults.pipeline.startTime).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Pipeline Flow Visualization */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Pipeline Flow
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-2">
                  {getStepIcon(getStepStatus(1))}
                </div>
                <div className="text-sm font-medium">Squeeze Scanner</div>
                <div className="text-xs text-gray-400">
                  {pipelineResults?.results?.squeezeScanner?.candidates || 0} candidates
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-600" />
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 mb-2">
                  {getStepIcon(getStepStatus(2))}
                </div>
                <div className="text-sm font-medium">Options Analyzer</div>
                <div className="text-xs text-gray-400">
                  {pipelineResults?.results?.optionsAnalyzer?.actionableTrades || 0} strategies
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-600" />
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 mb-2">
                  {getStepIcon(getStepStatus(3))}
                </div>
                <div className="text-sm font-medium">ML Engine</div>
                <div className="text-xs text-gray-400">
                  {pipelineResults?.results?.mlEngine?.recommendations || 0} enhanced
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-600" />
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-600 mb-2">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium">Final Trades</div>
                <div className="text-xs text-gray-400">
                  {actionableTrades.length} actionable
                </div>
              </div>
            </div>
            
            {pipelineResults && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {pipelineResults.summary?.pipelineEfficiency || 0}%
                </div>
                <div className="text-sm text-gray-400">Pipeline Efficiency</div>
                <div className="text-xs text-gray-500">
                  {pipelineResults.summary?.totalExecutionTime || '0s'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Tabs */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {/* Tab Navigation */}
          <div className="border-b border-gray-800 px-6 py-3">
            <div className="flex space-x-6">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'trades', name: 'Actionable Trades', icon: Target },
                { id: 'squeeze', name: 'Squeeze Results', icon: Activity },
                { id: 'ml', name: 'ML Insights', icon: Brain },
                { id: 'config', name: 'Configuration', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedTab === tab.id 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Pipeline Overview</h3>
                
                {pipelineResults ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">
                        {pipelineResults.squeezeData?.length || 0}
                      </div>
                      <div className="text-sm text-gray-400">Squeeze Candidates</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {actionableTrades.length}
                      </div>
                      <div className="text-sm text-gray-400">Actionable Trades</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">
                        {pipelineResults.mlData?.modelAccuracy ? 
                          `${(pipelineResults.mlData.modelAccuracy * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">ML Accuracy</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-400">
                        {actionableTrades.length > 0 ?
                          Math.round(actionableTrades.reduce((sum, t) => sum + (t.mlScore || t.aiScore), 0) / actionableTrades.length) :
                          0
                        }
                      </div>
                      <div className="text-sm text-gray-400">Avg Score</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">No pipeline data available</div>
                    <div className="text-sm text-gray-500">Run the pipeline to see results</div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Actionable Trades</h3>
                  <div className="text-sm text-gray-400">
                    {actionableTrades.length} trades • Last updated: {lastUpdate || 'Never'}
                  </div>
                </div>
                
                {actionableTrades.length > 0 ? (
                  <div className="space-y-4">
                    {actionableTrades.map((trade, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div>
                            <div className="font-bold text-lg text-blue-400">{trade.symbol}</div>
                            <div className="text-sm text-gray-400">{trade.strategyName}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getProbabilityColor(trade.probability)}`}>
                              {trade.probability}%
                            </div>
                            <div className="text-xs text-gray-400">Probability</div>
                          </div>
                          
                          <div className="text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMLScoreColor(trade.mlScore || trade.aiScore)}`}>
                              {trade.mlScore || trade.aiScore}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {trade.mlScore ? 'ML Score' : 'AI Score'}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {formatCurrency(trade.expectedReturn)}
                            </div>
                            <div className="text-xs text-gray-400">Expected Return</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-400">
                              {formatCurrency(trade.maxLoss)}
                            </div>
                            <div className="text-xs text-gray-400">Max Loss</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">
                              {trade.riskReward?.toFixed(1)}:1
                            </div>
                            <div className="text-xs text-gray-400">Risk:Reward</div>
                          </div>
                        </div>
                        
                        {trade.mlFactors && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="text-sm text-gray-300">
                              <strong>ML Insights:</strong> {trade.mlFactors.join(' • ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">No actionable trades available</div>
                    <div className="text-sm text-gray-500">Run the pipeline to generate trades</div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'config' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Pipeline Configuration</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Squeeze Threshold
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={pipelineConfig.squeezeThreshold}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, squeezeThreshold: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400">{pipelineConfig.squeezeThreshold}%</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Holy Grail Threshold
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="90"
                        value={pipelineConfig.holyGrailThreshold}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, holyGrailThreshold: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400">{pipelineConfig.holyGrailThreshold}%</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Investment
                      </label>
                      <select
                        value={pipelineConfig.maxInvestment}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, maxInvestment: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                      >
                        <option value={5000}>$5,000</option>
                        <option value={10000}>$10,000</option>
                        <option value={25000}>$25,000</option>
                        <option value={50000}>$50,000</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Risk Tolerance
                      </label>
                      <select
                        value={pipelineConfig.riskTolerance}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, riskTolerance: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                      >
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Trades
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={pipelineConfig.maxTrades}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, maxTrades: parseInt(e.target.value)})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pipelineConfig.enableMLLearning}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, enableMLLearning: e.target.checked})}
                        className="mr-3"
                      />
                      <label className="text-sm font-medium text-gray-300">
                        Enable ML Learning Engine
                      </label>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={runTradingPipeline}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Apply Configuration & Run Pipeline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}