
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
                
                this.config = {};
                this.initializeCryptoData();
                this.setupConfigListeners();
            }

            setupConfigListeners() {
                document.getElementById('stopType').addEventListener('change', (e) => {
                    document.getElementById('stopFixedRow').style.display = 
                        e.target.value === 'fixed' ? 'block' : 'none';
                });
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

                this.log(`⚙️ Config: EMA${this.config.emaFast}/${this.config.emaSlow}, RSI(${this.config.rsiMin}-${this.config.rsiMax}), TP1=${(this.config.tp1*100).toFixed(1)}%, TP2=${(this.config.tp2*100).toFixed(1)}% | Velocidad: ${speedLabels[this.config.timeSpeed]}`, 'success');
            }

            disableConfig() {
                const inputs = document.querySelectorAll('input, select');
                inputs.forEach(input => input.disabled = true);
            }

            enableConfig() {
                const inputs = document.querySelectorAll('input, select');
                inputs.forEach(input => input.disabled = false);
            }

            initializeCryptoData() {
                const baseData = [
                    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', basePrice: 42000, volatility: 0.02 },
                    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', basePrice: 2200, volatility: 0.03 },
                    { id: 'binance', symbol: 'BNB', name: 'BNB', basePrice: 310, volatility: 0.025 },
                    { id: 'solana', symbol: 'SOL', name: 'Solana', basePrice: 98, volatility: 0.04 },
                    { id: 'ripple', symbol: 'XRP', name: 'XRP', basePrice: 0.52, volatility: 0.035 },
                    { id: 'cardano', symbol: 'ADA', name: 'Cardano', basePrice: 0.48, volatility: 0.03 },
                    { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', basePrice: 36, volatility: 0.045 },
                    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.08, volatility: 0.05 },
                    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', basePrice: 7.2, volatility: 0.035 },
                    { id: 'polygon', symbol: 'MATIC', name: 'Polygon', basePrice: 0.82, volatility: 0.04 },
                    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', basePrice: 14.5, volatility: 0.03 },
                    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', basePrice: 73, volatility: 0.025 },
                    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', basePrice: 6.8, volatility: 0.04 },
                    { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', basePrice: 10.2, volatility: 0.035 }
                ];

                this.cryptoData = baseData.map(crypto => ({
                    ...crypto,
                    priceHistory: this.generatePriceHistory(crypto.basePrice, crypto.volatility, 60),
                    volumeHistory: []
                }));

                // Generar histórico de volumen
                this.cryptoData.forEach(crypto => {
                    const baseVolume = crypto.basePrice * 1000000;
                    crypto.volumeHistory = Array(60).fill(0).map(() => 
                        baseVolume * (0.8 + Math.random() * 0.4)
                    );
                });

                this.log('✅ Bot inicializado con 14 pares', 'success');
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
                this.cryptoData.forEach(crypto => {
                    const change = (Math.random() - 0.5) * crypto.volatility * 2;
                    const newPrice = crypto.priceHistory[crypto.priceHistory.length - 1] * (1 + change);
                    
                    crypto.priceHistory.push(newPrice);
                    if (crypto.priceHistory.length > 60) {
                        crypto.priceHistory.shift();
                    }

                    const baseVolume = crypto.basePrice * 1000000;
                    const newVolume = baseVolume * (0.8 + Math.random() * 0.4);
                    crypto.volumeHistory.push(newVolume);
                    if (crypto.volumeHistory.length > 60) {
                        crypto.volumeHistory.shift();
                    }
                });

                this.calculateIndicators();
                this.renderCryptoList();
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

                    // Calcular mínimo técnico (últimas 10 velas)
                    crypto.technicalLow = Math.min(...prices.slice(-10));
                    
                    // Evaluar señal de compra
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
                    
                    return `
                        <div class="crypto-item">
                            <div>
                                <div class="crypto-name">${crypto.symbol}</div>
                                <div class="crypto-symbol">$${crypto.currentPrice.toFixed(crypto.currentPrice < 1 ? 6 : 2)}</div>
                                <div class="crypto-indicators">
                                    <div class="indicator">
                                        <span class="indicator-label">EMA:</span>
                                        <span class="indicator-value ${signal.conditions.trend ? 'good' : 'bad'}">
                                            ${signal.conditions.trend ? '✓' : '✗'} Alcista
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
                
                // Usar velocidad configurada
                this.updateInterval = setInterval(() => {
                    this.runStrategy();
                    this.updateSimulationTime();
                }, this.config.timeSpeed);
                
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
                const elapsedReal = (Date.now() - this.startTime) / 1000; // segundos reales
                const days = Math.floor(this.totalCandles / 24); // asumiendo velas de 1 hora
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

                    // Actualizar máximo alcanzado para trailing
                    if (currentPrice > position.maxPrice) {
                        position.maxPrice = currentPrice;
                        
                        // Activar trailing si supera TP1
                        if (profitPct >= this.config.tp1 && !position.trailingActive) {
                            position.trailingActive = true;
                            position.trailingStop = position.maxPrice * (1 - this.config.trailingPct);
                            this.log(`🔄 Trailing activado en ${position.symbol} @ $${position.trailingStop.toFixed(6)}`, 'success');
                        }
                    }

                    // Actualizar trailing stop
                    if (position.trailingActive) {
                        position.trailingStop = position.maxPrice * (1 - this.config.trailingPct);
                    }

                    // TP2 - Cerrar 100%
                    if (profitPct >= this.config.tp2) {
                        this.closePosition(position, 1.0, 'TP2');
                        continue;
                    }

                    // TP1 - Cerrar 50% (si no se ha hecho)
                    if (profitPct >= this.config.tp1 && !position.tp1Taken) {
                        this.closePosition(position, 0.5, 'TP1');
                        position.tp1Taken = true;
                        continue;
                    }

                    // Trailing Stop
                    if (position.trailingActive && currentPrice <= position.trailingStop) {
                        this.closePosition(position, 1.0, 'TRAILING');
                        continue;
                    }

                    // Stop Loss
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

                    // Timeout
                    if (position.candles >= this.config.timeoutCandles) {
                        if (currentPrice < position.entryPrice * 1.005) {
                            this.closePosition(position, 1.0, 'TIMEOUT');
                            continue;
                        }
                    }
                }
            }

            lookForEntry() {
                // Buscar crypto con señal BUY que no tengamos
                const candidate = this.cryptoData.find(crypto => 
                    crypto.signal.type === 'BUY' && 
                    !this.investments.some(inv => inv.cryptoId === crypto.id)
                );

                if (!candidate) return;

                this.openPosition(candidate);
            }

            openPosition(crypto) {
                // Calcular tamaño de posición
                const riskAmount = this.cashBalance * this.config.riskPct;
                let stopPrice;
                
                if (this.config.stopType === 'fixed') {
                    stopPrice = crypto.currentPrice * (1 - this.config.stopLossPct);
                } else {
                    stopPrice = crypto.technicalLow;
                }

                const riskPerUnit = crypto.currentPrice - stopPrice;
                let positionSize = riskAmount / riskPerUnit;
                
                // Limitar por efectivo disponible
                const maxSize = this.cashBalance / crypto.currentPrice;
                positionSize = Math.min(positionSize, maxSize * 0.95);

                const investAmount = positionSize * crypto.currentPrice;
                const commission = investAmount * this.commission;
                const netInvest = investAmount - commission;
                
                if (netInvest < 1) return; // Mínimo $1

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

                this.log(
                    `✅ COMPRA: ${positionSize.toFixed(6)} ${crypto.symbol} @ $${crypto.currentPrice.toFixed(6)} | Stop: $${stopPrice.toFixed(6)}`,
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
                
                // Contar ganadores y perdedores
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

                this.log(
                    `${emoji} VENTA ${(percentage*100).toFixed(0)}% (${reason}): ${amountToSell.toFixed(6)} ${position.symbol} @ $${position.currentPrice.toFixed(6)} | P&L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${(position.profitPct*100).toFixed(2)}%)`,
                    logType
                );

                if (percentage >= 1.0) {
                    // Cerrar posición completa
                    this.investments = this.investments.filter(inv => inv.id !== position.id);
                } else {
                    // Cerrar parcial
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

                listElement.innerHTML = this.investments.map(pos => `
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
                                <span>$${pos.entryPrice.toFixed(6)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Actual:</span>
                                <span>$${pos.currentPrice.toFixed(6)}</span>
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
                                <span>$${(pos.trailingActive ? pos.trailingStop : pos.technicalStop).toFixed(6)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
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

                // Trades ganadores
                document.getElementById('successTrades').textContent = this.successfulTrades;
                
                // Trades perdedores
                document.getElementById('lossTrades').textContent = this.lossTrades;
                
                // Trades on hold (posiciones activas actualmente)
                document.getElementById('onHoldTrades').textContent = this.investments.length;
                
                // Win Rate
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

            reset() {
                this.stop();
                
                // Restaurar valores de capital
                this.cashBalance = this.initialBalance;
                this.totalBalance = this.initialBalance;
                this.investments = [];
                this.totalProfits = 0;
                this.totalTrades = 0;
                this.successfulTrades = 0;
                this.lossTrades = 0;
                this.totalCandles = 0;
                this.startTime = null;
                
                // Restaurar valores de configuración a defaults
                document.getElementById('emaFast').value = 20;
                document.getElementById('emaSlow').value = 50;
                document.getElementById('rsiPeriod').value = 14;
                document.getElementById('rsiMin').value = 50;
                document.getElementById('rsiMax').value = 70;
                document.getElementById('volumeMult').value = 1.2;
                document.getElementById('stopType').value = 'fixed';
                document.getElementById('stopLossPct').value = 2;
                document.getElementById('timeoutCandles').value = 30;
                document.getElementById('tp1').value = 2;
                document.getElementById('tp2').value = 4;
                document.getElementById('trailingPct').value = 2;
                document.getElementById('riskPct').value = 1;
                document.getElementById('maxPositions').value = 3;
                document.getElementById('timeSpeed').value = 500;
                
                // Mostrar/ocultar campos según defaults
                document.getElementById('stopFixedRow').style.display = 'block';
                
                // Limpiar UI inmediatamente
                document.getElementById('totalBalance').textContent = `$${this.initialBalance.toFixed(2)}`;
                document.getElementById('cashBalance').textContent = `$${this.initialBalance.toFixed(2)}`;
                document.getElementById('activeInvestments').textContent = '0/3';
                document.getElementById('totalProfits').textContent = '$0.00';
                document.getElementById('totalProfits').className = 'stat-value positive';
                document.getElementById('successTrades').textContent = '0';
                document.getElementById('lossTrades').textContent = '0';
                document.getElementById('onHoldTrades').textContent = '0';
                document.getElementById('winRate').textContent = '0%';
                
                // Limpiar logs
                document.getElementById('activityLog').innerHTML = '';
                const timeDisplay = document.getElementById('simulationTime');
                if (timeDisplay) {
                    timeDisplay.innerHTML = '';
                }
                
                // Limpiar inversiones
                document.getElementById('investmentsList').innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; font-size: 0.85rem;">Sin posiciones abiertas</p>';
                
                // Reinicializar datos de mercado
                this.initializeCryptoData();
                
                // Log final
                this.log('🔄 Sistema reiniciado - Todo en cero', 'success');
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
    
