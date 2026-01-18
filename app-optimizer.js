// app-optimizer.js - Sistema de Auto-Optimización con 3 Perfiles de Riesgo
// Optimiza TODOS los parámetros configurables en tiempo real

class TradingBotInstance {
    constructor(profile, marketDataProvider) {
        this.profile = profile; // 'conservador', 'moderado', 'agresivo'
        this.marketDataProvider = marketDataProvider;
        
        // Estado del bot
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
        this.commission = 0.001;
        this.totalCandles = 0;
        this.startTime = null;
        
        // Configuración inicial según perfil
        this.config = this.getInitialConfig(profile);
        
        // Historial de ajustes
        this.recentAdjustments = [];
        this.performanceHistory = [];
        
        // Intervalo de ejecución
        this.updateInterval = null;
    }

    getInitialConfig(profile) {
        const configs = {
            conservador: {
                emaFast: 30,
                emaSlow: 100,
                rsiPeriod: 14,
                rsiMin: 35,
                rsiMax: 65,
                volumeMult: 1.3,
                stopType: 'fixed',
                stopLossPct: 0.03,    // 3%
                timeoutCandles: 120,
                tp1: 0.015,           // 1.5%
                tp2: 0.04,            // 4%
                trailingPct: 0.008,   // 0.8%
                riskPct: 0.03,        // 3%
                maxPositions: 2,
                timeSpeed: 1000
            },
            moderado: {
                emaFast: 15,
                emaSlow: 50,
                rsiPeriod: 14,
                rsiMin: 40,
                rsiMax: 70,
                volumeMult: 1.2,
                stopType: 'fixed',
                stopLossPct: 0.05,    // 5%
                timeoutCandles: 80,
                tp1: 0.02,            // 2%
                tp2: 0.06,            // 6%
                trailingPct: 0.01,    // 1%
                riskPct: 0.06,        // 6%
                maxPositions: 3,
                timeSpeed: 1000
            },
            agresivo: {
                emaFast: 7,
                emaSlow: 20,
                rsiPeriod: 14,
                rsiMin: 30,
                rsiMax: 80,
                volumeMult: 1.1,
                stopType: 'fixed',
                stopLossPct: 0.08,    // 8%
                timeoutCandles: 50,
                tp1: 0.025,           // 2.5%
                tp2: 0.08,            // 8%
                trailingPct: 0.015,   // 1.5%
                riskPct: 0.12,        // 12%
                maxPositions: 5,
                timeSpeed: 1000
            }
        };
        
        return configs[profile];
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        console.log(`🚀 [${this.profile.toUpperCase()}] Bot iniciado`);
        
        this.updateInterval = setInterval(() => {
            this.runStrategy();
        }, this.config.timeSpeed);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log(`⏸️ [${this.profile.toUpperCase()}] Bot pausado`);
    }

    updateMarketData(data) {
        this.cryptoData = data.map(crypto => ({...crypto}));
        this.calculateIndicators();
    }

    updateConfig(newConfig) {
        const changes = [];
        
        Object.keys(newConfig).forEach(key => {
            if (this.config[key] !== newConfig[key]) {
                changes.push(`${key}: ${this.config[key].toFixed(2)} → ${newConfig[key].toFixed(2)}`);
            }
        });
        
        if (changes.length > 0) {
            this.config = {...this.config, ...newConfig};
            
            const timestamp = new Date().toLocaleTimeString();
            this.recentAdjustments.push({
                timestamp: timestamp,
                description: changes.join(', '),
                balance: this.totalBalance
            });
            
            // Mantener solo últimos 10 ajustes
            if (this.recentAdjustments.length > 10) {
                this.recentAdjustments.shift();
            }
            
            console.log(`🔧 [${this.profile.toUpperCase()}] Ajustado:`, changes);
        }
    }

    runStrategy() {
        this.checkPositions();
        
        if (this.investments.length < this.config.maxPositions) {
            this.lookForEntry();
        }
        
        this.totalCandles++;
        this.updateTotalBalance();
        this.recordPerformance();
    }

