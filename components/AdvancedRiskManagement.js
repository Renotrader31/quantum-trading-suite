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
  Slider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';

export default function AdvancedRiskManagement({ marketData = {}, selectedTrades = [], portfolioValue = 100000 }) {
  const [riskProfile, setRiskProfile] = useState('moderate-aggressive');
  const [maxPortfolioRisk, setMaxPortfolioRisk] = useState(2); // 2% max risk per trade
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [positionSizing, setPositionSizing] = useState({});
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Advanced Risk Management Engine
  const calculateAdvancedRisk = () => {
    if (!selectedTrades.length) return null;

    const analysis = {
      // Portfolio-Level Metrics
      totalExposure: 0,
      concentrationRisk: {},
      correlationRisk: 0,
      
      // Individual Position Metrics
      positions: selectedTrades.map(trade => ({
        symbol: trade.symbol || trade.strategy,
        strategy: trade.strategy || 'Unknown',
        maxRisk: trade.maxRisk || 'Unknown',
        kellySize: calculateKellyPosition(trade),
        var95: calculateVaR(trade, 0.95),
        expectedReturn: calculateExpectedReturn(trade),
        riskRewardRatio: calculateRiskRewardRatio(trade),
        
        // Greeks Risk (for options)
        deltaRisk: Math.abs(parseFloat(trade.delta) || 0) * 100,
        vegaRisk: Math.abs(parseFloat(trade.vega) || 0) * 100,
        thetaDecay: Math.abs(parseFloat(trade.theta) || 0) * 100,
        gammaRisk: Math.abs(parseFloat(trade.gamma) || 0) * 100,
        
        // Risk Scores
        complexityScore: getComplexityScore(trade.complexity || 'Basic'),
        liquidityScore: getLiquidityScore(trade.volume || 1000),
        volatilityScore: getVolatilityScore(trade.iv || 30)
      })),
      
      // Portfolio Optimization
      diversificationScore: calculateDiversification(selectedTrades),
      kellyOptimal: calculatePortfolioKelly(selectedTrades),
      maxDrawdownRisk: calculateMaxDrawdown(selectedTrades),
      
      // Advanced Metrics
      sharpeRatio: calculateSharpeRatio(selectedTrades),
      sortinoRatio: calculateSortinoRatio(selectedTrades),
      calmarRatio: calculateCalmarRatio(selectedTrades),
      
      // Risk Warnings
      warnings: generateRiskWarnings(selectedTrades)
    };

    return analysis;
  };

  // Kelly Criterion Implementation
  const calculateKellyPosition = (trade) => {
    // Kelly = (bp - q) / b
    // b = odds (reward/risk ratio)
    // p = probability of winning
    // q = probability of losing (1-p)
    
    const winRate = getWinRateForStrategy(trade.strategy) || 0.55; // Default 55%
    const lossRate = 1 - winRate;
    const rewardRiskRatio = calculateRiskRewardRatio(trade);
    
    if (rewardRiskRatio <= 0) return 0;
    
    const kellyPercent = (winRate * rewardRiskRatio - lossRate) / rewardRiskRatio;
    
    // Cap Kelly at reasonable levels for options (max 25% of portfolio)
    return Math.max(0, Math.min(0.25, kellyPercent));
  };

  // Value at Risk Calculation
  const calculateVaR = (trade, confidence = 0.95) => {
    const volatility = (trade.iv || 30) / 100;
    const timeFrame = (trade.dte || 30) / 365;
    const price = parseFloat(trade.entryPrice?.replace('$', '')) || 100;
    
    // Monte Carlo approximation for VaR
    const zScore = confidence === 0.95 ? 1.645 : 2.33; // 95% or 99%
    const var95 = price * volatility * Math.sqrt(timeFrame) * zScore;
    
    return var95;
  };

  // Advanced Risk Metrics
  const getWinRateForStrategy = (strategy) => {
    const winRates = {
      'Long Call': 0.45, 'Long Put': 0.45,
      'Bull Call Spread': 0.65, 'Bear Put Spread': 0.65,
      'Iron Condor': 0.75, 'Iron Butterfly': 0.70,
      'Short Straddle': 0.80, 'Short Strangle': 0.75,
      'Jade Lizard': 0.70, 'Wheel Strategy': 0.85,
      'Covered Call': 0.75, 'Cash-Secured Put': 0.70
    };
    return winRates[strategy] || 0.55;
  };

  const calculateRiskRewardRatio = (trade) => {
    const maxReward = parseFloat(trade.maxReward?.replace(/[^0-9.-]/g, '')) || 0;
    const maxRisk = parseFloat(trade.maxRisk?.replace(/[^0-9.-]/g, '')) || 1;
    return maxReward / maxRisk || 1;
  };

  const getComplexityScore = (complexity) => {
    const scores = { 'Basic': 1, 'Intermediate': 2, 'Advanced': 3 };
    return scores[complexity] || 1;
  };

  const getLiquidityScore = (volume) => {
    if (volume > 5000) return 1; // High liquidity
    if (volume > 1000) return 2; // Medium liquidity
    return 3; // Low liquidity risk
  };

  const getVolatilityScore = (iv) => {
    if (iv < 20) return 1; // Low vol
    if (iv < 40) return 2; // Medium vol
    return 3; // High vol
  };

  const calculateExpectedReturn = (trade) => {
    const winRate = getWinRateForStrategy(trade.strategy);
    const riskReward = calculateRiskRewardRatio(trade);
    return (winRate * riskReward - (1 - winRate)) * 100; // Expected return %
  };

  const calculateDiversification = (trades) => {
    if (!trades.length) return 0;
    
    // Simple diversification score based on strategy variety
    const strategies = new Set(trades.map(t => t.strategy));
    const symbols = new Set(trades.map(t => t.symbol));
    
    return Math.min(100, (strategies.size * 20) + (symbols.size * 10));
  };

  const calculatePortfolioKelly = (trades) => {
    return trades.reduce((sum, trade) => sum + calculateKellyPosition(trade), 0);
  };

  const calculateMaxDrawdown = (trades) => {
    // Simplified max drawdown estimation
    const totalRisk = trades.reduce((sum, trade) => {
      const risk = parseFloat(trade.maxRisk?.replace(/[^0-9.-]/g, '')) || 0;
      return sum + risk;
    }, 0);
    return Math.min(50, totalRisk * 0.3); // Estimate 30% of total risk as max drawdown
  };

  const calculateSharpeRatio = (trades) => {
    const avgReturn = trades.reduce((sum, trade) => sum + calculateExpectedReturn(trade), 0) / trades.length;
    const returnVariance = trades.reduce((sum, trade) => {
      const ret = calculateExpectedReturn(trade);
      return sum + Math.pow(ret - avgReturn, 2);
    }, 0) / trades.length;
    const volatility = Math.sqrt(returnVariance);
    return volatility > 0 ? avgReturn / volatility : 0;
  };

  const calculateSortinoRatio = (trades) => {
    const avgReturn = trades.reduce((sum, trade) => sum + calculateExpectedReturn(trade), 0) / trades.length;
    const downside = trades.filter(trade => calculateExpectedReturn(trade) < 0);
    if (!downside.length) return avgReturn / 1; // No downside risk
    
    const downsideVariance = downside.reduce((sum, trade) => {
      return sum + Math.pow(calculateExpectedReturn(trade), 2);
    }, 0) / downside.length;
    
    return avgReturn / Math.sqrt(downsideVariance);
  };

  const calculateCalmarRatio = (trades) => {
    const avgReturn = trades.reduce((sum, trade) => sum + calculateExpectedReturn(trade), 0) / trades.length;
    const maxDD = calculateMaxDrawdown(trades);
    return maxDD > 0 ? avgReturn / maxDD : 0;
  };

  const generateRiskWarnings = (trades) => {
    const warnings = [];
    
    // Concentration Risk
    const symbols = {};
    trades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      symbols[symbol] = (symbols[symbol] || 0) + 1;
    });
    
    Object.entries(symbols).forEach(([symbol, count]) => {
      if (count > 3) {
        warnings.push({
          type: 'warning',
          message: `High concentration in ${symbol} (${count} positions)`
        });
      }
    });

    // Complexity Risk
    const complexTrades = trades.filter(t => getComplexityScore(t.complexity) >= 3);
    if (complexTrades.length > trades.length * 0.5) {
      warnings.push({
        type: 'error',
        message: 'Portfolio has high complexity risk - over 50% advanced strategies'
      });
    }

    // Liquidity Risk
    const lowLiqTrades = trades.filter(t => getLiquidityScore(t.volume) >= 3);
    if (lowLiqTrades.length > 2) {
      warnings.push({
        type: 'warning',
        message: 'Multiple positions with liquidity concerns'
      });
    }

    // Time Decay Risk (for options with high theta)
    const highThetaTrades = trades.filter(t => Math.abs(parseFloat(t.theta) || 0) > 0.05);
    if (highThetaTrades.length > trades.length * 0.6) {
      warnings.push({
        type: 'info',
        message: 'High time decay exposure - monitor theta closely'
      });
    }

    return warnings;
  };

  // Calculate position sizes based on Kelly and risk management
  const calculateOptimalPositionSizes = () => {
    if (!selectedTrades.length) return {};
    
    const analysis = calculateAdvancedRisk();
    const sizing = {};
    
    selectedTrades.forEach(trade => {
      const kelly = calculateKellyPosition(trade);
      const maxRiskPercent = maxPortfolioRisk / 100;
      
      // Use smaller of Kelly or max risk limit
      const optimalPercent = Math.min(kelly, maxRiskPercent);
      const dollarAmount = portfolioValue * optimalPercent;
      
      sizing[trade.symbol || trade.strategy] = {
        percentage: (optimalPercent * 100).toFixed(1),
        dollarAmount: dollarAmount.toFixed(0),
        contracts: Math.floor(dollarAmount / 100), // Rough contract estimate
        kelly: (kelly * 100).toFixed(1),
        riskAdjusted: (optimalPercent * 100).toFixed(1)
      };
    });
    
    return sizing;
  };

  useEffect(() => {
    if (selectedTrades.length > 0) {
      const analysis = calculateAdvancedRisk();
      setPortfolioAnalysis(analysis);
      
      const sizing = calculateOptimalPositionSizes();
      setPositionSizing(sizing);
    }
  }, [selectedTrades, maxPortfolioRisk, portfolioValue]);

  const handleRiskProfileChange = (event) => {
    const profile = event.target.value;
    setRiskProfile(profile);
    
    // Adjust max risk based on profile
    const riskLevels = {
      'conservative': 1,
      'moderate': 2,
      'moderate-aggressive': 3,
      'aggressive': 5
    };
    setMaxPortfolioRisk(riskLevels[profile] || 2);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🛡️ Advanced Risk Management
      </Typography>
      
      {/* Risk Profile Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Risk Configuration
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Risk Profile</InputLabel>
              <Select
                value={riskProfile}
                onChange={handleRiskProfileChange}
                label="Risk Profile"
              >
                <MenuItem value="conservative">Conservative</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="moderate-aggressive">Moderate-Aggressive</MenuItem>
                <MenuItem value="aggressive">Aggressive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Max Risk Per Trade: {maxPortfolioRisk}%</Typography>
            <Slider
              value={maxPortfolioRisk}
              onChange={(e, value) => setMaxPortfolioRisk(value)}
              min={0.5}
              max={10}
              step={0.5}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Portfolio Value"
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(Number(e.target.value))}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Risk Warnings */}
      {portfolioAnalysis?.warnings && portfolioAnalysis.warnings.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {portfolioAnalysis.warnings.map((warning, index) => (
            <Alert 
              key={index} 
              severity={warning.type} 
              sx={{ mb: 1 }}
              icon={<WarningIcon />}
            >
              {warning.message}
            </Alert>
          ))}
        </Box>
      )}

      {selectedTrades.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            📊 Select trades from the Market Opportunities tab to analyze portfolio risk
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Portfolio Risk Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📈 Portfolio Risk Metrics
                </Typography>
                {portfolioAnalysis && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {portfolioAnalysis.diversificationScore}
                        </Typography>
                        <Typography variant="body2">Diversification Score</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="secondary">
                          {portfolioAnalysis.sharpeRatio.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">Sharpe Ratio</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          {portfolioAnalysis.sortinoRatio.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">Sortino Ratio</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main">
                          {portfolioAnalysis.maxDrawdownRisk.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">Max Drawdown Risk</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Kelly Criterion Sizing */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Kelly Criterion Position Sizing
                </Typography>
                {Object.entries(positionSizing).map(([symbol, sizing]) => (
                  <Box key={symbol} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" fontWeight="bold">{symbol}</Typography>
                      <Chip 
                        label={`${sizing.percentage}%`} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Kelly: {sizing.kelly}% | Risk-Adj: {sizing.riskAdjusted}% | ${sizing.dollarAmount}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, parseFloat(sizing.percentage) * 5)} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Position Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Individual Position Risk Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Strategy</TableCell>
                        <TableCell align="right">Expected Return</TableCell>
                        <TableCell align="right">VaR (95%)</TableCell>
                        <TableCell align="right">Risk/Reward</TableCell>
                        <TableCell align="right">Kelly %</TableCell>
                        <TableCell align="right">Greeks Risk</TableCell>
                        <TableCell>Risk Scores</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolioAnalysis?.positions.map((position, index) => (
                        <TableRow key={index}>
                          <TableCell>{position.symbol}</TableCell>
                          <TableCell>{position.strategy}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${position.expectedReturn.toFixed(1)}%`}
                              color={position.expectedReturn > 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">${position.var95.toFixed(0)}</TableCell>
                          <TableCell align="right">{position.riskRewardRatio.toFixed(2)}</TableCell>
                          <TableCell align="right">{(position.kellySize * 100).toFixed(1)}%</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              Δ:{position.deltaRisk.toFixed(0)} θ:{position.thetaDecay.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Chip 
                                label={`C:${position.complexityScore}`} 
                                color={position.complexityScore > 2 ? 'warning' : 'success'}
                                size="small"
                              />
                              <Chip 
                                label={`L:${position.liquidityScore}`}
                                color={position.liquidityScore > 2 ? 'warning' : 'success'}
                                size="small"
                              />
                              <Chip 
                                label={`V:${position.volatilityScore}`}
                                color={position.volatilityScore > 2 ? 'warning' : 'success'}
                                size="small"
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}