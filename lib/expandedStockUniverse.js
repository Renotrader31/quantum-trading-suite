// 🎯 PRIORITY #4: Expanded Stock Universe for Enhanced ML Training
// Comprehensive stock universe across sectors, market caps, and volatility profiles

export class ExpandedStockUniverse {
  constructor() {
    this.stockUniverse = {
      // 🏛️ Major ETFs & Index Funds (High liquidity, diverse exposure)
      etfs: [
        'SPY', 'QQQ', 'IWM', 'EFA', 'EEM', 'VTI', 'VEA', 'VWO', 'AGG', 'LQD',
        'HYG', 'IEMG', 'GLD', 'SLV', 'USO', 'UNG', 'XLF', 'XLE', 'XLK', 'XLV',
        'XLI', 'XLP', 'XLRE', 'XLB', 'XLU', 'ARKK', 'ARKQ', 'ARKG', 'SQQQ', 'TQQQ'
      ],

      // 💻 Technology (High growth, high volatility)
      technology: [
        'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'CRM',
        'ORCL', 'ADBE', 'INTC', 'AMD', 'CSCO', 'AVGO', 'TXN', 'QCOM', 'INTU', 'NOW',
        'SNOW', 'PLTR', 'RBLX', 'COIN', 'HOOD', 'ZM', 'UBER', 'LYFT', 'ABNB', 'DOCU',
        'TWLO', 'OKTA', 'DDOG', 'CRWD', 'ZS', 'NET', 'FSLY', 'ESTC', 'SPLK', 'MDB'
      ],

      // 🏥 Healthcare & Biotech (Moderate volatility, event-driven)
      healthcare: [
        'JNJ', 'PFE', 'UNH', 'MRK', 'ABBV', 'TMO', 'DHR', 'ABT', 'LLY', 'BMY',
        'AMGN', 'GILD', 'REGN', 'VRTX', 'BIIB', 'MRNA', 'BNTX', 'NVAX', 'PFE', 'ZTS',
        'ISRG', 'DXCM', 'VEEV', 'ILMN', 'PTON', 'TDOC', 'CRSP', 'EDIT', 'NTLA', 'BEAM'
      ],

      // 🏦 Financial Services (Interest rate sensitive)
      financial: [
        'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'USB', 'PNC', 'TFC', 'COF',
        'AXP', 'V', 'MA', 'PYPL', 'SQ', 'AFRM', 'SOFI', 'LC', 'UPST', 'ALLY',
        'BRK.A', 'BRK.B', 'BLK', 'SPGI', 'ICE', 'CME', 'NDAQ', 'MCO', 'AJG', 'MMC'
      ],

      // 🏭 Industrial & Manufacturing (Economic cycle sensitive)
      industrial: [
        'BA', 'CAT', 'DE', 'GE', 'HON', 'UPS', 'FDX', 'LMT', 'RTX', 'NOC',
        'MMM', 'EMR', 'ETN', 'PH', 'ROK', 'ITW', 'CSX', 'UNP', 'NSC', 'ODFL',
        'WM', 'RSG', 'WCN', 'FAST', 'PCAR', 'CMI', 'OTIS', 'CARR', 'TT', 'IR'
      ],

      // 🛒 Consumer & Retail (Consumer sentiment driven)
      consumer: [
        'AMZN', 'WMT', 'HD', 'TGT', 'COST', 'LOW', 'MCD', 'SBUX', 'NKE', 'DIS',
        'NFLX', 'CMG', 'YUM', 'QSR', 'DKNG', 'PENN', 'MGM', 'WYNN', 'LVS', 'CZR',
        'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'BYDDY', 'TM', 'HMC'
      ],

      // ⚡ Energy & Utilities (Commodity driven)
      energy: [
        'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'VLO', 'PSX', 'OXY', 'KMI',
        'WMB', 'EPD', 'ET', 'MPLX', 'NEE', 'SO', 'DUK', 'D', 'AEP', 'EXC',
        'SRE', 'PEG', 'ED', 'FE', 'PPL', 'ES', 'CMS', 'CNP', 'NI', 'EVRG'
      ],

      // 🏠 Real Estate & REITs (Interest rate sensitive)
      realestate: [
        'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'CSGP', 'SPG',
        'VICI', 'AVB', 'EQR', 'MAA', 'ESS', 'UDR', 'CPT', 'SBAC', 'EXR', 'FRT'
      ],

      // 🧪 Materials & Chemicals (Commodity cycle sensitive)
      materials: [
        'LIN', 'APD', 'ECL', 'SHW', 'FCX', 'NEM', 'GOLD', 'BHP', 'RIO', 'VALE',
        'DOW', 'DD', 'LYB', 'CF', 'MOS', 'FMC', 'ALB', 'IFF', 'CE', 'VMC'
      ],

      // 📱 Communication Services (Content & connectivity)
      communications: [
        'GOOGL', 'META', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'CHTR', 'TMUS', 'DISH',
        'TWTR', 'SNAP', 'PINS', 'ROKU', 'SPOT', 'MTCH', 'ZG', 'ZILLOW', 'YELP', 'TRIP'
      ],

      // 🔬 Emerging & Speculative (High volatility, growth potential)
      emerging: [
        'SPCE', 'OPEN', 'WISH', 'CLOV', 'BB', 'AMC', 'GME', 'MVIS', 'TLRY', 'ACB',
        'CGC', 'SNDL', 'PLBY', 'RIDE', 'NKLA', 'GOEV', 'HYLN', 'WKHS', 'FSR', 'PSNY'
      ],

      // 🌍 International ADRs (Geographic diversification)
      international: [
        'BABA', 'JD', 'PDD', 'BIDU', 'NTES', 'TME', 'BILI', 'IQ', 'VIPS', 'WB',
        'ASML', 'TSM', 'UMC', 'ASX', 'SAP', 'SHOP', 'SE', 'GRAB', 'DIDI', 'NIO'
      ]
    };

    // Create flat array of all symbols
    this.allSymbols = Object.values(this.stockUniverse).flat();
    
    // Remove duplicates
    this.allSymbols = [...new Set(this.allSymbols)];
    
    console.log(`📊 Expanded Universe: ${this.allSymbols.length} total symbols across ${Object.keys(this.stockUniverse).length} sectors`);
  }

