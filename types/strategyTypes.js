// Options Strategy Types and Enums

export const OptionType = {
  CALL: 'call',
  PUT: 'put'
};

export const ActionType = {
  BUY: 'buy',
  SELL: 'sell'
};

export const MarketBias = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral'
};

export const RiskLevel = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  AGGRESSIVE: 'aggressive'
};

export default {
  OptionType,
  ActionType,
  MarketBias,
  RiskLevel
};