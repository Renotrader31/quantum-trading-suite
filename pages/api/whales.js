// pages/api/whales.js
// REAL Unusual Whales API Integration - Based on Dan's official API support response
// Corrected endpoints, base URL, and authentication format

export default async function handler(req, res) {
  const { type, ticker = 'SPY', expiry, strike, days = 30 } = req.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const UW_TOKEN = process.env.UNUSUAL_WHALES_API_KEY || process.env.UW_TOKEN;

  if (!UW_TOKEN) {
    console.log('âŒ Unusual Whales API key not found in environment variables');
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'Unusual Whales API key not found. Set UNUSUAL_WHALES_API_KEY or UW_TOKEN'
    });
  }

  // REAL API structure from Dan's response
  const BASE_URL = 'https://api.unusualwhales.com/api/stock';

  try {
    let endpoint = '';
    let params = {};

    // Build endpoint based on type with REAL API paths from Dan
    switch (type) {
      case 'greeks':
        endpoint = `${BASE_URL}/${ticker}/greeks`;
        if (expiry) params.expiry = expiry;
        break;

      case 'options':
      case 'option-contracts':
        endpoint = `${BASE_URL}/${ticker}/option-contracts`;
        if (expiry) params.expiry = expiry;
        break;

      case 'darkpools':
        endpoint = `${BASE_URL}/${ticker}/darkpools`;
        break;

      case 'gex':
        endpoint = `${BASE_URL}/${ticker}/gex`;
        break;

      case 'flow':
        endpoint = `${BASE_URL}/${ticker}/flow`;
        break;

      case 'volatility':
        endpoint = `${BASE_URL}/${ticker}/volatility`;
        break;

      case 'stocks':
      case 'bars':
        endpoint = `${BASE_URL}/${ticker}/bars`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid type parameter. Use: greeks, options, darkpools, gex, flow, volatility, stocks' });
    }

    // Build URL with parameters
    const url = new URL(endpoint);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    console.log(`ðŸ”¥ Fetching from REAL UW API: ${url.toString()}`);

    // REAL headers format from Dan's working example
    const headers = {
      'Accept': 'application/json, text/plain',
      'Authorization': UW_TOKEN  // NOT "Bearer token" - just the token directly!
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
      timeout: 15000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`âŒ UW API Error: ${response.status} ${response.statusText}`);
      console.log(`âŒ Error response: ${errorText}`);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Process and normalize data based on type
    let processedData;

    switch (type) {
      case 'greeks':
        processedData = processGreeksData(data);
        break;

      case 'options':
      case 'option-contracts':
        processedData = processOptionsData(data);
        break;

      case 'darkpools':
        processedData = processDarkPoolsData(data);
        break;

      case 'gex':
        processedData = processGEXData(data);
        break;

      case 'flow':
        processedData = processFlowData(data);
        break;

      case 'volatility':
        processedData = processVolatilityData(data);
        break;

      case 'stocks':
      case 'bars':
        processedData = processStocksData(data);
        break;

      default:
        processedData = data;
    }

    console.log(`âœ… Successfully fetched ${type} data for ${ticker} - Records: ${processedData?.data?.length || 'N/A'}`);
    return res.status(200).json({
      success: true,
      ticker,
      type,
      timestamp: new Date().toISOString(),
      ...processedData
    });

  } catch (error) {
    console.error(`âŒ Unusual Whales API Error:`, error.message);

    // Return structured error response
    return res.status(500).json({
      success: false,
      error: error.message,
      ticker,
      type,
      timestamp: new Date().toISOString(),
      fallback: generateFallbackData(type, ticker)
    });
  }
}

// Process Greeks data with real field mappings from documentation
function processGreeksData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(item => ({
      // Core identifiers
      ticker: item.ticker,
      date: item.date,
      expiry: item.expiry,
      strike: parseFloat(item.strike) || 0,

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
      timestamp: item.timestamp
    }))
  };
}

// Process Option Contracts data
function processOptionsData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(option => ({
      // Option identifiers
      option_symbol: option.option_symbol,
      option_type: option.option_type,
      strike: parseFloat(option.strike) || 0,
      expiry: option.expiry,

      // Greeks
      delta: parseFloat(option.delta) || 0,
      gamma: parseFloat(option.gamma) || 0,
      theta: parseFloat(option.theta) || 0,
      vega: parseFloat(option.vega) || 0,
      rho: parseFloat(option.rho) || 0,
      implied_volatility: parseFloat(option.implied_volatility) || 0,

      // Pricing
      bid: parseFloat(option.bid) || 0,
      ask: parseFloat(option.ask) || 0,
      last: parseFloat(option.last) || 0,
      mark: parseFloat(option.mark) || 0,

      // Volume and Interest
      volume: option.volume || 0,
      open_interest: option.open_interest || 0,

      // Additional fields
      underlying_price: parseFloat(option.underlying_price) || 0,
      time_to_expiry: parseFloat(option.time_to_expiry) || 0,
      updated_at: option.updated_at
    }))
  };
}

// Process Dark Pools data
function processDarkPoolsData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(trade => ({
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

// Process GEX data
function processGEXData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(item => ({
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
      vanna_per_one_percent_move_vol: parseFloat(item.vanna_per_one_percent_move_vol) || 0
    }))
  };
}

// Process Flow data
function processFlowData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(flow => ({
      id: flow.id,
      ticker: flow.underlying_symbol || flow.ticker,
      full_name: flow.full_name,
      sector: flow.sector,
      industry_type: flow.industry_type,

      option_chain_id: flow.option_chain_id,
      option_type: flow.option_type,
      strike: parseFloat(flow.strike) || 0,
      expiry: flow.expiry,
      executed_at: flow.executed_at,

      price: parseFloat(flow.price) || 0,
      premium: parseFloat(flow.premium) || 0,
      underlying_price: parseFloat(flow.underlying_price) || 0,

      delta: parseFloat(flow.delta) || 0,
      gamma: parseFloat(flow.gamma) || 0,
      theta: parseFloat(flow.theta) || 0,
      vega: parseFloat(flow.vega) || 0,

      size: flow.size || 0,
      volume: flow.volume || 0,
      ask_vol: flow.ask_vol || 0,
      bid_vol: flow.bid_vol || 0,

      exchange: flow.exchange,
      tags: flow.tags || []
    }))
  };
}

// Process Volatility data
function processVolatilityData(data) {
  if (!data?.data) return { data: [] };

  const volatilityData = Array.isArray(data.data) ? data.data : [data.data];

  return {
    data: volatilityData.map(vol => ({
      date: vol.date,
      ticker: vol.ticker,
      price: parseFloat(vol.price) || 0,
      implied_volatility: parseFloat(vol.implied_volatility) || parseFloat(vol.iv) || 0,
      realized_volatility: parseFloat(vol.realized_volatility) || parseFloat(vol.rv) || 0,
      iv_rank: parseFloat(vol.iv_rank) || 0,
      volatility: parseFloat(vol.volatility) || 0
    }))
  };
}

// Process Stocks/Bars data
function processStocksData(data) {
  if (!data?.data) return { data: [] };

  return {
    data: data.data.map(bar => ({
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

// Generate fallback data to prevent crashes
function generateFallbackData(type, ticker) {
  switch (type) {
    case 'greeks':
      return { data: [] };
    case 'options':
    case 'option-contracts':
      return { data: [] };
    case 'darkpools':
      return { data: [] };
    case 'gex':
      return { data: [] };
    case 'flow':
      return { data: [] };
    case 'volatility':
      return { data: [] };
    case 'stocks':
    case 'bars':
      return { data: [] };
    default:
      return { data: [] };
  }
}
