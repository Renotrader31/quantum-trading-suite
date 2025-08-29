import React from 'react';
import OptionsStrategyTab from '../components/OptionsStrategyTab';
import ErrorBoundary from '../components/ErrorBoundary';

export default function TestOptions() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            🧪 Options Strategy Test Page
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Testing the OptionsStrategyTab component directly
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">
            ✅ Component Test Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>React component loaded successfully</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Error boundary active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Testing OptionsStrategyTab component...</span>
            </div>
          </div>
        </div>

        {/* Options Strategy Component Test */}
        <ErrorBoundary>
          <div className="bg-gray-800 rounded-lg p-1">
            <OptionsStrategyTab />
          </div>
        </ErrorBoundary>

        {/* Navigation Back */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-medium"
          >
            ← Back to Main App
          </button>
        </div>
      </div>
    </div>
  );
}