    calculateIndicators() {
        this.cryptoData.forEach(crypto => {
            const prices = crypto.priceHistory;
            const currentPrice = prices[prices.length - 1];
            
            crypto.ema20 = this.calculateEMA(prices, this.config.emaFast);
            crypto.ema50 = this.calculateEMA(prices, this.config.emaSlow);
            crypto.rsi = this.calculateRSI(prices, this.config.rsiPeriod);
            crypto.avgVolume = this.calculateSMA(crypto.volumeHistory, 20);
            crypto.currentVolume = crypto.volumeHistory[crypto.volumeHistory.length - 1];
            crypto.currentPrice = currentPrice;
            crypto.technicalLow = Math.min(...prices.slice(-10));
            
            crypto.signal = this.evaluateSignal(crypto);
        });
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

    evaluateSignal(crypto) {
        const conditions = {
            trend: crypto.ema20 > crypto.ema50,
            priceAboveEMA: crypto.currentPrice > crypto.ema20,
            rsiGood: crypto.rsi >= this.config.rsiMin && crypto.rsi <= this.config.rsiMax,
            volumeGood: crypto.currentVolume > crypto.avgVolume * this.config.volumeMult
        };

        const allGood = Object.values(conditions).every(v => v);
        
        return {
            type: allGood ? 'BUY' : 'WAIT',
            conditions: conditions
        };
    }

    lookForEntry() {
        const candidate = this.cryptoData.find(crypto => 
            crypto.signal.type === 'BUY' && 
            !this.investments.some(inv => inv.cryptoId === crypto.id)
        );

        if (!candidate) return;
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
            id: Date.now() + Math.random(),
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

        if (percentage >= 1.0) {
            this.investments = this.investments.filter(inv => inv.id !== position.id);
        } else {
            position.amount *= (1 - percentage);
            position.invested *= (1 - percentage);
        }
    }

    updateTotalBalance() {
        const investedValue = this.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        this.totalBalance = this.cashBalance + investedValue;
    }

    recordPerformance() {
        if (this.totalCandles % 10 === 0) { // Cada 10 velas
            const winRate = this.totalTrades > 0 ? this.successfulTrades / this.totalTrades : 0;
            const roi = (this.totalBalance - this.initialBalance) / this.initialBalance;
            
            this.performanceHistory.push({
                candle: this.totalCandles,
                balance: this.totalBalance,
                winRate: winRate,
                roi: roi,
                totalTrades: this.totalTrades
            });
            
            // Mantener últimas 100 mediciones
            if (this.performanceHistory.length > 100) {
                this.performanceHistory.shift();
            }
        }
    }

    getPerformanceMetrics() {
        const winRate = this.totalTrades > 0 ? this.successfulTrades / this.totalTrades : 0;
        const roi = (this.totalBalance - this.initialBalance) / this.initialBalance;
        const avgProfit = this.totalTrades > 0 ? this.totalProfits / this.totalTrades : 0;
        
        // Calcular drawdown
        const balances = this.performanceHistory.map(p => p.balance);
        let maxDrawdown = 0;
        let peak = this.initialBalance;
        
        balances.forEach(balance => {
            if (balance > peak) peak = balance;
            const drawdown = (peak - balance) / peak;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });
        
        // Sharpe Ratio simplificado
        const returns = [];
        for (let i = 1; i < this.performanceHistory.length; i++) {
            const ret = (this.performanceHistory[i].balance - this.performanceHistory[i-1].balance) / this.performanceHistory[i-1].balance;
            returns.push(ret);
        }
        
        const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
        const stdDev = returns.length > 0 ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) : 0;
        const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
        
        return {
            winRate,
            roi,
            avgProfit,
            maxDrawdown,
            sharpeRatio,
            totalTrades: this.totalTrades,
            activePositions: this.investments.length
        };
    }
}

// ==========================================
// OPTIMIZADOR GENÉTICO
// ==========================================

class GeneticOptimizer {
    constructor() {
        this.mutationRate = 0.15; // 15% de cambio
        this.learningRate = 0.1;  // Qué tan agresivo ajustar
    }

    optimize(bot, performance) {
        const profile = bot.profile;
        const currentConfig = bot.config;
        const ranges = this.getParameterRanges(profile);
        
        // Decidir si necesita ajuste
        if (!this.shouldOptimize(performance, bot.totalCandles)) {
            return currentConfig; // Sin cambios
        }
        
        // Estrategia de optimización según performance
        if (performance.winRate < 0.45) {
            // Muy mal → Cambio agresivo hacia conservador
            return this.makeConservative(currentConfig, ranges);
        } else if (performance.winRate > 0.65 && performance.roi > 0.1) {
            // Muy bien → Optimización fina
            return this.fineTune(currentConfig, ranges);
        } else if (performance.maxDrawdown > 0.15) {
            // Drawdown alto → Reducir riesgo
            return this.reduceRisk(currentConfig, ranges);
        } else {
            // Performance moderada → Mutación genética
            return this.geneticMutation(currentConfig, ranges);
        }
    }

    shouldOptimize(performance, totalCandles) {
        // No optimizar muy al inicio (necesita datos)
        if (totalCandles < 50) return false;
        
        // Optimizar cada 100 velas
        if (totalCandles % 100 !== 0) return false;
        
        // Optimizar si hay al menos 5 trades
        if (performance.totalTrades < 5) return false;
        
        return true;
    }

