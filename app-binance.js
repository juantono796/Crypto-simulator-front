// app-binance.js - Versión con Binance API usando CORS Proxy

// NOTA: Esta versión usa un CORS proxy para acceder a Binance
// Sigue siendo 100% static site, pero depende del proxy

class TradingBot {
    constructor() {
        // ... (mismo constructor que app-realtime.js)
        this.initialBalance = 1000;
        this.cashBalance = 1000;
        this.totalBalance = 1000;
        this.investments = [];
        this.totalProfits = 0;
        this.totalTrades = 0;
        this.successfulTrades = 0;
        this.lossTrades = 0;
        this.isRunning = false;
        this.cryptoData = [];
        this.updateInterval = null;
        this.commission = 0.001;
        this.totalCandles = 0;
        this.startTime = null;
        
        this.apiUpdateInterval = null;
        this.lastApiUpdate = 0;
        this.apiRateLimit = 10000; // 10 segundos (Binance más rápido)
        
        this.config = {};
        this.setupConfigListeners();
        this.initializeBinanceData();
    }

    // ... setupConfigListeners igual ...

    async initializeBinanceData() {
        this.log('🔄 Cargando datos reales de Binance...', 'info');
        
        try {
            await this.fetchBinanceData();
            this.log('✅ Datos reales cargados desde Binance API', 'success');
        } catch (error) {
            this.log('⚠️ Error al cargar Binance, usando CoinGecko', 'warning');
            console.error('Binance Error:', error);
            await this.fetchCoinGeckoData();
        }
    }

    async fetchBinanceData() {
        const now = Date.now();
        if (now - this.lastApiUpdate < this.apiRateLimit) {
            return;
        }

        // CORS Proxy para Binance
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const binanceUrl = 'https://api.binance.com/api/v3/ticker/24hr';
        
        const response = await fetch(corsProxy + encodeURIComponent(binanceUrl));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.lastApiUpdate = now;
        
        // Filtrar solo las principales criptos vs USDT
        const mainPairs = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 
            'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT',
            'DOTUSDT', 'MATICUSDT', 'LINKUSDT', 'LTCUSDT',
            'UNIUSDT', 'ATOMUSDT', 'XLMUSDT'
        ];
        
        const filteredData = data.filter(ticker => 
            mainPairs.includes(ticker.symbol)
        );
        
        // Transformar datos de Binance a nuestro formato
        this.cryptoData = filteredData.map(ticker => {
            const existingCrypto = this.cryptoData.find(c => c.symbol === ticker.symbol);
            const priceHistory = existingCrypto?.priceHistory || [];
            const volumeHistory = existingCrypto?.volumeHistory || [];
            
            const currentPrice = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.volume) * currentPrice;
            
            priceHistory.push(currentPrice);
            if (priceHistory.length > 60) priceHistory.shift();
            
            volumeHistory.push(volume);
            if (volumeHistory.length > 60) volumeHistory.shift();
            
            while (priceHistory.length < 60) {
                const randomChange = (Math.random() - 0.5) * 0.02;
                const prevPrice = priceHistory.length > 0 ? priceHistory[0] : currentPrice;
                priceHistory.unshift(prevPrice * (1 + randomChange));
            }
            
            while (volumeHistory.length < 60) {
                const randomChange = (Math.random() - 0.5) * 0.1;
                const prevVolume = volumeHistory.length > 0 ? volumeHistory[0] : volume;
                volumeHistory.unshift(prevVolume * (1 + randomChange));
            }
            
            return {
                id: ticker.symbol.toLowerCase(),
                symbol: ticker.symbol.replace('USDT', ''),
                name: ticker.symbol.replace('USDT', ''),
                currentPrice: currentPrice,
                priceHistory: priceHistory,
                volumeHistory: volumeHistory,
                change24h: parseFloat(ticker.priceChangePercent),
                marketCap: volume * 1000, // Estimado
                volatility: Math.abs(parseFloat(ticker.priceChangePercent)) / 100
            };
        });

        this.calculateIndicators();
        this.renderCryptoList();
    }

    async fetchCoinGeckoData() {
        // Fallback a CoinGecko si Binance falla
        const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h';
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Mismo procesamiento que app-realtime.js
        this.cryptoData = data.map(coin => {
            // ... (mismo código que app-realtime.js)
        });
        
        this.calculateIndicators();
        this.renderCryptoList();
    }

    // ... (resto del código igual a app-realtime.js)
}

// Inicializar
const bot = new TradingBot();

document.getElementById('startBtn').addEventListener('click', () => bot.start());
document.getElementById('stopBtn').addEventListener('click', () => bot.stop());
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('¿Reiniciar el simulador?')) {
        location.reload();
    }
});

bot.updateUI();
