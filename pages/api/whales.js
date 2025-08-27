// pages/api/whales.js
// COMPREHENSIVE DEBUG VERSION - Unusual Whales API Integration
// Created to identify exact cause of persistent 400 errors

// ===== ENVIRONMENT & CONFIG VALIDATION =====
console.log('\n=== UNUSUAL WHALES API DEBUG STARTUP ===');
console.log('Node.js Version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check for API key in multiple environment variable names
const UW_TOKEN = process.env.UNUSUAL_WHALES_API_KEY || process.env.UW_TOKEN;
console.log('Environment Variables Check:');
console.log('- UNUSUAL_WHALES_API_KEY exists:', !!process.env.UNUSUAL_WHALES_API_KEY);
console.log('- UW_TOKEN exists:', !!process.env.UW_TOKEN);
console.log('- Final UW_TOKEN length:', UW_TOKEN ? UW_TOKEN.length : 'MISSING');
console.log('- Token preview (first 10 chars):', UW_TOKEN ? UW_TOKEN.substring(0, 10) + '...' : 'NOT FOUND');

// Correct API configuration based on Dan's official response
const BASE_URL = 'https://api.unusualwhales.com/api/stock';
console.log('- Base URL:', BASE_URL);

// ===== ENDPOINT MAPPINGS =====
const ENDPOINT_MAP = {
  greeks: 'greeks',
  options_chain: 'options-chain',
  quote: 'quote',
  summary: 'summary',
  financials: 'financials',
  news: 'news',
  insider_trading: 'insider-trading',
  institutional_holdings: 'institutional-holdings',
  short_interest: 'short-interest',
  earnings: 'earnings',
  dividend: 'dividend',
  splits: 'splits'
};
console.log('Available endpoints:', Object.keys(ENDPOINT_MAP));

// ===== REQUEST BUILDER =====
function buildRequest(ticker, endpoint) {
  const url = `${BASE_URL}/${ticker}/${endpoint}`;

  // Correct authentication format (NOT "Bearer token")
  const headers = {
    'Accept': 'application/json, text/plain',
    'Authorization': UW_TOKEN  // Direct token, no "Bearer" prefix
  };

  console.log('\n=== REQUEST DETAILS ===');
  console.log('Full URL:', url);
  console.log('Headers:', JSON.stringify(headers, null, 2));

  return { url, headers };
}

// ===== DEBUG ENDPOINT =====
function handleDebugRequest(ticker = 'SPY') {
  console.log('\n=== DEBUG MODE ACTIVATED ===');
  console.log('Debug ticker:', ticker);

  const testEndpoint = ENDPOINT_MAP.greeks;
  const { url, headers } = buildRequest(ticker, testEndpoint);

  return {
    success: true,
    debug_info: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      api_key_status: {
        exists: !!UW_TOKEN,
        length: UW_TOKEN ? UW_TOKEN.length : 0,
        preview: UW_TOKEN ? UW_TOKEN.substring(0, 10) + '...' : 'MISSING'
      },
      request_config: {
        base_url: BASE_URL,
        full_url: url,
        headers: headers,
        method: 'GET'
      },
      available_endpoints: Object.keys(ENDPOINT_MAP),
      test_instructions: {
        step1: 'First test this debug endpoint: /api/whales?type=debug&ticker=SPY',
        step2: 'Then test live API: /api/whales?type=greeks&ticker=SPY',
        step3: 'Check console logs for detailed error information'
      }
    }
  };
}

