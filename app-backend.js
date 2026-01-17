// app-backend.js - Frontend conectado a Backend en Render
// 🚀 Datos REALES de Binance a través de tu propio backend

// ⚙️ CONFIGURACIÓN: Cambia esta URL por tu backend deployado en Render
const BACKEND_URL = 'https://crypto-simulator-back.onrender.com';
// Ejemplo: 'https://crypto-bot-backend-abc123.onrender.com'

class TradingBot {
    constructor() {
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
        
        // Configuración del backend
        this.backendUrl = BACKEND_URL;
        this.apiUpdateInterval = null;
        this.lastApiUpdate = 0;
        this.apiRateLimit = 5000; // 5 segundos entre llamadas
        this.backendConnected = false;
        
        this.config = {};
        this.setupConfigListeners();
        this.initializeBackendConnection();
    }

    setupConfigListeners() {
        document.getElementById('stopType').addEventListener('change', (e) => {
            document.getElementById('stopFixedRow').style.display = 
                e.target.value === 'fixed' ? 'block' : 'none';
        });
    }

    async initializeBackendConnection() {
        this.log('🔄 Conectando al backend...', 'info');
        
        // Verificar que el backend esté configurado
        if (this.backendUrl === 'https://crypto-bot-backend.onrender.com') {
            this.log('⚠️ IMPORTANTE: Configura BACKEND_URL en app-backend.js', 'warning');
            this.log('⚠️ Usando datos simulados por ahora...', 'warning');
            this.initializeSimulatedData();
            return;
        }
        
        try {
            // Health check del backend
            const healthCheck = await fetch(`${this.backendUrl}/health`);
            
            if (!healthCheck.ok) {
                throw new Error(`Backend no disponible: ${healthCheck.status}`);
            }
            
            const healthData = await healthCheck.json();
            this.backendConnected = true;
            
            this.log(`✅ Backend conectado: ${healthData.status}`, 'success');
            
            // Cargar datos iniciales
            await this.fetchBackendData();
            
        } catch (error) {
            this.log('⚠️ Error conectando con backend, usando simulación', 'warning');
            console.error('Backend Error:', error);
            this.backendConnected = false;
            this.initializeSimulatedData();
        }
    }

