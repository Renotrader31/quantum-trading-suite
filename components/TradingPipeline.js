// components/TradingPipeline.js - Intelligent Trading Pipeline Dashboard
import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, TrendingUp, Activity, Target, Shield, 
  BarChart3, Layers, Cpu, Eye, Sparkles, Award,
  AlertCircle, CheckCircle, Clock, DollarSign, Flame,
  Settings, Play, Pause, RefreshCw, Bell, ArrowUpRight,
  ArrowRight, ChevronRight, Filter, Search, Download
} from 'lucide-react';
import { MultiStrategyEnsemble } from '../lib/multiStrategyEnsemble.js';
import RiskManagementDashboard from './RiskManagementDashboard.js';

export default function TradingPipeline({ marketData, loading, onRefresh, lastUpdate }) {
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResults, setPipelineResults] = useState(null);
  const [actionableTrades, setActionableTrades] = useState([]);
  const [pipelineConfig, setPipelineConfig] = useState({
    squeezeThreshold: 50, // Adaptive via refinement engine
    holyGrailThreshold: 40, // Adaptive via refinement engine  
    maxSymbols: 50, // Expanded universe for richer ML training
    maxTrades: 6, // More variety for ensemble optimization
    riskTolerance: 'moderate',
    maxInvestment: 10000,
    enableMLLearning: true,
    enableEnsemble: true, // Multi-strategy ensemble system
    enableRefinement: true, // NEW: Real-time strategy refinement
    universeSize: 'balanced' // NEW: Universe size control
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [processingTrade, setProcessingTrade] = useState(null);
  
  // 🎯 PRIORITY #2: Multi-Strategy Ensemble
  const [ensembleEngine] = useState(() => new MultiStrategyEnsemble());
  const [ensembleResults, setEnsembleResults] = useState(null);
  
  // 🎯 PRIORITY #3: Risk Management System
  const [portfolioPositions, setPortfolioPositions] = useState([]);
  const [riskCalculatedPosition, setRiskCalculatedPosition] = useState(null);

  useEffect(() => {
    // Auto-run pipeline when market data is available
    if (marketData && Object.keys(marketData).length > 0 && !pipelineResults) {
      setTimeout(() => runTradingPipeline(), 2000);
    }
  }, [marketData]);

  // Handle selecting and tracking a trade directly from TradingPipeline
  const handleSelectAndTrack = async (trade) => {
    console.log(`🎯 Selecting and tracking trade: ${trade.strategyName} for ${trade.symbol}`);
    
    setProcessingTrade(trade.symbol);
    
    try {
      // First, send to ML learning system
      const enhancedTradeData = {
        ...trade,
        selectionTime: new Date().toISOString(),
        userSelectionId: `${trade.symbol}_${Date.now()}`,
        source: 'trading_pipeline'
      };

      const mlResponse = await fetch('/api/ml-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_selection',
          trade: enhancedTradeData,
          meta: {
            version: '3.0_pipeline',
            source: 'trading_pipeline',
            timestamp: new Date().toISOString()
          }
        })
      });

      let mlResult = null;
      if (mlResponse.ok) {
        mlResult = await mlResponse.json();
        console.log('✅ Trade fed to ML system:', mlResult);
      }

      // Second, record in trade tracker
      // Get proper entry price from multiple sources
      let entryPrice = trade.currentPrice || trade.price || trade.stockPrice || 0;
      
      // If still no price, try to get from market data or make API call
      if (entryPrice === 0 && trade.symbol) {
        try {
          // Try to get current price from a quick API call
          const priceResponse = await fetch('/api/enhanced-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              symbols: [trade.symbol],
              integrateLiveData: true
            })
          });
          
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            if (priceData.success && priceData.results && priceData.results[0]) {
              entryPrice = priceData.results[0].price || 0;
            }
          }
        } catch (priceError) {
          console.warn('Could not fetch current price for', trade.symbol, priceError);
        }
      }
      
      const tradeEntryData = {
        symbol: trade.symbol,
        strategyName: trade.strategyName || trade.strategy || 'TradingPipeline Strategy',
        entryPrice: entryPrice,
        strikes: trade.strikes || [],
        expiration: trade.expirationDate || new Date(Date.now() + (35 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        dte: trade.dte || 35,
        positionSize: trade.positionSize || 1,
        maxLoss: trade.maxLoss || 0,
        maxGain: trade.expectedReturn || 0,
        
        // ML Context
        squeezeContext: { holyGrail: trade.holyGrail, probability: trade.probability },
        marketConditions: { sector: trade.sector },
        neuralNetworkPrediction: mlResult?.learningResult?.neuralNetworkResults?.confidence || 0,
        aiScore: trade.aiScore || trade.mlScore || 0,
        probability: trade.probability || 0
      };

      const tradeEntryResponse = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordEntry',
          tradeData: tradeEntryData
        })
      });

      if (tradeEntryResponse.ok) {
        const tradeResult = await tradeEntryResponse.json();
        console.log('📋 Trade recorded in portfolio tracker:', tradeResult.tradeId);
        
        // Show success notification
        alert(`✅ ${trade.strategyName} for ${trade.symbol} added to portfolio!\n\nTrade ID: ${tradeResult.tradeId}\nActive Trades: ${tradeResult.activeTrades}\n\nCheck Portfolio Tracker to monitor this trade.`);
      }

      setProcessingTrade(null);
      
    } catch (error) {
      console.error('❌ Error selecting and tracking trade:', error);
      alert(`❌ Error: ${error.message}`);
      setProcessingTrade(null);
    }
  };

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
        
        // 🎯 PRIORITY #2: Apply Multi-Strategy Ensemble if enabled
        if (pipelineConfig.enableEnsemble && data.actionableTrades?.length > 0) {
          console.log('🎯 Applying Multi-Strategy Ensemble optimization...');
          console.log(`📊 Received ${data.actionableTrades.length} trades from pipeline`);
          
          try {
            // Get current portfolio context for risk management
            let portfolioContext = null;
            try {
              const portfolioResponse = await fetch('/api/trade-entry?action=getActiveTrades');
              if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();
                portfolioContext = {
                  activeTrades: portfolioData.activeTrades || [],
                  totalAllocated: portfolioData.totalAllocated || 0
                };
              }
            } catch (portErr) {
              console.warn('Could not fetch portfolio context:', portErr);
            }
            
            // Generate ensemble recommendations
            const ensembleOutput = await ensembleEngine.generateEnsembleRecommendations(
              marketData || {},
              data.actionableTrades,
              portfolioContext
            );
            
            setEnsembleResults(ensembleOutput);
            setActionableTrades(ensembleOutput.recommendations);
            
            console.log(`✅ Ensemble optimization complete: ${ensembleOutput.recommendations.length} optimized trades`);
            console.log(`📊 Market Regime: ${ensembleOutput.marketRegime.primary} (${ensembleOutput.marketRegime.confidence}% confidence)`);
          } catch (ensembleError) {
            console.error('❌ Ensemble processing failed, using original trades:', ensembleError);
            // Fallback to original trades if ensemble fails
            setActionableTrades(data.actionableTrades || []);
          }
        } else {
          console.log(`📊 Setting ${data.actionableTrades?.length || 0} actionable trades (ensemble disabled)`);
          setActionableTrades(data.actionableTrades || []);
        }
        
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
          <div className="border-b border-gray-800 px-4 py-4 bg-gray-800">
            {/* First Row - Main Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'trades', name: 'Trades', icon: Target },
                { id: 'ensemble', name: 'Ensemble', icon: Layers },
                { id: 'risk', name: 'Risk Mgmt', icon: Shield }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center justify-center gap-1 px-2 py-3 rounded-lg text-xs font-bold transition-colors ${
                    selectedTab === tab.id 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600 bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
            
            {/* Second Row - Analysis Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'squeeze', name: 'Squeeze Results', icon: Activity },
                { id: 'ml', name: 'ML Insights', icon: Brain },
                { id: 'config', name: 'Configuration', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center justify-center gap-1 px-2 py-3 rounded-lg text-xs font-bold transition-colors ${
                    selectedTab === tab.id 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600 bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Debug Tab Indicator */}
            <div className="mb-4 text-xs text-gray-500 bg-gray-800 p-2 rounded">
              🔄 Active Tab: <span className="text-purple-400 font-bold">{selectedTab}</span> | 
              📋 Available: overview, trades, ensemble, risk, squeeze, ml, config | 
              ⏰ Updated: {new Date().toLocaleTimeString()}
            </div>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Actionable Trades</h3>
                    <p className="text-gray-400">{actionableTrades.length} trades available • Last updated: {lastUpdate || 'Never'}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      onClick={() => window.open('/?tab=tradetracker', '_blank')}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 text-white border-2 border-purple-400"
                    >
                      📊 Portfolio Tracker
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                    <div className="text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded-lg">
                      Pipeline Status: {pipelineRunning ? 'Running...' : 'Ready'}
                    </div>
                  </div>
                </div>
                
                {actionableTrades.length > 0 ? (
                  <div className="space-y-4">
                    {actionableTrades.map((trade, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        {/* Header Row with Symbol and Action Button */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-2xl text-blue-400">{trade.symbol}</div>
                            <div className="text-lg text-gray-300">{trade.strategyName || trade.strategy}</div>
                          </div>
                          <button
                            onClick={() => handleSelectAndTrack(trade)}
                            disabled={processingTrade === trade.symbol}
                            className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                              processingTrade === trade.symbol
                                ? 'bg-yellow-600 text-white cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {processingTrade === trade.symbol ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4" />
                                Select Trade
                              </>
                            )}
                          </button>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                          <div className="text-center bg-gray-700 rounded-lg p-3">
                            <div className={`text-xl font-bold ${getProbabilityColor(trade.probability)}`}>
                              {trade.probability}%
                            </div>
                            <div className="text-xs text-gray-400">Probability</div>
                          </div>
                          
                          <div className="text-center bg-gray-700 rounded-lg p-3">
                            <div className={`text-xl font-bold px-2 py-1 rounded text-white ${getMLScoreColor(trade.mlScore || trade.aiScore).split(' ')[0]}`}>
                              {trade.mlScore || trade.aiScore}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {trade.mlScore ? 'ML Score' : 'AI Score'}
                            </div>
                          </div>
                          
                          <div className="text-center bg-gray-700 rounded-lg p-3">
                            <div className="text-xl font-bold text-green-400">
                              {formatCurrency(trade.expectedReturn)}
                            </div>
                            <div className="text-xs text-gray-400">Expected Return</div>
                          </div>
                          
                          <div className="text-center bg-gray-700 rounded-lg p-3">
                            <div className="text-xl font-bold text-red-400">
                              {formatCurrency(trade.maxLoss)}
                            </div>
                            <div className="text-xs text-gray-400">Max Loss</div>
                          </div>
                          
                          <div className="text-center bg-gray-700 rounded-lg p-3">
                           <div className="text-xl font-bold text-yellow-400">
  {typeof trade.riskReward === 'number' ? trade.riskReward.toFixed(1) : '0.0'}:1
</div>
                            <div className="text-xs text-gray-400">Risk:Reward</div>
                          </div>

                          <div className="text-center bg-gray-700 rounded-lg p-3">
                            <div className="text-xl font-bold text-purple-400">
                              ${trade.positionSize || 1000}
                            </div>
                            <div className="text-xs text-gray-400">Position Size</div>
                          </div>
                        </div>
                        
                        {/* ML Factors */}
                        {trade.mlFactors && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="text-sm text-gray-300">
                              <strong>ML Insights:</strong> {trade.mlFactors.join(' • ')}
                            </div>
                          </div>
                        )}

                        {/* 🎯 ENSEMBLE METADATA */}
                        {trade.ensembleGroup && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded p-3">
                              <div className="font-bold text-blue-300 mb-2 text-sm flex items-center gap-1">
                                🎯 Ensemble Strategy
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* Strategy Group */}
                                <div>
                                  <div className="text-blue-200 font-medium mb-1">📊 Group:</div>
                                  <div className="text-gray-300">
                                    {trade.ensembleGroup}
                                  </div>
                                </div>

                                {/* Ensemble Weight */}
                                <div>
                                  <div className="text-blue-200 font-medium mb-1">⚖️ Weight:</div>
                                  <div className="text-purple-400 font-semibold">
                                    {(trade.ensembleWeight * 100).toFixed(1)}%
                                  </div>
                                </div>

                                {/* Group Ranking */}
                                <div>
                                  <div className="text-blue-200 font-medium mb-1">🏆 Rank:</div>
                                  <div className="text-yellow-400">
                                    #{trade.groupRank} of {trade.totalInGroup}
                                  </div>
                                </div>
                              </div>

                              {/* Ensemble Score */}
                              {trade.ensembleScore && (
                                <div className="mt-2 text-xs text-green-300 bg-green-900/20 rounded px-2 py-1">
                                  🎯 Ensemble Score: {trade.ensembleScore}/100
                                </div>
                              )}

                              {/* Portfolio Allocation */}
                              {trade.portfolioAllocation && (
                                <div className="mt-2 text-xs text-blue-300 bg-blue-900/20 rounded px-2 py-1">
                                  💼 Portfolio Allocation: {trade.portfolioAllocation}%
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 🎯 SURGICAL EXECUTION PLAN */}
                        {trade.executionPlan && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded p-3">
                              <div className="font-bold text-purple-300 mb-2 text-sm flex items-center gap-1">
                                🎯 Execution Plan
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* Entry Strategy */}
                                <div>
                                  <div className="text-purple-200 font-medium mb-1">📈 Entry:</div>
                                  <div className="text-gray-300">
                                    {trade.executionPlan.entry?.orderType} at {trade.executionPlan.entry?.timing}
                                  </div>
                                </div>

                                {/* Profit Targets */}
                                <div>
                                  <div className="text-purple-200 font-medium mb-1">🎯 Targets:</div>
                                  <div className="text-green-400">
                                    {trade.executionPlan.profitTargets && trade.executionPlan.profitTargets[0] ? 
                                      `${trade.executionPlan.profitTargets[0].percent}% profit` : 
                                      'Dynamic'
                                    }
                                  </div>
                                </div>

                                {/* Risk Management */}
                                <div>
                                  <div className="text-purple-200 font-medium mb-1">🛡️ Risk:</div>
                                  <div className="text-red-300">
                                    Max {trade.executionPlan.riskManagement?.maxDaysToHold || 21} days
                                  </div>
                                </div>
                              </div>

                              {/* Quick Notes */}
                              {trade.executionPlan.entry?.notes && trade.executionPlan.entry.notes[0] && (
                                <div className="mt-2 text-xs text-yellow-300 bg-yellow-900/20 rounded px-2 py-1">
                                  💡 {trade.executionPlan.entry.notes[0]}
                                </div>
                              )}
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

            {selectedTab === 'ensemble' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-purple-500" />
                  Multi-Strategy Ensemble System
                </h3>

                {/* Always show ensemble info */}
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">🎯 Ensemble Status</h4>
                  <div className="text-sm text-gray-300">
                    <p><strong>Ensemble Engine:</strong> {pipelineConfig.enableEnsemble ? '✅ Enabled' : '❌ Disabled'}</p>
                    <p><strong>Results Available:</strong> {ensembleResults ? '✅ Yes' : '❌ No (run pipeline with ensemble enabled)'}</p>
                    <p><strong>Strategy Count:</strong> 6 core strategies available</p>
                  </div>
                </div>
                
                {ensembleResults ? (
                  <div className="space-y-6">
                    {/* Market Regime Assessment */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Market Regime Assessment
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {ensembleResults.marketRegime.primary.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-400">Primary Regime</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {ensembleResults.marketRegime.confidence}%
                          </div>
                          <div className="text-sm text-gray-400">Confidence</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {ensembleResults.portfolioMetrics.diversificationScore}%
                          </div>
                          <div className="text-sm text-gray-400">Diversification</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {Object.keys(ensembleResults.ensembleWeights).length}
                          </div>
                          <div className="text-sm text-gray-400">Active Strategies</div>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Weights */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-400" />
                        Dynamic Strategy Weights
                      </h4>
                      
                      <div className="space-y-3">
                        {Object.entries(ensembleResults.ensembleWeights).map(([strategyName, weights]) => (
                          <div key={strategyName} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                            <div>
                              <div className="font-medium text-white">{strategyName}</div>
                              <div className="text-xs text-gray-400">
                                Win Rate: {weights.performance.wins + weights.performance.losses > 0 ? 
                                  `${((weights.performance.wins / (weights.performance.wins + weights.performance.losses)) * 100).toFixed(1)}%` : 'No data'}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-300">
                                  Base: {weights.base}%
                                </div>
                                <div className={`text-lg font-bold ${
                                  parseFloat(weights.current) > parseFloat(weights.base) ? 'text-green-400' :
                                  parseFloat(weights.current) < parseFloat(weights.base) ? 'text-red-400' :
                                  'text-gray-300'
                                }`}>
                                  {weights.current}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rebalance Signals */}
                    {ensembleResults.rebalanceSignals && ensembleResults.rebalanceSignals.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                          Rebalance Signals
                        </h4>
                        
                        <div className="space-y-2">
                          {ensembleResults.rebalanceSignals.map((signal, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-white">{signal.strategy}</span>
                              <span className={`font-medium ${
                                signal.action === 'INCREASE' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {signal.action} ({signal.drift}% drift)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Metrics */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Portfolio Optimization Metrics
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded p-3 text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {ensembleResults.portfolioMetrics.totalAllocated}
                          </div>
                          <div className="text-sm text-gray-400">Total Recommendations</div>
                        </div>
                        
                        <div className="bg-gray-700 rounded p-3 text-center">
                          <div className="text-2xl font-bold text-red-400">
                            {ensembleResults.portfolioMetrics.riskConcentration}%
                          </div>
                          <div className="text-sm text-gray-400">Risk Concentration</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                      <Layers className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">Run Pipeline to Generate Ensemble Data</h4>
                      <p className="text-gray-400 mb-4">Enable ensemble mode in configuration and run the pipeline to see:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="text-blue-400 font-bold">Market Regime</div>
                          <div className="text-gray-300">Detection & Analysis</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="text-green-400 font-bold">Strategy Weights</div>
                          <div className="text-gray-300">Dynamic Optimization</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="text-purple-400 font-bold">Portfolio Metrics</div>
                          <div className="text-gray-300">Risk & Diversification</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'risk' && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">🛡️ Risk Management Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">✅ Active</div>
                      <div className="text-gray-300">Risk System</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">${pipelineConfig.maxInvestment.toLocaleString()}</div>
                      <div className="text-gray-300">Portfolio Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">{portfolioPositions.length}</div>
                      <div className="text-gray-300">Active Positions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">Kelly</div>
                      <div className="text-gray-300">Position Sizing</div>
                    </div>
                  </div>
                </div>
                
                <RiskManagementDashboard
                  positions={portfolioPositions}
                  portfolioValue={pipelineConfig.maxInvestment}
                  onPositionSizeCalculated={(size) => {
                    setRiskCalculatedPosition(size);
                    alert(`📊 Kelly Criterion Position Size: ${size.kellyPercentage.toFixed(2)}%\nOptimal Size: $${size.optimalSize.toLocaleString()}\nRisk Level: ${size.riskLevel}`);
                  }}
                />
                
                {/* Active Positions Integration */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      📊 Portfolio Integration
                    </h4>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/trade-entry?action=getActiveTrades');
                          if (response.ok) {
                            const data = await response.json();
                            setPortfolioPositions(data.activeTrades || []);
                          }
                        } catch (error) {
                          console.error('Failed to load portfolio positions:', error);
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                    >
                      Load Active Positions
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <div className="flex items-center justify-between mb-4">
  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
    📊 Portfolio Integration
  </h4>
  <button
    onClick={async () => {
      try {
        console.log('🔄 Loading active positions...');
        const response = await fetch('/api/trade-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getActiveTrades' })
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Received data:', data);
          
          if (data.success && data.activeTrades) {
            setPortfolioPositions(data.activeTrades);
            console.log(`✅ Loaded ${data.activeTrades.length} active positions`);
            alert(`✅ Loaded ${data.activeTrades.length} active positions from Portfolio Tracker`);
          } else {
            console.warn('⚠️ No active trades found in response');
            alert('ℹ️ No active positions found in Portfolio Tracker');
            setPortfolioPositions([]);
          }
        } else {
          const errorData = await response.text();
          console.error('❌ API Error:', response.status, errorData);
          alert(`❌ Error loading positions: ${response.status} - ${errorData}`);
        }
      } catch (error) {
        console.error('❌ Failed to load portfolio positions:', error);
        alert(`❌ Network Error: ${error.message}`);
      }
    }}
    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
  >
    Load Active Positions
  </button>
</div>

<div className="text-sm text-gray-400">
  {portfolioPositions.length > 0 ? (
    <div>
      <p className="mb-2">✅ {portfolioPositions.length} active positions loaded for risk analysis</p>
      <div className="text-xs text-gray-500 space-y-1">
        {portfolioPositions.slice(0, 3).map((pos, idx) => (
          <div key={idx}>• {pos.symbol} - {pos.strategyName}</div>
        ))}
        {portfolioPositions.length > 3 && <div>+ {portfolioPositions.length - 3} more...</div>}
      </div>
       </div>
  } : (
  <div>
    <p className="mb-3">No active positions loaded. Click "Load Active Positions" to sync with your Portfolio Tracker.</p>
    <button
      onClick={async () => {
        try {
          console.log('🔄 Loading active positions...');
          const response = await fetch('/api/trade-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getActiveTrades' })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.activeTrades) {
              setPortfolioPositions(data.activeTrades);
              alert(`✅ Loaded ${data.activeTrades.length} active positions from Portfolio Tracker`);
            } else {
              alert('ℹ️ No active positions found in Portfolio Tracker');
              setPortfolioPositions([]);
            }
          } else {
            alert(`❌ Error loading positions: ${response.status}`);
          }
        } catch (error) {
          alert(`❌ Network Error: ${error.message}`);
        }
      }}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
    >
      Load Active Positions
    </button>
  </div>
)}

</div>
    </div>
                {riskCalculatedPosition && (
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-green-300 mb-2 flex items-center gap-2">
                      📊 Last Kelly Calculation
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-green-200 font-medium">Kelly %:</div>
                        <div className="text-white">{riskCalculatedPosition.kellyPercentage.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-green-200 font-medium">Optimal Size:</div>
                        <div className="text-white">${riskCalculatedPosition.optimalSize.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-green-200 font-medium">Risk Level:</div>
                        <div className="text-white">{riskCalculatedPosition.riskLevel}</div>
                      </div>
                      <div>
                        <div className="text-green-200 font-medium">Max Loss:</div>
                        <div className="text-white">${riskCalculatedPosition.maxLoss.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'squeeze' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Squeeze Scanner Results</h3>
                  <div className="text-sm text-gray-400">
                    {pipelineResults?.squeezeData?.length || 0} candidates scanned
                  </div>
                </div>

                {pipelineResults?.squeezeData && pipelineResults.squeezeData.length > 0 ? (
                  <div className="space-y-4">
                    {pipelineResults.squeezeData.map((candidate, index) => (
                      <div key={candidate.symbol} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="grid grid-cols-8 gap-4 items-center">
                          <div>
                            <div className="font-bold text-lg text-blue-400">{candidate.symbol}</div>
                            <div className="text-sm text-gray-400">${candidate.price}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`text-lg font-bold ${candidate.holyGrail >= 70 ? 'text-green-400' : candidate.holyGrail >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {candidate.holyGrail}
                            </div>
                            <div className="text-xs text-gray-400">Holy Grail</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`text-lg font-bold ${candidate.squeeze >= 80 ? 'text-green-400' : candidate.squeeze >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {candidate.squeeze}
                            </div>
                            <div className="text-xs text-gray-400">Squeeze</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">
                              {candidate.gamma?.toFixed(3)}
                            </div>
                            <div className="text-xs text-gray-400">Gamma</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">
                              {candidate.flow}
                            </div>
                            <div className="text-xs text-gray-400">Flow</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {formatCurrency(candidate.volume)}
                            </div>
                            <div className="text-xs text-gray-400">Volume</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">
                              {candidate.rsi}
                            </div>
                            <div className="text-xs text-gray-400">RSI</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              candidate.enhanced?.riskScore <= 40 ? 'bg-green-600' :
                              candidate.enhanced?.riskScore <= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}>
                              {candidate.enhanced?.riskScore || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Risk Score</div>
                          </div>
                        </div>
                        
                        {/* Additional Details */}
                        {candidate.enhanced && (
                          <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Sector:</span>
                              <span className="ml-1 text-white">{candidate.enhanced.sectorCategory}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Liquidity:</span>
                              <span className="ml-1 text-white">{candidate.enhanced.liquidityScore}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">IV Rank:</span>
                              <span className="ml-1 text-white">{candidate.optionsMetrics?.ivRank}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Put/Call:</span>
                              <span className="ml-1 text-white">{candidate.optionsMetrics?.putCallRatio?.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">No squeeze candidates available</div>
                    <div className="text-sm text-gray-500">Run the pipeline to scan for squeeze opportunities</div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'ml' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  ML Learning Engine Insights
                </h3>

                {pipelineResults?.mlData ? (
                  <div className="space-y-6">
                    {/* Model Performance */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-green-400" />
                        Model Performance
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {(pipelineResults.mlData.modelAccuracy * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">Model Accuracy</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {pipelineResults.results?.mlEngine?.tradesProcessed || 0}
                          </div>
                          <div className="text-sm text-gray-400">Trades Processed</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {pipelineResults.results?.mlEngine?.patternsDetected || 0}
                          </div>
                          <div className="text-sm text-gray-400">Patterns Detected</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {pipelineResults.results?.mlEngine?.recommendations || 0}
                          </div>
                          <div className="text-sm text-gray-400">Enhanced Trades</div>
                        </div>
                      </div>
                    </div>

                    {/* Pattern Recognition */}
                    {pipelineResults.mlData.patternsRecognized && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-400" />
                          Pattern Recognition
                        </h4>
                        
                        <div className="space-y-2">
                          {Object.entries(pipelineResults.mlData.patternsRecognized).map(([pattern, confidence]) => (
                            <div key={pattern} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                              <span className="font-medium text-white">{pattern.replace(/_/g, ' ').toUpperCase()}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{(confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Progress */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Learning Progress
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Training Data Size</span>
                          <span className="font-bold text-white">{pipelineResults.mlData.trainingDataSize || 'N/A'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Neural Network Confidence</span>
                          <span className="font-bold text-green-400">{pipelineResults.mlData.neuralNetworkConfidence || 'Learning...'}%</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Strategy Preferences Learned</span>
                          <span className="font-bold text-purple-400">{pipelineResults.mlData.strategiesLearned || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">No ML insights available</div>
                    <div className="text-sm text-gray-500">Run the pipeline with ML learning enabled to see insights</div>
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
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pipelineConfig.enableEnsemble}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, enableEnsemble: e.target.checked})}
                        className="mr-3"
                      />
                      <label className="text-sm font-medium text-gray-300">
                        Enable Multi-Strategy Ensemble
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pipelineConfig.enableRefinement}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, enableRefinement: e.target.checked})}
                        className="mr-3"
                      />
                      <label className="text-sm font-medium text-gray-300">
                        Enable Real-time Strategy Refinement 🧠
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stock Universe Size (📊 Priority #4 Feature)
                      </label>
                      <select
                        value={pipelineConfig.universeSize}
                        onChange={(e) => setPipelineConfig({...pipelineConfig, universeSize: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                      >
                        <option value="conservative">Conservative (30 stable stocks)</option>
                        <option value="balanced">Balanced (60 diversified stocks)</option>
                        <option value="aggressive">Aggressive (80 high-vol stocks)</option>
                        <option value="mlTraining">ML Training (100+ diverse stocks)</option>
                      </select>
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
