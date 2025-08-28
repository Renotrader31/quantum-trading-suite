// Options Strategy Types and Enums - CommonJS for Next.js compatibility

const OptionType = {
  CALL: 'call',
  PUT: 'put'
};

const ActionType = {
  BUY: 'buy',
  SELL: 'sell'
};

const MarketBias = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral'
};

const RiskLevel = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  AGGRESSIVE: 'aggressive'
};

module.exports = {
  OptionType,
  ActionType,
  MarketBias,
  RiskLevel
};