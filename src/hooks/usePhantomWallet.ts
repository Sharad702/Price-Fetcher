import { useState, useEffect, useCallback } from 'react';
import { WalletInfo } from '../types';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
      publicKey?: { toString: () => string };
      isConnected?: boolean;
    };
  }
}

export const usePhantomWallet = () => {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    connected: false,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { solana } = window;
      
      if (solana?.isPhantom && solana.isConnected && solana.publicKey) {
        setWallet({
          address: solana.publicKey.toString(),
          connected: true,
        });
      }
    } catch (err) {
      console.log('Error checking wallet connection:', err);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const { solana } = window;

    if (!solana?.isPhantom) {
      setError('Phantom wallet not found. Please install Phantom wallet extension.');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      
      const response = await solana.connect();
      
      setWallet({
        address: response.publicKey.toString(),
        connected: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    const { solana } = window;

    try {
      if (solana) {
        await solana.disconnect();
      }
      
      setWallet({
        address: '',
        connected: false,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  }, []);

  useEffect(() => {
    const { solana } = window;

    if (solana?.isPhantom) {
      const handleConnect = () => checkIfWalletIsConnected();
      const handleDisconnect = () => {
        setWallet({ address: '', connected: false });
      };

      solana.on('connect', handleConnect);
      solana.on('disconnect', handleDisconnect);

      checkIfWalletIsConnected();

      return () => {
        solana.off('connect', handleConnect);
        solana.off('disconnect', handleDisconnect);
      };
    }
  }, [checkIfWalletIsConnected]);

  return {
    wallet,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
    isPhantomInstalled: !!window.solana?.isPhantom,
  };
};