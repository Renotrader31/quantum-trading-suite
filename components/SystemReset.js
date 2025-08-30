import React, { useState } from 'react';
import { 
  RefreshCw, AlertTriangle, Trash2, Database, Brain, 
  Target, CheckCircle, XCircle, Info, Clock, Shield,
  Zap, BarChart3, Settings, Package, HardDrive
} from 'lucide-react';

export default function SystemReset({ marketData, loading, onRefresh, lastUpdate }) {
  const [resetType, setResetType] = useState('pipeline_ml');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetOptions = [
    {
      id: 'pipeline_ml',
      name: 'Pipeline & ML Reset',
      description: 'Clear pipeline trades and ML learning data for fresh start',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-blue-400',
      recommended: true,
      affects: ['Trading Pipeline', 'ML Learning Data', 'Model Weights'],
      preserves: ['User Preferences', 'Trade History']
    },
    {
      id: 'pipeline_only',
      name: 'Pipeline Only',
      description: 'Clear only pipeline data, preserve ML learning',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400',
      recommended: false,
      affects: ['Trading Pipeline', 'Active Trades'],
      preserves: ['ML Learning Data', 'Model Weights', 'Trade History']
    },
    {
      id: 'ml_only',
      name: 'ML Only',
      description: 'Reset ML model and learning data, keep pipeline',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-purple-400',
      recommended: false,
      affects: ['ML Learning Data', 'Model Weights', 'Strategy Preferences'],
      preserves: ['Trading Pipeline', 'Active Trades', 'Trade History']
    },
    {
      id: 'complete',
      name: 'Complete Reset',
      description: 'Nuclear option - clear ALL data and start completely fresh',
      icon: <Trash2 className="w-5 h-5" />,
      color: 'text-red-400',
      recommended: false,
      affects: ['Everything'],
      preserves: ['Nothing - Complete fresh start'],
      warning: 'This will permanently delete ALL data!'
    }
  ];

  const handleResetRequest = () => {
    const selectedOption = resetOptions.find(opt => opt.id === resetType);
    if (selectedOption?.id === 'complete') {
      // Extra confirmation for complete reset
      setShowAdvanced(true);
    }
    setShowConfirmation(true);
  };

  const executeReset = async () => {
    if (confirmationCode !== 'FRESH_START_CONFIRMED') {
      alert('Please type the exact confirmation code: FRESH_START_CONFIRMED');
      return;
    }

    setIsResetting(true);
    setResetResult(null);

    try {
      console.log(`🔄 Executing ${resetType} reset...`);
      
      const response = await fetch('/api/system-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetType: resetType,
          confirmationCode: confirmationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        setResetResult({
          success: true,
          message: data.message,
          operations: data.operations,
          timestamp: data.timestamp,
          nextSteps: data.backup?.nextSteps || []
        });
        console.log('✅ Reset successful:', data.message);
      } else {
        throw new Error(data.error || 'Reset failed');
      }

    } catch (error) {
      console.error('❌ Reset error:', error);
      setResetResult({
        success: false,
        message: error.message,
        error: true
      });
    } finally {
      setIsResetting(false);
    }
  };

  const resetConfirmation = () => {
    setShowConfirmation(false);
    setShowAdvanced(false);
    setConfirmationCode('');
    setResetResult(null);
  };

  const selectedOption = resetOptions.find(opt => opt.id === resetType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 border border-red-800/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-900/30 rounded-lg">
            <RefreshCw className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Reset</h1>
            <p className="text-gray-400">Clear data for fresh start with live accurate data</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300">
            Reset operations are permanent. Choose your reset type carefully.
          </span>
        </div>
      </div>

      {/* Reset Options */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Reset Options</span>
        </h2>
        
        {resetOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => setResetType(option.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              resetType === option.id
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded ${option.color} bg-gray-800`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-white">{option.name}</h3>
                    {option.recommended && (
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                        Recommended
                      </span>
                    )}
                    {option.warning && (
                      <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                        Danger
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{option.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium text-red-300 mb-1">Will Clear:</div>
                      <ul className="space-y-1">
                        {option.affects.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span className="text-red-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="font-medium text-green-300 mb-1">Will Preserve:</div>
                      <ul className="space-y-1">
                        {option.preserves.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-green-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`w-4 h-4 rounded-full border-2 ${
                resetType === option.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-500'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Execute Reset Button */}
      {!showConfirmation && !resetResult && (
        <div className="flex justify-center">
          <button
            onClick={handleResetRequest}
            disabled={!resetType}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 
                     hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 
                     text-white rounded-lg transition-all disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Execute {selectedOption?.name}</span>
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && !resetResult && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Confirm Reset Operation</h3>
          </div>
          
          <div className="bg-red-900/30 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <div className="font-medium text-red-300 mb-1">You are about to execute:</div>
                <div className="text-white font-medium">{selectedOption?.name}</div>
                <div className="text-sm text-gray-300 mt-1">{selectedOption?.description}</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Type "FRESH_START_CONFIRMED" to confirm:
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="FRESH_START_CONFIRMED"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white 
                       focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={executeReset}
              disabled={isResetting || confirmationCode !== 'FRESH_START_CONFIRMED'}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                       disabled:bg-gray-600 text-white rounded transition-all disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Reset</span>
                </>
              )}
            </button>
            
            <button
              onClick={resetConfirmation}
              disabled={isResetting}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Result */}
      {resetResult && (
        <div className={`rounded-lg p-6 border ${
          resetResult.success 
            ? 'bg-green-900/20 border-green-700' 
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            {resetResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {resetResult.success ? 'Reset Successful' : 'Reset Failed'}
            </h3>
          </div>
          
          <p className={`text-sm mb-4 ${
            resetResult.success ? 'text-green-300' : 'text-red-300'
          }`}>
            {resetResult.message}
          </p>

          {resetResult.operations && (
            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Operations Completed:</h4>
              <ul className="space-y-1">
                {resetResult.operations.map((op, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-300">{op}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resetResult.nextSteps && (
            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Next Steps:</h4>
              <ul className="space-y-1">
                {resetResult.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm">
                    <Info className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-300">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-all"
            >
              Reload Application
            </button>
            
            <button
              onClick={resetConfirmation}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-blue-400" />
          <h4 className="font-medium text-white">Reset Information</h4>
        </div>
        
        <div className="text-sm text-blue-300 space-y-1">
          <p>• Reset operations are permanent and cannot be undone</p>
          <p>• Live data integration will continue working after reset</p>
          <p>• ML system will start learning fresh patterns from new data</p>
          <p>• Consider backing up important configurations before reset</p>
        </div>
      </div>
    </div>
  );
}