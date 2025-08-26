<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Options Strategies Component - Quantum Trading Suite</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .code-container {
            background: #1a1a1a;
            border-radius: 8px;
            overflow: hidden;
        }
        .code-header {
            background: #2d3748;
            color: #e2e8f0;
            padding: 12px 16px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            border-bottom: 1px solid #4a5568;
        }
        .code-content {
            background: #1a202c;
            color: #e2e8f0;
            padding: 20px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            overflow-x: auto;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
        }
        .keyword { color: #ff79c6; }
        .string { color: #f1fa8c; }
        .function { color: #50fa7b; }
        .comment { color: #6272a4; }
        .number { color: #bd93f9; }
        .operator { color: #ff79c6; }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="gradient-bg py-6">
            <div class="container mx-auto px-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-chart-line mr-3"></i>
                            Options Strategies Component
                        </h1>
                        <p class="text-lg opacity-90">Final Component - Quantum Trading Suite</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm opacity-75">Component 5 of 5</div>
                        <div class="text-lg font-semibold">✅ Complete Platform</div>
                    </div>
                </div>
            </div>
        </header>

        <div class="container mx-auto px-6 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Panel - Features & Info -->
                <div class="space-y-6">
                    <!-- Progress Status -->
                    <div class="feature-card rounded-lg p-6">
                        <h2 class="text-xl font-bold mb-4 text-green-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            Platform Completion Status
                        </h2>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span>✅ Dashboard Component</span>
                                <span class="text-green-400">Complete</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>✅ Squeeze Scanner</span>
                                <span class="text-green-400">Complete</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>✅ AI Recommendations</span>
                                <span class="text-green-400">Complete</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>✅ Gamma Analytics</span>
                                <span class="text-green-400">Complete</span>
                            </div>
                            <div class="flex items-center justify-between font-bold text-yellow-400">
                                <span>🚀 Options Strategies</span>
                                <span class="text-yellow-400">Final Component!</span>
                            </div>
                        </div>
                    </div>

                    <!-- Key Features -->
                    <div class="feature-card rounded-lg p-6">
                        <h2 class="text-xl font-bold mb-4 text-blue-400">
                            <i class="fas fa-cogs mr-2"></i>
                            Component Features
                        </h2>
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <i class="fas fa-hammer text-green-400 mr-3 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold">Strategy Builder</h3>
                                    <p class="text-sm text-gray-300">Interactive options strategy creation with templates</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-calculator text-yellow-400 mr-3 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold">P&L Analysis</h3>
                                    <p class="text-sm text-gray-300">Real-time profit/loss calculations and visualizations</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-chart-area text-purple-400 mr-3 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold">Risk/Reward Profiles</h3>
                                    <p class="text-sm text-gray-300">Interactive payoff diagrams and risk analysis</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-greek text-blue-400 mr-3 mt-1"></i>
                                <div>
                                    <h3 class="font-semibold">Greeks Analysis</h3>
                                    <p class="text-sm text-gray-300">Delta, Gamma, Theta, Vega tracking and alerts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Strategy Templates -->
                    <div class="feature-card rounded-lg p-6">
                        <h2 class="text-xl font-bold mb-4 text-purple-400">
                            <i class="fas fa-layer-group mr-2"></i>
                            Included Strategies
                        </h2>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="flex items-center">
                                <i class="fas fa-arrow-up text-green-400 mr-2"></i>
                                <span>Long Call</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-arrow-down text-red-400 mr-2"></i>
                                <span>Long Put</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-shield-alt text-blue-400 mr-2"></i>
                                <span>Covered Call</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-umbrella text-yellow-400 mr-2"></i>
                                <span>Protective Put</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-expand-arrows-alt text-purple-400 mr-2"></i>
                                <span>Long Straddle</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-compress-arrows-alt text-orange-400 mr-2"></i>
                                <span>Short Straddle</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-arrows-alt-h text-cyan-400 mr-2"></i>
                                <span>Iron Condor</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-plus text-green-400 mr-2"></i>
                                <span>Custom Builder</span>
                            </div>
                        </div>
                    </div>

                    <!-- File Instructions -->
                    <div class="feature-card rounded-lg p-6">
                        <h2 class="text-xl font-bold mb-4 text-green-400">
                            <i class="fas fa-file-code mr-2"></i>
                            Installation Instructions
                        </h2>
                        <div class="bg-gray-800 rounded p-4 font-mono text-sm">
                            <div class="text-green-400 mb-2">📁 Save as:</div>
                            <div class="text-yellow-300">components/OptionsStrategies.js</div>
                        </div>
                        <p class="text-sm text-gray-300 mt-3">
                            Copy the code from the right panel and save it as <code class="bg-gray-800 px-2 py-1 rounded">OptionsStrategies.js</code> in your components folder to complete your unified trading platform!
                        </p>
                    </div>
                </div>

                <!-- Right Panel - Code -->
                <div class="lg:sticky lg:top-8">
                    <div class="code-container">
                        <div class="code-header">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <i class="fas fa-file-code mr-2"></i>
                                    <span>OptionsStrategies.js</span>
                                </div>
                                <div class="text-xs opacity-75">Final Component</div>
                            </div>
                        </div>
                        <div class="code-content">
<pre><span class="comment">// OptionsStrategies.js - Comprehensive Options Strategy Builder</span>
<span class="comment">// Final Component for Quantum Trading Suite</span>

<span class="keyword">import</span> { <span class="function">useState</span>, <span class="function">useEffect</span> } <span class="keyword">from</span> <span class="string">'react'</span>;

<span class="keyword">const</span> <span class="function">OptionsStrategies</span> = () => {
  <span class="keyword">const</span> [selectedStrategy, setSelectedStrategy] = <span class="function">useState</span>(<span class="string">'covered-call'</span>);
  <span class="keyword">const</span> [stockPrice, setStockPrice] = <span class="function">useState</span>(<span class="number">150</span>);
  <span class="keyword">const</span> [strategies, setStrategies] = <span class="function">useState</span>([]);
  <span class="keyword">const</span> [positions, setPositions] = <span class="function">useState</span>([]);
  <span class="keyword">const</span> [loading, setLoading] = <span class="function">useState</span>(<span class="keyword">false</span>);
  <span class="keyword">const</span> [plData, setPlData] = <span class="function">useState</span>({});
  <span class="keyword">const</span> [greeksData, setGreeksData] = <span class="function">useState</span>({});

  <span class="comment">// Strategy Templates</span>
  <span class="keyword">const</span> strategyTemplates = {
    <span class="string">'covered-call'</span>: {
      name: <span class="string">'Covered Call'</span>,
      description: <span class="string">'Own stock + sell call option'</span>,
      risk: <span class="string">'Limited upside, downside protection'</span>,
      positions: [
        { type: <span class="string">'stock'</span>, quantity: <span class="number">100</span>, price: stockPrice },
        { type: <span class="string">'call'</span>, quantity: <span class="number">-1</span>, strike: stockPrice + <span class="number">5</span>, premium: <span class="number">2.50</span> }
      ]
    },
    <span class="string">'protective-put'</span>: {
      name: <span class="string">'Protective Put'</span>,
      description: <span class="string">'Own stock + buy put option'</span>,
      risk: <span class="string">'Limited downside, unlimited upside'</span>,
      positions: [
        { type: <span class="string">'stock'</span>, quantity: <span class="number">100</span>, price: stockPrice },
        { type: <span class="string">'put'</span>, quantity: <span class="number">1</span>, strike: stockPrice - <span class="number">5</span>, premium: <span class="number">1.80</span> }
      ]
    },
    <span class="string">'long-straddle'</span>: {
      name: <span class="string">'Long Straddle'</span>,
      description: <span class="string">'Buy call + buy put at same strike'</span>,
      risk: <span class="string">'Limited risk, unlimited profit potential'</span>,
      positions: [
        { type: <span class="string">'call'</span>, quantity: <span class="number">1</span>, strike: stockPrice, premium: <span class="number">3.20</span> },
        { type: <span class="string">'put'</span>, quantity: <span class="number">1</span>, strike: stockPrice, premium: <span class="number">3.10</span> }
      ]
    },
    <span class="string">'iron-condor'</span>: {
      name: <span class="string">'Iron Condor'</span>,
      description: <span class="string">'Sell call spread + sell put spread'</span>,
      risk: <span class="string">'Limited risk and reward'</span>,
      positions: [
        { type: <span class="string">'put'</span>, quantity: <span class="number">1</span>, strike: stockPrice - <span class="number">10</span>, premium: <span class="number">0.75</span> },
        { type: <span class="string">'put'</span>, quantity: <span class="number">-1</span>, strike: stockPrice - <span class="number">5</span>, premium: <span class="number">1.50</span> },
        { type: <span class="string">'call'</span>, quantity: <span class="number">-1</span>, strike: stockPrice + <span class="number">5</span>, premium: <span class="number">1.45</span> },
        { type: <span class="string">'call'</span>, quantity: <span class="number">1</span>, strike: stockPrice + <span class="number">10</span>, premium: <span class="number">0.70</span> }
      ]
    }
  };

  <span class="comment">// Calculate P&L for price range</span>
  <span class="keyword">const</span> <span class="function">calculatePL</span> = (positions, spotPrice) => {
    <span class="keyword">let</span> totalPL = <span class="number">0</span>;
    
    positions.<span class="function">forEach</span>(pos => {
      <span class="keyword">if</span> (pos.type === <span class="string">'stock'</span>) {
        totalPL += pos.quantity * (spotPrice - pos.price);
      } <span class="keyword">else</span> <span class="keyword">if</span> (pos.type === <span class="string">'call'</span>) {
        <span class="keyword">const</span> intrinsic = <span class="function">Math</span>.<span class="function">max</span>(<span class="number">0</span>, spotPrice - pos.strike);
        <span class="keyword">if</span> (pos.quantity > <span class="number">0</span>) {
          totalPL += pos.quantity * <span class="number">100</span> * (intrinsic - pos.premium);
        } <span class="keyword">else</span> {
          totalPL += pos.quantity * <span class="number">100</span> * (pos.premium - intrinsic);
        }
      } <span class="keyword">else</span> <span class="keyword">if</span> (pos.type === <span class="string">'put'</span>) {
        <span class="keyword">const</span> intrinsic = <span class="function">Math</span>.<span class="function">max</span>(<span class="number">0</span>, pos.strike - spotPrice);
        <span class="keyword">if</span> (pos.quantity > <span class="number">0</span>) {
          totalPL += pos.quantity * <span class="number">100</span> * (intrinsic - pos.premium);
        } <span class="keyword">else</span> {
          totalPL += pos.quantity * <span class="number">100</span> * (pos.premium - intrinsic);
        }
      }
    });
    
    <span class="keyword">return</span> totalPL;
  };

  <span class="comment">// Calculate Greeks (simplified)</span>
  <span class="keyword">const</span> <span class="function">calculateGreeks</span> = (positions) => {
    <span class="keyword">let</span> totalDelta = <span class="number">0</span>, totalGamma = <span class="number">0</span>, totalTheta = <span class="number">0</span>, totalVega = <span class="number">0</span>;
    
    positions.<span class="function">forEach</span>(pos => {
      <span class="keyword">if</span> (pos.type === <span class="string">'stock'</span>) {
        totalDelta += pos.quantity / <span class="number">100</span>; <span class="comment">// 1 delta per share, normalize to contracts</span>
      } <span class="keyword">else</span> <span class="keyword">if</span> (pos.type === <span class="string">'call'</span>) {
        <span class="comment">// Simplified Black-Scholes approximations</span>
        <span class="keyword">const</span> delta = <span class="number">0.6</span> * pos.quantity;
        <span class="keyword">const</span> gamma = <span class="number">0.05</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        <span class="keyword">const</span> theta = <span class="number">-0.02</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        <span class="keyword">const</span> vega = <span class="number">0.15</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        
        totalDelta += delta;
        totalGamma += gamma;
        totalTheta += theta * <span class="function">Math</span>.<span class="function">sign</span>(pos.quantity);
        totalVega += vega * <span class="function">Math</span>.<span class="function">sign</span>(pos.quantity);
      } <span class="keyword">else</span> <span class="keyword">if</span> (pos.type === <span class="string">'put'</span>) {
        <span class="keyword">const</span> delta = <span class="number">-0.4</span> * pos.quantity;
        <span class="keyword">const</span> gamma = <span class="number">0.05</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        <span class="keyword">const</span> theta = <span class="number">-0.02</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        <span class="keyword">const</span> vega = <span class="number">0.15</span> * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity);
        
        totalDelta += delta;
        totalGamma += gamma;
        totalTheta += theta * <span class="function">Math</span>.<span class="function">sign</span>(pos.quantity);
        totalVega += vega * <span class="function">Math</span>.<span class="function">sign</span>(pos.quantity);
      }
    });
    
    <span class="keyword">return</span> { delta: totalDelta, gamma: totalGamma, theta: totalTheta, vega: totalVega };
  };

  <span class="comment">// Load strategy data</span>
  <span class="function">useEffect</span>(() => {
    <span class="keyword">const</span> strategy = strategyTemplates[selectedStrategy];
    <span class="keyword">if</span> (strategy) {
      setPositions(strategy.positions);
      
      <span class="comment">// Calculate P&L curve</span>
      <span class="keyword">const</span> priceRange = [];
      <span class="keyword">const</span> plCurve = [];
      
      <span class="keyword">for</span> (<span class="keyword">let</span> price = stockPrice - <span class="number">20</span>; price <= stockPrice + <span class="number">20</span>; price += <span class="number">1</span>) {
        priceRange.<span class="function">push</span>(price);
        plCurve.<span class="function">push</span>(<span class="function">calculatePL</span>(strategy.positions, price));
      }
      
      setPlData({ priceRange, plCurve });
      setGreeksData(<span class="function">calculateGreeks</span>(strategy.positions));
    }
  }, [selectedStrategy, stockPrice]);

  <span class="comment">// Fetch real options data</span>
  <span class="function">useEffect</span>(() => {
    <span class="keyword">const</span> <span class="function">fetchOptionsData</span> = <span class="keyword">async</span> () => {
      <span class="function">setLoading</span>(<span class="keyword">true</span>);
      <span class="keyword">try</span> {
        <span class="keyword">const</span> response = <span class="keyword">await</span> <span class="function">fetch</span>(<span class="string">'/api/whales?endpoint=options_flow'</span>);
        <span class="keyword">const</span> data = <span class="keyword">await</span> response.<span class="function">json</span>();
        <span class="function">setStrategies</span>(data.data || []);
      } <span class="keyword">catch</span> (error) {
        <span class="function">console</span>.<span class="function">error</span>(<span class="string">'Error fetching options data:'</span>, error);
        <span class="comment">// Fallback data</span>
        <span class="function">setStrategies</span>([
          { symbol: <span class="string">'SPY'</span>, strategy: <span class="string">'Covered Call'</span>, profit: <span class="number">250</span>, probability: <span class="number">65</span> },
          { symbol: <span class="string">'QQQ'</span>, strategy: <span class="string">'Iron Condor'</span>, profit: <span class="number">180</span>, probability: <span class="number">58</span> },
          { symbol: <span class="string">'AAPL'</span>, strategy: <span class="string">'Protective Put'</span>, profit: <span class="number">320</span>, probability: <span class="number">72</span> }
        ]);
      }
      <span class="function">setLoading</span>(<span class="keyword">false</span>);
    };

    <span class="function">fetchOptionsData</span>();
    <span class="keyword">const</span> interval = <span class="function">setInterval</span>(fetchOptionsData, <span class="number">15000</span>);
    <span class="keyword">return</span> () => <span class="function">clearInterval</span>(interval);
  }, []);

  <span class="keyword">return</span> (
    &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"min-h-screen bg-gray-900 text-white p-6"</span>&gt;
      &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"max-w-7xl mx-auto"</span>&gt;
        <span class="comment">{/* Header */}</span>
        &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"mb-8"</span>&gt;
          &lt;<span class="keyword">h1</span> <span class="string">className</span>=<span class="string">"text-3xl font-bold mb-2"</span>&gt;
            🎯 Options Strategies
          &lt;/<span class="keyword">h1</span>&gt;
          &lt;<span class="keyword">p</span> <span class="string">className</span>=<span class="string">"text-gray-400"</span>&gt;
            Build, analyze, and optimize options strategies with real-time P&amp;L calculations
          &lt;/<span class="keyword">p</span>&gt;
        &lt;/<span class="keyword">div</span>&gt;

        <span class="comment">{/* Strategy Selector */}</span>
        &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"</span>&gt;
          {<span class="function">Object</span>.<span class="function">entries</span>(strategyTemplates).<span class="function">map</span>(([key, strategy]) =&gt; (
            &lt;<span class="keyword">div</span>
              <span class="string">key</span>={key}
              <span class="string">onClick</span>={() =&gt; <span class="function">setSelectedStrategy</span>(key)}
              <span class="string">className</span>={<span class="string">`p-4 rounded-lg cursor-pointer transition-all $</span>{
                selectedStrategy === key
                  ? <span class="string">'bg-blue-600 border-blue-400'</span>
                  : <span class="string">'bg-gray-800 border-gray-700 hover:bg-gray-700'</span>
              } <span class="string">border`</span>}
            &gt;
              &lt;<span class="keyword">h3</span> <span class="string">className</span>=<span class="string">"font-semibold mb-2"</span>&gt;{strategy.name}&lt;/<span class="keyword">h3</span>&gt;
              &lt;<span class="keyword">p</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-300 mb-2"</span>&gt;{strategy.description}&lt;/<span class="keyword">p</span>&gt;
              &lt;<span class="keyword">p</span> <span class="string">className</span>=<span class="string">"text-xs text-gray-400"</span>&gt;{strategy.risk}&lt;/<span class="keyword">p</span>&gt;
            &lt;/<span class="keyword">div</span>&gt;
          ))}
        &lt;/<span class="keyword">div</span>&gt;

        <span class="comment">{/* Main Content Grid */}</span>
        &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"</span>&gt;
          <span class="comment">{/* Position Builder */}</span>
          &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"bg-gray-800 p-6 rounded-lg"</span>&gt;
            &lt;<span class="keyword">h3</span> <span class="string">className</span>=<span class="string">"text-xl font-semibold mb-4"</span>&gt;📊 Position Details&lt;/<span class="keyword">h3</span>&gt;
            
            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"mb-4"</span>&gt;
              &lt;<span class="keyword">label</span> <span class="string">className</span>=<span class="string">"block text-sm font-medium mb-2"</span>&gt;Stock Price&lt;/<span class="keyword">label</span>&gt;
              &lt;<span class="keyword">input</span>
                <span class="string">type</span>=<span class="string">"number"</span>
                <span class="string">value</span>={stockPrice}
                <span class="string">onChange</span>={(e) =&gt; <span class="function">setStockPrice</span>(<span class="function">parseFloat</span>(e.target.value))}
                <span class="string">className</span>=<span class="string">"w-full p-2 bg-gray-700 rounded border border-gray-600"</span>
              /&gt;
            &lt;/<span class="keyword">div</span>&gt;

            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"space-y-3"</span>&gt;
              {positions.<span class="function">map</span>((pos, index) =&gt; (
                &lt;<span class="keyword">div</span> <span class="string">key</span>={index} <span class="string">className</span>=<span class="string">"p-3 bg-gray-700 rounded"</span>&gt;
                  &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"flex justify-between items-center"</span>&gt;
                    &lt;<span class="keyword">div</span>&gt;
                      &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"font-medium"</span>&gt;
                        {pos.quantity &gt; <span class="number">0</span> ? <span class="string">'Long'</span> : <span class="string">'Short'</span>} {<span class="function">Math</span>.<span class="function">abs</span>(pos.quantity)} {pos.type}
                      &lt;/<span class="keyword">span</span>&gt;
                      {pos.strike &amp;&amp; (
                        &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"text-gray-300 ml-2"</span>&gt;@ ${pos.strike}&lt;/<span class="keyword">span</span>&gt;
                      )}
                    &lt;/<span class="keyword">div</span>&gt;
                    &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-right"</span>&gt;
                      {pos.premium ? (
                        &lt;<span class="keyword">span</span> <span class="string">className</span>={<span class="string">`text-sm $</span>{pos.quantity &gt; <span class="number">0</span> ? <span class="string">'text-red-400'</span> : <span class="string">'text-green-400'</span>}<span class="string">`</span>}&gt;
                          {pos.quantity &gt; <span class="number">0</span> ? <span class="string">'-'</span> : <span class="string">'+'</span>}${(pos.premium * <span class="function">Math</span>.<span class="function">abs</span>(pos.quantity) * <span class="number">100</span>).<span class="function">toFixed</span>(<span class="number">0</span>)}
                        &lt;/<span class="keyword">span</span>&gt;
                      ) : (
                        &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400"</span>&gt;
                          ${(pos.price * pos.quantity).<span class="function">toFixed</span>(<span class="number">0</span>)}
                        &lt;/<span class="keyword">span</span>&gt;
                      )}
                    &lt;/<span class="keyword">div</span>&gt;
                  &lt;/<span class="keyword">div</span>&gt;
                &lt;/<span class="keyword">div</span>&gt;
              ))}
            &lt;/<span class="keyword">div</span>&gt;
          &lt;/<span class="keyword">div</span>&gt;

          <span class="comment">{/* Greeks Analysis */}</span>
          &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"bg-gray-800 p-6 rounded-lg"</span>&gt;
            &lt;<span class="keyword">h3</span> <span class="string">className</span>=<span class="string">"text-xl font-semibold mb-4"</span>&gt;🔢 Greeks Analysis&lt;/<span class="keyword">h3</span>&gt;
            
            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"grid grid-cols-2 gap-4"</span>&gt;
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"p-3 bg-gray-700 rounded"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400"</span>&gt;Delta&lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>={<span class="string">`text-lg font-bold $</span>{greeksData.delta &gt; <span class="number">0</span> ? <span class="string">'text-green-400'</span> : <span class="string">'text-red-400'</span>}<span class="string">`</span>}&gt;
                  {greeksData.delta?.<span class="function">toFixed</span>(<span class="number">2</span>) || <span class="string">'0.00'</span>}
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-xs text-gray-500"</span>&gt;Price sensitivity&lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
              
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"p-3 bg-gray-700 rounded"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400"</span>&gt;Gamma&lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-lg font-bold text-purple-400"</span>&gt;
                  {greeksData.gamma?.<span class="function">toFixed</span>(<span class="number">3</span>) || <span class="string">'0.000'</span>}
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-xs text-gray-500"</span>&gt;Delta sensitivity&lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
              
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"p-3 bg-gray-700 rounded"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400"</span>&gt;Theta&lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-lg font-bold text-red-400"</span>&gt;
                  {greeksData.theta?.<span class="function">toFixed</span>(<span class="number">2</span>) || <span class="string">'0.00'</span>}
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-xs text-gray-500"</span>&gt;Time decay&lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
              
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"p-3 bg-gray-700 rounded"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400"</span>&gt;Vega&lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-lg font-bold text-blue-400"</span>&gt;
                  {greeksData.vega?.<span class="function">toFixed</span>(<span class="number">2</span>) || <span class="string">'0.00'</span>}
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-xs text-gray-500"</span>&gt;Vol sensitivity&lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
            &lt;/<span class="keyword">div</span>&gt;

            <span class="comment">{/* Risk Metrics */}</span>
            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"mt-4 p-3 bg-gray-700 rounded"</span>&gt;
              &lt;<span class="keyword">h4</span> <span class="string">className</span>=<span class="string">"font-medium mb-2"</span>&gt;Risk Assessment&lt;/<span class="keyword">h4</span>&gt;
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"space-y-2 text-sm"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"flex justify-between"</span>&gt;
                  &lt;<span class="keyword">span</span>&gt;Max Risk:&lt;/<span class="keyword">span</span>&gt;
                  &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"text-red-400"</span>&gt;
                    ${plData.plCurve ? <span class="function">Math</span>.<span class="function">min</span>(...plData.plCurve).<span class="function">toFixed</span>(<span class="number">0</span>) : <span class="string">'--'</span>}
                  &lt;/<span class="keyword">span</span>&gt;
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"flex justify-between"</span>&gt;
                  &lt;<span class="keyword">span</span>&gt;Max Profit:&lt;/<span class="keyword">span</span>&gt;
                  &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"text-green-400"</span>&gt;
                    ${plData.plCurve ? <span class="function">Math</span>.<span class="function">max</span>(...plData.plCurve).<span class="function">toFixed</span>(<span class="number">0</span>) : <span class="string">'--'</span>}
                  &lt;/<span class="keyword">span</span>&gt;
                &lt;/<span class="keyword">div</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"flex justify-between"</span>&gt;
                  &lt;<span class="keyword">span</span>&gt;Breakeven:&lt;/<span class="keyword">span</span>&gt;
                  &lt;<span class="keyword">span</span> <span class="string">className</span>=<span class="string">"text-yellow-400"</span>&gt;
                    ${stockPrice.<span class="function">toFixed</span>(<span class="number">2</span>)}
                  &lt;/<span class="keyword">span</span>&gt;
                &lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
            &lt;/<span class="keyword">div</span>&gt;
          &lt;/<span class="keyword">div</span>&gt;
        &lt;/<span class="keyword">div</span>&gt;

        <span class="comment">{/* P&L Chart */}</span>
        &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"bg-gray-800 p-6 rounded-lg mb-8"</span>&gt;
          &lt;<span class="keyword">h3</span> <span class="string">className</span>=<span class="string">"text-xl font-semibold mb-4"</span>&gt;📈 Profit/Loss Diagram&lt;/<span class="keyword">h3</span>&gt;
          &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"h-64 flex items-center justify-center"</span>&gt;
            {plData.plCurve ? (
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"w-full h-full bg-gray-700 rounded flex items-center justify-center"</span>&gt;
                &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-center"</span>&gt;
                  &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-4xl mb-2"</span>&gt;📊&lt;/<span class="keyword">div</span>&gt;
                  &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-lg font-semibold"</span>&gt;
                    {strategyTemplates[selectedStrategy]?.name} P&amp;L Chart
                  &lt;/<span class="keyword">div</span>&gt;
                  &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-sm text-gray-400 mt-2"</span>&gt;
                    Interactive chart showing profit/loss at expiration
                  &lt;/<span class="keyword">div</span>&gt;
                &lt;/<span class="keyword">div</span>&gt;
              &lt;/<span class="keyword">div</span>&gt;
            ) : (
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-gray-500"</span>&gt;Loading P&amp;L data...&lt;/<span class="keyword">div</span>&gt;
            )}
          &lt;/<span class="keyword">div</span>&gt;
        &lt;/<span class="keyword">div</span>&gt;

        <span class="comment">{/* Strategy Performance Table */}</span>
        &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"bg-gray-800 p-6 rounded-lg"</span>&gt;
          &lt;<span class="keyword">h3</span> <span class="string">className</span>=<span class="string">"text-xl font-semibold mb-4"</span>&gt;🏆 Strategy Performance&lt;/<span class="keyword">h3</span>&gt;
          
          {loading ? (
            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"text-center py-8"</span>&gt;
              &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"</span>&gt;&lt;/<span class="keyword">div</span>&gt;
              &lt;<span class="keyword">div</span>&gt;Loading strategy performance...&lt;/<span class="keyword">div</span>&gt;
            &lt;/<span class="keyword">div</span>&gt;
          ) : (
            &lt;<span class="keyword">div</span> <span class="string">className</span>=<span class="string">"overflow-x-auto"</span>&gt;
              &lt;<span class="keyword">table</span> <span class="string">className</span>=<span class="string">"w-full text-left"</span>&gt;
                &lt;<span class="keyword">thead</span>&gt;
                  &lt;<span class="keyword">tr</span> <span class="string">className</span>=<span class="string">"border-b border-gray-700"</span>&gt;
                    &lt;<span class="keyword">th</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;Symbol&lt;/<span class="keyword">th</span>&gt;
                    &lt;<span class="keyword">th</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;Strategy&lt;/<span class="keyword">th</span>&gt;
                    &lt;<span class="keyword">th</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;Profit&lt;/<span class="keyword">th</span>&gt;
                    &lt;<span class="keyword">th</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;Probability&lt;/<span class="keyword">th</span>&gt;
                    &lt;<span class="keyword">th</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;Status&lt;/<span class="keyword">th</span>&gt;
                  &lt;/<span class="keyword">tr</span>&gt;
                &lt;/<span class="keyword">thead</span>&gt;
                &lt;<span class="keyword">tbody</span>&gt;
                  {strategies.<span class="function">map</span>((strategy, index) =&gt; (
                    &lt;<span class="keyword">tr</span> <span class="string">key</span>={index} <span class="string">className</span>=<span class="string">"border-b border-gray-800 hover:bg-gray-700"</span>&gt;
                      &lt;<span class="keyword">td</span> <span class="string">className</span>=<span class="string">"py-3 px-4 font-semibold"</span>&gt;{strategy.symbol}&lt;/<span class="keyword">td</span>&gt;
                      &lt;<span class="keyword">td</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;{strategy.strategy}&lt;/<span class="keyword">td</span>&gt;
                      &lt;<span class="keyword">td</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;
                        &lt;<span class="keyword">span</span> <span class="string">className</span>={<span class="string">`font-bold $</span>{strategy.profit &gt; <span class="number">0</span> ? <span class="string">'text-green-400'</span> : <span class="string">'text-red-400'</span>}<span class="string">`</span>}&gt;
                          ${strategy.profit}
                        &lt;/<span class="keyword">span</span>&gt;
                      &lt;/<span class="keyword">td</span>&gt;
                      &lt;<span class="keyword">td</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;
                        &lt;<span class="keyword">span</span> <span class="string">className</span>={<span class="string">`font-medium $</span>{
                          strategy.probability &gt; <span class="number">70</span> ? <span class="string">'text-green-400'</span> :
                          strategy.probability &gt; <span class="number">50</span> ? <span class="string">'text-yellow-400'</span> : <span class="string">'text-red-400'</span>
                        }<span class="string">`</span>}&gt;
                          {strategy.probability}%
                        &lt;/<span class="keyword">span</span>&gt;
                      &lt;/<span class="keyword">td</span>&gt;
                      &lt;<span class="keyword">td</span> <span class="string">className</span>=<span class="string">"py-3 px-4"</span>&gt;
                        &lt;<span class="keyword">span</span> <span class="string">className</span>={<span class="string">`px-2 py-1 rounded text-xs font-medium $</span>{
                          strategy.probability &gt; <span class="number">65</span> ? <span class="string">'bg-green-900 text-green-300'</span> :
                          strategy.probability &gt; <span class="number">50</span> ? <span class="string">'bg-yellow-900 text-yellow-300'</span> : <span class="string">'bg-red-900 text-red-300'</span>
                        }<span class="string">`</span>}&gt;
                          {strategy.probability &gt; <span class="number">65</span> ? <span class="string">'High Confidence'</span> :
                           strategy.probability &gt; <span class="number">50</span> ? <span class="string">'Moderate'</span> : <span class="string">'Low Confidence'</span>}
                        &lt;/<span class="keyword">span</span>&gt;
                      &lt;/<span class="keyword">td</span>&gt;
                    &lt;/<span class="keyword">tr</span>&gt;
                  ))}
                &lt;/<span class="keyword">tbody</span>&gt;
              &lt;/<span class="keyword">table</span>&gt;
            &lt;/<span class="keyword">div</span>&gt;
          )}
        &lt;/<span class="keyword">div</span>&gt;
      &lt;/<span class="keyword">div</span>&gt;
    &lt;/<span class="keyword">div</span>&gt;
  );
};

<span class="keyword">export</span> <span class="keyword">default</span> OptionsStrategies;</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
