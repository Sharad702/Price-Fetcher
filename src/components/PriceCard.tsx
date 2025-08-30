import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Database, Globe, BarChart3 } from 'lucide-react';
import { PriceData } from '../types';

interface PriceCardProps {
  priceData: PriceData;
  loading?: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({ priceData, loading = false }) => {
  const isPositive = priceData.priceChangePercentage24h >= 0;
  
  // Check if this is fallback data (prices that are exactly the same as our fallback values)
  const isFallbackData = 
    (priceData.symbol === 'SOL' && priceData.price === 98.45) ||
    (priceData.symbol === 'BONK' && priceData.price === 0.00001234);
  
  // Check if this is defi/price API data (primary source)
  const isDefiPriceData = priceData.price > 0 && !isFallbackData;
  
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getDataSourceInfo = () => {
    if (isFallbackData) {
      return { icon: AlertTriangle, text: 'Fallback Data', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', borderColor: 'border-yellow-700' };
    } else if (isDefiPriceData) {
      return { icon: Database, text: 'Defi/Price API', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-700' };
    } else {
      return { icon: Database, text: 'Birdeye API', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-700' };
    }
  };

  const dataSource = getDataSourceInfo();

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            priceData.symbol === 'SOL' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'
          }`}>
            <span className="text-white font-bold text-sm">{priceData.symbol}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{priceData.symbol}</h3>
            <p className="text-gray-400 text-sm">
              {priceData.symbol === 'SOL' ? 'Solana' : 'Bonk'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          )}
          <div className={`flex items-center space-x-1 ${dataSource.color}`} title={dataSource.text}>
            <dataSource.icon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Data source indicator */}
      <div className={`mb-3 p-2 ${dataSource.bgColor} border ${dataSource.borderColor} rounded-lg`}>
        <div className="flex items-center justify-center space-x-2">
          <dataSource.icon className={`w-3 h-3 ${dataSource.color}`} />
          <p className={`text-xs ${dataSource.color.replace('text-', 'text-').replace('-400', '-200')}`}>
            {dataSource.text}
            {isFallbackData && ' - API temporarily unavailable'}
            {isDefiPriceData && ' - Live market data'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-end space-x-2">
          <span className="text-2xl font-bold text-white">
            {formatPrice(priceData.price)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {formatPercentage(priceData.priceChangePercentage24h)}
            </span>
          </div>
          <span className="text-gray-500 text-sm">24h</span>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <p className="text-gray-400 text-xs">
            Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};