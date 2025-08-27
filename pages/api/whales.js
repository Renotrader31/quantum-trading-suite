// pages/api/whales.js - Unusual Whales API Integration with Real Response Structures
export default async function handler(req, res) {
  const { type, ticker, expiry, date, strike } = req.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const API_KEY = process.env.UNUSUAL_WHALES_API_KEY;

  if (!API_KEY) {
    console.log('âš ï¸  Unusual Whales API key not found');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let endpoint = '';
    let baseUrl = 'https://api.unusualwhales.com';

    // Build endpoint based on type and parameters
    switch(type) {
      case 'darkpools':
        endpoint = `/api/stock/${ticker}/darkpool`;
        if (date) endpoint += `?date=${date}`;
        break;

      case 'gex':
        endpoint = `/api/stock/${ticker}/gex`;
        if (date) endpoint += `?date=${date}`;
        break;

      case 'greeks':
        if (expiry && strike) {
          // Individual option Greeks
          endpoint = `/api/stock/${ticker}/greeks/${expiry}/${strike}`;
        } else if (expiry) {
          // Greeks by expiry
          endpoint = `/api/stock/${ticker}/greeks/${expiry}`;
        } else {
          // Total Greeks flow
          endpoint = `/api/stock/${ticker}/greeks`;
        }
        if (date) {
          endpoint += endpoint.includes('?') ? `&date=${date}` : `?date=${date}`;
        }
        break;

      case 'options':
        endpoint = `/api/stock/${ticker}/options-flow`;
        let params = [];
        if (date) params.push(`date=${date}`);
        if (expiry) params.push(`expiry=${expiry}`);
        if (params.length > 0) endpoint += `?${params.join('&')}`;
        break;

      case 'stocks':
        endpoint = `/api/stock/${ticker}/candles`;
        if (date) endpoint += `?date=${date}`;
        break;

      case 'volatility':
        endpoint = `/api/stock/${ticker}/volatility`;
        if (date) endpoint += `?date=${date}`;
        break;

      case 'alerts':
        endpoint = `/api/stock/${ticker}/alerts`;
        if (date) endpoint += `?date=${date}`;
        break;

      case 'chains':
        endpoint = `/api/stock/${ticker}/chains`;
        if (expiry) endpoint += `/${expiry}`;
        break;

      case 'maxpain':
        endpoint = `/api/stock/${ticker}/max-pain`;
        if (date) endpoint += `?date=${date}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    const url = `${baseUrl}${endpoint}`;
    console.log(`ðŸ‹ Fetching Unusual Whales data: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`âŒ Unusual Whales API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`âœ… Unusual Whales data fetched successfully for ${type}/${ticker}`);

    // Transform data based on type for frontend compatibility
    let transformedData;

    switch(type) {
      case 'darkpools':
        transformedData = {
          success: true,
          data: data.data?.map(item => ({
            canceled: item.canceled,
            executed_at: item.executed_at,
            ext_hour_sold_codes: item.ext_hour_sold_codes,
            market_center: item.market_center,
            nbbo_ask: parseFloat(item.nbbo_ask),
            nbbo_ask_quantity: item.nbbo_ask_quantity,
            nbbo_bid: parseFloat(item.nbbo_bid),
            nbbo_bid_quantity: item.nbbo_bid_quantity,
            premium: parseFloat(item.premium),
            price: parseFloat(item.price),
            sale_cond_codes: item.sale_cond_codes,
            size: item.size,
            ticker: item.ticker,
            tracking_id: item.tracking_id,
            trade_code: item.trade_code,
            trade_settlement: item.trade_settlement,
            volume: item.volume
          })) || []
        };
        break;

      case 'gex':
        transformedData = {
          success: true,
          data: data.data?.map(item => ({
            // Basic GEX format
            charm_per_one_percent_move_dir: parseFloat(item.charm_per_one_percent_move_dir || 0),
            charm_per_one_percent_move_oi: parseFloat(item.charm_per_one_percent_move_oi || 0),
            charm_per_one_percent_move_vol: parseFloat(item.charm_per_one_percent_move_vol || 0),
            gamma_per_one_percent_move_dir: parseFloat(item.gamma_per_one_percent_move_dir || 0),
            gamma_per_one_percent_move_oi: parseFloat(item.gamma_per_one_percent_move_oi || 0),
            gamma_per_one_percent_move_vol: parseFloat(item.gamma_per_one_percent_move_vol || 0),
            price: parseFloat(item.price),
            time: item.time,
            vanna_per_one_percent_move_dir: parseFloat(item.vanna_per_one_percent_move_dir || 0),
            vanna_per_one_percent_move_oi: parseFloat(item.vanna_per_one_percent_move_oi || 0),
            vanna_per_one_percent_move_vol: parseFloat(item.vanna_per_one_percent_move_vol || 0),

            // Detailed GEX format (if available)
            call_charm_ask: parseFloat(item.call_charm_ask || 0),
            call_charm_bid: parseFloat(item.call_charm_bid || 0),
            call_charm_oi: parseFloat(item.call_charm_oi || 0),
            call_charm_vol: parseFloat(item.call_charm_vol || 0),
            call_delta_ask: parseFloat(item.call_delta_ask || 0),
            call_delta_bid: parseFloat(item.call_delta_bid || 0),
            call_delta_oi: parseFloat(item.call_delta_oi || 0),
            call_delta_vol: parseFloat(item.call_delta_vol || 0),
            call_gamma_ask: parseFloat(item.call_gamma_ask || 0),
            call_gamma_bid: parseFloat(item.call_gamma_bid || 0),
            call_gamma_oi: parseFloat(item.call_gamma_oi || 0),
            call_gamma_vol: parseFloat(item.call_gamma_vol || 0),
            call_vanna_ask: parseFloat(item.call_vanna_ask || 0),
            call_vanna_bid: parseFloat(item.call_vanna_bid || 0),
            call_vanna_oi: parseFloat(item.call_vanna_oi || 0),
            call_vanna_vol: parseFloat(item.call_vanna_vol || 0),

            put_charm_ask: parseFloat(item.put_charm_ask || 0),
            put_charm_bid: parseFloat(item.put_charm_bid || 0),
            put_charm_oi: parseFloat(item.put_charm_oi || 0),
            put_charm_vol: parseFloat(item.put_charm_vol || 0),
            put_delta_ask: parseFloat(item.put_delta_ask || 0),
            put_delta_bid: parseFloat(item.put_delta_bid || 0),
            put_delta_oi: parseFloat(item.put_delta_oi || 0),
            put_delta_vol: parseFloat(item.put_delta_vol || 0),
            put_gamma_ask: parseFloat(item.put_gamma_ask || 0),
            put_gamma_bid: parseFloat(item.put_gamma_bid || 0),
            put_gamma_oi: parseFloat(item.put_gamma_oi || 0),
            put_gamma_vol: parseFloat(item.put_gamma_vol || 0),
            put_vanna_ask: parseFloat(item.put_vanna_ask || 0),
            put_vanna_bid: parseFloat(item.put_vanna_bid || 0),
            put_vanna_oi: parseFloat(item.put_vanna_oi || 0),
            put_vanna_vol: parseFloat(item.put_vanna_vol || 0)
          })) || []
        };
        break;

      case 'greeks':
        transformedData = {
          success: true,
          data: data.data?.map(item => ({
            // Basic Greeks
            call_charm: parseFloat(item.call_charm || 0),
            call_delta: parseFloat(item.call_delta || 0),
            call_gamma: parseFloat(item.call_gamma || 0),
            call_vanna: parseFloat(item.call_vanna || 0),
            put_charm: parseFloat(item.put_charm || 0),
            put_delta: parseFloat(item.put_delta || 0),
            put_gamma: parseFloat(item.put_gamma || 0),
            put_vanna: parseFloat(item.put_vanna || 0),

            // Time fields
            date: item.date,
            dte: item.dte,
            expiry: item.expiry,
            strike: parseFloat(item.strike || 0),

            // Flow fields
            dir_delta_flow: parseFloat(item.dir_delta_flow || 0),
            dir_vega_flow: parseFloat(item.dir_vega_flow || 0),
            otm_dir_delta_flow: parseFloat(item.otm_dir_delta_flow || 0),
            otm_dir_vega_flow: parseFloat(item.otm_dir_vega_flow || 0),
            otm_total_delta_flow: parseFloat(item.otm_total_delta_flow || 0),
            otm_total_vega_flow: parseFloat(item.otm_total_vega_flow || 0),
            ticker: item.ticker,
            timestamp: item.timestamp,
            total_delta_flow: parseFloat(item.total_delta_flow || 0),
            total_vega_flow: parseFloat(item.total_vega_flow || 0),
            transactions: item.transactions,
            volume: item.volume,

            // Individual option Greeks
            call_option_symbol: item.call_option_symbol,
            call_rho: parseFloat(item.call_rho || 0),
            call_theta: parseFloat(item.call_theta || 0),
            call_vega: parseFloat(item.call_vega || 0),
            call_volatility: parseFloat(item.call_volatility || 0),
            put_option_symbol: item.put_option_symbol,
            put_rho: parseFloat(item.put_rho || 0),
            put_theta: parseFloat(item.put_theta || 0),
            put_vega: parseFloat(item.put_vega || 0),
            put_volatility: parseFloat(item.put_volatility || 0)
          })) || []
        };
        break;

      case 'options':
        transformedData = {
          success: true,
          data: data.data?.map(item => ({
            ask_vol: item.ask_vol,
            bid_vol: item.bid_vol,
            canceled: item.canceled,
            delta: parseFloat(item.delta),
            er_time: item.er_time,
            ewma_nbbo_ask: parseFloat(item.ewma_nbbo_ask),
            ewma_nbbo_bid: parseFloat(item.ewma_nbbo_bid),
            exchange: item.exchange,
            executed_at: item.executed_at,
            expiry: item.expiry,
            flow_alert_id: item.flow_alert_id,
            full_name: item.full_name,
            gamma: parseFloat(item.gamma),
            id: item.id,
            implied_volatility: parseFloat(item.implied_volatility),
            industry_type: item.industry_type,
            marketcap: parseFloat(item.marketcap),
            mid_vol: item.mid_vol,
            multi_vol: item.multi_vol,
            nbbo_ask: parseFloat(item.nbbo_ask),
            nbbo_bid: parseFloat(item.nbbo_bid),
            next_earnings_date: item.next_earnings_date,
            no_side_vol: item.no_side_vol,
            open_interest: item.open_interest,
            option_chain_id: item.option_chain_id,
            option_type: item.option_type,
            premium: parseFloat(item.premium),
            price: parseFloat(item.price),
            report_flags: item.report_flags,
            rho: parseFloat(item.rho),
            rule_id: item.rule_id,
            sector: item.sector,
            size: item.size,
            stock_multi_vol: item.stock_multi_vol,
            strike: parseFloat(item.strike),
            tags: item.tags,
            theo: parseFloat(item.theo),
            theta: parseFloat(item.theta),
            underlying_price: parseFloat(item.underlying_price),
            underlying_symbol: item.underlying_symbol,
            upstream_condition_detail: item.upstream_condition_detail,
            vega: parseFloat(item.vega),
            volume: item.volume
          })) || []
        };
        break;

      case 'stocks':
        transformedData = {
          success: true,
          data: data.data?.map(item => ({
            close: parseFloat(item.close),
            end_time: item.end_time,
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            market_time: item.market_time,
            open: parseFloat(item.open),
            start_time: item.start_time,
            total_volume: item.total_volume,
            volume: item.volume,

            // Alert fields (if available)
            alert_rule: item.alert_rule,
            all_opening_trades: item.all_opening_trades,
            created_at: item.created_at,
            expiry: item.expiry,
            expiry_count: item.expiry_count,
            has_floor: item.has_floor,
            has_multileg: item.has_multileg,
            has_singleleg: item.has_singleleg,
            has_sweep: item.has_sweep,
            open_interest: item.open_interest,
            option_chain: item.option_chain,
            price: parseFloat(item.price || item.close || 0),
            strike: parseFloat(item.strike || 0),
            ticker: item.ticker,
            total_ask_side_prem: parseFloat(item.total_ask_side_prem || 0),
            total_bid_side_prem: parseFloat(item.total_bid_side_prem || 0),
            total_premium: parseFloat(item.total_premium || 0),
            total_size: item.total_size,
            trade_count: item.trade_count,
            type: item.type,
            underlying_price: parseFloat(item.underlying_price || 0),
            volume_oi_ratio: parseFloat(item.volume_oi_ratio || 0)
          })) || []
        };
        break;

      case 'volatility':
        transformedData = {
          success: true,
          data: data.data ? (Array.isArray(data.data) ? data.data.map(item => ({
            date: item.date,
            implied_volatility: parseFloat(item.implied_volatility || item.iv || 0),
            price: parseFloat(item.price || item.close || 0),
            realized_volatility: parseFloat(item.realized_volatility || item.rv || 0),
            unshifted_rv_date: item.unshifted_rv_date,

            // Summary fields
            iv: parseFloat(item.iv || 0),
            iv_high: parseFloat(item.iv_high || 0),
            iv_low: parseFloat(item.iv_low || 0),
            iv_rank: parseFloat(item.iv_rank || 0),
            rv: parseFloat(item.rv || 0),
            rv_high: parseFloat(item.rv_high || 0),
            rv_low: parseFloat(item.rv_low || 0),
            ticker: item.ticker,

            // Term structure fields
            dte: item.dte,
            expiry: item.expiry,
            implied_move: parseFloat(item.implied_move || 0),
            implied_move_perc: parseFloat(item.implied_move_perc || 0),
            volatility: parseFloat(item.volatility || 0),

            // Percentile fields
            days: item.days,
            percentile: parseFloat(item.percentile || 0),

            // Historical fields
            close: parseFloat(item.close || 0),
            iv_rank_1y: parseFloat(item.iv_rank_1y || 0),
            updated_at: item.updated_at
          })) : [data.data]) : []
        };
        break;

      default:
        transformedData = data;
    }

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('âŒ Unusual Whales API Error:', error.message);

    // Return fallback data structure based on type
    let fallbackData = { success: false, error: error.message, data: [] };

    switch(type) {
      case 'darkpools':
        fallbackData.data = [{
          ticker: ticker || 'SPY',
          premium: 125000,
          size: 5000,
          price: 450.25,
          volume: 1000000,
          executed_at: new Date().toISOString(),
          market_center: 'D'
        }];
        break;

      case 'gex':
        fallbackData.data = [{
          gamma_per_one_percent_move_dir: 475681.21,
          gamma_per_one_percent_move_oi: 65476967081.41,
          price: 4650,
          time: new Date().toISOString()
        }];
        break;

      case 'greeks':
        fallbackData.data = [{
          call_delta: 227549667.47,
          call_gamma: 9356683.42,
          put_delta: -191893077.72,
          put_gamma: -12337386.05,
          date: new Date().toISOString().split('T')[0]
        }];
        break;

      case 'options':
        fallbackData.data = [{
          delta: 0.61,
          gamma: 0.008,
          premium: 2150,
          strike: 124,
          expiry: '2025-01-17',
          underlying_price: 128.16,
          volume: 33
        }];
        break;

      case 'stocks':
        fallbackData.data = [{
          close: 450.25,
          high: 452.10,
          low: 448.90,
          open: 449.75,
          volume: 1250000,
          start_time: new Date().toISOString()
        }];
        break;

      case 'volatility':
        fallbackData.data = [{
          implied_volatility: 0.23,
          realized_volatility: 0.19,
          price: 150.15,
          date: new Date().toISOString().split('T')[0]
        }];
        break;
    }

    return res.status(200).json(fallbackData);
  }
}
