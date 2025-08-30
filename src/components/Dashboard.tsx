import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { WalletCard } from './WalletCard';
import { PriceCard } from './PriceCard';
import { usePriceData } from '../hooks/usePriceData';

export const Dashboard: React.FC = () => {
  const { prices, loading, error, refetch } = usePriceData();
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  const handleRefresh = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    // Rate limiting: minimum 5 seconds between manual refreshes (matching API rate limit)
    if (timeSinceLastRefresh < 5000) {
      const remainingTime = Math.ceil((5000 - timeSinceLastRefresh) / 1000);
      console.log(`⏳ Please wait ${remainingTime} seconds before refreshing again`);
      return;
    }
    
    setLastRefreshTime(now);
    refetch();
  };

  // Check data sources
  const getDataSourcesSummary = () => {
    const sources = Object.entries(prices).map(([symbol, data]) => {
      const isFallback = (symbol === 'SOL' && data.price === 98.45) || (symbol === 'BONK' && data.price === 0.00001234);
      const isDefiPrice = data.price > 0 && !isFallback;
      
      if (isFallback) return { symbol, source: 'Fallback', status: 'warning' };
      if (isDefiPrice) return { symbol, source: 'Defi/Price API', status: 'success' };
      return { symbol, source: 'Birdeye API', status: 'success' };
    });

    return sources;
  };

  const dataSources = getDataSourcesSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Monitor your wallet and track live crypto prices</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading || (Date.now() - lastRefreshTime) < 5000}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>
            {loading ? 'Refreshing...' : 
             (Date.now() - lastRefreshTime) < 5000 ? 
             `Wait ${Math.ceil((5000 - (Date.now() - lastRefreshTime)) / 1000)}s` : 
             'Refresh Prices'}
          </span>
        </button>
      </div>

      {/* Note about ethereum error */}
      {/* <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Browser Extension Notice</h4>
            <p className="text-yellow-200 text-sm">
              If you see an "ethereum" error in the console, it's likely from a browser extension (like MetaMask) 
              conflicting with this Solana app. This error doesn't affect the functionality of your dashboard.
            </p>
          </div>
        </div>
      </div> */}

      {/* Data Sources Summary */}
      {Object.keys(prices).length > 0 && (
        <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-300 font-medium mb-2">Data Sources</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dataSources.map(({ symbol, source, status }) => (
                  <div key={symbol} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'success' ? 'bg-green-400' : 
                      status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-gray-300 text-sm">{symbol}:</span>
                    <span className={`text-sm ${
                      status === 'success' ? 'text-green-400' : 
                      status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>{source}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-2">
                The app tries multiple API sources to ensure you always have price data.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-300 font-medium mb-1">API Error</h4>
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-red-300 text-xs mt-2">
                The app is using fallback price data. Check the browser console for detailed API debugging information.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <WalletCard />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(prices).map(([symbol, priceData]) => (
            <PriceCard 
              key={symbol} 
              priceData={priceData} 
              loading={loading}
            />
          ))}
        </div>
      </div>

      {loading && Object.keys(prices).length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading price data...</p>
          </div>
        </div>
      )}
    </div>
  );
};