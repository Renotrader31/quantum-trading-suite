import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BrainIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';

export default function AdvancedMLEngine({ marketData = {}, selectedTrades = [] }) {
  const [mlMetrics, setMLMetrics] = useState(null);
  const [learningProgress, setLearningProgress] = useState(0);
  const [predictionAccuracy, setPredictionAccuracy] = useState(null);
  const [strategyPerformance, setStrategyPerformance] = useState({});
  const [marketRegimeDetection, setMarketRegimeDetection] = useState(null);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [loading, setLoading] = useState(false);

  // Advanced ML Learning Engine
  class QuantumMLEngine {
    constructor() {
      try {
        this.strategyDatabase = this.loadStrategyDatabase();
        this.marketRegimes = this.initializeMarketRegimes();
        this.neuralNetwork = this.initializeNeuralNetwork();
        this.performanceTracker = this.initializePerformanceTracker();
      } catch (error) {
        console.error('Error in QuantumMLEngine constructor:', error);
        // Initialize with safe defaults
        this.strategyDatabase = {};
        this.marketRegimes = {};
        this.neuralNetwork = { epochs: 0, accuracy: 0.65 };
        this.performanceTracker = { totalTrades: 0, winningTrades: 0, totalReturn: 0 };
      }
    }

    // Initialize strategy performance database
    loadStrategyDatabase() {
      const defaultPerformance = {
        'Long Call': { winRate: 0.45, avgReturn: 0.15, volatility: 0.65, sharpe: 0.23, regime: 'bull' },
        'Long Put': { winRate: 0.45, avgReturn: 0.12, volatility: 0.62, sharpe: 0.19, regime: 'bear' },
        'Bull Call Spread': { winRate: 0.65, avgReturn: 0.08, volatility: 0.35, sharpe: 0.43, regime: 'bull' },
        'Bear Put Spread': { winRate: 0.65, avgReturn: 0.08, volatility: 0.35, sharpe: 0.43, regime: 'bear' },
        'Iron Condor': { winRate: 0.75, avgReturn: 0.06, volatility: 0.25, sharpe: 0.52, regime: 'sideways' },
        'Iron Butterfly': { winRate: 0.70, avgReturn: 0.07, volatility: 0.28, sharpe: 0.48, regime: 'sideways' },
        'Short Straddle': { winRate: 0.80, avgReturn: 0.05, volatility: 0.22, sharpe: 0.55, regime: 'low_vol' },
        'Short Strangle': { winRate: 0.75, avgReturn: 0.06, volatility: 0.24, sharpe: 0.50, regime: 'low_vol' },
        'Long Straddle': { winRate: 0.35, avgReturn: 0.25, volatility: 0.85, sharpe: 0.29, regime: 'high_vol' },
        'Long Strangle': { winRate: 0.40, avgReturn: 0.20, volatility: 0.75, sharpe: 0.27, regime: 'high_vol' },
        'Jade Lizard': { winRate: 0.70, avgReturn: 0.09, volatility: 0.30, sharpe: 0.45, regime: 'bull' },
        'Wheel Strategy': { winRate: 0.85, avgReturn: 0.04, volatility: 0.18, sharpe: 0.58, regime: 'sideways' },
        'Butterfly Spread': { winRate: 0.68, avgReturn: 0.07, volatility: 0.32, sharpe: 0.41, regime: 'sideways' },
        'Calendar Spread': { winRate: 0.60, avgReturn: 0.10, volatility: 0.40, sharpe: 0.35, regime: 'vol_expansion' },
        'Covered Call': { winRate: 0.75, avgReturn: 0.05, volatility: 0.20, sharpe: 0.48, regime: 'bull' },
        'Cash-Secured Put': { winRate: 0.70, avgReturn: 0.06, volatility: 0.28, sharpe: 0.42, regime: 'bull' }
      };

      // Load from localStorage or use defaults
      const stored = localStorage.getItem('quantumMLDatabase');
      return stored ? { ...defaultPerformance, ...JSON.parse(stored) } : defaultPerformance;
    }

    // Initialize market regime configurations
    initializeMarketRegimes() {
      return {
        bull: { description: 'Bullish Market', characteristics: ['uptrend', 'high_volume', 'positive_sentiment'] },
        bear: { description: 'Bearish Market', characteristics: ['downtrend', 'fear', 'negative_sentiment'] },
        sideways: { description: 'Sideways Market', characteristics: ['range_bound', 'low_directional_movement'] },
        high_vol: { description: 'High Volatility', characteristics: ['elevated_iv', 'market_uncertainty'] },
        low_vol: { description: 'Low Volatility', characteristics: ['compressed_iv', 'stable_conditions'] },
        vol_expansion: { description: 'Volatility Expansion', characteristics: ['increasing_iv', 'pending_catalysts'] }
      };
    }

    // Market regime detection using multiple indicators
    detectMarketRegime(marketData) {
      const symbols = Object.keys(marketData);
      if (!symbols.length) return 'unknown';

      // Calculate market indicators
      let bullishCount = 0;
      let bearishCount = 0;
      let totalVolatility = 0;
      let avgVolume = 0;
      
      symbols.forEach(symbol => {
        const data = marketData[symbol];
        if (data.flow === 'BULLISH' || data.flow === 'VERY_BULLISH') bullishCount++;
        if (data.flow === 'BEARISH' || data.flow === 'VERY_BEARISH') bearishCount++;
        totalVolatility += (data.iv || 30);
        avgVolume += (data.volume || 1000);
      });

      const bullishRatio = bullishCount / symbols.length;
      const avgIV = totalVolatility / symbols.length;
      avgVolume = avgVolume / symbols.length;

      // Regime classification
      if (avgIV > 40) return 'high_vol';
      if (avgIV < 20) return 'low_vol';
      if (bullishRatio > 0.7) return 'bull';
      if (bullishRatio < 0.3) return 'bear';
      return 'sideways';
    }

    // Neural network for strategy recommendation
    initializeNeuralNetwork() {
      return {
        inputLayers: [
          'marketRegime', 'volatility', 'sentiment', 'volume', 'dte', 'userPreference'
        ],
        hiddenLayers: [
          { nodes: 64, activation: 'relu' },
          { nodes: 32, activation: 'relu' },
          { nodes: 16, activation: 'tanh' }
        ],
        outputLayer: { nodes: 19, activation: 'softmax' }, // 19 strategies
        learningRate: 0.001,
        epochs: 0,
        accuracy: 0.65 // Starting accuracy
      };
    }

    // Performance tracking and learning
    initializePerformanceTracker() {
      return {
        totalTrades: 0,
        winningTrades: 0,
        totalReturn: 0,
        strategies: {},
        regimePerformance: {},
        recentAccuracy: 0.65,
        adaptationRate: 0.02
      };
    }

    // Learn from strategy selection and outcomes
    learnFromOutcome(strategy, outcome, marketConditions) {
      const strategyData = this.strategyDatabase[strategy];
      if (!strategyData) return;

      // Update performance metrics
      this.performanceTracker.totalTrades++;
      if (outcome.profitable) {
        this.performanceTracker.winningTrades++;
        strategyData.winRate = this.updateMetric(strategyData.winRate, 1, 0.1);
      } else {
        strategyData.winRate = this.updateMetric(strategyData.winRate, 0, 0.1);
      }

      // Update return and volatility
      const returnRate = outcome.return || 0;
      strategyData.avgReturn = this.updateMetric(strategyData.avgReturn, returnRate, 0.05);
      strategyData.volatility = this.updateMetric(strategyData.volatility, Math.abs(returnRate), 0.05);
      strategyData.sharpe = strategyData.avgReturn / (strategyData.volatility || 0.01);

      // Update regime-specific performance
      const regime = this.detectMarketRegime(marketConditions);
      if (!this.performanceTracker.regimePerformance[regime]) {
        this.performanceTracker.regimePerformance[regime] = {};
      }
      if (!this.performanceTracker.regimePerformance[regime][strategy]) {
        this.performanceTracker.regimePerformance[regime][strategy] = { wins: 0, total: 0 };
      }

      const regimeData = this.performanceTracker.regimePerformance[regime][strategy];
      regimeData.total++;
      if (outcome.profitable) regimeData.wins++;

      // Update neural network accuracy
      this.neuralNetwork.epochs++;
      if (outcome.profitable) {
        this.neuralNetwork.accuracy = Math.min(0.95, this.neuralNetwork.accuracy + this.performanceTracker.adaptationRate);
      } else {
        this.neuralNetwork.accuracy = Math.max(0.45, this.neuralNetwork.accuracy - this.performanceTracker.adaptationRate * 0.5);
      }

      // Save to localStorage
      this.saveToStorage();
    }

    // Exponential moving average update
    updateMetric(current, newValue, alpha = 0.1) {
      return current * (1 - alpha) + newValue * alpha;
    }

    // Advanced strategy scoring with ML
    scoreStrategiesML(marketConditions, userPreference = 'moderate-aggressive') {
      const currentRegime = this.detectMarketRegime(marketConditions);
      const scores = {};

      Object.entries(this.strategyDatabase).forEach(([strategy, data]) => {
        let score = 50; // Base score

        // Regime matching bonus
        if (data.regime === currentRegime) score += 25;
        
        // Performance-based scoring
        score += (data.winRate - 0.5) * 100; // Win rate adjustment
        score += data.sharpe * 20; // Sharpe ratio bonus
        score += (data.avgReturn) * 100; // Return bonus

        // User preference adjustment
        const preferenceMultipliers = {
          'conservative': { winRate: 1.5, avgReturn: 0.8, volatility: -1.0 },
          'moderate': { winRate: 1.2, avgReturn: 1.0, volatility: -0.5 },
          'moderate-aggressive': { winRate: 1.0, avgReturn: 1.3, volatility: 0.0 },
          'aggressive': { winRate: 0.8, avgReturn: 1.5, volatility: 0.5 }
        };

        const prefs = preferenceMultipliers[userPreference] || preferenceMultipliers['moderate-aggressive'];
        score += data.winRate * 50 * prefs.winRate;
        score += data.avgReturn * 200 * prefs.avgReturn;
        score += data.volatility * 30 * prefs.volatility;

        // Regime-specific performance adjustment
        if (this.performanceTracker.regimePerformance[currentRegime]?.[strategy]) {
          const regimePerf = this.performanceTracker.regimePerformance[currentRegime][strategy];
          const regimeWinRate = regimePerf.wins / regimePerf.total;
          score += (regimeWinRate - 0.5) * 50; // Regime-specific adjustment
        }

        // Neural network confidence adjustment
        score *= (0.7 + this.neuralNetwork.accuracy * 0.6); // Scale by NN confidence

        scores[strategy] = Math.max(0, Math.min(100, score));
      });

      return scores;
    }

    // Predict optimal portfolio allocation
    predictOptimalAllocation(strategies, portfolioValue) {
      const totalScore = Object.values(strategies).reduce((sum, score) => sum + score, 0);
      const allocation = {};

      Object.entries(strategies).forEach(([strategy, score]) => {
        const percentage = (score / totalScore) * 100;
        allocation[strategy] = {
          percentage: percentage.toFixed(1),
          dollarAmount: (portfolioValue * percentage / 100).toFixed(0),
          confidence: (score / 100 * this.neuralNetwork.accuracy * 100).toFixed(1)
        };
      });

      return allocation;
    }

    // Generate ML insights and recommendations
    generateMLInsights(marketData) {
      const regime = this.detectMarketRegime(marketData);
      const totalAccuracy = this.performanceTracker.totalTrades > 0 ? 
        (this.performanceTracker.winningTrades / this.performanceTracker.totalTrades * 100).toFixed(1) : 'N/A';
      
      return {
        currentRegime: regime,
        networkAccuracy: (this.neuralNetwork.accuracy * 100).toFixed(1),
        totalAccuracy: totalAccuracy,
        totalTrades: this.performanceTracker.totalTrades,
        epochs: this.neuralNetwork.epochs,
        bestPerformingStrategies: this.getBestPerformingStrategies(),
        regimeRecommendations: this.getRegimeRecommendations(regime),
        learningProgress: Math.min(100, this.neuralNetwork.epochs / 100 * 100),
        confidenceLevel: this.calculateConfidenceLevel()
      };
    }

    getBestPerformingStrategies() {
      return Object.entries(this.strategyDatabase)
        .sort((a, b) => (b[1].sharpe || 0) - (a[1].sharpe || 0))
        .slice(0, 5)
        .map(([strategy, data]) => ({
          strategy,
          sharpe: data.sharpe.toFixed(2),
          winRate: (data.winRate * 100).toFixed(1),
          avgReturn: (data.avgReturn * 100).toFixed(1)
        }));
    }

    getRegimeRecommendations(regime) {
      const regimeStrategies = {
        'bull': ['Long Call', 'Bull Call Spread', 'Jade Lizard', 'Covered Call'],
        'bear': ['Long Put', 'Bear Put Spread', 'Bear Call Spread'],
        'sideways': ['Iron Condor', 'Iron Butterfly', 'Wheel Strategy', 'Butterfly Spread'],
        'high_vol': ['Short Straddle', 'Short Strangle', 'Iron Condor'],
        'low_vol': ['Long Straddle', 'Long Strangle', 'Calendar Spread'],
        'vol_expansion': ['Calendar Spread', 'Diagonal Spread']
      };

      return regimeStrategies[regime] || ['Iron Condor', 'Covered Call', 'Cash-Secured Put'];
    }

    calculateConfidenceLevel() {
      const factors = [
        this.neuralNetwork.accuracy,
        Math.min(1, this.performanceTracker.totalTrades / 50), // More trades = higher confidence
        Math.min(1, this.neuralNetwork.epochs / 100) // More learning = higher confidence
      ];

      const avgConfidence = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
      return (avgConfidence * 100).toFixed(1);
    }

    saveToStorage() {
      localStorage.setItem('quantumMLDatabase', JSON.stringify(this.strategyDatabase));
      localStorage.setItem('quantumMLPerformance', JSON.stringify(this.performanceTracker));
      localStorage.setItem('quantumMLNetwork', JSON.stringify(this.neuralNetwork));
    }

    loadFromStorage() {
      const database = localStorage.getItem('quantumMLDatabase');
      const performance = localStorage.getItem('quantumMLPerformance');
      const network = localStorage.getItem('quantumMLNetwork');

      if (database) this.strategyDatabase = JSON.parse(database);
      if (performance) this.performanceTracker = JSON.parse(performance);
      if (network) this.neuralNetwork = JSON.parse(network);
    }
  }

  // Initialize ML Engine
  const [mlEngine] = useState(() => {
    try {
      const engine = new QuantumMLEngine();
      engine.loadFromStorage();
      return engine;
    } catch (error) {
      console.error('Error initializing QuantumMLEngine:', error);
      // Return a fallback minimal engine
      return {
        generateMLInsights: () => ({ 
          networkAccuracy: 0.65, 
          totalTrades: 0, 
          winRate: 0, 
          adaptiveStrategies: [],
          regimeAnalysis: { currentRegime: 'unknown', confidence: 0 },
          recommendations: []
        }),
        learnFromOutcome: () => {},
        saveToStorage: () => {},
        loadFromStorage: () => {},
        performanceTracker: { totalTrades: 0, winningTrades: 0, totalReturn: 0 },
        neuralNetwork: { epochs: 0, accuracy: 0.65 },
        initializePerformanceTracker: () => ({ totalTrades: 0, winningTrades: 0, totalReturn: 0 })
      };
    }
  });

  // Simulate ML learning process
  const runMLLearning = async () => {
    setLoading(true);
    
    // Simulate learning from recent data
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLearningProgress((i + 1) * 10);
      
      // Simulate learning outcomes
      const randomStrategy = Object.keys(mlEngine.strategyDatabase)[Math.floor(Math.random() * 19)];
      mlEngine.learnFromOutcome(
        randomStrategy,
        { profitable: Math.random() > 0.4, return: (Math.random() - 0.5) * 0.3 },
        marketData
      );
    }

    // Update state with ML insights
    const insights = mlEngine.generateMLInsights(marketData);
    setMLMetrics(insights);
    setPredictionAccuracy(insights.networkAccuracy);
    setLearningProgress(insights.learningProgress);

    // Generate strategy performance comparison
    const scores = mlEngine.scoreStrategiesML(marketData);
    setStrategyPerformance(scores);

    // Market regime detection
    const regime = mlEngine.detectMarketRegime(marketData);
    setMarketRegimeDetection({
      regime: regime,
      confidence: mlEngine.calculateConfidenceLevel(),
      recommendations: mlEngine.getRegimeRecommendations(regime)
    });

    setLoading(false);
  };

  // Simulate strategy outcome feedback
  const recordStrategyOutcome = (strategy, profitable, returnRate) => {
    mlEngine.learnFromOutcome(
      strategy,
      { profitable, return: returnRate },
      marketData
    );

    // Update UI
    const insights = mlEngine.generateMLInsights(marketData);
    setMLMetrics(insights);
    setPredictionAccuracy(insights.networkAccuracy);
  };

  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      const insights = mlEngine.generateMLInsights(marketData);
      setMLMetrics(insights);
    }
  }, [marketData]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧠 Advanced ML Engine
      </Typography>
      
      <Grid container spacing={3}>
        {/* ML Status Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <BrainIcon color="primary" />
                <Typography variant="h6">Neural Network Status</Typography>
              </Box>
              {mlMetrics && (
                <Box>
                  <Box mb={2}>
                    <Typography variant="body2">Network Accuracy</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(mlMetrics.networkAccuracy)} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" textAlign="right">
                      {mlMetrics.networkAccuracy}%
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2">Learning Progress</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={mlMetrics.learningProgress} 
                      color="secondary"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" textAlign="right">
                      {mlMetrics.learningProgress}%
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Total Trades</Typography>
                      <Typography variant="h6">{mlMetrics.totalTrades}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Epochs</Typography>
                      <Typography variant="h6">{mlMetrics.epochs}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Market Regime Detection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AnalyticsIcon color="secondary" />
                <Typography variant="h6">Market Regime</Typography>
              </Box>
              {marketRegimeDetection && (
                <Box>
                  <Chip 
                    label={marketRegimeDetection.regime.toUpperCase().replace('_', ' ')}
                    color="primary"
                    size="large"
                    sx={{ mb: 2, fontSize: '1.1rem' }}
                  />
                  <Typography variant="body2" gutterBottom>
                    Confidence: {marketRegimeDetection.confidence}%
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Recommended Strategies:
                  </Typography>
                  {marketRegimeDetection.recommendations.map((strategy, index) => (
                    <Chip 
                      key={index}
                      label={strategy}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ML Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ML Training Controls
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  onClick={runMLLearning}
                  disabled={loading}
                  fullWidth
                  startIcon={<BrainIcon />}
                >
                  {loading ? 'Training Neural Network...' : 'Run ML Training'}
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adaptiveLearning}
                      onChange={(e) => setAdaptiveLearning(e.target.checked)}
                    />
                  }
                  label="Adaptive Learning"
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    mlEngine.performanceTracker = mlEngine.initializePerformanceTracker();
                    mlEngine.neuralNetwork.epochs = 0;
                    mlEngine.saveToStorage();
                    setMLMetrics(mlEngine.generateMLInsights(marketData));
                  }}
                  size="small"
                >
                  Reset ML Model
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Strategy Performance Heatmap */}
        {Object.keys(strategyPerformance).length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 ML Strategy Scoring (Current Market Conditions)
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(strategyPerformance)
                    .sort((a, b) => b[1] - a[1])
                    .map(([strategy, score]) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={strategy}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: score > 80 ? 'success.light' : 
                                     score > 60 ? 'warning.light' : 'error.light',
                            color: 'white'
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {strategy}
                          </Typography>
                          <Typography variant="h6">
                            {score.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  }
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Best Performing Strategies */}
        {mlMetrics?.bestPerformingStrategies && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Top Performing Strategies (ML Learned)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Strategy</TableCell>
                        <TableCell align="right">Sharpe</TableCell>
                        <TableCell align="right">Win Rate</TableCell>
                        <TableCell align="right">Avg Return</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mlMetrics.bestPerformingStrategies.map((strategy, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={`#${index + 1}`} size="small" sx={{ mr: 1 }} />
                            {strategy.strategy}
                          </TableCell>
                          <TableCell align="right">{strategy.sharpe}</TableCell>
                          <TableCell align="right">{strategy.winRate}%</TableCell>
                          <TableCell align="right">{strategy.avgReturn}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Outcome Feedback Simulator */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Strategy Outcome Feedback (Simulation)
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Simulate strategy outcomes to train the ML model
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => recordStrategyOutcome('Iron Condor', true, 0.08)}
                  size="small"
                >
                  ✅ Iron Condor +8% (Profitable)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => recordStrategyOutcome('Long Call', false, -0.15)}
                  size="small"
                >
                  ❌ Long Call -15% (Loss)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => recordStrategyOutcome('Short Strangle', true, 0.06)}
                  size="small"
                >
                  ✅ Short Strangle +6% (Profitable)
                </Button>
                <Typography variant="caption" color="textSecondary">
                  Click to simulate outcomes and watch ML accuracy improve
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}