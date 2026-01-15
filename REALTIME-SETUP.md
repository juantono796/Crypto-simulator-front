# 🔴 ACTIVAR DATOS EN TIEMPO REAL

## 🚨 IMPORTANTE: Diferencia entre Simulado vs Real

### ❌ MODO ACTUAL (Simulado)
```
app.js → Datos generados aleatoriamente
├── Precios: Calculados matemáticamente
├── Volumen: Aleatorio
├── Cambios: Sintéticos
└── Velocidad: Controlada (acelerador de tiempo)
```

### ✅ MODO REAL (CoinGecko API)
```
app-realtime.js → Datos reales de CoinGecko
├── Precios: Bitcoin, Ethereum, etc. REALES
├── Volumen: Volumen real del mercado
├── Cambios: Cambios reales 24h
└── Actualización: Cada 1 minuto desde la API
```

---

## 🔄 CÓMO ACTIVAR DATOS REALES

### Opción 1: Cambiar archivo en index.html (Recomendado)

**Paso 1:** Edita `index.html`

**Antes:**
```html
<script src="app.js"></script>
```

**Después:**
```html
<script src="app-realtime.js"></script>
```

**Paso 2:** Commit y push

```bash
git add index.html
git commit -m "Activar datos en tiempo real"
git push origin main
```

**Paso 3:** Render re-deploya automáticamente (~30 seg)

---

### Opción 2: Renombrar archivos

```bash
# Backup del archivo simulado
mv app.js app-simulated.js

# Activar versión real
mv app-realtime.js app.js

# Commit
git add .
git commit -m "Cambiar a datos reales"
git push origin main
```

---

## 📊 VENTAJAS Y DESVENTAJAS

### ✅ Datos REALES (app-realtime.js)

**Ventajas:**
- ✅ Precios reales de Bitcoin, Ethereum, etc.
- ✅ Volumen real del mercado
- ✅ Indicadores calculados con datos verdaderos
- ✅ Resultados más realistas
- ✅ API GRATUITA de CoinGecko

**Desventajas:**
- ❌ Actualización cada 1 minuto (límite API)
- ❌ Máximo 50 llamadas/minuto (rate limit)
- ❌ Acelerador de tiempo limitado (no puedes simular 1 mes en 30 seg)
- ❌ Depende de conexión a Internet

### ⚡ Datos SIMULADOS (app.js)

**Ventajas:**
- ✅ Acelerador de tiempo funcional (1 mes en 30 seg)
- ✅ Sin límites de rate
- ✅ Funciona offline
- ✅ Perfecto para backtesting y pruebas

**Desventajas:**
- ❌ Datos ficticios
- ❌ No refleja mercado real
- ❌ Solo para educación/pruebas

---

## 🔧 CONFIGURACIÓN AVANZADA

### Cambiar Fuente de Datos (APIs alternativas)

#### Opción A: Binance API

En `app-realtime.js`, cambia la URL (línea ~60):

```javascript
// CoinGecko (actual)
const url = 'https://api.coingecko.com/api/v3/coins/markets...';

// Cambiar a Binance
const url = 'https://api.binance.com/api/v3/ticker/24hr';
```

**Ventajas de Binance:**
- Actualización más frecuente
- Más pares de trading
- Datos de exchange real

**Desventajas:**
- Formato diferente (requiere adaptación)
- Posibles problemas de CORS

#### Opción B: CoinCap API

```javascript
const url = 'https://api.coincap.io/v2/assets?limit=15';
```

**Ventajas:**
- CORS habilitado
- WebSockets disponibles
- Gratuita

**Desventajas:**
- Menos completa que CoinGecko

---

## ⚠️ LIMITACIONES DE APIS GRATUITAS

### CoinGecko (Usada actualmente)
```
✅ Gratis: Sí
📊 Rate Limit: 50 llamadas/minuto
🔑 API Key: No requerida
🌐 CORS: Habilitado
⏱️ Actualización: Cada 1 minuto en el bot
```

### Si necesitas más llamadas:

1. **CoinGecko PRO** ($129/mes)
   - 500 llamadas/min
   - Datos históricos
   - Soporte prioritario

2. **CryptoCompare** (Gratis con límites)
   - 100,000 llamadas/mes gratis
   - Requiere API key

3. **Binance** (Gratis, ilimitado)
   - Sin límites estrictos
   - Pero requiere adaptación del código

---

## 🧪 TESTING

### Verificar que datos son reales:

1. Inicia el bot
2. Mira el log: debe decir `"Modo: REAL"`
3. Compara precios con [CoinGecko.com](https://www.coingecko.com)
4. Los precios deben coincidir

### Ejemplo de log correcto:

```
[12:30:45] ✅ Datos reales cargados desde CoinGecko API
[12:30:46] ⚙️ Config: EMA20/50, RSI(50-70) | Modo: REAL
[12:31:45] 🔄 Datos de mercado actualizados
```

---

## 🚀 DEPLOY CON DATOS REALES

### GitHub + Render

```bash
# 1. Editar index.html
nano index.html
# Cambiar: <script src="app.js"></script>
# Por: <script src="app-realtime.js"></script>

# 2. Commit
git add index.html
git commit -m "feat: Activar datos en tiempo real de CoinGecko"

# 3. Push
git push origin main

# 4. Render detecta cambios y re-deploya
# Espera ~30 segundos
```

### Verificar en producción:

1. Ve a tu URL de Render
2. Abre DevTools (F12)
3. Ve a Console
4. Busca: `"Datos reales cargados desde CoinGecko API"`

---

## 📝 NOTAS IMPORTANTES

### ⚡ Acelerador de Tiempo con Datos Reales

```javascript
// Con datos SIMULADOS:
Velocidad Máxima → 1 mes en 25 segundos ✅

// Con datos REALES:
Velocidad Máxima → Solo acelera el procesamiento interno
La API solo se actualiza cada 1 minuto
NO puedes simular 1 mes en 30 segundos ❌
```

**Solución:** Si necesitas backtesting rápido, usa `app.js` (simulado)

### 🔒 Seguridad

```javascript
// Las APIs usadas son PÚBLICAS
// NO requieren API keys
// NO hay riesgo de seguridad

// Datos que se consumen:
✅ Precios (público)
✅ Volumen (público)
✅ Cambios 24h (público)

// Datos que NO se envían:
❌ Tu capital
❌ Tus trades
❌ Tu configuración

// Todo se procesa en tu navegador
```

---

## 🎯 RECOMENDACIÓN

### Para Trading en Vivo (futuro):
→ Usa `app-realtime.js`

### Para Backtesting y Optimización:
→ Usa `app.js` (simulado)

### Lo Ideal:
→ Ten ambos archivos disponibles
→ Cambia según tu necesidad

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
**Causa:** Problema de CORS o rate limit
**Solución:** 
1. Espera 1 minuto
2. Recarga la página
3. Si persiste, usa `app.js` (simulado)

### Los precios no cambian
**Causa:** La API se actualiza cada 1 minuto
**Solución:** Es normal, espera 60 segundos

### Mensaje: "usando modo simulado"
**Causa:** La API falló, el bot usó fallback
**Solución:** Revisa conexión a Internet

---

## 📞 Contacto

¿Problemas activando datos reales?
Abre un issue en GitHub o contacta al desarrollador.

---

**Última actualización:** 2026-01-14
