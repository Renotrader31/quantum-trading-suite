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
  LinearProgress,

} from '@mui/material';

import ErrorBoundary from './ErrorBoundary';
import OptionsStrategyTab from './OptionsStrategyTab';
import AdvancedRiskManagement from './AdvancedRiskManagement';
import AdvancedMLEngine from './AdvancedMLEngine';

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

export default function TradingPipeline({ marketData = {}, loading: externalLoading = false, onRefresh, lastUpdate }) {
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



  // Beautiful, professional Market Scanner matching ML Engine styling
  const renderScanResults = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎯 Intelligent Market Scanner
      </Typography>
      
      <Grid container spacing={3}>
        {/* Scanner Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box sx={{ color: 'primary.main', fontSize: 24 }}>🔍</Box>
                <Typography variant="h6">Scanner Controls</Typography>
              </Box>
              
              <Box mb={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={runMarketScan}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Scanning Markets...' : 'Run Market Scan'}
                </Button>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Scan Type</InputLabel>
                  <Select
                    value={config.scanType || 'comprehensive'}
                    label="Scan Type"
                    onChange={(e) => setConfig(prev => ({ ...prev, scanType: e.target.value }))}
                  >
                    <MenuItem value="comprehensive">Comprehensive Scan</MenuItem>
                    <MenuItem value="high_volume">High Volume</MenuItem>
                    <MenuItem value="earnings">Earnings Plays</MenuItem>
                    <MenuItem value="momentum">Momentum</MenuItem>
                    <MenuItem value="mean_reversion">Mean Reversion</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Market Cap</InputLabel>
                  <Select
                    value={config.marketCap || 'all'}
                    label="Market Cap"
                    onChange={(e) => setConfig(prev => ({ ...prev, marketCap: e.target.value }))}
                  >
                    <MenuItem value="all">All Market Caps</MenuItem>
                    <MenuItem value="large">Large Cap ($10B+)</MenuItem>
                    <MenuItem value="mid">Mid Cap ($2-10B)</MenuItem>
                    <MenuItem value="small">Small Cap (<$2B)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Scan Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box sx={{ color: 'success.main', fontSize: 24 }}>📊</Box>
                <Typography variant="h6">Scan Statistics</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Total Opportunities</Typography>
                <Typography variant="h3" color="primary.main">{scanResults.length}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Selected Trades</Typography>
                <Typography variant="h4" color="secondary.main">{selectedTrades.length}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                    color="success"
                  />
                  <Typography variant="body2">75%</Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" color="textSecondary">Last Scan</Typography>
                <Typography variant="body2">{new Date().toLocaleTimeString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box sx={{ color: 'warning.main', fontSize: 24 }}>🌍</Box>
                <Typography variant="h6">Market Status</Typography>
              </Box>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Market Regime</Typography>
                  <Chip label="Bullish" color="success" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Volatility</Typography>
                  <Chip label="Moderate" color="warning" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Volume</Typography>
                  <Chip label="High" color="info" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Sentiment</Typography>
                  <Chip label="Positive" color="success" size="small" />
                </Box>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Market conditions favorable for options strategies
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Scan Results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Market Opportunities ({scanResults.length})
              </Typography>
              
              {scanResults.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Box sx={{ fontSize: 48, mb: 2 }}>🔍</Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No opportunities found
                  </Typography>
                  <Typography color="textSecondary" mb={3}>
                    Run a market scan to discover trading opportunities
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={runMarketScan}
                    disabled={loading}
                    size="large"
                  >
                    Start Market Scan
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {scanResults.map((result, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': { 
                            boxShadow: 3,
                            transform: 'translateY(-2px)'
                          },
                          border: selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) 
                            ? '2px solid' 
                            : '1px solid',
                          borderColor: selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) 
                            ? 'primary.main' 
                            : 'divider'
                        }}
                        onClick={() => handleTradeSelect(result)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" color="primary.main">
                              {result.symbol || 'Unknown Symbol'}
                            </Typography>
                            <Chip 
                              label={getSafeSeverityUpper(result)} 
                              color={getSeverityColor(result.severity)}
                              size="small" 
                            />
                          </Box>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="textSecondary">Strategy</Typography>
                            <Typography variant="subtitle2" gutterBottom>
                              {result.strategy || 'Not specified'}
                            </Typography>
                            
                            <Typography variant="body2" color="textSecondary">Expected Return</Typography>
                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                              {result.expectedReturn || 'N/A'}
                            </Typography>
                            
                            <Typography variant="body2" color="textSecondary">Risk Level</Typography>
                            <Typography variant="subtitle2" gutterBottom>
                              {result.risk || 'Unknown'}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Button
                              variant={selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) ? "contained" : "outlined"}
                              color="primary"
                              size="small"
                              fullWidth
                            >
                              {selectedTrades.some(t => (t.id || t.symbol) === (result.id || result.symbol)) ? '✓ Selected' : 'Select Trade'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
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
            <Tab label="ML Engine" />
            <Tab label="Configuration" />
          </Tabs>
          
          <TabPanel value={activeTab} index={0}>
            {renderScanResults()}
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <OptionsStrategyTab marketData={marketData} loading={externalLoading} onRefresh={onRefresh} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <AdvancedRiskManagement 
              marketData={marketData} 
              selectedTrades={selectedTrades}
              portfolioValue={100000}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <ErrorBoundary>
              <AdvancedMLEngine 
                marketData={marketData} 
                selectedTrades={selectedTrades}
              />
            </ErrorBoundary>
          </TabPanel>
          
          <TabPanel value={activeTab} index={4}>
            {renderConfiguration()}
          </TabPanel>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