  // Get symbols by category
  getByCategory(category) {
    return this.stockUniverse[category] || [];
  }

  // Get diverse sampling across all categories
  getDiversifiedSample(count = 50) {
    const sample = [];
    const categories = Object.keys(this.stockUniverse);
    const samplesPerCategory = Math.floor(count / categories.length);
    const remainder = count % categories.length;

    categories.forEach((category, index) => {
      const categorySymbols = this.stockUniverse[category];
      const sampleSize = samplesPerCategory + (index < remainder ? 1 : 0);
      
      // Randomly sample from each category
      const shuffled = [...categorySymbols].sort(() => 0.5 - Math.random());
      sample.push(...shuffled.slice(0, Math.min(sampleSize, categorySymbols.length)));
    });

    return sample.slice(0, count);
  }

  // Get high-volatility subset for options trading
  getHighVolatilitySubset(count = 30) {
    const highVolSymbols = [
      ...this.stockUniverse.technology.slice(10), // Emerging tech
      ...this.stockUniverse.emerging,
      ...this.stockUniverse.healthcare.slice(10), // Biotech
      'TSLA', 'AMD', 'NVDA', 'COIN', 'RBLX', 'ARKK'
    ];

    return [...new Set(highVolSymbols)].slice(0, count);
  }

  // Get stable, high-liquidity subset
  getStableSubset(count = 20) {
    const stableSymbols = [
      ...this.stockUniverse.etfs.slice(0, 10),
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'JPM', 'JNJ', 'PG', 'KO', 'WMT', 'V'
    ];

    return [...new Set(stableSymbols)].slice(0, count);
  }

  // Smart sampling based on market conditions
  getAdaptiveSample(marketConditions = {}) {
    const { volatilityRegime = 'normal', sector = 'balanced', riskTolerance = 'moderate' } = marketConditions;
    
    let sample = [];

    if (volatilityRegime === 'high') {
      sample = this.getStableSubset(30).concat(this.getHighVolatilitySubset(20));
    } else if (volatilityRegime === 'low') {
      sample = this.getHighVolatilitySubset(40).concat(this.getStableSubset(10));
    } else {
      sample = this.getDiversifiedSample(50);
    }

    // Add sector focus if specified
    if (sector !== 'balanced' && this.stockUniverse[sector]) {
      const sectorSymbols = this.stockUniverse[sector].slice(0, 15);
      sample = [...new Set([...sectorSymbols, ...sample])].slice(0, 60);
    }

    return sample;
  }

  // Get all symbols with metadata
  getAllWithMetadata() {
    return Object.entries(this.stockUniverse).map(([sector, symbols]) => ({
      sector,
      symbols,
      count: symbols.length
    }));
  }

  // Performance tracking for ML refinement
  getSymbolsByPerformance(performanceData = {}) {
    // Sort symbols by historical ML success rate
    const performanceMetrics = Object.entries(performanceData)
      .sort(([,a], [,b]) => (b.winRate || 0) - (a.winRate || 0))
      .map(([symbol]) => symbol);

    // Mix top performers with random sampling for diversity
    const topPerformers = performanceMetrics.slice(0, 20);
    const randomSample = this.getDiversifiedSample(30);
    
    return [...new Set([...topPerformers, ...randomSample])];
  }

  // Get symbols for testing new strategies
  getTestingUniverse(count = 25) {
    // Focus on liquid, well-known symbols for strategy testing
    const testingSymbols = [
      ...this.stockUniverse.etfs.slice(0, 8),
      ...this.stockUniverse.technology.slice(0, 10),
      ...this.stockUniverse.financial.slice(0, 4),
      ...this.stockUniverse.consumer.slice(0, 3)
    ];

    return [...new Set(testingSymbols)].slice(0, count);
  }
}

// Pre-configured universe configurations
export const UniverseConfigs = {
  // Conservative: Focus on stable, liquid symbols
  conservative: {
    maxSymbols: 30,
    sectors: ['etfs', 'technology', 'financial', 'consumer'],
    volatilityFilter: 'low',
    liquidityFilter: 'high'
  },

  // Aggressive: Include high-volatility and emerging symbols  
  aggressive: {
    maxSymbols: 80,
    sectors: ['technology', 'emerging', 'healthcare', 'international'],
    volatilityFilter: 'high',
    liquidityFilter: 'medium'
  },

  // Balanced: Diversified across all sectors
  balanced: {
    maxSymbols: 60,
    sectors: Object.keys(new ExpandedStockUniverse().stockUniverse),
    volatilityFilter: 'mixed',
    liquidityFilter: 'medium'
  },

  // ML Training: Optimized for learning algorithm diversity
  mlTraining: {
    maxSymbols: 100,
    sectors: Object.keys(new ExpandedStockUniverse().stockUniverse),
    volatilityFilter: 'all',
    liquidityFilter: 'all',
    includeEmerging: true,
    includeInternational: true
  }
};

export default ExpandedStockUniverse;