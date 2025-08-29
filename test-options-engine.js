/**
 * Test script for OptionsStrategyEngine
 */

const OptionsStrategyEngine = require('./lib/OptionsStrategyEngine.js').default;

async function testEngine() {
  console.log('🧪 Testing OptionsStrategyEngine...');
  
  const engine = new OptionsStrategyEngine();
  
  const testStockData = {
    symbol: 'NVDA',
    price: 875.30,
    flow: 'VERY_BULLISH',
    sentiment: 'STRONG_POSITIVE',
    iv: 42,
    volume: 8900
  };
  
  const testMarketConditions = {
    sentiment: 'bullish',
    volatility: 'high',
    trend: 'uptrend',
    ivRank: 75
  };
  
  try {
    console.log('📊 Calling analyzeStrategies...');
    const result = await engine.analyzeStrategies(testStockData, testMarketConditions);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEngine();