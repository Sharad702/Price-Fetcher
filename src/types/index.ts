export interface PriceData {
  address: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  lastUpdated: string;
}

export interface WalletInfo {
  address: string;
  connected: boolean;
}