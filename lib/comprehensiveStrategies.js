import { OptionType, ActionType, MarketBias, RiskLevel } from '../types/strategyTypes.js';

/**
 * COMPREHENSIVE OPTIONS STRATEGIES SYSTEM
 * Fixes the systemic issue where strategy names don't match their actual trade setups
 */

// =============================================================================
// BULL STRATEGIES
// =============================================================================

export const bullCallSpread = {
  name: "Bull Call Spread",
  description: "Buy call + sell higher strike call",
  marketBias: MarketBias.BULLISH,
  riskLevel: RiskLevel.MODERATE,
  winRate: 65,
  bestFor: "Moderate bullish view with limited upside",
  
  generateLegs: function(params) {
    const { longStrike, shortStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    if (longStrike >= shortStrike) {
      throw new Error("Bull call spread requires long strike < short strike");
    }
    
    return [
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: longStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${longStrike} Call (long position)`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.CALL,
        strike: shortStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${shortStrike} Call (limit upside)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Buy ${params.longStrike} Call + Sell ${params.shortStrike} Call`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "+", gamma: "+", theta: "-", vega: "-" },
  aiReasoning: "🚀 BULLISH PLAY! Buy lower strike call, sell higher strike call for defined risk upside"
};

export const bullPutSpread = {
  name: "Bull Put Spread",
  description: "Sell put + buy lower strike put",
  marketBias: MarketBias.BULLISH,
  riskLevel: RiskLevel.MODERATE,
  winRate: 70,
  bestFor: "Moderate bullish view with income",
  
  generateLegs: function(params) {
    const { shortStrike, longStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    if (shortStrike <= longStrike) {
      throw new Error("Bull put spread requires short strike > long strike");
    }
    
    return [
      {
        action: ActionType.SELL,
        optionType: OptionType.PUT,
        strike: shortStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${shortStrike} Put (collect premium)`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: longStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${longStrike} Put (limit risk)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Sell ${params.shortStrike} Put + Buy ${params.longStrike} Put`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "+", gamma: "0", theta: "+", vega: "-" },
  aiReasoning: "💰 INCOME PLAY! Sell puts to collect premium with upward momentum"
};

// =============================================================================
// BEAR STRATEGIES
// =============================================================================

export const bearCallSpread = {
  name: "Bear Call Spread",
  description: "Sell call + buy higher strike call",
  marketBias: MarketBias.BEARISH,
  riskLevel: RiskLevel.MODERATE,
  winRate: 65,
  bestFor: "Moderate bearish view with income",
  
  generateLegs: function(params) {
    const { shortStrike, longStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    if (shortStrike >= longStrike) {
      throw new Error("Bear call spread requires short strike < long strike");
    }
    
    return [
      {
        action: ActionType.SELL,
        optionType: OptionType.CALL,
        strike: shortStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${shortStrike} Call (collect premium)`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: longStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${longStrike} Call (limit risk)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Sell ${params.shortStrike} Call + Buy ${params.longStrike} Call`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "-", gamma: "-", theta: "+", vega: "-" },
  aiReasoning: "📉 BEARISH INCOME! Sell calls to collect premium expecting downward movement"
};

export const bearPutSpread = {
  name: "Bear Put Spread",
  description: "Buy put + sell lower strike put",
  marketBias: MarketBias.BEARISH,
  riskLevel: RiskLevel.MODERATE,
  winRate: 65,
  bestFor: "Moderate bearish view with defined risk",
  
  generateLegs: function(params) {
    const { longStrike, shortStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    if (longStrike <= shortStrike) {
      throw new Error("Bear put spread requires long strike > short strike");
    }
    
    return [
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: longStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${longStrike} Put (long position)`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.PUT,
        strike: shortStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${shortStrike} Put (reduce cost)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Buy ${params.longStrike} Put + Sell ${params.shortStrike} Put`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "-", gamma: "+", theta: "-", vega: "-" },
  aiReasoning: "📉 BEARISH PLAY! Buy higher strike put, sell lower strike put for defined risk downside"
};

// =============================================================================
// VOLATILITY STRATEGIES
// =============================================================================

export const longStraddle = {
  name: "Long Straddle",
  description: "Buy call + buy put at same strike",
  marketBias: MarketBias.NEUTRAL,
  riskLevel: RiskLevel.MODERATE,
  winRate: 55,
  bestFor: "Expecting large move in either direction",
  
  generateLegs: function(params) {
    const { strike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    return [
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: strike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${strike} Call (upside)`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: strike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${strike} Put (downside)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Buy ${params.strike} Call + Buy ${params.strike} Put`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "~0", gamma: "+", theta: "-", vega: "+" },
  aiReasoning: "💥 VOLATILITY PLAY! Profit from large moves in either direction"
};

export const longStrangle = {
  name: "Long Strangle",
  description: "Buy call + buy put at different strikes",
  marketBias: MarketBias.NEUTRAL,
  riskLevel: RiskLevel.MODERATE,
  winRate: 50,
  bestFor: "Expecting large move, lower cost than straddle",
  
  generateLegs: function(params) {
    const { callStrike, putStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    return [
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: callStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${callStrike} Call (upside)`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: putStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${putStrike} Put (downside)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Buy ${params.callStrike} Call + Buy ${params.putStrike} Put`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "~0", gamma: "+", theta: "-", vega: "+" },
  aiReasoning: "⚡ LOWER COST VOLATILITY! Wider strikes for cheaper premium"
};

// =============================================================================
// NEUTRAL/ADVANCED STRATEGIES
// =============================================================================

export const ironCondor = {
  name: "Iron Condor",
  description: "Sell call spread + sell put spread",
  marketBias: MarketBias.NEUTRAL,
  riskLevel: RiskLevel.MODERATE,
  winRate: 60,
  bestFor: "Range-bound market with income generation",
  
  generateLegs: function(params) {
    const { 
      putSellStrike, 
      putBuyStrike, 
      callSellStrike, 
      callBuyStrike, 
      expiry = "30-45 DTE", 
      contracts = 1 
    } = params;
    
    return [
      {
        action: ActionType.SELL,
        optionType: OptionType.PUT,
        strike: putSellStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${putSellStrike} Put`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: putBuyStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${putBuyStrike} Put`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.CALL,
        strike: callSellStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${callSellStrike} Call`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: callBuyStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${callBuyStrike} Call`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Iron Condor: Sell ${params.putSellStrike}/${params.callSellStrike} Straddle + Buy ${params.putBuyStrike}/${params.callBuyStrike} Strangle`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "~0", gamma: "-", theta: "+", vega: "-" },
  aiReasoning: "🦅 NEUTRAL INCOME! Profit from low volatility and time decay in range-bound market"
};

export const ironButterfly = {
  name: "Iron Butterfly",
  description: "Sell straddle + buy strangle",
  marketBias: MarketBias.NEUTRAL,
  riskLevel: RiskLevel.MODERATE,
  winRate: 55,
  bestFor: "Pinning to strike price with income",
  
  generateLegs: function(params) {
    const { 
      centerStrike, 
      wingStrike1, 
      wingStrike2, 
      expiry = "30-45 DTE", 
      contracts = 1 
    } = params;
    
    return [
      {
        action: ActionType.BUY,
        optionType: OptionType.PUT,
        strike: wingStrike1,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${wingStrike1} Put (wing)`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.PUT,
        strike: centerStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${centerStrike} Put (body)`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.CALL,
        strike: centerStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${centerStrike} Call (body)`
      },
      {
        action: ActionType.BUY,
        optionType: OptionType.CALL,
        strike: wingStrike2,
        quantity: contracts,
        expiry: expiry,
        description: `Buy ${wingStrike2} Call (wing)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    const legs = this.generateLegs(params);
    return {
      action: `Iron Butterfly: Sell ${params.centerStrike} Straddle + Buy ${params.wingStrike1}/${params.wingStrike2} Strangle`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: legs.map(leg => 
        `${leg.action.toUpperCase()} ${leg.strike} ${leg.optionType.toUpperCase()}`
      ).join(" + ")
    };
  },
  
  greeks: { delta: "~0", gamma: "-", theta: "+", vega: "-" },
  aiReasoning: "🦋 PINPOINT PLAY! Maximum profit if price stays exactly at center strike"
};

// =============================================================================
// INCOME STRATEGIES
// =============================================================================

export const coveredCall = {
  name: "Covered Call",
  description: "Own stock + sell call",
  marketBias: MarketBias.NEUTRAL,
  riskLevel: RiskLevel.LOW,
  winRate: 75,
  bestFor: "Income generation on stock holdings",
  
  generateLegs: function(params) {
    const { stockShares = 100, callStrike, expiry = "30-45 DTE", contracts = 1 } = params;
    
    return [
      {
        action: ActionType.BUY,
        optionType: "STOCK",
        strike: "N/A",
        quantity: stockShares,
        expiry: "N/A",
        description: `Own ${stockShares} shares (long stock)`
      },
      {
        action: ActionType.SELL,
        optionType: OptionType.CALL,
        strike: callStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${callStrike} Call (income)`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    return {
      action: `Own Stock + Sell ${params.callStrike} Call`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: `OWN STOCK + SELL ${params.callStrike} CALL`
    };
  },
  
  greeks: { delta: "+", gamma: "-", theta: "+", vega: "-" },
  aiReasoning: "💰 INCOME GENERATOR! Collect premium on stock you already own"
};

export const cashSecuredPut = {
  name: "Cash-Secured Put",
  description: "Sell put with cash backing",
  marketBias: MarketBias.BULLISH,
  riskLevel: RiskLevel.MODERATE,
  winRate: 70,
  bestFor: "Income while willing to buy stock",
  
  generateLegs: function(params) {
    const { putStrike, expiry = "30-45 DTE", contracts = 1, cashRequired } = params;
    
    return [
      {
        action: ActionType.SELL,
        optionType: OptionType.PUT,
        strike: putStrike,
        quantity: contracts,
        expiry: expiry,
        description: `Sell ${putStrike} Put (collect premium)`
      },
      {
        action: "CASH_BACKING",
        optionType: "CASH",
        strike: "N/A",
        quantity: cashRequired || (putStrike * 100 * contracts),
        expiry: "N/A",
        description: `Cash secured: $${cashRequired || (putStrike * 100 * contracts)}`
      }
    ];
  },
  
  formatTradeSetup: function(params) {
    return {
      action: `Sell ${params.putStrike} Put (Cash-Secured)`,
      expiry: params.expiry || "30-45 DTE",
      contracts: params.contracts || 1,
      legs: `SELL ${params.putStrike} PUT + CASH BACKING`
    };
  },
  
  greeks: { delta: "-", gamma: "-", theta: "+", vega: "-" },
  aiReasoning: "💵 CASH INCOME! Collect premium while prepared to buy stock at discount"
};

// =============================================================================
// STRATEGY REGISTRY
// =============================================================================

export const ALL_STRATEGIES = {
  bullCallSpread,
  bullPutSpread,
  bearCallSpread,
  bearPutSpread,
  longStraddle,
  longStrangle,
  ironCondor,
  ironButterfly,
  coveredCall,
  cashSecuredPut
};

export const getStrategyByName = (name) => {
  const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const [key, strategy] of Object.entries(ALL_STRATEGIES)) {
    const strategyName = strategy.name.toLowerCase().replace(/[^a-z]/g, '');
    if (strategyName === normalizedName) {
      return strategy;
    }
  }
  
  throw new Error(`Strategy "${name}" not found`);
};

// Strategy name mapping for backward compatibility
export const STRATEGY_NAME_MAP = {
  'straddle': 'longStraddle',
  'strangle': 'longStrangle', 
  'callSpread': 'bullCallSpread',
  'putSpread': 'bullPutSpread',
  'bearCallSpread': 'bearCallSpread',
  'bearPutSpread': 'bearPutSpread',
  'ironCondor': 'ironCondor',
  'butterfly': 'ironButterfly',
  'ironButterfly': 'ironButterfly',
  'coveredCall': 'coveredCall',
  'cashSecuredPut': 'cashSecuredPut'
};

export default ALL_STRATEGIES;