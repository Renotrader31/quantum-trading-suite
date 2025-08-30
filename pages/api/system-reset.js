// System Reset API - Clear pipeline and ML data for fresh start
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resetType, confirmationCode } = req.body;

    // Security confirmation code required
    if (confirmationCode !== 'FRESH_START_CONFIRMED') {
      return res.status(400).json({
        success: false,
        error: 'Invalid confirmation code. Please confirm you want to reset all data.'
      });
    }

    console.log('🔄 Starting system reset:', resetType);

    const resetResults = {
      success: true,
      resetType: resetType,
      timestamp: new Date().toISOString(),
      operations: [],
      errors: []
    };

    // Define data file paths
    const dataFiles = {
      tradingPipeline: path.join(process.cwd(), 'data', 'recorded_trades.json'),
      mlLearning: path.join(process.cwd(), 'data', 'ml_learning.json'),
      activeTrades: path.join(process.cwd(), 'data', 'active_trades.json'),
      tradeHistory: path.join(process.cwd(), 'data', 'trade_history.json'),
      mlModel: path.join(process.cwd(), 'data', 'ml_model.json'),
      userPreferences: path.join(process.cwd(), 'data', 'user_preferences.json')
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Reset functions
    const resetOperations = {
      pipeline: async () => {
        // Clear trading pipeline data
        const emptyPipeline = {
          trades: [],
          totalTrades: 0,
          lastReset: new Date().toISOString(),
          metadata: {
            resetBy: 'system_reset',
            version: '1.0'
          }
        };
        
        fs.writeFileSync(dataFiles.tradingPipeline, JSON.stringify(emptyPipeline, null, 2));
        resetResults.operations.push('Trading Pipeline cleared');
      },

      ml: async () => {
        // Clear ML learning data
        const emptyML = {
          learningEntries: [],
          totalEntries: 0,
          modelStats: {
            accuracy: 0.0,
            totalTrades: 0,
            winRate: 0.0,
            lastTrained: null,
            strategyWeights: {
              ttm_squeeze: 1.0,
              options_flow: 1.0,
              gamma_exposure: 1.0,
              dark_pool: 1.0,
              technical_analysis: 1.0,
              unusual_activity: 1.0
            }
          },
          lastReset: new Date().toISOString(),
          metadata: {
            resetBy: 'system_reset',
            version: '1.0'
          }
        };
        
        fs.writeFileSync(dataFiles.mlLearning, JSON.stringify(emptyML, null, 2));
        resetResults.operations.push('ML Learning data cleared');
      },

      trades: async () => {
        // Clear active trades
        const emptyActiveTrades = {
          trades: [],
          lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(dataFiles.activeTrades, JSON.stringify(emptyActiveTrades, null, 2));
        resetResults.operations.push('Active trades cleared');
      },

      history: async () => {
        // Clear trade history
        const emptyHistory = {
          trades: [],
          totalTrades: 0,
          lastReset: new Date().toISOString(),
          metadata: {
            resetBy: 'system_reset',
            version: '1.0'
          }
        };
        
        fs.writeFileSync(dataFiles.tradeHistory, JSON.stringify(emptyHistory, null, 2));
        resetResults.operations.push('Trade history cleared');
      },

      model: async () => {
        // Reset ML model to default state
        const defaultModel = {
          version: '1.0',
          accuracy: 0.0,
          totalTrades: 0,
          winRate: 0.0,
          lastTrained: null,
          strategyWeights: {
            ttm_squeeze: 1.0,
            options_flow: 1.0,
            gamma_exposure: 1.0,
            dark_pool: 1.0,
            technical_analysis: 1.0,
            unusual_activity: 1.0
          },
          preferences: {},
          lastReset: new Date().toISOString(),
          metadata: {
            resetBy: 'system_reset',
            version: '1.0'
          }
        };
        
        fs.writeFileSync(dataFiles.mlModel, JSON.stringify(defaultModel, null, 2));
        resetResults.operations.push('ML model reset to defaults');
      },

      preferences: async () => {
        // Reset user preferences
        const defaultPreferences = {
          scanSettings: {
            autoRefresh: false,
            refreshInterval: 60,
            maxResults: 50
          },
          displaySettings: {
            theme: 'dark',
            compactMode: false
          },
          alertSettings: {
            enabled: true,
            minConfidence: 70
          },
          lastReset: new Date().toISOString()
        };
        
        fs.writeFileSync(dataFiles.userPreferences, JSON.stringify(defaultPreferences, null, 2));
        resetResults.operations.push('User preferences reset');
      }
    };

    // Execute reset operations based on resetType
    switch (resetType) {
      case 'complete':
        // Reset everything
        await resetOperations.pipeline();
        await resetOperations.ml();
        await resetOperations.trades();
        await resetOperations.history();
        await resetOperations.model();
        await resetOperations.preferences();
        resetResults.message = 'Complete system reset successful - all data cleared for fresh start';
        break;

      case 'pipeline_ml':
        // Reset only pipeline and ML data (most common)
        await resetOperations.pipeline();
        await resetOperations.ml();
        await resetOperations.model();
        resetResults.message = 'Pipeline and ML data reset successful - ready for fresh learning cycle';
        break;

      case 'pipeline_only':
        // Reset only pipeline data
        await resetOperations.pipeline();
        await resetOperations.trades();
        resetResults.message = 'Trading pipeline reset successful - trade history preserved';
        break;

      case 'ml_only':
        // Reset only ML data and model
        await resetOperations.ml();
        await resetOperations.model();
        resetResults.message = 'ML system reset successful - pipeline data preserved';
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid reset type. Options: complete, pipeline_ml, pipeline_only, ml_only'
        });
    }

    // Generate backup info
    resetResults.backup = {
      recommended: 'Consider backing up important data before reset',
      timestamp: new Date().toISOString(),
      filesAffected: resetResults.operations.length,
      nextSteps: [
        'All specified data has been cleared',
        'System is ready for fresh data collection',
        'Start scanning to begin new learning cycle',
        'ML will adapt to new trade patterns and preferences'
      ]
    };

    console.log(`✅ System reset complete: ${resetType} - ${resetResults.operations.length} operations`);

    return res.status(200).json(resetResults);

  } catch (error) {
    console.error('❌ System reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Reset operation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}