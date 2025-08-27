export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write(`event: connected\n`);
  res.write(`data: Stream connected at ${new Date().toISOString()}\n\n`);

  // Mock real-time flow data generator
  const sendMockFlow = () => {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const flowData = {
      symbol,
      type: Math.random() > 0.5 ? 'CALL' : 'PUT',
      strike: Math.round(150 + Math.random() * 100),
      premium: Math.round(100000 + Math.random() * 900000),
      volume: Math.round(100 + Math.random() * 1000),
      multiplier: 1 + Math.random() * 4,
      unusual: Math.random() > 0.7,
      timestamp: new Date().toISOString()
    };

    res.write(`event: flow\n`);
    res.write(`data: ${JSON.stringify(flowData)}\n\n`);
  };

  // Send mock flow data every 5-15 seconds
  const interval = setInterval(() => {
    if (Math.random() > 0.3) { // 70% chance to send data
      sendMockFlow();
    }
  }, 5000 + Math.random() * 10000);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\n`);
    res.write(`data: ${Date.now()}\n\n`);
  }, 30000);

  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    res.end();
  });

  req.on('error', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    res.end();
  });
}

