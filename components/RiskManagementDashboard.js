import React, { useState, useEffect } from 'react';

const RiskManagementDashboard = ({ positions = [], portfolioValue = 100000, onPositionSizeCalculated }) => {
  const [riskData, setRiskData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kellyInputs, setKellyInputs] = useState({
    winRate: 0.65,
    avgWin: 0.15,
    avgLoss: 0.08
  });
  const [showKellyCalculator, setShowKellyCalculator] = useState(false);

  // Real-time risk assessment
  useEffect(() => {
    if (positions.length > 0) {
      assessPortfolioRisk();
    }
  }, [positions]);

  const assessPortfolioRisk = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assessPortfolioRisk',
          positions,
          portfolioValue
        })
      });

      const data = await response.json();
      if (data.success) {
        setRiskData(data.riskAssessment);
        setAlerts(data.riskAssessment.alerts || []);
      }
    } catch (error) {
      console.error('Risk assessment failed:', error);
    }
    setLoading(false);
  };

  const calculateKellySize = async () => {
    try {
      const response = await fetch('/api/risk-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculatePositionSize',
          winRate: kellyInputs.winRate,
          avgWin: kellyInputs.avgWin,
          avgLoss: kellyInputs.avgLoss,
          portfolioValue
        })
      });

      const data = await response.json();
      if (data.success && onPositionSizeCalculated) {
        onPositionSizeCalculated(data.positionSize);
      }
    } catch (error) {
      console.error('Kelly calculation failed:', error);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'critical': return 'border-red-500 bg-red-50 text-red-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Risk Management Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={assessPortfolioRisk}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh Risk'}
          </button>
          <button
            onClick={() => setShowKellyCalculator(!showKellyCalculator)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Kelly Calculator
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-red-600">⚠️ Active Risk Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border-l-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    {alert.recommendation && (
                      <p className="text-sm mt-1 opacity-75">💡 {alert.recommendation}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kelly Criterion Calculator */}
      {showKellyCalculator && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">📊 Kelly Criterion Position Sizing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Win Rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={kellyInputs.winRate}
                onChange={(e) => setKellyInputs({...kellyInputs, winRate: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.65"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Win (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kellyInputs.avgWin}
                onChange={(e) => setKellyInputs({...kellyInputs, avgWin: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Loss (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kellyInputs.avgLoss}
                onChange={(e) => setKellyInputs({...kellyInputs, avgLoss: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.08"
              />
            </div>
          </div>
          <button
            onClick={calculateKellySize}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Calculate Optimal Position Size
          </button>
        </div>
      )}

      {/* Risk Metrics Dashboard */}
      {riskData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Risk Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">📈 Portfolio Risk Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border">
                <span className="font-medium">Overall Risk Level</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskData.overallRisk)}`}>
                  {riskData.overallRisk}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border">
                <span className="font-medium">Risk Score</span>
                <span className="font-bold text-lg">{riskData.riskScore}/100</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border">
                <span className="font-medium">Position Count</span>
                <span className="font-bold">{positions.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border">
                <span className="font-medium">Portfolio Value</span>
                <span className="font-bold">${portfolioValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Concentration Risks */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🎯 Concentration Analysis</h3>
            <div className="space-y-4">
              {riskData.concentrationRisks && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sector Exposure</h4>
                    <div className="space-y-2">
                      {Object.entries(riskData.concentrationRisks.sectorConcentration || {})
                        .slice(0, 5)
                        .map(([sector, percentage]) => (
                        <div key={sector} className="flex justify-between items-center">
                          <span className="text-sm">{sector}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentage * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{(percentage * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Strategy Exposure</h4>
                    <div className="space-y-2">
                      {Object.entries(riskData.concentrationRisks.strategyConcentration || {})
                        .slice(0, 3)
                        .map(([strategy, percentage]) => (
                        <div key={strategy} className="flex justify-between items-center">
                          <span className="text-sm">{strategy}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentage * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{(percentage * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Greeks Exposure */}
          {riskData.greeksExposure && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🔄 Greeks Exposure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {riskData.greeksExposure.totalDelta?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">Total Delta</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {riskData.greeksExposure.totalGamma?.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Gamma</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {riskData.greeksExposure.totalTheta?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">Total Theta</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {riskData.greeksExposure.totalVega?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">Total Vega</div>
                </div>
              </div>
            </div>
          )}

          {/* Time Decay Risks */}
          {riskData.timeDecayRisks && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">⏰ Time Decay Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="font-medium">Positions Expiring &lt; 7 Days</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    riskData.timeDecayRisks.criticalDTE > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {riskData.timeDecayRisks.criticalDTE || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="font-medium">Avg Days to Expiration</span>
                  <span className="font-bold">{riskData.timeDecayRisks.avgDTE?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="font-medium">Daily Theta Decay</span>
                  <span className="font-bold text-red-600">
                    ${Math.abs(riskData.timeDecayRisks.dailyThetaDecay || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!riskData && positions.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Positions to Analyze</h3>
          <p className="text-gray-600">Add some positions to your portfolio to see comprehensive risk analysis.</p>
        </div>
      )}
    </div>
  );
};

export default RiskManagementDashboard;