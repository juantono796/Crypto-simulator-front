# 🚀 GUÍA COMPLETA: Binance + Heroku CORS Proxy

Esta guía te mostrará cómo deployar el Trading Bot con datos REALES de Binance usando Heroku como proxy CORS.

---

## 📋 ARQUITECTURA

```
┌──────────────────────┐
│   FRONTEND           │
│  (Static Site)       │  ← Tu trading bot
│  Render/Netlify      │
└──────────┬───────────┘
           │ fetch()
           │
           ▼
┌──────────────────────┐
│  HEROKU PROXY        │
│  (Node.js Express)   │  ← Solo añade headers CORS
└──────────┬───────────┘
           │ forward
           │
           ▼
┌──────────────────────┐
│   BINANCE API        │
│  api.binance.com     │  ← Datos reales
└──────────────────────┘
```

**Ventajas:**
- ✅ Frontend sigue siendo 100% static site
- ✅ Datos REALES de Binance
- ✅ Sin problemas de CORS
- ✅ Heroku gratis (con limitaciones)

---

## 🎯 PASO 1: DEPLOY DEL PROXY EN HEROKU

### Opción A: Heroku CLI (Recomendado)

#### 1. Instalar Heroku CLI

**Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Descarga desde: https://devcenter.heroku.com/articles/heroku-cli

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. Login a Heroku

```bash
heroku login
```

#### 3. Crear directorio del proxy

```bash
mkdir binance-cors-proxy
cd binance-cors-proxy
```

#### 4. Copiar archivos

Copia estos archivos a la carpeta:
- `server.js`
- `package.json`
- `Procfile`
- `.gitignore`
- `README.md`

(Los encontrarás en la carpeta `heroku-cors-proxy` del proyecto)

#### 5. Inicializar Git

```bash
git init
git add .
git commit -m "Initial commit: CORS proxy for Binance"
```

#### 6. Crear app en Heroku

```bash
heroku create tu-proxy-binance
```

**Nota:** Cambia `tu-proxy-binance` por un nombre único. Heroku te dirá si ya está tomado.

#### 7. Deploy

```bash
git push heroku main
```

#### 8. Verificar

```bash
heroku open
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Binance CORS Proxy is running",
  ...
}
```

#### 9. Obtener URL

```bash
heroku info
```

Copia la URL del proxy, ejemplo:
```
https://tu-proxy-binance.herokuapp.com
```

---

### Opción B: Heroku Dashboard (Sin CLI)

#### 1. Preparar código

1. Sube la carpeta `heroku-cors-proxy` a GitHub
2. Crea un nuevo repositorio: `binance-cors-proxy`

#### 2. Crear app en Heroku

