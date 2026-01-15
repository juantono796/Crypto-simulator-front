# 🤖 Crypto Trading Bot Simulator

Simulador profesional de trading de criptomonedas con análisis técnico avanzado (EMA, RSI, Volumen) y gestión automatizada de riesgo.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

### 📊 Análisis Técnico Profesional
- **EMA (Exponential Moving Averages)**: Detecta tendencias alcistas
- **RSI (Relative Strength Index)**: Identifica zonas de sobrecompra/sobreventa
- **Análisis de Volumen**: Confirma movimientos con volumen significativo
- **Señales de entrada múltiple**: Solo opera cuando TODOS los criterios se cumplen

### 🎯 Gestión de Riesgo Avanzada
- **Stop Loss Inteligente**: 
  - Fijo: Porcentaje predefinido
  - Técnico: Basado en mínimos de las últimas 10 velas
- **Take Profit Parcial**:
  - TP1: Vende 50% de la posición
  - TP2: Cierra completamente
- **Trailing Stop Dinámico**: Protege ganancias siguiendo el precio al alza
- **Timeout**: Libera capital de posiciones estancadas

### 💼 Gestión de Capital Profesional
- Tamaño de posición calculado según riesgo (0.5% - 5% del capital)
- Máximo de posiciones simultáneas configurable
- Comisiones incluidas (0.1% por transacción)
- Protección: nunca invierte más del 95% del efectivo disponible

### ⚡ Acelerador de Tiempo
- **Tiempo Real**: 1 vela cada 3 segundos
- **Rápido**: 1 vela por segundo
- **Muy Rápido**: 1 vela cada 0.5s
- **Ultra Rápido**: 1 vela cada 0.1s (~1 mes en 50 segundos)
- **Máximo**: 1 vela cada 0.05s (~1 mes en 25 segundos)

### 📈 Métricas y Estadísticas
- Capital Total
- Efectivo Disponible
- Posiciones Activas
- P&L Total (Profit & Loss)
- Trades Ganadores
- Trades Perdedores
- Trades On Hold
- Win Rate (%)

## 🚀 Instalación

### Requisitos Previos
- Node.js (opcional, solo si quieres usar un servidor local)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/crypto-trading-bot.git

# Navegar al directorio
cd crypto-trading-bot

# Abrir index.html en tu navegador
# O usar un servidor local:
npx serve .
```

### Deploy en Render

1. Fork este repositorio
2. Ve a [Render](https://render.com)
3. Crea un nuevo **Static Site**
4. Conecta tu repositorio de GitHub
5. Configuración:
   - **Build Command**: (dejar vacío)
   - **Publish Directory**: `.`
6. Click en **Deploy**

### Deploy en Netlify

1. Fork este repositorio
2. Ve a [Netlify](https://netlify.com)
3. Click en **Add new site** → **Import an existing project**
4. Conecta tu repositorio de GitHub
5. Configuración:
   - **Build Command**: (dejar vacío)
   - **Publish Directory**: `.`
6. Click en **Deploy**

### Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio del proyecto
vercel
```

## 🎮 Uso

### Configuración Básica

1. **Indicadores Técnicos**:
   - EMA Rápida: 20 (default)
   - EMA Lenta: 50 (default)
   - RSI: 50-70 (ajustar a 55-65 para mayor precisión)
   - Volumen: 1.2× (ajustar a 1.5× para mayor calidad)

2. **Stop Loss**:
   - Tipo: Técnico (recomendado) o Fijo
   - Porcentaje: 2% (si usas fijo)
   - Timeout: 20-30 velas

3. **Take Profit**:
   - TP1: 1.5-2% (vende 50%)
   - TP2: 3-4% (vende 100%)
   - Trailing: 2%

4. **Gestión**:
   - Riesgo: 1% (conservador) - 2% (balanceado)
   - Máx Posiciones: 3

### Optimización del Win Rate

Para mejorar el Win Rate (60% → 75%):

```javascript
// Configuración Optimizada
RSI Mín: 55
RSI Máx: 65
Volumen: 1.5×
Stop Type: Técnico
TP1: 1.5%
TP2: 3%
Timeout: 20 velas
```

### Backtesting Rápido

1. Configura tu estrategia
2. Selecciona velocidad **Máximo** (💫)
3. Click en **Iniciar**
4. Espera 25-50 segundos
5. Analiza: Win Rate, P&L, Total Trades

## 📁 Estructura del Proyecto

```
crypto-trading-bot/
├── index.html          # HTML principal
├── styles.css          # Estilos CSS
├── app.js             # Lógica del simulador
├── README.md          # Documentación
├── LICENSE            # Licencia MIT
└── package.json       # Metadata del proyecto
```

## 🔧 Configuración Avanzada

### Modificar Criptomonedas

En `app.js`, línea ~45:

```javascript
const baseData = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', basePrice: 42000, volatility: 0.02 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', basePrice: 2200, volatility: 0.03 },
    // Agregar más criptos aquí
];
```

### Cambiar Capital Inicial

En `app.js`, línea ~10:

```javascript
this.initialBalance = 1000; // Cambiar a tu capital deseado
```

### Ajustar Comisiones

En `app.js`, línea ~20:

```javascript
this.commission = 0.001; // 0.1% - Ajustar según tu exchange
```

## 📊 Interpretación de Resultados

### Win Rate
- **< 50%**: Estrategia necesita optimización
- **50-60%**: Aceptable, pero mejorable
- **60-70%**: Buena estrategia
- **> 70%**: Excelente estrategia

### P&L Total
- Compara con el capital inicial
- Objetivo: ROI > 5% mensual

### Trades On Hold
- Si se mantiene alto (> máx posiciones): Capital atrapado
- Solución: Reducir timeout o ajustar criterios

## 🐛 Troubleshooting

### El bot no compra nada
- **Causa**: Criterios muy estrictos (RSI 60-62, volumen 2×)
- **Solución**: Ampliar RSI a 55-65 o reducir volumen a 1.2×

### Win Rate muy bajo (<40%)
- **Causa**: Criterios muy permisivos o stops muy ajustados
- **Solución**: 
  1. RSI más estricto (55-65)
  2. Usar Stop técnico en lugar de fijo
  3. Reducir TP1 a 1.5%

### Posiciones se quedan "atrapadas"
- **Causa**: Timeout muy largo o sin stop loss
- **Solución**: Reducir timeout a 20 velas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Integración con APIs reales (Binance, Coinbase)
- [ ] Backtest histórico con datos reales
- [ ] Más indicadores (MACD, Bollinger Bands, Fibonacci)
- [ ] Guardar/Cargar configuraciones
- [ ] Export de resultados (CSV, JSON)
- [ ] Modo oscuro/claro
- [ ] Multi-idioma

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## ⚠️ Disclaimer

Este simulador es solo para propósitos educativos. Los datos son simulados y no reflejan condiciones reales del mercado. NO use este software para trading real sin una comprensión completa de los riesgos involucrados. Los resultados pasados no garantizan resultados futuros.

## 👨‍💻 Autor

Creado con ❤️ para la comunidad de trading

## 🙏 Agradecimientos

- Comunidad de trading algorítmico
- APIs de criptomonedas
- Fuentes: Google Fonts (JetBrains Mono, Outfit)

---

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**