// ===== MAIN API HANDLER =====
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('\n=== NEW API REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query params:', req.query);
  console.log('Timestamp:', new Date().toISOString());

  // CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    console.log('âŒ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed', allowed_methods: ['GET'] });
  }

  // Extract parameters
  const { type, ticker = 'SPY' } = req.query;

  console.log('Parameters:');
  console.log('- Type:', type);
  console.log('- Ticker:', ticker);

  // Validation
  if (!UW_TOKEN) {
    console.log('âŒ CRITICAL ERROR: No API token found');
    return res.status(500).json({
      error: 'API token not configured',
      debug_info: {
        checked_vars: ['UNUSUAL_WHALES_API_KEY', 'UW_TOKEN'],
        found: false,
        solution: 'Add UNUSUAL_WHALES_API_KEY to your environment variables'
      }
    });
  }

  if (!type) {
    console.log('âŒ Missing required parameter: type');
    return res.status(400).json({
      error: 'Missing required parameter: type',
      available_types: Object.keys(ENDPOINT_MAP).concat(['debug']),
      example: '/api/whales?type=greeks&ticker=SPY'
    });
  }

  // Handle debug mode
  if (type === 'debug') {
    console.log('ðŸ” Debug mode requested');
    const debugResponse = handleDebugRequest(ticker);
    const elapsed = Date.now() - startTime;
    console.log(`âœ… Debug response prepared in ${elapsed}ms`);
    return res.status(200).json(debugResponse);
  }

  // Validate endpoint
  const endpoint = ENDPOINT_MAP[type];
  if (!endpoint) {
    console.log('âŒ Invalid endpoint type:', type);
    return res.status(400).json({
      error: `Invalid type: ${type}`,
      available_types: Object.keys(ENDPOINT_MAP),
      example: '/api/whales?type=greeks&ticker=SPY'
    });
  }

  // Build and execute request
  try {
    console.log('\n=== EXECUTING API REQUEST ===');
    const { url, headers } = buildRequest(ticker, endpoint);

    console.log('Making fetch request...');
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      timeout: 30000  // 30 second timeout
    });

    console.log('\n=== RESPONSE DETAILS ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is ok
    if (!response.ok) {
      console.log('âŒ API ERROR DETECTED');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      let errorBody = '';
      try {
        errorBody = await response.text();
        console.log('Error Response Body:', errorBody);
      } catch (bodyError) {
        console.log('Could not read error response body:', bodyError.message);
      }

      const elapsed = Date.now() - startTime;

      return res.status(response.status).json({
        error: `Unusual Whales API Error: ${response.status} ${response.statusText}`,
        debug_details: {
          requested_url: url,
          request_headers: headers,
          response_status: response.status,
          response_headers: Object.fromEntries(response.headers.entries()),
          response_body: errorBody,
          request_duration_ms: elapsed,
          timestamp: new Date().toISOString(),
          troubleshooting: {
            check_token: 'Verify your Unusual Whales API token is correct',
            check_permissions: 'Ensure your API plan includes this endpoint',
            check_ticker: 'Verify the ticker symbol is valid',
            contact_support: 'Contact Unusual Whales support if error persists'
          }
        }
      });
    }

    // Parse successful response
    console.log('âœ… Successful response received');
    const data = await response.json();
    console.log('Response data keys:', Object.keys(data));
    console.log('Response data preview:', JSON.stringify(data).substring(0, 200) + '...');

    const elapsed = Date.now() - startTime;
    console.log(`âœ… Request completed successfully in ${elapsed}ms`);

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        ticker: ticker,
        endpoint: type,
        timestamp: new Date().toISOString(),
        request_duration_ms: elapsed
      }
    });

  } catch (fetchError) {
    console.log('\nâŒ FETCH ERROR OCCURRED');
    console.log('Error type:', fetchError.constructor.name);
    console.log('Error message:', fetchError.message);
    console.log('Full error:', fetchError);

    const elapsed = Date.now() - startTime;

    return res.status(500).json({
      error: 'Request failed',
      debug_details: {
        error_type: fetchError.constructor.name,
        error_message: fetchError.message,
        request_duration_ms: elapsed,
        timestamp: new Date().toISOString(),
        possible_causes: [
          'Network connectivity issues',
          'API server temporarily unavailable',
          'Request timeout (30s limit)',
          'Invalid API token format',
          'Rate limiting'
        ]
      }
    });
  }
}

// ===== STARTUP VALIDATION =====
console.log('\n=== STARTUP VALIDATION COMPLETE ===');
console.log('API handler loaded successfully');
console.log('Ready to handle requests');
console.log('Test endpoints:');
console.log('- Debug: /api/whales?type=debug&ticker=SPY');
console.log('- Live API: /api/whales?type=greeks&ticker=SPY');
console.log('=====================================\n');
