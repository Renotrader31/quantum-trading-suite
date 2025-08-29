import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorBoundary from './ErrorBoundary';

// Utility function to safely access severity property
const getSafeSeverity = (item) => {
  if (!item || typeof item !== 'object') return 'info';
  return item.severity || 'info';
};

// Utility function to safely convert severity to uppercase
const getSafeSeverityUpper = (item) => {
  const severity = getSafeSeverity(item);
  return severity.toUpperCase();
};

// Safe severity color mapping
const getSeverityColor = (severity) => {
  const safeSeverity = (severity || 'info').toLowerCase();
  switch (safeSeverity) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TradingPipeline() {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Trading data state
  const [scanResults, setScanResults] = useState([]);
  const [portfolioPositions, setPortfolioPositions] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [selectedTrades, setSelectedTrades] = useState([]);
  
  // Options strategy state
  const [selectedStock, setSelectedStock] = useState(null);
  const [strategyRecommendations, setStrategyRecommendations] = useState([]);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyEngine, setStrategyEngine] = useState(null);
  
  // Initialize strategy engine safely on client side with dynamic import
  useEffect(() => {
    let isMounted = true;
    
    const initializeEngine = async () => {
      try {
        console.log('🔧 Starting OptionsStrategyEngine initialization...');
        
        // Small delay to ensure component is fully mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) {
          console.log('⚠️ Component unmounted during initialization');
          return;
        }
        
        console.log('📦 Dynamic importing SimpleOptionsEngine class...');
        const { default: SimpleOptionsEngine } = await import('../lib/SimpleOptionsEngine');
        
        console.log('🏗️ Creating engine instance...');
        const engine = new SimpleOptionsEngine();
        
        console.log('🧪 Testing engine methods...');
        // Test that the engine has required methods
        if (typeof engine.analyzeStrategies !== 'function') {
          throw new Error('SimpleOptionsEngine missing analyzeStrategies method');
        }
        
        setStrategyEngine(engine);
        console.log('✅ SimpleOptionsEngine initialized successfully');
        console.log('🎯 Engine methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(engine)));
      } catch (error) {
        console.error('❌ Failed to initialize SimpleOptionsEngine:', error);
        console.error('📊 Error stack:', error.stack);
        if (isMounted) {
          showError(`Failed to initialize options strategy engine: ${error.message}`);
        }
      }
    };
    
    initializeEngine();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Debug state changes
  useEffect(() => {
    console.log('🔍 Strategy state changed:', {
      selectedStock: selectedStock?.symbol,
      recommendationsCount: strategyRecommendations.length,
      strategyLoading,
      engineReady: !!strategyEngine
    });
  }, [selectedStock, strategyRecommendations, strategyLoading, strategyEngine]);
  
  // Configuration state
  const [config, setConfig] = useState({
    riskTolerance: 'medium',
    maxPositionSize: 10000,
    stopLossPercent: 15,
    takeProfitPercent: 25,
    enableAutoTrading: false,
    maxDailyTrades: 5
  });

  // Enhanced error handling with auto-clear
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Safe API call wrapper
  const safeApiCall = async (apiCall, errorMessage = 'API call failed') => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      console.error(errorMessage, err);
      showError(`${errorMessage}: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced market scan with proper error handling
  const runMarketScan = async () => {
    const result = await safeApiCall(async () => {
      const response = await fetch('/api/enhanced-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scanType: 'comprehensive',
          riskTolerance: config.riskTolerance 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Safety check for scan results
      const safeResults = (data.opportunities || []).map(opportunity => ({
        ...opportunity,
        severity: opportunity.severity || 'info',
        risk: opportunity.risk || 'medium'
      }));
      
      setScanResults(safeResults);
      showSuccess(`Market scan completed! Found ${safeResults.length} opportunities.`);
      return data;
    }, 'Market scan failed');
  };

  // Enhanced load active positions with comprehensive safety checks
  const loadActivePositions = async () => {
    const result = await safeApiCall(async () => {
      const response = await fetch('/api/trade-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getActiveTrades',
          userId: 'current_user' 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load positions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw positions data:', data);
      
      // Enhanced safety mapping with comprehensive property checks
      const positions = data.positions || data.trades || [];
      const safePositions = positions.map(pos => {
        // Ensure all required properties exist with safe defaults
        const safePos = {
          id: pos.id || `pos_${Math.random().toString(36).substr(2, 9)}`,
          symbol: pos.symbol || 'UNKNOWN',
          type: pos.type || 'options',
          quantity: pos.quantity || 0,
          entryPrice: pos.entryPrice || pos.price || 0,
          currentPrice: pos.currentPrice || pos.entryPrice || pos.price || 0,
          pnl: pos.pnl || 0,
          status: pos.status || 'active',
          severity: pos.severity || 'info',
          risk: pos.risk || 'medium',
          strategy: pos.strategy || 'unknown',
          entryDate: pos.entryDate || new Date().toISOString(),
          ...pos  // Preserve any additional properties
        };
        
        // Ensure severity is always a string
        if (typeof safePos.severity !== 'string') {
          safePos.severity = 'info';
        }
        
        return safePos;
      });
      
      console.log('Safe positions:', safePositions);
      setPortfolioPositions(safePositions);
      showSuccess(`Loaded ${safePositions.length} active positions successfully.`);
      return data;
    }, 'Failed to load active positions');
  };

  // Enhanced apply configuration with validation
  const applyConfiguration = async () => {
    const result = await safeApiCall(async () => {
      // Validate configuration before applying
      const errors = [];
      if (config.maxPositionSize <= 0) errors.push('Max position size must be positive');
      if (config.stopLossPercent < 0 || config.stopLossPercent > 100) errors.push('Stop loss must be 0-100%');
      if (config.takeProfitPercent < 0) errors.push('Take profit must be positive');
      if (config.maxDailyTrades < 1) errors.push('Max daily trades must be at least 1');
      
      if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
      }
      
      const response = await fetch('/api/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateConfig',
          config: config 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Configuration update failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      showSuccess('Configuration applied successfully!');
      return data;
    }, 'Failed to apply configuration');
  };

  // Enhanced trade analysis with safety checks
  const analyzeSelectedTrades = async () => {
    if (selectedTrades.length === 0) {
      showError('Please select at least one trade to analyze');
      return;
    }

    const result = await safeApiCall(async () => {
      const response = await fetch('/api/options-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trades: selectedTrades,
          analysisType: 'comprehensive' 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update risk metrics with safety checks
      const safeMetrics = {
        ...data.riskMetrics,
        totalRisk: data.riskMetrics?.totalRisk || 0,
        maxDrawdown: data.riskMetrics?.maxDrawdown || 0,
        sharpeRatio: data.riskMetrics?.sharpeRatio || 0
      };
      
      setRiskMetrics(safeMetrics);
      showSuccess('Trade analysis completed successfully!');
      return data;
    }, 'Trade analysis failed');
  };

  // Handle trade selection with safety
  const handleTradeSelect = (trade) => {
    const safeTradeId = trade?.id || trade?.symbol || Math.random().toString(36);
    setSelectedTrades(prev => {
      if (prev.some(t => (t.id || t.symbol) === safeTradeId)) {
        return prev.filter(t => (t.id || t.symbol) !== safeTradeId);
      }
      return [...prev, { ...trade, id: safeTradeId }];
    });
  };

  // Handle stock selection for options strategy analysis
  const handleStockSelect = useCallback(async (stock) => {
    console.log('🎯 Stock selected for options analysis:', stock.symbol);
    
    if (!strategyEngine) {
      showError('Options strategy engine is not ready. Please wait a moment and try again.');
      return;
    }
    
    // Cancel any previous analysis
    setStrategyLoading(true);
    setSelectedStock(stock);
    
    // Use AbortController to handle cleanup
    const controller = new AbortController();
    
    try {
      // Prepare stock data for analysis
      const stockData = {
        symbol: stock.symbol,
        price: stock.price || stock.currentPrice || 100, // Use actual price or fallback
        change: stock.change || 0,
        changePercent: stock.changePercent || 0,
        volume: stock.volume || 0,
        marketCap: stock.marketCap || 0
      };
      
      // Get market conditions from the stock data and scan results
      const marketConditions = {
        sentiment: stock.sentiment || 'neutral',
        volatility: stock.volatility || 'medium',
        trend: stock.trend || 'sideways',
        ivRank: stock.ivRank || 50
      };
      
      console.log('📊 Analyzing strategies with data:', { stockData, marketConditions });
      
      // Get strategy recommendations
      console.log('🔧 Calling strategyEngine.analyzeStrategies...');
      const analysis = await strategyEngine.analyzeStrategies(stockData, marketConditions);
      console.log('📋 Raw analysis result:', analysis);
      console.log('📊 Recommendations array:', analysis.recommendations);
      console.log('📏 Recommendations length:', analysis.recommendations?.length);
      
      setStrategyRecommendations(analysis.recommendations || []);
      
      // Auto-switch to Options Strategies tab to show results
      setActiveTab(1);
      
      console.log('✅ Strategy analysis complete:', analysis);
      showSuccess(`Generated ${analysis.recommendations?.length || 0} strategy recommendations for ${stock.symbol}`);
      
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('❌ Options strategy analysis failed:', error);
        showError(`Failed to analyze options strategies: ${error.message}`);
        setStrategyRecommendations([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setStrategyLoading(false);
      }
    }
    
    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [strategyEngine, showError, showSuccess, setActiveTab]);

  // Handle strategy selection and ML feedback
  const handleStrategySelect = async (strategy) => {
    console.log('📈 Strategy selected:', strategy.strategy);
    
    try {
      // Record strategy selection in ML system
      const response = await fetch('/api/ml-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordStrategySelection',
          userId: 'current_user',
          symbol: selectedStock?.symbol,
          strategy: strategy.strategyKey,
          confidence: strategy.score,
          reasoning: strategy.reasoning,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        showSuccess(`Strategy selection recorded for ML learning: ${strategy.strategy}`);
      }
    } catch (error) {
      console.error('Failed to record strategy selection:', error);
    }
    
    // Add to selected trades for further analysis
    const tradeData = {
      id: `${selectedStock?.symbol}_${strategy.strategyKey}_${Date.now()}`,
      symbol: selectedStock?.symbol,
      strategy: strategy.strategy,
      type: 'options_strategy',
      setup: strategy.setup,
      risk: strategy.maxRisk,
      reward: strategy.maxReward,
      score: strategy.score
    };
    
    setSelectedTrades(prev => [...prev, tradeData]);
  };

  // Safe render functions for different data types
  const renderScanResults = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Market Scan Results ({scanResults.length})
        </Typography>
        {scanResults.length === 0 ? (
          <Typography color="textSecondary">
            No scan results available. Run a market scan to see opportunities.
          </Typography>
        ) : (
          <List>
            {scanResults.map((result, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {result.symbol || 'Unknown Symbol'}
                      </Typography>
                      <Chip 
                        label={getSafeSeverityUpper(result)} 
                        color={getSeverityColor(result.severity)}
                        size="small" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Strategy: {result.strategy || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        Expected Return: {result.expectedReturn || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Risk Level: {result.risk || 'Unknown'}
                      </Typography>
                    </Box>
                  }
                />
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleTradeSelect(result)}
                    color={selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) ? "primary" : "inherit"}
                  >
                    {selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => handleStockSelect(result)}
                    disabled={!strategyEngine || (strategyLoading && selectedStock?.symbol === result.symbol)}
                  >
                    {strategyLoading && selectedStock?.symbol === result.symbol ? 
                      <CircularProgress size={16} /> : 'Analyze Options'
                    }
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const renderPortfolioPositions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Positions ({portfolioPositions.length})
        </Typography>
        {portfolioPositions.length === 0 ? (
          <Typography color="textSecondary">
            No active positions found. Click "Load Active Positions" to refresh.
          </Typography>
        ) : (
          <List>
            {portfolioPositions.map((position, index) => (
              <ListItem key={position.id || index} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {position.symbol || 'Unknown'}
                      </Typography>
                      <Chip 
                        label={getSafeSeverityUpper(position)} 
                        color={getSeverityColor(position.severity)}
                        size="small" 
                      />
                      <Chip 
                        label={position.status || 'unknown'} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Quantity: {position.quantity || 0} | Entry: ${position.entryPrice || 0}
                      </Typography>
                      <Typography variant="body2">
                        Current: ${position.currentPrice || 0} | P&L: ${position.pnl || 0}
                      </Typography>
                      <Typography variant="body2">
                        Strategy: {position.strategy || 'Unknown'}
                      </Typography>
                    </Box>
                  }
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleTradeSelect(position)}
                  color={selectedTrades.some(t => (t.id || t.symbol) === (position.id || position.symbol)) ? "primary" : "inherit"}
                >
                  {selectedTrades.some(t => (t.id || t.symbol) === (position.id || position.symbol)) ? 'Selected' : 'Select'}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const renderOptionsStrategies = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Options Strategy Analysis
            </Typography>
            
            {selectedStock ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Analyzing options strategies for {selectedStock.symbol}. 
                  Found {strategyRecommendations.length} recommendations.
                  {strategyLoading && ' Analysis in progress...'}
                </Alert>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h5" color="primary">
                    {selectedStock.symbol}
                  </Typography>
                  <Chip 
                    label={`$${selectedStock.price || selectedStock.currentPrice || 'N/A'}`}
                    color="primary"
                    variant="outlined"
                  />
                  {selectedStock.changePercent && (
                    <Chip 
                      label={`${selectedStock.changePercent > 0 ? '+' : ''}${selectedStock.changePercent.toFixed(2)}%`}
                      color={selectedStock.changePercent > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  )}
                </Box>
                
                {strategyLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                    <Typography ml={2}>Analyzing optimal strategies...</Typography>
                  </Box>
                ) : strategyRecommendations.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Top {strategyRecommendations.length} Recommended Strategies
                    </Typography>
                    {strategyRecommendations.map((strategy, index) => (
                      <Accordion key={index} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" gap={2} width="100%">
                            <Chip 
                              label={`#${index + 1}`} 
                              color="primary" 
                              size="small" 
                            />
                            <Typography variant="h6">
                              {strategy.strategy}
                            </Typography>
                            <Chip 
                              label={strategy.type}
                              color={
                                strategy.type.includes('bullish') ? 'success' : 
                                strategy.type.includes('bearish') ? 'error' : 'warning'
                              }
                              size="small"
                            />
                            <Chip 
                              label={`Score: ${(strategy.score * 100).toFixed(0)}%`}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom color="primary">
                                    Strategy Overview
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Complexity:</strong> {strategy.complexity}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Reasoning:</strong> {strategy.reasoning}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Max Risk:</strong> ${strategy.maxRisk}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Max Reward:</strong> ${strategy.maxReward}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Breakeven:</strong> ${strategy.breakeven}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Probability of Profit:</strong> {strategy.probabilityOfProfit}%
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom color="primary">
                                    Position Details
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Position Size:</strong> {strategy.positionSize} contracts
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Entry Price:</strong> ${strategy.entryPrice}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Target Price:</strong> ${strategy.targetPrice}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Stop Loss:</strong> ${strategy.stopLoss}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Days to Expiration:</strong> {strategy.daysToExpiration}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Expiration:</strong> {new Date(strategy.expirationDate).toLocaleDateString()}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom color="primary">
                                    Greeks Analysis
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Delta:</strong> {strategy.netDelta}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Theta:</strong> {strategy.netTheta}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    <strong>Vega:</strong> {strategy.netVega}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Gamma:</strong> {strategy.netGamma}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom color="primary">
                                    Action Plan
                                  </Typography>
                                  {strategy.actions && strategy.actions.map((action, idx) => (
                                    <Typography key={idx} variant="body2" paragraph>
                                      {idx + 1}. {action}
                                    </Typography>
                                  ))}\n                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Box display="flex" gap={2}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleStrategySelect(strategy)}
                                >
                                  Select This Strategy
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    // Export strategy details
                                    const strategyData = JSON.stringify(strategy, null, 2);
                                    const blob = new Blob([strategyData], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${selectedStock.symbol}_${strategy.strategyKey}_strategy.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  Export Strategy
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                ) : (
                  <Typography color="textSecondary">
                    Strategy analysis completed but no recommendations found.
                  </Typography>
                )}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Options Strategy Analysis
                  </Typography>
                  <Typography paragraph>
                    Click "Analyze Options" on any stock from the Market Opportunities tab to get personalized strategy recommendations.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Features: 15+ strategies, Greeks analysis, risk management, ML learning
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(0)}
                  size="large"
                >
                  Browse Market Opportunities
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRiskManagement = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Portfolio Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                onClick={loadActivePositions}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={20} /> : 'Load Active Positions'}
              </Button>
              <Button
                variant="outlined"
                onClick={analyzeSelectedTrades}
                disabled={loading || selectedTrades.length === 0}
                fullWidth
              >
                Analyze Selected Trades ({selectedTrades.length})
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Metrics
            </Typography>
            {riskMetrics ? (
              <Box>
                <Typography variant="body2">
                  Total Risk: ${riskMetrics.totalRisk || 0}
                </Typography>
                <Typography variant="body2">
                  Max Drawdown: {riskMetrics.maxDrawdown || 0}%
                </Typography>
                <Typography variant="body2">
                  Sharpe Ratio: {riskMetrics.sharpeRatio || 0}
                </Typography>
              </Box>
            ) : (
              <Typography color="textSecondary">
                Select trades and run analysis to see risk metrics.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        {renderPortfolioPositions()}
      </Grid>
    </Grid>
  );

  const renderConfiguration = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trading Configuration
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Risk Tolerance</InputLabel>
              <Select
                value={config.riskTolerance}
                onChange={(e) => setConfig(prev => ({ ...prev, riskTolerance: e.target.value }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Max Position Size ($)"
              type="number"
              fullWidth
              value={config.maxPositionSize}
              onChange={(e) => setConfig(prev => ({ ...prev, maxPositionSize: Number(e.target.value) }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Stop Loss (%)"
              type="number"
              fullWidth
              value={config.stopLossPercent}
              onChange={(e) => setConfig(prev => ({ ...prev, stopLossPercent: Number(e.target.value) }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Take Profit (%)"
              type="number"
              fullWidth
              value={config.takeProfitPercent}
              onChange={(e) => setConfig(prev => ({ ...prev, takeProfitPercent: Number(e.target.value) }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Max Daily Trades"
              type="number"
              fullWidth
              value={config.maxDailyTrades}
              onChange={(e) => setConfig(prev => ({ ...prev, maxDailyTrades: Number(e.target.value) }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enableAutoTrading}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableAutoTrading: e.target.checked }))}
                />
              }
              label="Enable Auto Trading"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={applyConfiguration}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : 'Apply Configuration'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          Quantum Trading Suite
        </Typography>
        
        {/* Main Actions */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={runMarketScan}
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={20} /> : 'Run Market Scan'}
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  Selected Trades: {selectedTrades.length} | 
                  Scan Results: {scanResults.length} | 
                  Active Positions: {portfolioPositions.length}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Tabs */}
        <Paper>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Market Opportunities" />
            <Tab label="Options Strategies" />
            <Tab label="Risk Management" />
            <Tab label="Configuration" />
          </Tabs>
          
          <TabPanel value={activeTab} index={0}>
            {renderScanResults()}
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <ErrorBoundary>
              <div>
                <Typography variant="h6" gutterBottom>
                  Options Strategies Debug
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Engine Status: {strategyEngine ? '✅ Ready' : '❌ Not Ready'}
                </Alert>
                {strategyEngine && (
                  <Alert severity="success">
                    Options Strategy Engine successfully initialized!
                  </Alert>
                )}
                {renderOptionsStrategies()}
              </div>
            </ErrorBoundary>
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            {renderRiskManagement()}
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            {renderConfiguration()}
          </TabPanel>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