    getParameterRanges(profile) {
        const ranges = {
            conservador: {
                emaFast: [20, 50],
                emaSlow: [50, 200],
                rsiPeriod: [10, 20],
                rsiMin: [30, 40],
                rsiMax: [60, 70],
                volumeMult: [1.2, 1.5],
                stopLossPct: [0.02, 0.05],
                timeoutCandles: [80, 150],
                tp1: [0.01, 0.02],
                tp2: [0.03, 0.06],
                trailingPct: [0.005, 0.015],
                riskPct: [0.02, 0.05],
                maxPositions: [1, 3]
            },
            moderado: {
                emaFast: [10, 30],
                emaSlow: [30, 100],
                rsiPeriod: [10, 20],
                rsiMin: [25, 45],
                rsiMax: [55, 75],
                volumeMult: [1.1, 1.4],
                stopLossPct: [0.03, 0.08],
                timeoutCandles: [50, 120],
                tp1: [0.015, 0.03],
                tp2: [0.04, 0.08],
                trailingPct: [0.008, 0.02],
                riskPct: [0.04, 0.10],
                maxPositions: [2, 5]
            },
            agresivo: {
                emaFast: [5, 20],
                emaSlow: [15, 60],
                rsiPeriod: [10, 20],
                rsiMin: [20, 50],
                rsiMax: [50, 85],
                volumeMult: [1.0, 1.3],
                stopLossPct: [0.05, 0.12],
                timeoutCandles: [30, 100],
                tp1: [0.02, 0.04],
                tp2: [0.06, 0.12],
                trailingPct: [0.01, 0.025],
                riskPct: [0.08, 0.20],
                maxPositions: [3, 8]
            }
        };
        
        return ranges[profile];
    }

    makeConservative(config, ranges) {
        // Estrategia perdedora → Ser más conservador
        return {
            ...config,
            riskPct: Math.max(ranges.riskPct[0], config.riskPct * 0.7),
            stopLossPct: Math.min(ranges.stopLossPct[1], config.stopLossPct * 1.3),
            rsiMin: Math.min(ranges.rsiMin[1], config.rsiMin + 5),
            rsiMax: Math.max(ranges.rsiMax[0], config.rsiMax - 5),
            volumeMult: Math.min(ranges.volumeMult[1], config.volumeMult + 0.1),
            maxPositions: Math.max(ranges.maxPositions[0], config.maxPositions - 1),
            tp1: Math.max(ranges.tp1[0], config.tp1 * 0.9),
            tp2: Math.max(ranges.tp2[0], config.tp2 * 0.9)
        };
    }

    reduceRisk(config, ranges) {
        // Drawdown alto → Reducir exposición
        return {
            ...config,
            riskPct: this.clamp(config.riskPct * 0.8, ranges.riskPct),
            stopLossPct: this.clamp(config.stopLossPct * 0.9, ranges.stopLossPct),
            maxPositions: Math.max(ranges.maxPositions[0], config.maxPositions - 1),
            trailingPct: this.clamp(config.trailingPct * 0.9, ranges.trailingPct)
        };
    }

    fineTune(config, ranges) {
        // Buena performance → Ajustes pequeños
        const newConfig = {};
        
        Object.keys(ranges).forEach(param => {
            if (param === 'stopType') return; // No mutar tipo de stop
            
            const currentValue = config[param];
            const [min, max] = ranges[param];
            
            // Mutación muy pequeña (5%)
            const delta = (max - min) * 0.05 * (Math.random() - 0.5);
            const newValue = currentValue + delta;
            
            newConfig[param] = this.clamp(newValue, [min, max]);
        });
        
        // Mantener enteros donde corresponde
        newConfig.emaFast = Math.round(newConfig.emaFast);
        newConfig.emaSlow = Math.round(newConfig.emaSlow);
        newConfig.rsiPeriod = Math.round(newConfig.rsiPeriod);
        newConfig.rsiMin = Math.round(newConfig.rsiMin);
        newConfig.rsiMax = Math.round(newConfig.rsiMax);
        newConfig.timeoutCandles = Math.round(newConfig.timeoutCandles);
        newConfig.maxPositions = Math.round(newConfig.maxPositions);
        newConfig.stopType = config.stopType;
        newConfig.timeSpeed = config.timeSpeed;
        
        return newConfig;
    }

