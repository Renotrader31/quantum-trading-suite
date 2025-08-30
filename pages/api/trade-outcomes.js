/**
 * 🎯 TRADE OUTCOMES API v3.0
 * 
 * This API handles the complete trade lifecycle:
 * 1. Records when trades are executed
 * 2. Tracks ongoing trade progress
 * 3. Records final trade outcomes (win/loss/breakeven)
 * 4. Feeds results back to ML learning system
 * 5. Updates strategy performance metrics
 * 
 * This is the critical feedback loop that makes the system smarter
 */

import IntelligentMLEngine from '../../lib/IntelligentMLEngine.js';
import fs from 'fs';
import path from 'path';

let mlEngine;

// Initialize ML engine
function getMLEngine() {
  if (!mlEngine) {
    mlEngine = new IntelligentMLEngine();
  }
  return mlEngine;
}

export default async function handler(req, res) {
  console.log('\n=== TRADE OUTCOMES API ===');
  console.log('Method:', req.method);
  console.log('Action:', req.body?.action);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, tradeData, outcomeData } = req.body;
  const engine = getMLEngine();

  try {
    switch (action) {
      case 'recordEntry':
        return await handleTradeEntry(req, res, engine, tradeData);
      
      case 'updateProgress':
        return await handleProgressUpdate(req, res, engine, tradeData);
      
      case 'recordOutcome':
        return await handleTradeOutcome(req, res, engine, outcomeData);
      
      case 'getActiveTrades':
        return await handleGetActiveTrades(req, res, engine);
      
      case 'getTradeHistory':
        return await handleGetTradeHistory(req, res, engine);
      
      case 'getPerformanceStats':
        return await handleGetPerformanceStats(req, res, engine);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unknown action: ${action}` 
        });
    }
  } catch (error) {
    console.error('❌ Trade Outcomes API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle new trade entry
async function handleTradeEntry(req, res, engine, tradeData) {
  console.log(`📋 Recording new trade entry: ${tradeData.symbol} - ${tradeData.strategy}`);
  
  try {
    // Record the trade in ML engine
    const tradeId = engine.recordUserSelection(tradeData);
    
    // Also record in active trades for tracking
    const activeTradesPath = path.join(process.cwd(), 'active-trades.json');
    let activeTrades = [];
    
    if (fs.existsSync(activeTradesPath)) {
      const data = fs.readFileSync(activeTradesPath, 'utf8');
      activeTrades = JSON.parse(data);
    }
    
    const newActiveTrade = {
      id: tradeId,
      symbol: tradeData.symbol,
      strategy: tradeData.strategy,
      entryDate: new Date().toISOString().split('T')[0],
      entryPrice: tradeData.entryPrice || 0,
      detectedBy: tradeData.detectedBy || [],
      aiScore: tradeData.aiScore || 0,
      strategyScores: tradeData.strategyScores || {},
      
      // Position details
      positionSize: tradeData.positionSize || 1,
      maxLoss: tradeData.maxLoss || 0,
      maxGain: tradeData.maxGain || 0,
      stopLoss: tradeData.stopLoss || 0,
      targetPrice: tradeData.targetPrice || 0,
      
      // Tracking fields
      currentPrice: tradeData.entryPrice || 0,
      currentReturn: 0,
      status: 'active',
      daysHeld: 0,
      lastUpdated: new Date().toISOString(),
      
      // ML context for future learning
      marketConditions: tradeData.marketConditions || {},
      neuralNetworkPrediction: tradeData.neuralNetworkPrediction || 0,
      
      // Notes
      entryNotes: tradeData.entryNotes || '',
      tags: tradeData.tags || []
    };
    
    activeTrades.push(newActiveTrade);
    fs.writeFileSync(activeTradesPath, JSON.stringify(activeTrades, null, 2));
    
    console.log(`✅ Trade entry recorded: ${tradeId}`);
    
    return res.json({
      success: true,
      message: 'Trade entry recorded successfully',
      tradeId: tradeId,
      activeTrades: activeTrades.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error recording trade entry:', error);
    throw error;
  }
}

// Handle trade progress update
async function handleProgressUpdate(req, res, engine, tradeData) {
  console.log(`📊 Updating trade progress: ${tradeData.tradeId}`);
  
  try {
    const activeTradesPath = path.join(process.cwd(), 'active-trades.json');
    
    if (!fs.existsSync(activeTradesPath)) {
      throw new Error('No active trades file found');
    }
    
    const data = fs.readFileSync(activeTradesPath, 'utf8');
    let activeTrades = JSON.parse(data);
    
    const tradeIndex = activeTrades.findIndex(t => t.id === tradeData.tradeId);
    if (tradeIndex === -1) {
      throw new Error(`Trade ${tradeData.tradeId} not found`);
    }
    
    const trade = activeTrades[tradeIndex];
    
    // Update current status
    trade.currentPrice = tradeData.currentPrice || trade.currentPrice;
    trade.currentReturn = tradeData.currentReturn || 
      ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
    trade.daysHeld = Math.floor(
      (new Date() - new Date(trade.entryDate)) / (1000 * 60 * 60 * 24)
    );
    trade.lastUpdated = new Date().toISOString();
    
    // Update any other fields provided
    if (tradeData.notes) trade.notes = tradeData.notes;
    if (tradeData.stopLoss) trade.stopLoss = tradeData.stopLoss;
    if (tradeData.targetPrice) trade.targetPrice = tradeData.targetPrice;
    
    activeTrades[tradeIndex] = trade;
    fs.writeFileSync(activeTradesPath, JSON.stringify(activeTrades, null, 2));
    
    console.log(`✅ Trade progress updated: ${trade.symbol} - ${trade.currentReturn.toFixed(2)}%`);
    
    return res.json({
      success: true,
      message: 'Trade progress updated',
      trade: trade,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating trade progress:', error);
    throw error;
  }
}

// Handle final trade outcome
async function handleTradeOutcome(req, res, engine, outcomeData) {
  console.log(`🏁 Recording trade outcome: ${outcomeData.tradeId} - ${outcomeData.outcome}`);
  
  try {
    const activeTradesPath = path.join(process.cwd(), 'active-trades.json');
    
    if (!fs.existsSync(activeTradesPath)) {
      throw new Error('No active trades file found');
    }
    
    const data = fs.readFileSync(activeTradesPath, 'utf8');
    let activeTrades = JSON.parse(data);
    
    const tradeIndex = activeTrades.findIndex(t => t.id === outcomeData.tradeId);
    if (tradeIndex === -1) {
      throw new Error(`Trade ${outcomeData.tradeId} not found`);
    }
    
    const trade = activeTrades[tradeIndex];
    
    // Calculate final metrics
    const exitPrice = outcomeData.exitPrice || trade.currentPrice;
    const returnPercentage = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    const daysHeld = Math.floor(
      (new Date() - new Date(trade.entryDate)) / (1000 * 60 * 60 * 24)
    );
    
    // Determine success based on return
    const success = outcomeData.success !== undefined ? 
      outcomeData.success : 
      returnPercentage > (outcomeData.successThreshold || 0);
    
    const outcome = {
      exitPrice: exitPrice,
      return: returnPercentage,
      daysHeld: daysHeld,
      success: success,
      outcome: success ? 'win' : (returnPercentage > -2 ? 'breakeven' : 'loss'),
      exitReason: outcomeData.exitReason || 'manual',
      exitNotes: outcomeData.exitNotes || ''
    };
    
    // Feed outcome to ML learning system
    engine.recordTradeOutcome(trade.id, outcome);
    
    // Move trade from active to completed
    const completedTrade = {
      ...trade,
      ...outcome,
      completedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    // Remove from active trades
    activeTrades.splice(tradeIndex, 1);
    fs.writeFileSync(activeTradesPath, JSON.stringify(activeTrades, null, 2));
    
    // Add to completed trades history
    const completedTradesPath = path.join(process.cwd(), 'completed-trades.json');
    let completedTrades = [];
    
    if (fs.existsSync(completedTradesPath)) {
      const completedData = fs.readFileSync(completedTradesPath, 'utf8');
      completedTrades = JSON.parse(completedData);
    }
    
    completedTrades.push(completedTrade);
    fs.writeFileSync(completedTradesPath, JSON.stringify(completedTrades, null, 2));
    
    // Get updated ML stats
    const mlStats = engine.getModelStats();
    
    console.log(`✅ Trade outcome recorded: ${trade.symbol} - ${returnPercentage.toFixed(2)}% - ${success ? 'WIN' : 'LOSS'}`);
    console.log(`📊 Updated ML stats: ${mlStats.totalTrades} trades, ${(mlStats.winRate * 100).toFixed(1)}% win rate`);
    
    return res.json({
      success: true,
      message: 'Trade outcome recorded successfully',
      completedTrade: completedTrade,
      mlStats: {
        totalTrades: mlStats.totalTrades,
        winRate: mlStats.winRate,
        accuracy: mlStats.accuracy,
        recentWinRate: mlStats.recentWinRate
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error recording trade outcome:', error);
    throw error;
  }
}

// Get active trades
async function handleGetActiveTrades(req, res, engine) {
  try {
    const activeTradesPath = path.join(process.cwd(), 'active-trades.json');
    
    if (!fs.existsSync(activeTradesPath)) {
      return res.json({
        success: true,
        trades: [],
        count: 0
      });
    }
    
    const data = fs.readFileSync(activeTradesPath, 'utf8');
    const activeTrades = JSON.parse(data);
    
    // Update days held for each trade
    const updatedTrades = activeTrades.map(trade => ({
      ...trade,
      daysHeld: Math.floor(
        (new Date() - new Date(trade.entryDate)) / (1000 * 60 * 60 * 24)
      )
    }));
    
    return res.json({
      success: true,
      trades: updatedTrades,
      count: updatedTrades.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting active trades:', error);
    throw error;
  }
}

// Get trade history
async function handleGetTradeHistory(req, res, engine) {
  try {
    const completedTradesPath = path.join(process.cwd(), 'completed-trades.json');
    
    if (!fs.existsSync(completedTradesPath)) {
      return res.json({
        success: true,
        trades: [],
        count: 0,
        stats: {}
      });
    }
    
    const data = fs.readFileSync(completedTradesPath, 'utf8');
    const completedTrades = JSON.parse(data);
    
    // Calculate basic stats
    const totalTrades = completedTrades.length;
    const winningTrades = completedTrades.filter(t => t.success).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    const avgReturn = totalTrades > 0 ? 
      completedTrades.reduce((sum, t) => sum + (t.return || 0), 0) / totalTrades : 0;
    const totalReturn = completedTrades.reduce((sum, t) => sum + (t.return || 0), 0);
    
    // Get recent trades (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrades = completedTrades.filter(t => 
      new Date(t.completedAt || t.entryDate) >= thirtyDaysAgo
    );
    
    return res.json({
      success: true,
      trades: completedTrades.slice(-50), // Last 50 trades
      recentTrades: recentTrades,
      count: totalTrades,
      stats: {
        totalTrades,
        winningTrades,
        winRate,
        avgReturn,
        totalReturn,
        recentTradesCount: recentTrades.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting trade history:', error);
    throw error;
  }
}

// Get performance statistics
async function handleGetPerformanceStats(req, res, engine) {
  try {
    const mlStats = engine.getModelStats();
    
    // Get completed trades for additional analysis
    const completedTradesPath = path.join(process.cwd(), 'completed-trades.json');
    let completedTrades = [];
    
    if (fs.existsSync(completedTradesPath)) {
      const data = fs.readFileSync(completedTradesPath, 'utf8');
      completedTrades = JSON.parse(data);
    }
    
    // Strategy performance analysis
    const strategyStats = {};
    completedTrades.forEach(trade => {
      if (trade.detectedBy && Array.isArray(trade.detectedBy)) {
        trade.detectedBy.forEach(strategy => {
          if (!strategyStats[strategy]) {
            strategyStats[strategy] = {
              trades: 0,
              wins: 0,
              totalReturn: 0,
              avgReturn: 0,
              winRate: 0
            };
          }
          
          const stats = strategyStats[strategy];
          stats.trades++;
          if (trade.success) stats.wins++;
          stats.totalReturn += trade.return || 0;
          stats.avgReturn = stats.totalReturn / stats.trades;
          stats.winRate = stats.wins / stats.trades;
        });
      }
    });
    
    // Monthly performance
    const monthlyStats = {};
    completedTrades.forEach(trade => {
      const month = new Date(trade.completedAt || trade.entryDate).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          trades: 0,
          wins: 0,
          totalReturn: 0,
          winRate: 0
        };
      }
      
      const stats = monthlyStats[month];
      stats.trades++;
      if (trade.success) stats.wins++;
      stats.totalReturn += trade.return || 0;
      stats.winRate = stats.wins / stats.trades;
    });
    
    return res.json({
      success: true,
      mlStats: mlStats,
      strategyStats: strategyStats,
      monthlyStats: monthlyStats,
      totalCompletedTrades: completedTrades.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting performance stats:', error);
    throw error;
  }
}