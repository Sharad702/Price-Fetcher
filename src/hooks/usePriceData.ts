import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceData } from '../types';

const BIRDEYE_API_BASE = 'https://public-api.birdeye.so';
const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;

// Token addresses - using the correct Solana token addresses
const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
};

// Global request manager to prevent multiple instances from making simultaneous calls
let globalRequestManager = {
  isRequesting: false,
  lastRequestTime: 0,
  requestCount: 0,
  consecutive429Errors: 0,
  usePublicEndpoint: false,
  listeners: new Set<() => void>()
};

export const usePriceData = () => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for this instance
  const requestTimeout = useRef<NodeJS.Timeout | null>(null);
  const instanceId = useRef<string>(Math.random().toString(36).substr(2, 9));

  // Log API key status (without exposing the full key)
  const apiKeySource = import.meta.env.VITE_BIRDEYE_API_KEY ? 'Environment Variable' : 'Fallback Key';
  console.log(`🔑 [Instance ${instanceId.current}] Using Birdeye API key from: ${apiKeySource}`);

  const fetchPriceData = useCallback(async () => {
    // Prevent multiple simultaneous requests globally
    if (globalRequestManager.isRequesting) {
      console.log(`⏳ [Instance ${instanceId.current}] Global request already in progress, skipping...`);
      return;
    }

    // Rate limiting: minimum 5 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - globalRequestManager.lastRequestTime;
    if (timeSinceLastRequest < 5000) {
      console.log(`⏳ [Instance ${instanceId.current}] Rate limiting: waiting ${5000 - timeSinceLastRequest}ms before next request`);
      return;
    }

    try {
      globalRequestManager.isRequesting = true;
      globalRequestManager.lastRequestTime = now;
      globalRequestManager.requestCount += 1;
      
      console.log(`🔄 [Instance ${instanceId.current}] API Request #${globalRequestManager.requestCount} - Time since last: ${timeSinceLastRequest}ms`);
      
      // If we've had too many 429 errors, switch to public endpoint
      if (globalRequestManager.consecutive429Errors >= 1) { // Switch immediately on first 429
        globalRequestManager.usePublicEndpoint = true;
        console.log(`🔄 [Instance ${instanceId.current}] Switching to public endpoint due to rate limiting (${globalRequestManager.consecutive429Errors} errors)`);
      }

      if (globalRequestManager.usePublicEndpoint) {
        console.log(`🔄 [Instance ${instanceId.current}] Fetching price data from Birdeye public endpoint (no API key)...`);

        // Use public endpoint without API key
        const [solResponse, bonkResponse] = await Promise.all([
          fetch(`${BIRDEYE_API_BASE}/public/price?address=${TOKENS.SOL}`),
          fetch(`${BIRDEYE_API_BASE}/public/price?address=${TOKENS.BONK}`)
        ]);

        console.log(`📡 [Instance ${instanceId.current}] SOL public response status:`, solResponse.status, solResponse.statusText);
        console.log(`📡 [Instance ${instanceId.current}] BONK public response status:`, bonkResponse.status, bonkResponse.statusText);

        if (solResponse.ok && bonkResponse.ok) {
          const solData = await solResponse.json();
          const bonkData = await bonkResponse.json();

          console.log(`📊 [Instance ${instanceId.current}] SOL public API response:`, solData);
          console.log(`📊 [Instance ${instanceId.current}] BONK public API response:`, bonkData);

          // Extract price data from the response structure
          const solPrice = solData?.data?.value;
          const bonkPrice = bonkData?.data?.value;

          if (solPrice && bonkPrice) {
            const priceData: Record<string, PriceData> = {
              SOL: {
                address: TOKENS.SOL,
                symbol: 'SOL',
                price: solPrice,
                priceChange24h: 0,
                priceChangePercentage24h: 0,
                lastUpdated: new Date().toISOString(),
              },
              BONK: {
                address: TOKENS.BONK,
                symbol: 'BONK',
                price: bonkPrice,
                priceChange24h: 0,
                priceChangePercentage24h: 0,
                lastUpdated: new Date().toISOString(),
              }
            };

            console.log(`🎉 [Instance ${instanceId.current}] All prices fetched from public endpoint:`, priceData);
            setPrices(priceData);
            setError('Using public endpoint due to rate limiting');
            globalRequestManager.consecutive429Errors = 0; // Reset error count
          } else {
            throw new Error('Price data not found in public API response');
          }
        } else {
          throw new Error('Public endpoint failed');
        }
      } else {
        console.log(`🔄 [Instance ${instanceId.current}] Fetching price data from Birdeye defi/price API with private key...`);
        console.log(`🔑 [Instance ${instanceId.current}] API Key available: ${!!BIRDEYE_API_KEY}`);

        // Check if API key is available
        if (!BIRDEYE_API_KEY) {
          throw new Error('Birdeye API key not configured');
        }

        // Fetch tokens sequentially with 10 second delay to avoid rate limiting
        console.log(`📡 [Instance ${instanceId.current}] Fetching SOL price first...`);
        const solResponse = await fetch(`${BIRDEYE_API_BASE}/defi/price?address=${TOKENS.SOL}`, {
          headers: {
            'X-API-KEY': BIRDEYE_API_KEY,
            'accept': 'application/json',
            'x-chain': 'solana'
          },
        });

        console.log(`📡 [Instance ${instanceId.current}] SOL defi/price response status:`, solResponse.status, solResponse.statusText);

        if (!solResponse.ok) {
          const errorText = await solResponse.text();
          console.log(`❌ [Instance ${instanceId.current}] SOL API error:`, solResponse.status, solResponse.statusText, errorText);
          
          if (solResponse.status === 429) {
            globalRequestManager.consecutive429Errors += 1;
            console.log(`⚠️ [Instance ${instanceId.current}] Rate limited by API (${globalRequestManager.consecutive429Errors}/1), switching to public endpoint`);
            setError(`API rate limit reached (${globalRequestManager.consecutive429Errors}/1). Switching to public endpoint.`);
            return;
          }
          throw new Error(`SOL API failed: ${solResponse.status} ${solResponse.statusText}`);
        }

        const solData = await solResponse.json();
        console.log(`📊 [Instance ${instanceId.current}] SOL API response:`, solData);

                  // Wait 2 seconds before fetching BONK
          console.log(`⏳ [Instance ${instanceId.current}] Waiting 2 seconds before fetching BONK price...`);
          await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`📡 [Instance ${instanceId.current}] Fetching BONK price...`);
        const bonkResponse = await fetch(`${BIRDEYE_API_BASE}/defi/price?address=${TOKENS.BONK}`, {
          headers: {
            'X-API-KEY': BIRDEYE_API_KEY,
            'accept': 'application/json',
            'x-chain': 'solana'
          },
        });

        console.log(`📡 [Instance ${instanceId.current}] BONK defi/price response status:`, bonkResponse.status, bonkResponse.statusText);

        if (!bonkResponse.ok) {
          const errorText = await bonkResponse.text();
          console.log(`❌ [Instance ${instanceId.current}] BONK API error:`, bonkResponse.status, bonkResponse.statusText, errorText);
          
          if (bonkResponse.status === 429) {
            globalRequestManager.consecutive429Errors += 1;
            console.log(`⚠️ [Instance ${instanceId.current}] Rate limited by API (${globalRequestManager.consecutive429Errors}/1), switching to public endpoint`);
            setError(`API rate limit reached (${globalRequestManager.consecutive429Errors}/1). Switching to public endpoint.`);
            return;
          }
          throw new Error(`BONK API failed: ${bonkResponse.status} ${bonkResponse.statusText}`);
        }

        const bonkData = await bonkResponse.json();
        console.log(`📊 [Instance ${instanceId.current}] BONK API response:`, bonkData);

        // Extract price data from the response structure
        const solPrice = solData?.data?.value;
        const bonkPrice = bonkData?.data?.value;

        if (solPrice && bonkPrice) {
          const priceData: Record<string, PriceData> = {
            SOL: {
              address: TOKENS.SOL,
              symbol: 'SOL',
              price: solPrice,
              priceChange24h: 0, // Not provided by this endpoint
              priceChangePercentage24h: 0, // Not provided by this endpoint
              lastUpdated: new Date().toISOString(),
            },
            BONK: {
              address: TOKENS.BONK,
              symbol: 'BONK',
              price: bonkPrice,
              priceChange24h: 0, // Not provided by this endpoint
              priceChangePercentage24h: 0, // Not provided by this endpoint
              lastUpdated: new Date().toISOString(),
            }
          };

          console.log(`🎉 [Instance ${instanceId.current}] All prices fetched from Birdeye defi/price API:`, priceData);
          setPrices(priceData);
          setError(null);
          globalRequestManager.consecutive429Errors = 0; // Reset error count
          globalRequestManager.usePublicEndpoint = false; // Switch back to private if successful
        } else {
          throw new Error('Price data not found in API response');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price data';
      setError(errorMessage);
      console.error(`💥 [Instance ${instanceId.current}] Price fetch error:`, err);

      // Set empty prices on error
      setPrices({});
    } finally {
      globalRequestManager.isRequesting = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPriceData();
    
    // Clear any existing timeout
    if (requestTimeout.current) {
      clearTimeout(requestTimeout.current);
    }
    
                // Set up interval with rate limiting
            const setupNextRequest = () => {
              requestTimeout.current = setTimeout(() => {
                fetchPriceData();
                setupNextRequest(); // Schedule next request
              }, 5000); // 5 seconds between requests (very fast updates)
            };
    
    setupNextRequest();
    
    return () => {
      if (requestTimeout.current) {
        clearTimeout(requestTimeout.current);
      }
    };
  }, [fetchPriceData]);

  return { prices, loading, error, refetch: fetchPriceData };
};