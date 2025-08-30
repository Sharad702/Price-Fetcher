import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add helpful console message about ethereum error
console.log(`
🚀 CryptoDash - Solana Price Tracker

📝 Note: If you see an "ethereum" error in the console, it's likely from:
   - MetaMask or other EVM wallet extensions
   - Browser extensions that inject ethereum objects
   - This error doesn't affect the Solana functionality

🔧 The app will continue to work normally with Phantom wallet and price data.
`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
