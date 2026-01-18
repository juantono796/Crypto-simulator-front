// optimizer-ui.js - Renderizado de UI para Auto-Optimización

class OptimizerUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.updateInterval = null;
    }

    render(bots) {
        if (!this.container) return;
        
        const profilesHTML = `
            <div class="optimizer-header">
                <h2>🤖 Auto-Optimización de Estrategias</h2>
                <p class="subtitle">Tres perfiles ajustando parámetros en tiempo real para maximizar ganancias</p>
            </div>
            
            <div class="optimizer-grid">
                ${this.renderProfile(bots.conservador, 'Conservador', '🛡️', 'conservador')}
                ${this.renderProfile(bots.moderado, 'Moderado', '⚖️', 'moderado')}
                ${this.renderProfile(bots.agresivo, 'Agresivo', '🚀', 'agresivo')}
            </div>
        `;
        
        this.container.innerHTML = profilesHTML;
    }

    renderProfile(bot, name, icon, className) {
        const metrics = bot.getPerformanceMetrics();
        const winRate = (metrics.winRate * 100).toFixed(1);
        const roi = (metrics.roi * 100).toFixed(2);
        const maxDD = (metrics.maxDrawdown * 100).toFixed(2);
        
        return `
            <div class="strategy-card ${className}">
                <!-- Header -->
                <div class="card-header">
                    <div class="card-title">
                        <span class="icon">${icon}</span>
                        <h3>${name}</h3>
                    </div>
                    <span class="status-badge ${bot.isRunning ? 'active' : 'paused'}">
                        ${bot.isRunning ? '🟢 Activo' : '⏸️ Pausado'}
                    </span>
                </div>
                
                <!-- Métricas Principales -->
                <div class="main-metrics">
                    <div class="metric-large">
                        <div class="metric-label">Balance Total</div>
                        <div class="metric-value">${this.formatCurrency(bot.totalBalance)}</div>
                        <div class="metric-change ${roi >= 0 ? 'positive' : 'negative'}">
                            ${roi >= 0 ? '▲' : '▼'} ${Math.abs(roi)}%
                        </div>
                    </div>
                </div>
                
                <!-- Métricas Secundarias -->
                <div class="metrics-grid">
                    <div class="metric-small">
                        <div class="label">Efectivo</div>
                        <div class="value">${this.formatCurrency(bot.cashBalance)}</div>
                    </div>
                    <div class="metric-small">
                        <div class="label">Win Rate</div>
                        <div class="value">${winRate}%</div>
                    </div>
                    <div class="metric-small">
                        <div class="label">Trades</div>
                        <div class="value">${metrics.totalTrades}</div>
                    </div>
                    <div class="metric-small">
                        <div class="label">Posiciones</div>
                        <div class="value">${metrics.activePositions}/${bot.config.maxPositions}</div>
                    </div>
                    <div class="metric-small">
                        <div class="label">Sharpe</div>
                        <div class="value">${metrics.sharpeRatio.toFixed(2)}</div>
                    </div>
                    <div class="metric-small">
                        <div class="label">Max DD</div>
                        <div class="value ${maxDD > 10 ? 'negative' : ''}">${maxDD}%</div>
                    </div>
                </div>
                
                <!-- Configuración Actual -->
                <div class="current-config">
                    <h4>⚙️ Configuración Actual:</h4>
                    <div class="config-grid">
                        <div class="config-param">
                            <span class="param-label">EMA:</span>
                            <span class="param-value">${bot.config.emaFast}/${bot.config.emaSlow}</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">RSI:</span>
                            <span class="param-value">${bot.config.rsiMin}-${bot.config.rsiMax} (${bot.config.rsiPeriod})</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Vol Mult:</span>
                            <span class="param-value">${bot.config.volumeMult.toFixed(2)}x</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Stop Loss:</span>
                            <span class="param-value">${(bot.config.stopLossPct * 100).toFixed(1)}%</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">TP1/TP2:</span>
                            <span class="param-value">${(bot.config.tp1 * 100).toFixed(1)}% / ${(bot.config.tp2 * 100).toFixed(1)}%</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Trailing:</span>
                            <span class="param-value">${(bot.config.trailingPct * 100).toFixed(2)}%</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Risk/Trade:</span>
                            <span class="param-value">${(bot.config.riskPct * 100).toFixed(1)}%</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Timeout:</span>
                            <span class="param-value">${bot.config.timeoutCandles} velas</span>
                        </div>
                        <div class="config-param">
                            <span class="param-label">Max Pos:</span>
                            <span class="param-value">${bot.config.maxPositions}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Ajustes Recientes -->
                <div class="recent-adjustments">
                    <h4>🔧 Últimos Ajustes:</h4>
                    <div class="adjustments-list">
                        ${this.renderAdjustments(bot.recentAdjustments)}
                    </div>
                </div>
                
                <!-- Posiciones Activas -->
                <div class="active-positions">
                    <h4>📊 Posiciones Activas:</h4>
                    <div class="positions-list">
                        ${this.renderPositions(bot.investments)}
                    </div>
                </div>
                
                <!-- Performance Stats -->
                <div class="performance-stats">
                    <h4>📈 Estadísticas:</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-label">✅ Exitosos:</span>
                            <span class="stat-value">${bot.successfulTrades}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">❌ Pérdidas:</span>
                            <span class="stat-value">${bot.lossTrades}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">💰 Ganancia Prom:</span>
                            <span class="stat-value">${this.formatCurrency(metrics.avgProfit)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">🕐 Velas:</span>
                            <span class="stat-value">${bot.totalCandles}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAdjustments(adjustments) {
        if (!adjustments || adjustments.length === 0) {
            return '<p class="empty-state">Sin ajustes aún</p>';
        }
        
        return adjustments.slice(-5).reverse().map(adj => `
            <div class="adjustment-item">
                <span class="adjustment-time">${adj.timestamp}</span>
                <span class="adjustment-desc">${this.truncate(adj.description, 60)}</span>
                <span class="adjustment-balance">${this.formatCurrency(adj.balance)}</span>
            </div>
        `).join('');
    }

    renderPositions(positions) {
        if (!positions || positions.length === 0) {
            return '<p class="empty-state">Sin posiciones abiertas</p>';
        }
        
        return positions.map(pos => {
            const profitPct = (pos.profitPct * 100).toFixed(2);
            const isProfit = pos.profitPct >= 0;
            
            return `
                <div class="position-item">
                    <div class="position-symbol">${pos.symbol}</div>
                    <div class="position-details">
                        <span class="position-price">$${pos.currentPrice.toFixed(pos.currentPrice < 1 ? 6 : 2)}</span>
                        <span class="position-profit ${isProfit ? 'positive' : 'negative'}">
                            ${isProfit ? '+' : ''}${profitPct}%
                        </span>
                    </div>
                    <div class="position-status">
                        ${pos.trailingActive ? '🔄' : '⏱️'} ${pos.candles}v
                    </div>
                </div>
            `;
        }).join('');
    }

    formatCurrency(value) {
        if (value === undefined || value === null) return '$0.00';
        return `$${value.toFixed(2)}`;
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    startAutoUpdate(bots, interval = 1000) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.render(bots);
        }, interval);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.OptimizerUI = OptimizerUI;
}
