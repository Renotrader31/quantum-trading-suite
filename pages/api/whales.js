// pages/api/whales.js
// Real Unusual Whales API Integration with correct response structures
// Based on actual API documentation provided

export default async function handler(req, res) {
  const { type, ticker = 'SPY', expiry, strike, days = 30 } = req.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const UW_API_KEY = process.env.UNUSUAL_WHALES_API_KEY;

  if (!UW_API_KEY) {
    console.log('âŒ Unusual Whales API key not found in environment variables');
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'Unusual Whales API key not found in environment variables'
    });
  }

  const BASE_URL = 'https://api.unusualwhales.com/api/v1';

  try {
    let endpoint = '';
    let params = new URLSearchParams();

    // Build endpoint based on type with real API paths
    switch (type) {
      case 'darkpools':
        endpoint = `/darkpools/${ticker}`;
        break;

      case 'gex':
        endpoint = `/gex/${ticker}`;
        break;

      case 'greeks':
        endpoint = `/greeks/${ticker}`;
        if (expiry) params.append('expiry', expiry);
        if (strike) params.append('strike', strike);
        break;

      case 'options':
        endpoint = `/options-flow/${ticker}`;
        params.append('days', days);
        break;

      case 'stocks':
        endpoint = `/stocks/${ticker}`;
        break;

      case 'volatility':
        endpoint = `/volatility/${ticker}`;
        break;

      case 'flow':
        endpoint = `/flow/${ticker}`;
        params.append('days', days);
        break;

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    const url = `${BASE_URL}${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;

    console.log(`ðŸ”¥ Fetching from UW API: ${endpoint}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${UW_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'QuantumTradingSuite/1.0'
      },
      timeout: 10000
    });

    if (!response.ok) {
      console.log(`âŒ UW API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Process and normalize data based on type with real field mappings
    let processedData;

    switch (type) {
      case 'darkpools':
        processedData = processDarkPoolsData(data);
        break;

      case 'gex':
        processedData = processGEXData(data);
        break;

      case 'greeks':
        processedData = processGreeksData(data);
        break;

      case 'options':
      case 'flow':
        processedData = processOptionsFlowData(data);
        break;

      case 'stocks':
        processedData = processStocksData(data);
        break;

      case 'volatility':
        processedData = processVolatilityData(data);
        break;

      default:
        processedData = data;
    }

    console.log(`âœ… Successfully fetched ${type} data for ${ticker}`);
    return res.status(200).json(processedData);

  } catch (error) {
    console.error(`âŒ Unusual Whales API Error:`, error.message);

    // Return fallback data structure to prevent frontend crashes
    const fallbackData = generateFallbackData(type, ticker);

    return res.status(200).json({
      ...fallbackData,
      _meta: {
        source: 'fallback',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Process Dark Pools data with real field mappings
function processDarkPoolsData(data) {
  if (!data?.data) return { trades: [] };

  return {
    trades: data.data.map(trade => ({
      // Real field mappings from API documentation
      ticker: trade.ticker,
      price: parseFloat(trade.price) || 0,
      size: trade.size || 0,
      premium: parseFloat(trade.premium) || 0,
      volume: trade.volume || 0,
      executed_at: trade.executed_at,
      market_center: trade.market_center,
      nbbo_ask: parseFloat(trade.nbbo_ask) || 0,
      nbbo_bid: parseFloat(trade.nbbo_bid) || 0,
      nbbo_ask_quantity: trade.nbbo_ask_quantity || 0,
      nbbo_bid_quantity: trade.nbbo_bid_quantity || 0,
      canceled: trade.canceled || false,
      ext_hour_sold_codes: trade.ext_hour_sold_codes,
      tracking_id: trade.tracking_id,
      trade_settlement: trade.trade_settlement
    }))
  };
}

// Process GEX data with real field mappings
function processGEXData(data) {
  if (!data?.data) return { gex_data: [] };

  return {
    gex_data: data.data.map(item => ({
      // Real field mappings from API documentation
      price: parseFloat(item.price) || 0,
      time: item.time,
      gamma_per_one_percent_move_dir: parseFloat(item.gamma_per_one_percent_move_dir) || 0,
      gamma_per_one_percent_move_oi: parseFloat(item.gamma_per_one_percent_move_oi) || 0,
      gamma_per_one_percent_move_vol: parseFloat(item.gamma_per_one_percent_move_vol) || 0,
      charm_per_one_percent_move_dir: parseFloat(item.charm_per_one_percent_move_dir) || 0,
      charm_per_one_percent_move_oi: parseFloat(item.charm_per_one_percent_move_oi) || 0,
      charm_per_one_percent_move_vol: parseFloat(item.charm_per_one_percent_move_vol) || 0,
      vanna_per_one_percent_move_dir: parseFloat(item.vanna_per_one_percent_move_dir) || 0,
      vanna_per_one_percent_move_oi: parseFloat(item.vanna_per_one_percent_move_oi) || 0,
      vanna_per_one_percent_move_vol: parseFloat(item.vanna_per_one_percent_move_vol) || 0,

      // Detailed breakdown if available
      call_gamma_oi: parseFloat(item.call_gamma_oi) || 0,
      call_gamma_vol: parseFloat(item.call_gamma_vol) || 0,
      put_gamma_oi: parseFloat(item.put_gamma_oi) || 0,
      put_gamma_vol: parseFloat(item.put_gamma_vol) || 0
    }))
  };
}

// Process Greeks data with real field mappings  
function processGreeksData(data) {
  if (!data?.data) return { greeks: [] };

  return {
    greeks: data.data.map(item => ({
      // Real field mappings from API documentation
      date: item.date,
      expiry: item.expiry,
      strike: item.strike,

      // Call Greeks
      call_delta: parseFloat(item.call_delta) || 0,
      call_gamma: parseFloat(item.call_gamma) || 0,
      call_theta: parseFloat(item.call_theta) || 0,
      call_vega: parseFloat(item.call_vega) || 0,
      call_rho: parseFloat(item.call_rho) || 0,
      call_charm: parseFloat(item.call_charm) || 0,
      call_vanna: parseFloat(item.call_vanna) || 0,
      call_volatility: parseFloat(item.call_volatility) || 0,
      call_option_symbol: item.call_option_symbol,

      // Put Greeks
      put_delta: parseFloat(item.put_delta) || 0,
      put_gamma: parseFloat(item.put_gamma) || 0,
      put_theta: parseFloat(item.put_theta) || 0,
      put_vega: parseFloat(item.put_vega) || 0,
      put_rho: parseFloat(item.put_rho) || 0,
      put_charm: parseFloat(item.put_charm) || 0,
      put_vanna: parseFloat(item.put_vanna) || 0,
      put_volatility: parseFloat(item.put_volatility) || 0,
      put_option_symbol: item.put_option_symbol,

      // Flow data if available
      dir_delta_flow: parseFloat(item.dir_delta_flow) || 0,
      dir_vega_flow: parseFloat(item.dir_vega_flow) || 0,
      total_delta_flow: parseFloat(item.total_delta_flow) || 0,
      total_vega_flow: parseFloat(item.total_vega_flow) || 0,
      transactions: item.transactions || 0,
      volume: item.volume || 0,
      ticker: item.ticker,
      timestamp: item.timestamp
    }))
  };
}

// Process Options Flow data with real field mappings
function processOptionsFlowData(data) {
  if (!data?.data) return { flows: [] };

  return {
    flows: data.data.map(flow => ({
      // Real field mappings from API documentation
      id: flow.id,
      ticker: flow.underlying_symbol || flow.ticker,
      full_name: flow.full_name,
      sector: flow.sector,
      industry_type: flow.industry_type,
      marketcap: parseFloat(flow.marketcap) || 0,

      // Option details
      option_chain_id: flow.option_chain_id,
      option_type: flow.option_type,
      strike: parseFloat(flow.strike) || 0,
      expiry: flow.expiry,
      executed_at: flow.executed_at,

      // Pricing
      price: parseFloat(flow.price) || 0,
      premium: parseFloat(flow.premium) || 0,
      underlying_price: parseFloat(flow.underlying_price) || 0,
      theo: parseFloat(flow.theo) || 0,

      // Greeks
      delta: parseFloat(flow.delta) || 0,
      gamma: parseFloat(flow.gamma) || 0,
      theta: parseFloat(flow.theta) || 0,
      vega: parseFloat(flow.vega) || 0,
      rho: parseFloat(flow.rho) || 0,
      implied_volatility: parseFloat(flow.implied_volatility) || 0,

      // Volume breakdown
      size: flow.size || 0,
      volume: flow.volume || 0,
      ask_vol: flow.ask_vol || 0,
      bid_vol: flow.bid_vol || 0,
      mid_vol: flow.mid_vol || 0,
      multi_vol: flow.multi_vol || 0,
      no_side_vol: flow.no_side_vol || 0,
      stock_multi_vol: flow.stock_multi_vol || 0,

      // Market data
      exchange: flow.exchange,
      nbbo_ask: parseFloat(flow.nbbo_ask) || 0,
      nbbo_bid: parseFloat(flow.nbbo_bid) || 0,
      ewma_nbbo_ask: parseFloat(flow.ewma_nbbo_ask) || 0,
      ewma_nbbo_bid: parseFloat(flow.ewma_nbbo_bid) || 0,

      // Metadata
      open_interest: flow.open_interest || 0,
      tags: flow.tags || [],
      canceled: flow.canceled || false,
      er_time: flow.er_time,
      next_earnings_date: flow.next_earnings_date,
      flow_alert_id: flow.flow_alert_id,
      rule_id: flow.rule_id,
      report_flags: flow.report_flags || [],
      upstream_condition_detail: flow.upstream_condition_detail
    }))
  };
}

// Process Stocks data with real field mappings
function processStocksData(data) {
  if (!data?.data) return { bars: [] };

  return {
    bars: data.data.map(bar => ({
      // Real field mappings from API documentation
      open: parseFloat(bar.open) || 0,
      high: parseFloat(bar.high) || 0,
      low: parseFloat(bar.low) || 0,
      close: parseFloat(bar.close) || 0,
      volume: bar.volume || 0,
      total_volume: bar.total_volume || 0,
      start_time: bar.start_time,
      end_time: bar.end_time,
      market_time: bar.market_time
    }))
  };
}

// Process Volatility data with real field mappings
function processVolatilityData(data) {
  if (!data?.data) return { volatility: [] };

  // Handle both array and object responses
  const volatilityData = Array.isArray(data.data) ? data.data : [data.data];

  return {
    volatility: volatilityData.map(vol => ({
      // Real field mappings from API documentation
      date: vol.date,
      ticker: vol.ticker,
      price: parseFloat(vol.price) || 0,

      // Implied Volatility
      implied_volatility: parseFloat(vol.implied_volatility) || parseFloat(vol.iv) || 0,
      iv_high: parseFloat(vol.iv_high) || 0,
      iv_low: parseFloat(vol.iv_low) || 0,
      iv_rank: parseFloat(vol.iv_rank) || parseFloat(vol.iv_rank_1y) || 0,

      // Realized Volatility
      realized_volatility: parseFloat(vol.realized_volatility) || parseFloat(vol.rv) || 0,
      rv_high: parseFloat(vol.rv_high) || 0,
      rv_low: parseFloat(vol.rv_low) || 0,

      // Term Structure
      volatility: parseFloat(vol.volatility) || 0,
      dte: vol.dte,
      expiry: vol.expiry,
      implied_move: parseFloat(vol.implied_move) || 0,
      implied_move_perc: parseFloat(vol.implied_move_perc) || 0,

      // Percentile data
      days: vol.days,
      percentile: parseFloat(vol.percentile) || 0,

      // Timestamps
      unshifted_rv_date: vol.unshifted_rv_date,
      updated_at: vol.updated_at
    }))
  };
}

// Generate fallback data to prevent crashes
function generateFallbackData(type, ticker) {
  const timestamp = new Date().toISOString();

  switch (type) {
    case 'darkpools':
      return {
        trades: [],
        _fallback: true
      };

    case 'gex':
      return {
        gex_data: [],
        _fallback: true
      };

    case 'greeks':
      return {
        greeks: [],
        _fallback: true
      };

    case 'options':
    case 'flow':
      return {
        flows: [],
        _fallback: true
      };

    case 'stocks':
      return {
        bars: [],
        _fallback: true
      };

    case 'volatility':
      return {
        volatility: [],
        _fallback: true
      };

    default:
      return {
        data: [],
        _fallback: true
      };
  }
}
