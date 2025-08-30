import React from 'react';
import { BarChart3, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CryptoDash</h1>
              <p className="text-blue-400 text-sm">Solana Price Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Live Data</span>
          </div>
        </div>
      </div>
    </header>
  );
};