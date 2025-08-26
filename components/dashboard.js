import { useState, useEffect } from 'react';

export default function Dashboard({ marketData, loading }) {
  const [marketStats, setMarketStats] = useState({
    totalStocks: 0,
    gainers: 0,
    losers: 0,
    avgChange: 0,
    totalVolume: 0
  });

  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      calculateMarketStats();
    }
  }, [marketData]);

  const calculateMarketStats = () => {
    const stocks = Object.values(marketData);
    const totalStocks = stocks.length;
    const gainers = stocks.filter(stock => stock.changePercent > 0).length;
    const losers = stocks.filter(stock => stock.changePercent < 0).length;
    const avgChange = stocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / totalStocks;
    const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);

    setMarketStats({
      totalStocks,
      gainers,
      losers,
      avgChange,
      totalVolume
    });
  };

  if (loading) {
    return (
      "flex items-center justify-center h-64">
        "text-xl text-gray-400">Loading market data...
      
    );
  }

  return (
    "space-y-6">
      {/* Market Overview Cards */}
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        "bg-gray-800 rounded-lg p-6 border border-gray-700">
          "flex items-center justify-between">
            
              "text-gray-400 text-sm">Total Stocks
              "text-2xl font-bold text-white">{marketStats.totalStocks}
            
            "text-3xl">📊
          
        

        "bg-gray-800 rounded-lg p-6 border border-gray-700">
          "flex items-center justify-between">
            
              "text-gray-400 text-sm">Gainers
              "text-2xl font-bold text-green-400">{marketStats.gainers}
            
            "text-3xl">📈
          
        

        "bg-gray-800 rounded-lg p-6 border border-gray-700">
          "flex items-center justify-between">
            
              "text-gray-400 text-sm">Losers
              "text-2xl font-bold text-red-400">{marketStats.losers}
            
            "text-3xl">📉
          
        

        "bg-gray-800 rounded-lg p-6 border border-gray-700">
          "flex items-center justify-between">
            
              "text-gray-400 text-sm">Avg Change
              "{`text-2xl" font-bold="" ${marketstats.avgchange="">= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.avgChange.toFixed(2)}%
              
            
            ">⚖️
          
        
      

      {/* Top Movers */}
      800 rounded-lg border border-gray-700">
        6 border-b border-gray-700">
          ">Top Movers
        
        ">
          
              {Object.values(marketData)
                .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
                .slice(0, 10)
                .map((stock) => (
                  
                ))}
            ">
            700">
              700">" classname="hover:bg-gray-700">
                    
                6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol
                6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price
                6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Change
                6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume
                6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Flow Score
              
            
            6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {stock.symbol}
                    
                    6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${stock.price?.toFixed(2) || 'N/A'}
                    
                    6 py-4 whitespace-nowrap text-sm">
                      " ||="" 0)="">= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(stock.changePercent || 0) >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                      
                    
                    6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                    
                    6 py-4 whitespace-nowrap text-sm">
                      ">
                        16 bg-gray-600 rounded-full h-2 mr-2">
                          500 h-2 rounded-full" style="{{" width:="" `${(stock.flowscore="" ||="" 0)}%`="" }}="">
                        
                        300 text-xs">{stock.flowScore || 0}
                      
                    
                  
          
        
      
    
  );
}
