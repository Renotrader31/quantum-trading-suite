import React, { useState, useEffect } from 'react';

const OptionsStrategies = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('straddle');
  const [symbol, setSymbol] = useState('SPY');
  const [currentPrice, setCurrentPrice] = useState(425.50);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsData, setOptionsData] = useState(null);

  // Predefined strategy templates
  const strategyTemplates = {
    straddle: {
      name: 'Long Straddle',
      description: 'Buy call and put at same strike, profit from large moves in either direction',
      legs: [
        { type: 'call', action: 'buy', strike: 0, quantity: 1 },
        { type: 'put', action: 'buy', strike: 0, quantity: 1 }
      ]
    },
    strangle: {
      name: 'Long Strangle',
      description: 'Buy call and put at different strikes, lower cost than straddle',
      legs: [
        { type: 'call', action: 'buy', strike: 5, quantity: 1 },
        { type: 'put', action: 'buy', strike: -5, quantity: 1 }
      ]
    },
    ironCondor: {
      name: 'Iron Condor',
      description: 'Sell strangle and buy wider strangle, profit from low volatility',
      legs: [
        { type: 'put', action: 'buy', strike: -15, quantity: 1 },
        { type: 'put', action: 'sell', strike: -5, quantity: 1 },
        { type: 'call', action: 'sell', strike: 5, quantity: 1 },
        { type: 'call', action: 'buy', strike: 15, quantity: 1 }
      ]
    },
    butterfly: {
      name: 'Long Call Butterfly',
      description: 'Buy 1 ITM call, sell 2 ATM calls, buy 1 OTM call',
      legs: [
        { type: 'call', action: 'buy', strike: -10, quantity: 1 },
        { type: 'call', action: 'sell', strike: 0, quantity: 2 },
        { type: 'call', action: 'buy', strike: 10, quantity: 1 }
      ]
    },
    coveredCall: {
      name: 'Covered Call',
      description: 'Own 100 shares and sell call option for income',
      legs: [
        { type: 'stock', action: 'buy', strike: 0, quantity: 100 },
        { type: 'call', action: 'sell', strike: 5, quantity: 1 }
      ]
    }
  };

  useEffect(() => {
    fetchCurrentPrice();
    generateStrategyAnalysis();
  }, [symbol, selectedStrategy]);

  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch(`/api/stocks?symbol=${symbol}`);
      const data = await response.json();
      setCurrentPrice(data.price || 425.50);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const generateStrategyAnalysis = () => {
    setLoading(true);
    
    const template = strategyTemplates[selectedStrategy];
    if (!template) return;

    // Calculate strategy metrics
    const analysis = calculateStrategyMetrics(template, currentPrice);
    setStrategies([analysis]);
    
    // Simulate options data
    setOptionsData({
      calls: generateOptionsChain('call', currentPrice),
      puts: generateOptionsChain('put', currentPrice)
    });
    
    setLoading(false);
  };

  const calculateStrategyMetrics = (template, price) => {
    const legs = template.legs.map(leg => ({
      ...leg,
      strike: leg.type === 'stock' ? price : price + leg.strike,
      premium: leg.type === 'stock' ? 0 : calculatePremium(leg.type, price + leg.strike, price, leg.action),
      delta: calculateDelta(leg.type, price + leg.strike, price),
      gamma: calculateGamma(leg.type, price + leg.strike, price),
      theta: calculateTheta(leg.type, price + leg.strike, price),
      vega: calculateVega(leg.type, price + leg.strike, price)
    }));

    const totalCost = legs.reduce((sum, leg) => {
      const cost = leg.type === 'stock' 
        ? leg.strike * leg.quantity 
        : leg.premium * leg.quantity * 100;
      return sum + (leg.action === 'buy' ? cost : -cost);
    }, 0);

    const maxProfit = calculateMaxProfit(legs, price);
    const maxLoss = calculateMaxLoss(legs, totalCost);
    const breakevens = calculateBreakevens(legs, price);
    const probabilityOfProfit = calculateProbabilityOfProfit(legs, price);

    // Portfolio Greeks
    const portfolioGreeks = legs.reduce((greeks, leg) => {
      const multiplier = leg.action === 'buy' ? 1 : -1;
      return {
        delta: greeks.delta + (leg.delta * leg.quantity * multiplier),
        gamma: greeks.gamma + (leg.gamma * leg.quantity * multiplier),
        theta: greeks.theta + (leg.theta * leg.quantity * multiplier),
        vega: greeks.vega + (leg.vega * leg.quantity * multiplier)
      };
    }, { delta: 0, gamma: 0, theta: 0, vega: 0 });

    return {
      ...template,
      legs,
      totalCost,
      maxProfit,
      maxLoss,
      breakevens,
      probabilityOfProfit,
      portfolioGreeks,
      returnOnRisk: maxProfit === Infinity ? 'Unlimited' : ((maxProfit / Math.abs(maxLoss)) * 100).toFixed(1) + '%'
    };
  };

  // Options pricing functions (simplified Black-Scholes approximations)
  const calculatePremium = (type, strike, spot, action) => {
    const timeValue = Math.random() * 5 + 1; // Simplified time value
    const intrinsic = type === 'call' 
      ? Math.max(0, spot - strike) 
      : Math.max(0, strike - spot);
    return intrinsic + timeValue;
  };

  const calculateDelta = (type, strike, spot) => {
    if (type === 'stock') return 1;
    const moneyness = spot / strike;
    if (type === 'call') {
      return moneyness > 1 ? 0.7 : moneyness < 0.95 ? 0.2 : 0.5;
    } else {
      return moneyness > 1 ? -0.2 : moneyness < 0.95 ? -0.7 : -0.5;
    }
  };

  const calculateGamma = (type, strike, spot) => {
    if (type === 'stock') return 0;
    const atm = Math.abs(spot - strike) < 5;
    return atm ? 0.05 : 0.02;
  };

  const calculateTheta = (type, strike, spot) => {
    if (type === 'stock') return 0;
    return -0.05; // Simplified theta decay
  };

  const calculateVega = (type, strike, spot) => {
    if (type === 'stock') return 0;
    return 0.15; // Simplified vega
  };

  const calculateMaxProfit = (legs, price) => {
    // Simplified calculation - would need more complex logic for all strategies
    const hasShortOptions = legs.some(leg => leg.action === 'sell' && leg.type !== 'stock');
    return hasShortOptions && selectedStrategy !== 'coveredCall' ? 1000 : Infinity;
  };

  const calculateMaxLoss = (legs, totalCost) => {
    return Math.abs(totalCost);
  };

  const calculateBreakevens = (legs, price) => {
    // Simplified - would need strategy-specific logic
    if (selectedStrategy === 'straddle' || selectedStrategy === 'strangle') {
      return [price - 10, price + 10];
    }
    return [price];
  };

  const calculateProbabilityOfProfit = (legs, price) => {
    // Simplified probability calculation
    return Math.random() * 40 + 30; // 30-70% range
  };

  const generateOptionsChain = (type, price) => {
    const chain = [];
    for (let i = -20; i <= 20; i += 5) {
      const strike = price + i;
      chain.push({
        strike,
        bid: calculatePremium(type, strike, price) - 0.5,
        ask: calculatePremium(type, strike, price) + 0.5,
        last: calculatePremium(type, strike, price),
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVol: 0.20 + Math.random() * 0.10,
        delta: calculateDelta(type, strike, price),
        gamma: calculateGamma(type, strike, price),
        theta: calculateTheta(type, strike, price),
        vega: calculateVega(type, strike, price)
      });
    }
    return chain;
  };

  const formatCurrency = (value) => {
    if (value === Infinity) return 'Unlimited';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Options Strategies</h1>
            <p className="text-gray-400 mt-2">Build, analyze, and optimize options trading strategies</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="SPY">SPY</option>
              <option value="QQQ">QQQ</option>
              <option value="AAPL">AAPL</option>
              <option value="TSLA">TSLA</option>
            </select>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Price</div>
              <div className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Select Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(strategyTemplates).map(([key, strategy]) => (
              <button
                key={key}
                onClick={() => setSelectedStrategy(key)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedStrategy === key
                    ? 'border-blue-400 bg-blue-900/20 text-blue-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold mb-2">{strategy.name}</div>
                <div className="text-xs text-gray-400">{strategy.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Analysis */}
        {strategies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Strategy Details */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Strategy Details</h3>
              
              {/* Legs */}
              <div className="space-y-3 mb-6">
                {strategies[0].legs.map((leg, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        leg.action === 'buy' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                      }`}>
                        {leg.action.toUpperCase()}
                      </span>
                      <span className="font-medium">
                        {leg.quantity} {leg.type.toUpperCase()}
                      </span>
                      {leg.type !== 'stock' && (
                        <span className="text-gray-300">${leg.strike.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-right">
                      {leg.type !== 'stock' && (
                        <>
                          <div className="text-white font-semibold">
                            ${leg.premium.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">Premium</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost and P&L */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Total Cost</div>
                  <div className={`text-lg font-bold ${
                    strategies[0].totalCost < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(Math.abs(strategies[0].totalCost))}
                    {strategies[0].totalCost < 0 && ' Credit'}
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">Return on Risk</div>
                  <div className="text-lg font-bold text-blue-400">
                    {strategies[0].returnOnRisk}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Analysis</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-900/20 p-4 rounded border border-green-800">
                  <div className="text-green-400 text-sm">Max Profit</div>
                  <div className="text-lg font-bold text-green-300">
                    {formatCurrency(strategies[0].maxProfit)}
                  </div>
                </div>
                <div className="bg-red-900/20 p-4 rounded border border-red-800">
                  <div className="text-red-400 text-sm">Max Loss</div>
                  <div className="text-lg font-bold text-red-300">
                    {formatCurrency(strategies[0].maxLoss)}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-2">Breakeven Points</div>
                <div className="flex space-x-2">
                  {strategies[0].breakevens.map((be, index) => (
                    <span key={index} className="bg-yellow-900/20 text-yellow-400 px-3 py-1 rounded border border-yellow-800">
                      ${be.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Probability of Profit</div>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${strategies[0].probabilityOfProfit}%` }}
                    ></div>
                  </div>
                  <span className="text-blue-400 font-bold">
                    {formatPercent(strategies[0].probabilityOfProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Greeks */}
        {strategies.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Greeks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded text-center">
                <div className="text-gray-400 text-sm">Delta</div>
                <div className="text-xl font-bold text-white">
                  {strategies[0].portfolioGreeks.delta.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Price sensitivity</div>
              </div>
              <div className="bg-gray-700 p-4 rounded text-center">
                <div className="text-gray-400 text-sm">Gamma</div>
                <div className="text-xl font-bold text-white">
                  {strategies[0].portfolioGreeks.gamma.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Delta sensitivity</div>
              </div>
              <div className="bg-gray-700 p-4 rounded text-center">
                <div className="text-gray-400 text-sm">Theta</div>
                <div className="text-xl font-bold text-red-400">
                  {strategies[0].portfolioGreeks.theta.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Time decay</div>
              </div>
              <div className="bg-gray-700 p-4 rounded text-center">
                <div className="text-gray-400 text-sm">Vega</div>
                <div className="text-xl font-bold text-white">
                  {strategies[0].portfolioGreeks.vega.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Volatility sensitivity</div>
              </div>
            </div>
          </div>
        )}

        {/* Options Chain Preview */}
        {optionsData && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Options Chain</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calls */}
              <div>
                <h4 className="text-green-400 font-semibold mb-3">Calls</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Strike</th>
                        <th className="text-left py-2">Last</th>
                        <th className="text-left py-2">Vol</th>
                        <th className="text-left py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsData.calls.slice(0, 6).map((option, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 font-semibold">${option.strike.toFixed(0)}</td>
                          <td className="py-2">${option.last.toFixed(2)}</td>
                          <td className="py-2">{option.volume}</td>
                          <td className="py-2">{option.delta.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Puts */}
              <div>
                <h4 className="text-red-400 font-semibold mb-3">Puts</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Strike</th>
                        <th className="text-left py-2">Last</th>
                        <th className="text-left py-2">Vol</th>
                        <th className="text-left py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsData.puts.slice(0, 6).map((option, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 font-semibold">${option.strike.toFixed(0)}</td>
                          <td className="py-2">${option.last.toFixed(2)}</td>
                          <td className="py-2">{option.volume}</td>
                          <td className="py-2">{option.delta.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Insights */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Strategy Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-semibold text-white mb-2">Market Outlook</h4>
              <p className="text-sm text-gray-400">
                {selectedStrategy === 'straddle' || selectedStrategy === 'strangle' 
                  ? 'Neutral - expecting high volatility'
                  : selectedStrategy === 'ironCondor'
                  ? 'Neutral - expecting low volatility'
                  : selectedStrategy === 'coveredCall'
                  ? 'Slightly bullish - generating income'
                  : 'Neutral to slightly bullish'
                }
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-white mb-2">Volatility Impact</h4>
              <p className="text-sm text-gray-400">
                {strategies[0]?.portfolioGreeks.vega > 0 
                  ? 'Benefits from increasing volatility'
                  : 'Benefits from decreasing volatility'
                }
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold text-white mb-2">Time Decay</h4>
              <p className="text-sm text-gray-400">
                {strategies[0]?.portfolioGreeks.theta < 0 
                  ? 'Loses value as time passes'
                  : 'Gains value as time passes'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsStrategies;
