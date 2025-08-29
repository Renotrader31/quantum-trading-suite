import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import SqueezeScanner from '../components/SqueezeScanner';
import AIRecommendations from '../components/AIRecommendations';
import GammaAnalytics from '../components/GammaAnalytics';
import OptionsStrategies from '../components/OptionsStrategies';
import QuantumTradeAI from '../components/QuantumTradeAI';
import TradingPipeline from '../components/TradingPipeline';
import IntelligentTradingScanner from '../components/IntelligentTradingScanner';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  const [activeMode, setActiveMode] = useState('dashboard');
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [navigationLoading, setNavigationLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Check for URL parameters to set initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'tradetracker') {
      setActiveMode('dashboard'); // Dashboard contains the TradeTracker
      // Use setTimeout to ensure the component has mounted before triggering modal
      setTimeout(() => {
        const event = new CustomEvent('openTradeTracker');
        window.dispatchEvent(event);
      }, 1000);
    }
    
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000); // Update time every second
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      // Use enhanced-scan API instead of stocks API to avoid polygon API key requirement
      const response = await fetch('/api/enhanced-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'],
          integrateLiveData: true
        })
      });
      const data = await response.json();
      
      if (data.success && data.results) {
        const dataMap = {};
        
        // Add enhanced scan results to the data map
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach(stock => {
            dataMap[stock.symbol] = {
              ...stock,
              name: stock.symbol, // AI component expects name field
            };
          });
        }
        
        // Enhanced scan already includes index data (SPY, QQQ, IWM) in results
        
        setMarketData(dataMap);
        setLastUpdate(new Date().toLocaleTimeString());
        console.log(`✅ Updated market data for ${Object.keys(dataMap).length} symbols`);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'intelligent', name: 'Intelligent Scanner', icon: '🧠' },
    { id: 'scanner', name: 'Squeeze Scanner', icon: '🔍' },
    { id: 'pipeline', name: 'Trading Pipeline', icon: '⚙️' },
    { id: 'ai', name: 'AI Recommendations', icon: '🤖' },
    { id: 'quantum', name: 'Quantum AI v3.0', icon: '🔮' },
    { id: 'gamma', name: 'Gamma Analytics', icon: '⚡' },
    { id: 'options', name: 'Options Strategies', icon: '📈' }
  ];

  const renderActiveComponent = () => {
    const commonProps = { 
      marketData, 
      loading,
      onRefresh: fetchMarketData,
      lastUpdate 
    };
    
    switch (activeMode) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'intelligent':
        return <IntelligentTradingScanner {...commonProps} />;
      case 'scanner':
        return <SqueezeScanner {...commonProps} />;
      case 'pipeline':
        return (
          <ErrorBoundary>
            <TradingPipeline {...commonProps} />
          </ErrorBoundary>
        );
      case 'ai':
        return <AIRecommendations {...commonProps} />;
      case 'quantum':
        return <QuantumTradeAI {...commonProps} />;
      case 'gamma':
        return <GammaAnalytics {...commonProps} />;
      case 'options':
        return <OptionsStrategies {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  const getDataStats = () => {
    const symbolCount = Object.keys(marketData).length;
    const gainers = Object.values(marketData).filter(stock => stock.changePercent > 0).length;
    const losers = Object.values(marketData).filter(stock => stock.changePercent < 0).length;
    
    return { symbolCount, gainers, losers };
  };

  const { symbolCount, gainers, losers } = getDataStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                🚀 Quantum Trading Suite
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Advanced AI-powered trading platform with real-time analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">
                  {loading ? 'Updating...' : 'Live Data'}
                </span>
              </div>
              <div className="text-gray-400 text-sm">
                {isClient ? (lastUpdate || currentTime) : 'Loading...'}
              </div>
              <div className="text-xs text-gray-500">
                {symbolCount} symbols • {gainers}↑ • {losers}↓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  if (!navigationLoading && activeMode !== mode.id) {
                    setNavigationLoading(true);
                    // Small delay to prevent rapid navigation
                    setTimeout(() => {
                      setActiveMode(mode.id);
                      setNavigationLoading(false);
                    }, 50);
                  }
                }}
                disabled={navigationLoading}
                className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                  activeMode === mode.id
                    ? 'text-purple-400 border-purple-400'
                    : navigationLoading
                    ? 'text-gray-500 border-transparent cursor-not-allowed'
                    : 'text-gray-300 hover:text-white border-transparent hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{mode.icon}</span>
                {mode.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </div>

      {/* Footer Stats */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <div>
            Mode: <span className="text-purple-400">{modes.find(m => m.id === activeMode)?.name}</span>
          </div>
          <div>
            Market Data: {symbolCount} symbols loaded
          </div>
          <div>
            Last Update: {isClient ? (lastUpdate || 'Never') : 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  );
}