    async fetchBackendData() {
        const now = Date.now();
        if (now - this.lastApiUpdate < this.apiRateLimit) {
            return;
        }

        try {
            const url = `${this.backendUrl}/api/crypto/markets`;
            
            console.log(`📡 Fetching from backend: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Backend returned error');
            }
            
            this.lastApiUpdate = now;
            const data = result.data;
            
            // Transformar datos de CoinGecko a nuestro formato
            this.cryptoData = data.map(coin => {
                const existingCrypto = this.cryptoData.find(c => c.id === coin.id);
                const priceHistory = existingCrypto?.priceHistory || [];
                const volumeHistory = existingCrypto?.volumeHistory || [];
                
                const currentPrice = coin.current_price;
                const volume = coin.total_volume;
                
                // Agregar precio actual al histórico
                priceHistory.push(currentPrice);
                if (priceHistory.length > 60) priceHistory.shift();
                
                // Agregar volumen actual al histórico
                volumeHistory.push(volume);
                if (volumeHistory.length > 60) volumeHistory.shift();
                
                // Si no hay suficiente histórico, generarlo
                while (priceHistory.length < 60) {
                    const randomChange = (Math.random() - 0.5) * 0.01;
                    const prevPrice = priceHistory.length > 0 ? priceHistory[0] : currentPrice;
                    priceHistory.unshift(prevPrice * (1 + randomChange));
                }
                
                while (volumeHistory.length < 60) {
                    const randomChange = (Math.random() - 0.5) * 0.05;
                    const prevVolume = volumeHistory.length > 0 ? volumeHistory[0] : volume;
                    volumeHistory.unshift(prevVolume * (1 + randomChange));
                }
                
                return {
                    id: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    currentPrice: currentPrice,
                    priceHistory: priceHistory,
                    volumeHistory: volumeHistory,
                    change24h: coin.price_change_percentage_24h || 0,
                    marketCap: coin.market_cap,
                    volatility: Math.abs(coin.price_change_percentage_24h || 0) / 100,
                };
            });

            this.calculateIndicators();
            this.renderCryptoList();
            
            this.log(`✅ ${this.cryptoData.length} criptos actualizadas desde CoinGecko`, 'success');
            
        } catch (error) {
            console.error('Error fetching from backend:', error);
            this.log(`⚠️ Error: ${error.message}`, 'warning');
            
            // Si falla, usar simulación como fallback
            if (this.cryptoData.length === 0) {
                this.initializeSimulatedData();
            }
        }
    }

    initializeSimulatedData() {
        const baseData = [
            { id: 'BTCUSDT', symbol: 'BTC', name: 'Bitcoin', basePrice: 43000, volatility: 0.02 },
            { id: 'ETHUSDT', symbol: 'ETH', name: 'Ethereum', basePrice: 2250, volatility: 0.03 },
            { id: 'BNBUSDT', symbol: 'BNB', name: 'BNB', basePrice: 315, volatility: 0.025 },
            { id: 'SOLUSDT', symbol: 'SOL', name: 'Solana', basePrice: 102, volatility: 0.04 },
            { id: 'XRPUSDT', symbol: 'XRP', name: 'XRP', basePrice: 0.54, volatility: 0.035 },
            { id: 'ADAUSDT', symbol: 'ADA', name: 'Cardano', basePrice: 0.49, volatility: 0.03 },
            { id: 'AVAXUSDT', symbol: 'AVAX', name: 'Avalanche', basePrice: 37, volatility: 0.045 },
            { id: 'DOGEUSDT', symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.082, volatility: 0.05 },
            { id: 'DOTUSDT', symbol: 'DOT', name: 'Polkadot', basePrice: 7.4, volatility: 0.035 },
            { id: 'MATICUSDT', symbol: 'MATIC', name: 'Polygon', basePrice: 0.85, volatility: 0.04 },
            { id: 'LINKUSDT', symbol: 'LINK', name: 'Chainlink', basePrice: 15, volatility: 0.03 },
            { id: 'LTCUSDT', symbol: 'LTC', name: 'Litecoin', basePrice: 75, volatility: 0.025 },
            { id: 'UNIUSDT', symbol: 'UNI', name: 'Uniswap', basePrice: 7, volatility: 0.04 },
            { id: 'ATOMUSDT', symbol: 'ATOM', name: 'Cosmos', basePrice: 10.5, volatility: 0.035 }
        ];

        this.cryptoData = baseData.map(crypto => ({
            ...crypto,
            currentPrice: crypto.basePrice,
            priceHistory: this.generatePriceHistory(crypto.basePrice, crypto.volatility, 60),
            volumeHistory: Array(60).fill(0).map(() => crypto.basePrice * 5000000 * (0.8 + Math.random() * 0.4)),
            change24h: (Math.random() - 0.5) * 10
        }));

        this.calculateIndicators();
        this.renderCryptoList();
    }

    generatePriceHistory(basePrice, volatility, length) {
        const history = [basePrice];
        for (let i = 1; i < length; i++) {
            const change = (Math.random() - 0.5) * volatility * 2;
            const newPrice = history[i-1] * (1 + change);
            history.push(newPrice);
        }
        return history;
    }

    updatePrices() {
        // Si estamos conectados al backend, no simular cambios localmente
        if (this.backendConnected) {
            return;
        }

        // Modo simulado: generar cambios sintéticos
        this.cryptoData.forEach(crypto => {
            if (crypto.volatility) {
                const change = (Math.random() - 0.5) * crypto.volatility * 2;
                const newPrice = crypto.priceHistory[crypto.priceHistory.length - 1] * (1 + change);
                
                crypto.priceHistory.push(newPrice);
                if (crypto.priceHistory.length > 60) {
                    crypto.priceHistory.shift();
                }

                const baseVolume = crypto.basePrice * 5000000;
                const newVolume = baseVolume * (0.8 + Math.random() * 0.4);
                crypto.volumeHistory.push(newVolume);
                if (crypto.volumeHistory.length > 60) {
                    crypto.volumeHistory.shift();
                }
            }
        });

        this.calculateIndicators();
        this.renderCryptoList();
    }

    loadConfig() {
        this.config = {
            emaFast: parseInt(document.getElementById('emaFast').value),
            emaSlow: parseInt(document.getElementById('emaSlow').value),
            rsiPeriod: parseInt(document.getElementById('rsiPeriod').value),
            rsiMin: parseInt(document.getElementById('rsiMin').value),
            rsiMax: parseInt(document.getElementById('rsiMax').value),
            volumeMult: parseFloat(document.getElementById('volumeMult').value),
            stopType: document.getElementById('stopType').value,
            stopLossPct: parseFloat(document.getElementById('stopLossPct').value) / 100,
            timeoutCandles: parseInt(document.getElementById('timeoutCandles').value),
            tp1: parseFloat(document.getElementById('tp1').value) / 100,
            tp2: parseFloat(document.getElementById('tp2').value) / 100,
            trailingPct: parseFloat(document.getElementById('trailingPct').value) / 100,
            riskPct: parseFloat(document.getElementById('riskPct').value) / 100,
            maxPositions: parseInt(document.getElementById('maxPositions').value),
            timeSpeed: parseInt(document.getElementById('timeSpeed').value)
        };

        const speedLabels = {
            3000: 'Tiempo Real',
            1000: 'Rápido',
            500: 'Muy Rápido',
            100: 'Ultra Rápido',
            50: 'Máximo'
        };

        const dataSource = this.backendConnected ? 'COINGECKO (vía Backend)' : 'SIMULADO';
        
        this.log(`⚙️ Config: EMA${this.config.emaFast}/${this.config.emaSlow}, RSI(${this.config.rsiMin}-${this.config.rsiMax}), TP1=${(this.config.tp1*100).toFixed(1)}%, TP2=${(this.config.tp2*100).toFixed(1)}% | Velocidad: ${speedLabels[this.config.timeSpeed]} | Fuente: ${dataSource}`, 'success');
    }

    disableConfig() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = true);
    }

    enableConfig() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = false);
    }

    calculateEMA(data, period) {
        const k = 2 / (period + 1);
        let ema = data[0];
        
        for (let i = 1; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
        }
        return ema;
    }

    calculateRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i-1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateSMA(data, period) {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    }

    calculateIndicators() {
        this.cryptoData.forEach(crypto => {
            const prices = crypto.priceHistory;
            const currentPrice = prices[prices.length - 1];
            
            crypto.ema20 = this.calculateEMA(prices, 20);
            crypto.ema50 = this.calculateEMA(prices, 50);
            crypto.rsi = this.calculateRSI(prices, 14);
            crypto.avgVolume = this.calculateSMA(crypto.volumeHistory, 20);
            crypto.currentVolume = crypto.volumeHistory[crypto.volumeHistory.length - 1];
            crypto.currentPrice = currentPrice;
            crypto.technicalLow = Math.min(...prices.slice(-10));
            
            crypto.signal = this.evaluateSignal(crypto);
        });
    }

    evaluateSignal(crypto) {
        const conditions = {
            trend: crypto.ema20 > crypto.ema50,
            priceAboveEMA: crypto.currentPrice > crypto.ema20,
            rsiGood: crypto.rsi >= 50 && crypto.rsi <= 70,
            volumeGood: crypto.currentVolume > crypto.avgVolume * 1.2
        };

        const allGood = Object.values(conditions).every(v => v);
        
        return {
            type: allGood ? 'BUY' : 'WAIT',
            conditions: conditions
        };
    }

    renderCryptoList() {
        const listElement = document.getElementById('cryptoList');
        
        listElement.innerHTML = this.cryptoData.map(crypto => {
            const signal = crypto.signal;
            const hasPosition = this.investments.some(inv => inv.cryptoId === crypto.id);
            
            let priceDecimals = 2;
            if (crypto.currentPrice < 1) priceDecimals = 6;
            else if (crypto.currentPrice < 10) priceDecimals = 4;
            
            return `
                <div class="crypto-item">
                    <div>
                        <div class="crypto-name">${crypto.symbol}</div>
                        <div class="crypto-symbol">$${crypto.currentPrice.toFixed(priceDecimals)}</div>
                        <div class="crypto-indicators">
                            <div class="indicator">
                                <span class="indicator-label">EMA:</span>
                                <span class="indicator-value ${signal.conditions.trend ? 'good' : 'bad'}">
                                    ${signal.conditions.trend ? '✓' : '✗'} ${signal.conditions.trend ? 'Alcista' : 'Bajista'}
                                </span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">RSI:</span>
                                <span class="indicator-value ${signal.conditions.rsiGood ? 'good' : 'bad'}">
                                    ${crypto.rsi.toFixed(0)}
                                </span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Vol:</span>
                                <span class="indicator-value ${signal.conditions.volumeGood ? 'good' : 'bad'}">
                                    ${signal.conditions.volumeGood ? '✓' : '✗'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span class="signal-badge signal-${signal.type === 'BUY' ? 'buy' : 'wait'}">
                            ${hasPosition ? '🔒 EN POSICIÓN' : signal.type}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    start() {
        if (this.isRunning) return;
        
        this.loadConfig();
        this.disableConfig();
        
        this.isRunning = true;
        this.totalCandles = 0;
        this.startTime = Date.now();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        this.log('🤖 Bot activado - Escaneando mercado...', 'success');
        
        // Interval para la estrategia
        this.updateInterval = setInterval(() => {
            this.runStrategy();
            this.updateSimulationTime();
        }, this.config.timeSpeed);
        
        // Interval para actualizar datos del backend
        if (this.backendConnected) {
            this.apiUpdateInterval = setInterval(async () => {
                try {
                    await this.fetchBackendData();
                } catch (error) {
                    console.error('Error actualizando desde backend:', error);
                }
            }, this.apiRateLimit);
        }
        
        this.runStrategy();
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.enableConfig();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.apiUpdateInterval) {
            clearInterval(this.apiUpdateInterval);
            this.apiUpdateInterval = null;
        }
        
        this.log('⏸️ Bot pausado', 'error');
    }

    runStrategy() {
        this.updatePrices();
        this.checkPositions();
        
        if (this.investments.length < this.config.maxPositions) {
            this.lookForEntry();
        }
        
        this.totalCandles++;
        this.updateUI();
    }

    updateSimulationTime() {
        const elapsedReal = (Date.now() - this.startTime) / 1000;
        const days = Math.floor(this.totalCandles / 24);
        const hours = this.totalCandles % 24;
        
        const timeDisplay = document.getElementById('simulationTime');
        if (timeDisplay) {
            timeDisplay.innerHTML = `📅 Tiempo simulado: ${days} días, ${hours}h (${this.totalCandles} velas)<br>⏱️ Tiempo real: ${elapsedReal.toFixed(1)}s`;
        }
    }

    checkPositions() {
        for (let position of [...this.investments]) {
            const crypto = this.cryptoData.find(c => c.id === position.cryptoId);
            if (!crypto) continue;

            const currentPrice = crypto.currentPrice;
            const currentValue = position.amount * currentPrice;
            const profitPct = (currentPrice - position.entryPrice) / position.entryPrice;
            
            position.currentPrice = currentPrice;
            position.currentValue = currentValue;
            position.profitPct = profitPct;
            position.candles++;

            if (currentPrice > position.maxPrice) {
                position.maxPrice = currentPrice;
                
                if (profitPct >= this.config.tp1 && !position.trailingActive) {
                    position.trailingActive = true;
                    position.trailingStop = position.maxPrice * (1 - this.config.trailingPct);
                    this.log(`🔄 Trailing activado en ${position.symbol} @ $${position.trailingStop.toFixed(6)}`, 'success');
                }
            }

            if (position.trailingActive) {
                position.trailingStop = position.maxPrice * (1 - this.config.trailingPct);
            }

            if (profitPct >= this.config.tp2) {
                this.closePosition(position, 1.0, 'TP2');
                continue;
            }

            if (profitPct >= this.config.tp1 && !position.tp1Taken) {
                this.closePosition(position, 0.5, 'TP1');
                position.tp1Taken = true;
                continue;
            }

            if (position.trailingActive && currentPrice <= position.trailingStop) {
                this.closePosition(position, 1.0, 'TRAILING');
                continue;
            }

            let stopPrice;
            if (this.config.stopType === 'fixed') {
                stopPrice = position.entryPrice * (1 - this.config.stopLossPct);
            } else {
                stopPrice = position.technicalStop;
            }

            if (currentPrice <= stopPrice) {
                this.closePosition(position, 1.0, 'STOP-LOSS');
                continue;
            }

            if (position.candles >= this.config.timeoutCandles) {
                if (currentPrice < position.entryPrice * 1.005) {
                    this.closePosition(position, 1.0, 'TIMEOUT');
                    continue;
                }
            }
        }
    }

    lookForEntry() {
        // DEBUG: Mostrar por qué cada crypto no califica
        const debugInfo = this.cryptoData.map(crypto => {
            const hasPosition = this.investments.some(inv => inv.cryptoId === crypto.id);
            return {
                symbol: crypto.symbol,
                signal: crypto.signal.type,
                hasPosition: hasPosition,
                conditions: crypto.signal.conditions,
                price: crypto.currentPrice,
                ema20: crypto.ema20?.toFixed(2),
                ema50: crypto.ema50?.toFixed(2),
                rsi: crypto.rsi?.toFixed(0)
            };
        });
        
        // Contar cuántas cumplen cada condición
        const stats = {
            total: this.cryptoData.length,
            trend: debugInfo.filter(d => d.conditions.trend).length,
            priceAboveEMA: debugInfo.filter(d => d.conditions.priceAboveEMA).length,
            rsiGood: debugInfo.filter(d => d.conditions.rsiGood).length,
            volumeGood: debugInfo.filter(d => d.conditions.volumeGood).length,
            buySignals: debugInfo.filter(d => d.signal === 'BUY').length
        };
        
        console.log('📊 Market Analysis:', stats);
        
        const candidate = this.cryptoData.find(crypto => 
            crypto.signal.type === 'BUY' && 
            !this.investments.some(inv => inv.cryptoId === crypto.id)
        );

        if (!candidate) {
            if (this.totalCandles % 10 === 0) { // Log cada 10 velas
                this.log(`⏳ Esperando señal... (${stats.buySignals} BUY de ${stats.total} | Trend: ${stats.trend}, RSI: ${stats.rsiGood}, Vol: ${stats.volumeGood})`, 'info');
            }
            return;
        }

        this.openPosition(candidate);
    }

    openPosition(crypto) {
        const riskAmount = this.cashBalance * this.config.riskPct;
        let stopPrice;
        
        if (this.config.stopType === 'fixed') {
            stopPrice = crypto.currentPrice * (1 - this.config.stopLossPct);
        } else {
            stopPrice = crypto.technicalLow;
        }

        const riskPerUnit = crypto.currentPrice - stopPrice;
        let positionSize = riskAmount / riskPerUnit;
        
        const maxSize = this.cashBalance / crypto.currentPrice;
        positionSize = Math.min(positionSize, maxSize * 0.95);

        const investAmount = positionSize * crypto.currentPrice;
        const commission = investAmount * this.commission;
        const netInvest = investAmount - commission;
        
        if (netInvest < 1) return;

        this.cashBalance -= investAmount;

        const position = {
            id: Date.now(),
            cryptoId: crypto.id,
            symbol: crypto.symbol,
            entryPrice: crypto.currentPrice,
            currentPrice: crypto.currentPrice,
            amount: positionSize,
            invested: investAmount,
            currentValue: netInvest,
            profitPct: 0,
            technicalStop: stopPrice,
            maxPrice: crypto.currentPrice,
            trailingActive: false,
            trailingStop: 0,
            tp1Taken: false,
            candles: 0,
            timestamp: new Date()
        };

        this.investments.push(position);

        let priceDecimals = crypto.currentPrice < 1 ? 6 : 2;
        
        this.log(
            `✅ COMPRA: ${positionSize.toFixed(6)} ${crypto.symbol} @ $${crypto.currentPrice.toFixed(priceDecimals)} | Stop: $${stopPrice.toFixed(priceDecimals)}`,
            'success'
        );

        this.renderInvestments();
    }

    closePosition(position, percentage, reason) {
        const amountToSell = position.amount * percentage;
        const saleValue = amountToSell * position.currentPrice;
        const commission = saleValue * this.commission;
        const netSale = saleValue - commission;
        
        const costBasis = position.invested * percentage;
        const profit = netSale - costBasis;

        this.cashBalance += netSale;
        this.totalProfits += profit;
        this.totalTrades++;
        
        if (profit > 0) {
            this.successfulTrades++;
        } else {
            this.lossTrades++;
        }

        let emoji = '💰';
        let logType = 'success';
        
        if (reason === 'STOP-LOSS' || reason === 'TIMEOUT') {
            emoji = reason === 'STOP-LOSS' ? '🛑' : '⏱️';
            logType = 'warning';
        }

        const crypto = this.cryptoData.find(c => c.id === position.cryptoId);
        let priceDecimals = crypto?.currentPrice < 1 ? 6 : 2;

        this.log(
            `${emoji} VENTA ${(percentage*100).toFixed(0)}% (${reason}): ${amountToSell.toFixed(6)} ${position.symbol} @ $${position.currentPrice.toFixed(priceDecimals)} | P&L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${(position.profitPct*100).toFixed(2)}%)`,
            logType
        );

        if (percentage >= 1.0) {
            this.investments = this.investments.filter(inv => inv.id !== position.id);
        } else {
            position.amount *= (1 - percentage);
            position.invested *= (1 - percentage);
        }

        this.renderInvestments();
    }

    renderInvestments() {
        const listElement = document.getElementById('investmentsList');
        
        if (this.investments.length === 0) {
            listElement.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; font-size: 0.85rem;">Sin posiciones abiertas</p>';
            return;
        }

        listElement.innerHTML = this.investments.map(pos => {
            const crypto = this.cryptoData.find(c => c.id === pos.cryptoId);
            let priceDecimals = crypto?.currentPrice < 1 ? 6 : 2;
            
            return `
            <div class="investment-card">
                <div class="investment-header">
                    <div class="investment-name">${pos.symbol}</div>
                    <div class="investment-status status-active">
                        ${pos.trailingActive ? '🔄 TRAILING' : 'ACTIVO'}
                    </div>
                </div>
                <div class="investment-details">
                    <div class="detail-row">
                        <span class="detail-label">Entrada:</span>
                        <span>$${pos.entryPrice.toFixed(priceDecimals)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Actual:</span>
                        <span>$${pos.currentPrice.toFixed(priceDecimals)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cantidad:</span>
                        <span>${pos.amount.toFixed(6)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Invertido:</span>
                        <span>$${pos.invested.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Valor:</span>
                        <span>$${pos.currentValue.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">P&L:</span>
                        <span style="color: ${pos.profitPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 700;">
                            ${pos.profitPct >= 0 ? '+' : ''}${(pos.profitPct * 100).toFixed(2)}%
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Velas:</span>
                        <span>${pos.candles}/${this.config.timeoutCandles}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Stop:</span>
                        <span>$${(pos.trailingActive ? pos.trailingStop : pos.technicalStop).toFixed(priceDecimals)}</span>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    updateUI() {
        const investedValue = this.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        this.totalBalance = this.cashBalance + investedValue;
        
        document.getElementById('totalBalance').textContent = `$${this.totalBalance.toFixed(2)}`;
        document.getElementById('cashBalance').textContent = `$${this.cashBalance.toFixed(2)}`;
        document.getElementById('activeInvestments').textContent = 
            `${this.investments.length}/${this.config.maxPositions || 3}`;
        
        const profitsElement = document.getElementById('totalProfits');
        profitsElement.textContent = `$${this.totalProfits.toFixed(2)}`;
        profitsElement.className = `stat-value ${this.totalProfits >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('successTrades').textContent = this.successfulTrades;
        document.getElementById('lossTrades').textContent = this.lossTrades;
        document.getElementById('onHoldTrades').textContent = this.investments.length;
        
        const winRate = this.totalTrades > 0 ? (this.successfulTrades / this.totalTrades * 100) : 0;
        document.getElementById('winRate').textContent = `${winRate.toFixed(0)}%`;
    }

    log(message, type = 'info') {
        const logElement = document.getElementById('activityLog');
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
        
        logElement.insertBefore(entry, logElement.firstChild);
        
        while (logElement.children.length > 100) {
            logElement.removeChild(logElement.lastChild);
        }
    }
}

// Inicializar
const bot = new TradingBot();

document.getElementById('startBtn').addEventListener('click', () => bot.start());
document.getElementById('stopBtn').addEventListener('click', () => bot.stop());
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('¿Reiniciar el simulador? Se perderán todos los datos y volverá al estado inicial.')) {
        location.reload();
    }
});

bot.updateUI();