    geneticMutation(config, ranges) {
        // Mutación genética estándar
        const newConfig = {};
        
        Object.keys(ranges).forEach(param => {
            if (param === 'stopType') return;
            
            const currentValue = config[param];
            const [min, max] = ranges[param];
            
            // Decidir si mutar este parámetro (30% chance)
            if (Math.random() > 0.3) {
                newConfig[param] = currentValue;
                return;
            }
            
            // Mutación del 15%
            const delta = (max - min) * this.mutationRate * (Math.random() - 0.5);
            const newValue = currentValue + delta;
            
            newConfig[param] = this.clamp(newValue, [min, max]);
        });
        
        // Redondear enteros
        newConfig.emaFast = Math.round(newConfig.emaFast);
        newConfig.emaSlow = Math.round(newConfig.emaSlow);
        newConfig.rsiPeriod = Math.round(newConfig.rsiPeriod);
        newConfig.rsiMin = Math.round(newConfig.rsiMin);
        newConfig.rsiMax = Math.round(newConfig.rsiMax);
        newConfig.timeoutCandles = Math.round(newConfig.timeoutCandles);
        newConfig.maxPositions = Math.round(newConfig.maxPositions);
        newConfig.stopType = config.stopType;
        newConfig.timeSpeed = config.timeSpeed;
        
        return newConfig;
    }

    clamp(value, [min, max]) {
        return Math.max(min, Math.min(max, value));
    }
}

// ==========================================
// GESTOR PRINCIPAL
// ==========================================

class OptimizerManager {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.marketData = null;
        this.lastApiUpdate = 0;
        this.apiRateLimit = 5000; // 5 segundos
        
        // 3 bots
        this.bots = {
            conservador: new TradingBotInstance('conservador'),
            moderado: new TradingBotInstance('moderado'),
            agresivo: new TradingBotInstance('agresivo')
        };
        
        // Optimizador
        this.optimizer = new GeneticOptimizer();
        
        // Intervalos
        this.dataFetchInterval = null;
        this.optimizationInterval = null;
        
        // UI
        this.uiRenderer = null;
    }

    async initialize() {
        console.log('🔧 Inicializando Optimizer Manager...');
        
        // Cargar datos iniciales
        await this.fetchMarketData();
        
        // Iniciar fetch periódico de datos
        this.dataFetchInterval = setInterval(async () => {
            await this.fetchMarketData();
        }, this.apiRateLimit);
        
        // Iniciar optimización periódica
        this.optimizationInterval = setInterval(() => {
            this.runOptimization();
        }, 10000); // Cada 10 segundos evaluar
        
        console.log('✅ Optimizer Manager listo');
    }

    async fetchMarketData() {
        const now = Date.now();
        if (now - this.lastApiUpdate < this.apiRateLimit) return;
        
        try {
            const response = await fetch(`${this.backendUrl}/api/binance/ticker`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Backend error');
            }
            
            this.lastApiUpdate = now;
            
            // Transformar datos igual que app-backend.js
            this.marketData = result.data.map(ticker => {
                const existingData = this.marketData?.find(c => c.id === ticker.symbol);
                const priceHistory = existingData?.priceHistory || [];
                const volumeHistory = existingData?.volumeHistory || [];
                
                const currentPrice = parseFloat(ticker.lastPrice);
                const volume = parseFloat(ticker.quoteVolume);
                
                priceHistory.push(currentPrice);
                if (priceHistory.length > 60) priceHistory.shift();
                
                volumeHistory.push(volume);
                if (volumeHistory.length > 60) volumeHistory.shift();
                
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
                    id: ticker.symbol,
                    symbol: ticker.symbol.replace('USDT', ''),
                    name: ticker.symbol.replace('USDT', ''),
                    currentPrice: currentPrice,
                    priceHistory: priceHistory,
                    volumeHistory: volumeHistory,
                    change24h: parseFloat(ticker.priceChangePercent),
                    marketCap: volume * 100,
                    volatility: Math.abs(parseFloat(ticker.priceChangePercent)) / 100
                };
            });
            
            // Actualizar todos los bots
            Object.values(this.bots).forEach(bot => {
                bot.updateMarketData(this.marketData);
            });
            
        } catch (error) {
            console.error('Error fetching market data:', error);
        }
    }

    startAll() {
        console.log('▶️ Iniciando todos los bots...');
        Object.values(this.bots).forEach(bot => bot.start());
    }

    stopAll() {
        console.log('⏸️ Deteniendo todos los bots...');
        Object.values(this.bots).forEach(bot => bot.stop());
    }

    runOptimization() {
        Object.keys(this.bots).forEach(profile => {
            const bot = this.bots[profile];
            
            if (!bot.isRunning) return;
            
            const performance = bot.getPerformanceMetrics();
            const newConfig = this.optimizer.optimize(bot, performance);
            
            bot.updateConfig(newConfig);
        });
        
        // Actualizar UI
        if (this.uiRenderer) {
            this.uiRenderer.render(this.bots);
        }
    }

    setUIRenderer(renderer) {
        this.uiRenderer = renderer;
    }

    destroy() {
        this.stopAll();
        
        if (this.dataFetchInterval) {
            clearInterval(this.dataFetchInterval);
        }
        
        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.OptimizerManager = OptimizerManager;
    window.TradingBotInstance = TradingBotInstance;
    window.GeneticOptimizer = GeneticOptimizer;
}
