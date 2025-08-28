// API endpoint to record trade entries from SqueezeScanner
import { TradeTracker } from '../../lib/tradeTracker.js';
import fs from 'fs';
import path from 'path';

// Server-side persistent storage for TradeTracker
const STORAGE_FILE = path.join(process.cwd(), 'trade-tracker-data.json');

// Global trade tracker instance
let globalTradeTracker;

// Initialize server-side trade tracker with file persistence
function initializeTradeTracker() {
  if (!globalTradeTracker) {
    globalTradeTracker = new TradeTracker();
    
    // Override storage methods to use file system
    globalTradeTracker.saveToStorage = function() {
      try {
        const data = {
          activeTrades: Array.from(this.activeTrades.entries()),
          completedTrades: Array.from(this.completedTrades.entries())
        };
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Trade tracker saved to file');
      } catch (error) {
        console.error('Error saving trade tracker to file:', error);
      }
    };
    
    globalTradeTracker.loadFromStorage = function() {
      try {
        if (fs.existsSync(STORAGE_FILE)) {
          const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
          this.activeTrades = new Map(data.activeTrades || []);
          this.completedTrades = new Map(data.completedTrades || []);
          console.log(`📊 Trade Tracker Loaded from file: ${this.activeTrades.size} active, ${this.completedTrades.size} completed`);
        }
      } catch (error) {
        console.error('Error loading trade tracker from file:', error);
      }
    };
    
    // Load existing data
    globalTradeTracker.loadFromStorage();
  }
  return globalTradeTracker;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, tradeData, tradeId, outcomeData } = req.body;

    // Initialize persistent trade tracker
    const tradeTracker = initializeTradeTracker();

    if (action === 'recordEntry') {
      // Record a new trade entry
      const newTradeId = tradeTracker.recordTradeEntry(tradeData);
      
      res.status(200).json({
        success: true,
        message: 'Trade entry recorded successfully',
        tradeId: newTradeId,
        activeTrades: tradeTracker.getActiveTrades().length,
        completedTrades: tradeTracker.getCompletedTrades().length
      });

    } else if (action === 'recordOutcome') {
      // Record trade outcome and get ML training data
      const mlTrainingData = tradeTracker.recordTradeOutcome(tradeId, outcomeData);
      
      res.status(200).json({
        success: true,
        message: 'Trade outcome recorded successfully',
        mlTrainingData: mlTrainingData,
        activeTrades: tradeTracker.getActiveTrades().length,
        completedTrades: tradeTracker.getCompletedTrades().length
      });

    } else if (action === 'getActiveTrades') {
      // Get current active trades
      const activeTrades = tradeTracker.getActiveTrades();
      
      res.status(200).json({
        success: true,
        activeTrades: activeTrades,
        performanceStats: tradeTracker.getPerformanceStats()
      });

    } else if (action === 'getPerformance') {
      // Get performance statistics
      const performanceStats = tradeTracker.getPerformanceStats();
      const strategyStats = tradeTracker.getStrategyPerformance();
      
      res.status(200).json({
        success: true,
        performanceStats: performanceStats,
        strategyStats: strategyStats,
        completedTrades: tradeTracker.getCompletedTrades(10)
      });

    } else if (action === 'debug') {
      // Debug action to see what's in storage
      const activeTrades = tradeTracker.getActiveTrades();
      const completedTrades = tradeTracker.getCompletedTrades();
      
      res.status(200).json({
        success: true,
        debug: {
          activeTradesCount: activeTrades.length,
          completedTradesCount: completedTrades.length,
          activeTrades: activeTrades,
          completedTrades: completedTrades,
          storageFile: STORAGE_FILE,
          fileExists: fs.existsSync(STORAGE_FILE)
        }
      });

    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Use: recordEntry, recordOutcome, getActiveTrades, getPerformance, or debug'
      });
    }

  } catch (error) {
    console.error('Trade tracking error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}