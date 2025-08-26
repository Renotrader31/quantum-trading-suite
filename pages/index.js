import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import SqueezeScanner from '../components/SqueezeScanner';
import AIRecommendations from '../components/AIRecommendations';
import GammaAnalytics from '../components/GammaAnalytics';
import OptionsStrategies from '../components/OptionsStrategies';

export default function Home() {
  const [activeMode, setActiveMode] = useState('dashboard');
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      
      if (data.status === 'success') {
        const dataMap = {};
        data.data.forEach(stock => {
          dataMap[stock.symbol] = stock;
        });
        setMarketData(dataMap);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'scanner', name: 'Squeeze Scanner', icon: '🔍' },
    { id: 'ai', name: 'AI Recommendations', icon: '🤖' },
    { id: 'gamma', name: 'Gamma Analytics', icon: '⚡' },
    { id: 'options', name: 'Options Strategies', icon: '📈' }
  ];

  const renderActiveComponent = () => {
    const commonProps = { marketData, loading };
    
    switch (activeMode) {
      case 'dashboard':
        return ">;
      case 'scanner':
        return ">;
      case 'ai':
        return ">;
      case 'gamma':
        return ">;
      case 'options':
        return ">;
      default:
        return ">;
    }
  };

  return (
    900 text-white">
      {/* Header */}
      800 border-b border-gray-700">
        4 sm:px-6 lg:px-8">
          4">
            ">
              400 to-pink-400 bg-clip-text text-transparent">
                🚀 Quantum Trading Suite
              
            
            4">
              2">
                2 h-2 bg-green-500 rounded-full animate-pulse">
                300">Live Data
              
              400">
                {new Date().toLocaleTimeString()}
              
            
          
        
      

      {/* Navigation */}
      800 border-b border-gray-700">
        4 sm:px-6 lg:px-8">
          8">
            {modes.map((mode) => (
              " onclick="{()" ==""> setActiveMode(mode.id)}
                className={`py-3 px-4 text-sm font-medium transition-colors ${
                  activeMode === mode.id
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                2">{mode.icon}
                {mode.name}
              
            ))}
          
        
      

      {/* Main Content */}
      4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      
    
  );
}
