export default async function handler(req, res) {
  const { endpoint, symbol = 'SPY', symbols } = req.query;
  const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
  
  if (!POLYGON_API_KEY) {
    return res.status(500).json({ error: 'Polygon API key not configured' });
  }

  try {
    switch (endpoint) {
      case 'market-overview':
        // Get major indices data
        const indices = ['SPY', 'QQQ', 'IWM', 'VIX'];
        const indicesData = {};
        
        for (const ticker of indices) {
          try {
            // Get previous close and current price
            const prevCloseResponse = await fetch(
              `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`
            );
            const currentPriceResponse = await fetch(
              `https://api.polygon.io/v1/last/stocks/${ticker}?apikey=${POLYGON_API_KEY}`
            );
            
            if (prevCloseResponse.ok && currentPriceResponse.ok) {
              const prevData = await prevCloseResponse.json();
              const currentData = await currentPriceResponse.json();
              
              const currentPrice = currentData.last?.price || prevData.results[0]?.c || 0;
              const prevClose = prevData.results[0]?.c || currentPrice;
              const change = currentPrice - prevClose;
              const changePercent = (change / prevClose) * 100;
              
              indicesData[ticker.toLowerCase()] = {
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2))
              };
            }
          } catch (error) {
            console.error(`Error fetching ${ticker}:`, error);
            // Fallback data
            indicesData[ticker.toLowerCase()] = {
              price: ticker === 'SPY' ? 425.50 : ticker === 'QQQ' ? 375.20 : ticker === 'IWM' ? 195.80 : 18.25,
              change: (Math.random() - 0.5) * 5,
              changePercent: (Math.random() - 0.5) * 2
            };
          }
        }

        // Get top movers
        const topMoversResponse = await fetch(
          `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apikey=${POLYGON_API_KEY}`
        );
        
        let topMovers = [];
        if (topMoversResponse.ok) {
          const moversData = await topMoversResponse.json();
          topMovers = moversData.results?.slice(0, 8).map(stock => ({
            symbol: stock.ticker,
            price: parseFloat(stock.value.toFixed(2)),
            change: parseFloat(stock.change.toFixed(2)),
            changePercent: parseFloat(stock.changeP.toFixed(2)),
            volume: stock.session?.volume || Math.floor(Math.random() * 50000000),
            sector: getSectorForSymbol(stock.ticker)
          })) || [];
        }

        // Get sector ETF performance
        const sectorETFs = ['XLK', 'XLV', 'XLF', 'XLE', 'XLY', 'XLI', 'XLB', 'XLU'];
        const sectors = [];
        
        for (const etf of sectorETFs) {
          try {
            const response = await fetch(
              `https://api.polygon.io/v2/aggs/ticker/${etf}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`
            );
            const currentResponse = await fetch(
              `https://api.polygon.io/v1/last/stocks/${etf}?apikey=${POLYGON_API_KEY}`
            );
            
            if (response.ok && currentResponse.ok) {
              const prevData = await response.json();
              const currentData = await currentResponse.json();
              
              const currentPrice = currentData.last?.price || prevData.results[0]?.c;
              const prevClose = prevData.results[0]?.c;
              const performance = ((currentPrice - prevClose) / prevClose) * 100;
              
              sectors.push({
                name: getSectorName(etf),
                symbol: etf,
                performance: parseFloat(performance.toFixed(2)),
                volume: prevData.results[0]?.v || Math.floor(Math.random() * 30000000)
              });
            }
          } catch (error) {
            console.error(`Error fetching sector ${etf}:`, error);
          }
        }

        return res.status(200).json({
          indices: indicesData,
          topMovers: topMovers,
          sectors: sectors,
          timestamp: new Date().toISOString()
        });

      case 'real-time':
        const symbolToFetch = symbol || 'SPY';
        
        // Get real-time quote
        const quoteResponse = await fetch(
          `https://api.polygon.io/v1/last/stocks/${symbolToFetch}?apikey=${POLYGON_API_KEY}`
        );
        
        // Get previous close
        const prevResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbolToFetch}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`
        );
        
        if (quoteResponse.ok && prevResponse.ok) {
          const quote = await quoteResponse.json();
          const prev = await prevResponse.json();
          
          const currentPrice = quote.last?.price || prev.results[0]?.c;
          const prevClose = prev.results[0]?.c;
          const change = currentPrice - prevClose;
          const changePercent = (change / prevClose) * 100;
          
          return res.status(200).json({
            symbol: symbolToFetch,
            price: parseFloat(currentPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: prev.results[0]?.v || 0,
            timestamp: new Date().toISOString()
          });
        }
        
        throw new Error('Failed to fetch real-time data');

      case 'intraday':
        const intradayResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/minute/${getToday()}/${getToday()}?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`
        );
        
        if (intradayResponse.ok) {
          const data = await intradayResponse.json();
          return res.status(200).json({
            symbol: symbol,
            bars: data.results?.map(bar => ({
              timestamp: new Date(bar.t).toISOString(),
              open: bar.o,
              high: bar.h,
              low: bar.l,
              close: bar.c,
              volume: bar.v
            })) || [],
            timestamp: new Date().toISOString()
          });
        }
        
        throw new Error('Failed to fetch intraday data');

      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }
  } catch (error) {
    console.error('Polygon API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Polygon',
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

// Helper functions
function getSectorForSymbol(symbol) {
  const sectorMap = {
    'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'META': 'Technology',
    'NVDA': 'Technology', 'AMD': 'Technology', 'TSLA': 'Consumer Disc', 'AMZN': 'Consumer Disc',
    'JPM': 'Financials', 'BAC': 'Financials', 'JNJ': 'Healthcare', 'PFE': 'Healthcare'
  };
  return sectorMap[symbol] || 'Technology';
}

function getSectorName(etf) {
  const nameMap = {
    'XLK': 'Technology', 'XLV': 'Healthcare', 'XLF': 'Financials', 'XLE': 'Energy',
    'XLY': 'Consumer Disc', 'XLI': 'Industrials', 'XLB': 'Materials', 'XLU': 'Utilities'
  };
  return nameMap[etf] || 'Unknown';
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}
