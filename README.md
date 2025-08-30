# 🚀 CryptoDash - Solana Price Tracker

A modern web dashboard that connects to Phantom wallet and displays live price data for SOL and BONK tokens from the Birdeye API.

## ✨ Features

- **🔗 Phantom Wallet Integration**: Connect and disconnect your Phantom wallet
- **📊 Live Price Data**: Real-time SOL and BONK prices from Birdeye API
- **🎨 Modern UI**: Beautiful dark theme with gradient backgrounds
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Auto-refresh**: Prices update automatically every 30 seconds
- **⚠️ Fallback Data**: Graceful degradation when API is unavailable

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Wallet**: Phantom Wallet Integration
- **API**: Birdeye Public API
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Phantom wallet browser extension installed
- Modern web browser

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project-4
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🔧 Usage

### Connecting Your Wallet

1. **Install Phantom Wallet**: If you haven't already, install the [Phantom wallet extension](https://phantom.app/)
2. **Connect Wallet**: Click the "Connect Wallet" button in the dashboard
3. **Approve Connection**: Approve the connection in your Phantom wallet
4. **View Address**: Your wallet address will be displayed and can be copied

### Viewing Price Data

- **SOL Price**: Current Solana token price with 24h change
- **BONK Price**: Current Bonk token price with 24h change
- **Auto-refresh**: Prices update every 30 seconds automatically
- **Manual Refresh**: Click the refresh button to update prices immediately

## 📡 API Integration

The dashboard integrates with multiple Birdeye API endpoints:

- `/public/price` - Direct price endpoint
- `/public/token_list` - Token information endpoint  
- `/public/search` - Search-based endpoint
- `/v2/price` - Version 2 API endpoint

If all endpoints fail, the app gracefully falls back to demo data.

## 🐛 Troubleshooting

### Common Issues

1. **"ethereum" Error in Console**:
   - This is caused by browser extensions (like MetaMask) conflicting with the Solana app
   - **Solution**: The error doesn't affect functionality - you can ignore it
   - **Alternative**: Disable EVM wallet extensions temporarily

2. **API 404 Errors**:
   - Birdeye API endpoints may change
   - **Solution**: The app automatically tries multiple endpoints and falls back to demo data
   - Check the browser console for detailed debugging information

3. **Wallet Connection Issues**:
   - Ensure Phantom wallet is installed and unlocked
   - Try refreshing the page
   - Check if you have multiple wallet extensions enabled

### Debug Mode

The app includes extensive console logging:
- 🔄 API request attempts
- ✅ Successful data fetches
- ❌ Failed API calls
- ⚠️ Fallback data usage

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard layout
│   ├── Header.tsx      # App header
│   ├── PriceCard.tsx   # Individual price display
│   └── WalletCard.tsx  # Wallet connection UI
├── hooks/              # Custom React hooks
│   ├── usePhantomWallet.ts  # Wallet management
│   └── usePriceData.ts      # API data fetching
├── types/              # TypeScript type definitions
└── App.tsx             # Main app component
```

## 🔒 Security Notes

- **No Private Keys**: The app never accesses your private keys
- **Read-Only**: Only reads wallet address and public information
- **Local Storage**: No sensitive data is stored on servers
- **HTTPS**: Always use HTTPS in production

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Phantom Wallet](https://phantom.app/) for Solana wallet integration
- [Birdeye](https://birdeye.so/) for price data API
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Happy Trading! 🚀📈**