1. Ve a [dashboard.heroku.com](https://dashboard.heroku.com)
2. Click **New** → **Create new app**
3. Nombre: `tu-proxy-binance`
4. Click **Create app**

#### 3. Conectar con GitHub

1. En **Deploy**, selecciona **GitHub**
2. Conecta tu cuenta
3. Busca el repo `binance-cors-proxy`
4. Click **Connect**

#### 4. Deploy

1. Scroll a **Manual deploy**
2. Selecciona **main** branch
3. Click **Deploy Branch**
4. Espera ~2 minutos

#### 5. Verificar

Click **Open app** (arriba a la derecha)

Deberías ver el JSON con status "ok"

#### 6. Copiar URL

La URL será:
```
https://tu-proxy-binance.herokuapp.com
```

---

## 🎯 PASO 2: CONFIGURAR EL FRONTEND

### 1. Editar app-binance-heroku.js

En la línea 5, cambia:

```javascript
// ANTES
const HEROKU_PROXY_URL = 'https://tu-proxy-binance.herokuapp.com';

// DESPUÉS (con tu URL real)
const HEROKU_PROXY_URL = 'https://crypto-bot-proxy.herokuapp.com';
```

### 2. Actualizar index.html

Cambia el script que se carga:

```html
<!-- ANTES -->
<script src="app.js"></script>

<!-- DESPUÉS -->
<script src="app-binance-heroku.js"></script>
```

### 3. Commit y Push

```bash
git add .
git commit -m "Conectar con Binance via Heroku proxy"
git push origin main
```

### 4. Render re-deploya automáticamente

Espera ~30 segundos

---

## ✅ VERIFICACIÓN

### 1. Abrir tu sitio en Render

```
https://tu-crypto-bot.onrender.com
```

### 2. Abrir DevTools (F12)

Console → deberías ver:

```
✅ Datos REALES cargados desde Binance (via Heroku)
⚙️ Config: ... | Fuente: BINANCE REAL
```

### 3. Comparar precios

Abre [Binance.com](https://www.binance.com/es/price/bitcoin)

Los precios en tu bot deben **coincidir exactamente**

---

## 🎨 PERSONALIZACIÓN

### Cambiar criptos monitoreadas

En `app-binance-heroku.js`, línea ~85:

```javascript
const mainPairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 
    // Agrega más aquí
    'ADAUSDT', 'LINKUSDT'
];
```

### Cambiar frecuencia de actualización

Línea 20:

```javascript
// ANTES
this.apiRateLimit = 5000; // 5 segundos

// DESPUÉS (más rápido)
this.apiRateLimit = 2000; // 2 segundos

// O más lento (menos peticiones)
this.apiRateLimit = 10000; // 10 segundos
```

---

## 💰 COSTOS

### Heroku Free Tier

```
✅ GRATIS
550 horas/mes (suficiente para un proyecto)
Duerme después de 30 min sin actividad
1000 MB RAM
```

**Limitación:** El proxy "duerme" si no se usa por 30 min.

**Solución:** Usa [UptimeRobot](https://uptimerobot.com) para hacer ping cada 5 min (gratis).

### Heroku Hobby

```
💰 $7/mes
Sin sleep (siempre activo)
SSL incluido
1000 MB RAM
```

### Render (Frontend)

```
✅ GRATIS (Static Site)
Sin limitaciones
100 GB bandwidth
```

**Total costo mínimo:** $0 (con limitación de sleep)
**Total costo recomendado:** $7/mes (sin sleep)

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch"

**Causa:** El proxy no está corriendo o la URL es incorrecta

**Solución:**
1. Ve a tu proxy: `https://tu-proxy.herokuapp.com`
2. Debe mostrar JSON con status "ok"
3. Si no carga, revisa logs: `heroku logs --tail`

### Error: "CORS policy"

**Causa:** El proxy no está enviando headers CORS correctamente

**Solución:**
Verifica que `server.js` tenga:
```javascript
app.use(cors({
    origin: '*',  // O tu dominio específico
    ...
}));
```

### El proxy se duerme

**Causa:** Heroku free tier duerme después de 30 min

**Solución A - UptimeRobot (Gratis):**
1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Crea cuenta gratis
3. Add New Monitor
4. URL: `https://tu-proxy.herokuapp.com`
5. Interval: 5 minutes

**Solución B - Upgrade a Hobby ($7/mes):**
```bash
heroku dyno:type hobby -a tu-proxy-binance
```

### Los precios no cambian

**Causa:** La API se está llamando correctamente pero los datos no se actualizan visualmente

**Solución:**
1. Abre DevTools → Network
2. Filtra por `binance`
3. Deberías ver peticiones cada 5 segundos
4. Si no hay peticiones, revisa la consola por errores

---

## 📊 MONITOREO

### Ver logs del proxy

```bash
heroku logs --tail -a tu-proxy-binance
```

### Ver métricas

```bash
heroku metrics -a tu-proxy-binance
```

O en el dashboard:
https://dashboard.heroku.com/apps/tu-proxy-binance/metrics

---

## 🔒 SEGURIDAD

### Restringir orígenes (Recomendado para producción)

En `server.js`:

```javascript
// ANTES (permite todo)
app.use(cors({
    origin: '*',
    ...
}));

// DESPUÉS (solo tu dominio)
app.use(cors({
    origin: 'https://tu-crypto-bot.onrender.com',
    methods: ['GET'],
    credentials: true
}));
```

Luego:

```bash
git add server.js
git commit -m "Restrict CORS to specific domain"
git push heroku main
```

---

## 🚀 ALTERNATIVAS AL PROXY

### 1. Usar CoinGecko (sin proxy)

**Ventajas:**
- ✅ CORS habilitado
- ✅ Sin proxy necesario
- ✅ Gratis

**Desventajas:**
- ⚠️ 50 llamadas/min (vs ilimitado en Binance)
- ⚠️ Actualización cada 1 min (vs 5 seg)

**Cómo:**
Usa `app-realtime.js` en lugar de `app-binance-heroku.js`

### 2. Cloudflare Workers (Avanzado)

Más rápido que Heroku, pero requiere más configuración.

---

## 📈 PERFORMANCE

### Latencia esperada

```
Usuario → Render (Frontend)     : ~50ms
Render → Heroku (Proxy)          : ~100ms
Heroku → Binance API             : ~50ms
Binance → Heroku → Render → User: ~100ms
────────────────────────────────────────
Total: ~300ms
```

Comparado con:

```
Usuario → CoinGecko directo: ~150ms
```

**Conclusión:** El proxy añade ~150ms de latencia (aceptable).

---

## ✅ CHECKLIST FINAL

- [ ] Proxy deployado en Heroku
- [ ] Proxy responde en `/` con JSON status ok
- [ ] URL del proxy copiada
- [ ] `app-binance-heroku.js` con URL correcta
- [ ] `index.html` apunta a `app-binance-heroku.js`
- [ ] Frontend deployado en Render
- [ ] Console muestra "Fuente: BINANCE REAL"
- [ ] Precios coinciden con Binance.com
- [ ] (Opcional) UptimeRobot configurado para evitar sleep

---

## 🎉 ¡LISTO!

Ahora tienes:
- ✅ Frontend static site en Render (GRATIS)
- ✅ Proxy CORS en Heroku (GRATIS o $7/mes)
- ✅ Datos REALES de Binance
- ✅ Actualización cada 5 segundos
- ✅ Sin problemas de CORS

---

## 📞 SOPORTE

¿Problemas?
1. Revisa los logs: `heroku logs --tail`
2. Verifica el proxy funciona: visita la URL directamente
3. Abre DevTools → Console para ver errores
4. Abre un issue en GitHub

---

**Última actualización:** 2026-01-15
