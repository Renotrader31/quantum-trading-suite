// Configuration API for trading settings
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, config } = req.body;

    if (action === 'updateConfig') {
      // Validate configuration
      const errors = [];
      if (!config) {
        errors.push('Configuration object is required');
      } else {
        if (config.maxPositionSize <= 0) errors.push('Max position size must be positive');
        if (config.stopLossPercent < 0 || config.stopLossPercent > 100) errors.push('Stop loss must be 0-100%');
        if (config.takeProfitPercent < 0) errors.push('Take profit must be positive');
        if (config.maxDailyTrades < 1) errors.push('Max daily trades must be at least 1');
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: errors 
        });
      }

      // In a real app, save to database
      console.log('Configuration updated:', config);

      return res.status(200).json({
        success: true,
        message: 'Configuration updated successfully',
        config: config,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Configuration API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
