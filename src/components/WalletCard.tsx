import React from 'react';
import { Copy, Wallet, LogOut } from 'lucide-react';
import { usePhantomWallet } from '../hooks/usePhantomWallet';

export const WalletCard: React.FC = () => {
  const { wallet, connecting, error, connectWallet, disconnectWallet, isPhantomInstalled } = usePhantomWallet();

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!isPhantomInstalled) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Phantom Wallet</h3>
        </div>
        <p className="text-gray-400 mb-4">Phantom wallet not detected. Please install the Phantom browser extension to continue.</p>
        <a
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
        >
          Install Phantom
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Phantom Wallet</h3>
        </div>
        {wallet.connected && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Connected</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {wallet.connected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-gray-400 text-sm">Wallet Address</p>
              <p className="text-white font-mono">{formatAddress(wallet.address)}</p>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors duration-200"
        >
          <Wallet className="w-4 h-4" />
          <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      )}
    </div>
  );
};