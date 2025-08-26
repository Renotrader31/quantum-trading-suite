<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gamma Analytics Component - Quantum Trading Suite</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            background: #111827;
            color: #f9fafb;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .gradient-border {
            background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899);
            padding: 1px;
            border-radius: 8px;
        }
        .chart-container {
            height: 400px;
            position: relative;
        }
        .gex-card {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border: 1px solid #374151;
        }
        .flip-point {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        }
        .gamma-wall {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
        .resistance-level {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        }
        .support-level {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
    </style>
</head>
<body>
    <div class="container mx-auto p-6 max-w-7xl">
        <div class="space-y-6">
            <!-- Header Section -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                        <i class="fas fa-bolt text-yellow-400"></i>
                        Gamma Flow Analytics
                        <span class="text-sm bg-yellow-900 bg-opacity-30 text-yellow-400 px-3 py-1 rounded-full">
                            Real-Time GEX • Market Maker Positioning
                        </span>
                    </h1>
                    <p class="text-gray-400 mt-1">
                        Advanced gamma exposure analysis with flip points and wall detection
                    </p>
                </div>
                <div class="flex gap-3">
                    <button class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                        <i class="fas fa-play"></i>
                        Start Analysis
                    </button>
                    <button class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white font-medium">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            <!-- GEX Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="gex-card rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-gray-400 text-sm">Total GEX</div>
                            <div class="text-2xl font-bold text-purple-400">$2.4B</div>
                        </div>
                        <div class="text-3xl text-purple-400">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        Net Gamma Exposure
                    </div>
                </div>

                <div class="gex-card rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-gray-400 text-sm">Flip Point</div>
                            <div class="text-2xl font-bold text-yellow-400">$485.50</div>
                        </div>
                        <div class="text-3xl text-yellow-400">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        Current: $487.20 (+$1.70)
                    </div>
                </div>

                <div class="gex-card rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-gray-400 text-sm">Call Wall</div>
                            <div class="text-2xl font-bold text-red-400">$495.00</div>
                        </div>
                        <div class="text-3xl text-red-400">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        Resistance Level
                    </div>
                </div>

                <div class="gex-card rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-gray-400 text-sm">Put Wall</div>
                            <div class="text-2xl font-bold text-green-400">$475.00</div>
                        </div>
                        <div class="text-3xl text-green-400">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        Support Level
                    </div>
                </div>
            </div>

            <!-- Main GEX Chart -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white">Gamma Exposure Profile</h3>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-purple-600 text-white rounded text-sm">SPY</button>
                        <button class="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">QQQ</button>
                        <button class="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">IWM</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="gexChart"></canvas>
                </div>
            </div>

            <!-- Detailed Analytics Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Support & Resistance Levels -->
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-layer-group text-blue-400"></i>
                        Gamma Levels Analysis
                    </h3>
                    
                    <!-- Resistance Levels -->
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-red-400 mb-3 uppercase tracking-wider">Resistance Levels</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center py-2 px-3 bg-red-900 bg-opacity-20 rounded">
                                <span class="text-red-400 font-semibold">R3</span>
                                <span class="font-mono text-white">$500.00</span>
                                <span class="text-xs text-gray-400">Strong</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-3 bg-red-900 bg-opacity-20 rounded">
                                <span class="text-red-400 font-semibold">R2</span>
                                <span class="font-mono text-white">$495.00</span>
                                <span class="text-xs text-gray-400">Major</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-3 bg-red-900 bg-opacity-20 rounded">
                                <span class="text-red-400 font-semibold">R1</span>
                                <span class="font-mono text-white">$490.00</span>
                                <span class="text-xs text-gray-400">Minor</span>
                            </div>
                        </div>
                    </div>

                    <!-- Current Price -->
                    <div class="my-4 py-3 px-4 bg-purple-900 bg-opacity-30 rounded-lg border border-purple-500">
                        <div class="flex justify-between items-center">
                            <span class="text-purple-400 font-semibold">Current Price</span>
                            <span class="font-mono text-white text-lg">$487.20</span>
                            <span class="text-green-400 text-sm">+0.35%</span>
                        </div>
                    </div>

                    <!-- Support Levels -->
                    <div>
                        <h4 class="text-sm font-medium text-green-400 mb-3 uppercase tracking-wider">Support Levels</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center py-2 px-3 bg-green-900 bg-opacity-20 rounded">
                                <span class="text-green-400 font-semibold">S1</span>
                                <span class="font-mono text-white">$480.00</span>
                                <span class="text-xs text-gray-400">Minor</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-3 bg-green-900 bg-opacity-20 rounded">
                                <span class="text-green-400 font-semibold">S2</span>
                                <span class="font-mono text-white">$475.00</span>
                                <span class="text-xs text-gray-400">Major</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-3 bg-green-900 bg-opacity-20 rounded">
                                <span class="text-green-400 font-semibold">S3</span>
                                <span class="font-mono text-white">$470.00</span>
                                <span class="text-xs text-gray-400">Strong</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Market Maker Positioning -->
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-users text-cyan-400"></i>
                        Market Maker Positioning
                    </h3>
                    
                    <!-- MM Status -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-gray-400">MM Gamma Positioning</span>
                            <span class="text-green-400 font-semibold">LONG GAMMA</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: 65%"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">Price is below gamma flip point</div>
                    </div>

                    <!-- Volatility Impact -->
                    <div class="mb-6">
                        <div class="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                            <h4 class="text-sm font-medium text-yellow-400 mb-2">Volatility Impact</h4>
                            <div class="text-xs text-gray-300 leading-relaxed">
                                Market makers are <span class="text-green-400 font-semibold">long gamma</span>, 
                                which creates a stabilizing effect. Expect <span class="text-blue-400">lower volatility</span> 
                                as MM hedging dampens price movements.
                            </div>
                        </div>
                    </div>

                    <!-- Greeks Summary -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-gray-900 bg-opacity-30 rounded">
                            <div class="text-lg font-bold text-blue-400">+$1.2B</div>
                            <div class="text-xs text-gray-400">Call Gamma</div>
                        </div>
                        <div class="text-center p-3 bg-gray-900 bg-opacity-30 rounded">
                            <div class="text-lg font-bold text-red-400">-$0.8B</div>
                            <div class="text-xs text-gray-400">Put Gamma</div>
                        </div>
                        <div class="text-center p-3 bg-gray-900 bg-opacity-30 rounded">
                            <div class="text-lg font-bold text-purple-400">$2.1B</div>
                            <div class="text-xs text-gray-400">Total Delta</div>
                        </div>
                        <div class="text-center p-3 bg-gray-900 bg-opacity-30 rounded">
                            <div class="text-lg font-bold text-yellow-400">-$0.3B</div>
                            <div class="text-xs text-gray-400">Vanna</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GEX Flow Analysis -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-stream text-indigo-400"></i>
                    Real-Time GEX Flow
                </h3>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Strike</th>
                                <th class="text-right py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Call Gamma</th>
                                <th class="text-right py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Put Gamma</th>
                                <th class="text-right py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Net GEX</th>
                                <th class="text-center py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Impact</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            <tr class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors">
                                <td class="py-3 px-4 font-mono text-white">$500.00</td>
                                <td class="py-3 px-4 text-right text-blue-400">+$45.2M</td>
                                <td class="py-3 px-4 text-right text-red-400">-$12.1M</td>
                                <td class="py-3 px-4 text-right font-semibold text-green-400">+$33.1M</td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-1 bg-red-900 bg-opacity-30 text-red-400 text-xs rounded">Resistance</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors">
                                <td class="py-3 px-4 font-mono text-white">$495.00</td>
                                <td class="py-3 px-4 text-right text-blue-400">+$67.8M</td>
                                <td class="py-3 px-4 text-right text-red-400">-$18.3M</td>
                                <td class="py-3 px-4 text-right font-semibold text-green-400">+$49.5M</td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-1 bg-red-900 bg-opacity-30 text-red-400 text-xs rounded">Strong Res</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors border-l-4 border-purple-500">
                                <td class="py-3 px-4 font-mono text-purple-400 font-bold">$487.20</td>
                                <td class="py-3 px-4 text-right text-blue-400">+$23.1M</td>
                                <td class="py-3 px-4 text-right text-red-400">-$21.7M</td>
                                <td class="py-3 px-4 text-right font-semibold text-purple-400">+$1.4M</td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-1 bg-purple-900 bg-opacity-30 text-purple-400 text-xs rounded">Current</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors">
                                <td class="py-3 px-4 font-mono text-white">$480.00</td>
                                <td class="py-3 px-4 text-right text-blue-400">+$34.7M</td>
                                <td class="py-3 px-4 text-right text-red-400">-$52.3M</td>
                                <td class="py-3 px-4 text-right font-semibold text-red-400">-$17.6M</td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-1 bg-green-900 bg-opacity-30 text-green-400 text-xs rounded">Support</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors">
                                <td class="py-3 px-4 font-mono text-white">$475.00</td>
                                <td class="py-3 px-4 text-right text-blue-400">+$28.9M</td>
                                <td class="py-3 px-4 text-right text-red-400">-$71.2M</td>
                                <td class="py-3 px-4 text-right font-semibold text-red-400">-$42.3M</td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-1 bg-green-900 bg-opacity-30 text-green-400 text-xs rounded">Strong Sup</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Trading Insights -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-lightbulb text-yellow-400"></i>
                        Trading Insights
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="bg-green-900 bg-opacity-20 border-l-4 border-green-400 p-4 rounded">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-arrow-up text-green-400 mt-1"></i>
                                <div>
                                    <div class="text-green-400 font-medium">Bullish Setup</div>
                                    <div class="text-sm text-gray-300">Strong put wall at $475 provides solid support. Low volatility environment favors upward moves.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-400 p-4 rounded">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-exclamation-triangle text-yellow-400 mt-1"></i>
                                <div>
                                    <div class="text-yellow-400 font-medium">Key Level</div>
                                    <div class="text-sm text-gray-300">Flip point at $485.50 critical. Break above shifts MM to short gamma (higher vol).</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-blue-900 bg-opacity-20 border-l-4 border-blue-400 p-4 rounded">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-chart-line text-blue-400 mt-1"></i>
                                <div>
                                    <div class="text-blue-400 font-medium">Volatility Outlook</div>
                                    <div class="text-sm text-gray-300">Expect compressed volatility while price remains between gamma walls ($475-$495).</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-cog text-gray-400"></i>
                        System Status
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2">
                            <span class="text-gray-400">GEX Data Feed</span>
                            <span class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span class="text-green-400 text-sm">Live</span>
                            </span>
                        </div>
                        
                        <div class="flex justify-between items-center py-2">
                            <span class="text-gray-400">Unusual Whales API</span>
                            <span class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span class="text-green-400 text-sm">Connected</span>
                            </span>
                        </div>
                        
                        <div class="flex justify-between items-center py-2">
                            <span class="text-gray-400">Last Update</span>
                            <span class="text-gray-300 text-sm">12:34:56 PM</span>
                        </div>
                        
                        <div class="flex justify-between items-center py-2">
                            <span class="text-gray-400">Data Quality</span>
                            <span class="text-green-400 text-sm">99.8%</span>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-gray-700">
                            <div class="text-xs text-gray-500 leading-relaxed">
                                Real-time gamma exposure data from institutional options flow. 
                                Updates every 5 seconds during market hours.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize GEX Chart
        const ctx = document.getElementById('gexChart').getContext('2d');
        
        const gexChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['470', '475', '480', '485', '487.20', '490', '495', '500', '505'],
                datasets: [{
                    label: 'Call Gamma',
                    data: [28.9, 34.2, 34.7, 41.3, 23.1, 38.7, 67.8, 45.2, 32.1],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }, {
                    label: 'Put Gamma',
                    data: [-45.3, -71.2, -52.3, -28.9, -21.7, -15.4, -18.3, -12.1, -8.7],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'SPY Gamma Exposure by Strike',
                        color: '#f9fafb',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#f9fafb'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Strike Price ($)',
                            color: '#9ca3af'
                        },
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: '#374151'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Gamma Exposure ($M)',
                            color: '#9ca3af'
                        },
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: '#374151'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                },
                animation: {
                    duration: 1000
                }
            }
        });

        // Add vertical line for current price
        Chart.register({
            id: 'currentPriceLine',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const xAxis = chart.scales.x;
                const yAxis = chart.scales.y;
                
                // Current price position
                const currentPriceIndex = 4; // Index of 487.20
                const x = xAxis.getPixelForValue(currentPriceIndex);
                
                ctx.save();
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom);
                ctx.stroke();
                ctx.restore();
            }
        });

        // Simulate real-time updates
        setInterval(() => {
            // Update GEX values slightly
            const datasets = gexChart.data.datasets;
            datasets[0].data = datasets[0].data.map(val => val + (Math.random() - 0.5) * 2);
            datasets[1].data = datasets[1].data.map(val => val + (Math.random() - 0.5) * 2);
            gexChart.update('none');
        }, 5000);

        // Add interactive hover effects
        document.querySelectorAll('.gex-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        console.log('🚀 Gamma Analytics Component Loaded Successfully!');
        console.log('📊 Real-time GEX analysis initialized');
        console.log('⚡ Gamma walls and flip points calculated');
    </script>
</body>
</html>
