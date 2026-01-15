# 🚀 GUÍA COMPLETA: Deploy Frontend + Backend en Render

Esta guía te mostrará cómo deployar **AMBOS** servicios (Frontend y Backend) en Render con integración a Binance.

---

## 📋 ARQUITECTURA COMPLETA

```
┌──────────────────────────────┐
│   FRONTEND (Static Site)     │
│   Render                      │  ← Tu trading bot (HTML/CSS/JS)
│   app-backend.js              │
└──────────────┬────────────────┘
               │
               │ fetch() cada 5 segundos
               │
               ▼
┌──────────────────────────────┐
│   BACKEND (Web Service)       │
│   Render                      │  ← API REST (Node.js + Express)
│   server.js                   │
└──────────────┬────────────────┘
               │
               │ forward request
               │
               ▼
┌──────────────────────────────┐
│   BINANCE API                 │
│   api.binance.com             │  ← Datos REALES
└──────────────────────────────┘
```

**Ventajas:**
- ✅ Ambos en Render (un solo proveedor)
- ✅ 100% GRATIS (sin tarjeta)
- ✅ Datos REALES de Binance
- ✅ Fácil mantenimiento
- ✅ Auto-deploy desde GitHub

---

## 🎯 PASO 1: DEPLOY DEL BACKEND

### 1.1 Preparar Repositorio del Backend

```bash
# Navegar a la carpeta del backend
cd crypto-bot-backend

# Inicializar Git
git init
git add .
git commit -m "Initial commit: Backend API"

# Crear repositorio en GitHub
# Ve a: https://github.com/new
# Nombre: crypto-bot-backend

# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/crypto-bot-backend.git
git branch -M main
git push -u origin main
```

### 1.2 Crear Web Service en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Click **Connect GitHub** (si aún no lo hiciste)
4. Busca y selecciona el repo `crypto-bot-backend`
5. Click **Connect**

### 1.3 Configuración del Backend

```
Name: crypto-bot-backend
Region: Oregon (o el más cercano a ti)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

6. Click **Create Web Service**
7. Espera 2-3 minutos mientras se deploya

### 1.4 Obtener URL del Backend

Una vez deployado, verás tu URL:
```
https://crypto-bot-backend.onrender.com
```

**IMPORTANTE:** Copia esta URL, la necesitarás para el frontend.

### 1.5 Verificar que funciona

Abre la URL en tu navegador. Deberías ver:

```json
{
  "status": "ok",
  "message": "Crypto Trading Bot Backend",
  "version": "1.0.0",
  ...
}
```

✅ Si ves esto, el backend está funcionando correctamente.

---

## 🎯 PASO 2: CONFIGURAR EL FRONTEND

### 2.1 Actualizar URL del Backend

En tu proyecto frontend, edita `app-backend.js`:

```javascript
// Línea 5 - CAMBIAR ESTA URL
const BACKEND_URL = 'https://crypto-bot-backend.onrender.com';

// POR tu URL real del backend
const BACKEND_URL = 'https://crypto-bot-backend-abc123.onrender.com';
```

### 2.2 Actualizar index.html

Asegúrate de que `index.html` cargue el archivo correcto:

```html
<!-- Casi al final del archivo, cambiar: -->
<script src="app.js"></script>

<!-- POR: -->
<script src="app-backend.js"></script>
```

### 2.3 Commit cambios

```bash
cd crypto-bot-frontend

git add .
git commit -m "Connect to backend API"
git push origin main
```

---

## 🎯 PASO 3: DEPLOY DEL FRONTEND

### 3.1 Preparar Repositorio (si aún no lo hiciste)

```bash
cd crypto-bot-frontend

git init
git add .
git commit -m "Initial commit: Frontend"

# Crear repo en GitHub
# Nombre: crypto-bot-frontend

git remote add origin https://github.com/TU-USUARIO/crypto-bot-frontend.git
git branch -M main
git push -u origin main
```

### 3.2 Crear Static Site en Render

1. En Render dashboard, click **New +** → **Static Site**
2. Conecta tu repositorio `crypto-bot-frontend`
3. Click **Connect**

### 3.3 Configuración del Frontend

```
Name: crypto-bot-frontend
Branch: main
Build Command: (dejar vacío)
Publish Directory: .
```

4. Click **Create Static Site**
5. Espera 1-2 minutos

### 3.4 Obtener URL del Frontend

Tu frontend estará en:
```
https://crypto-bot-frontend.onrender.com
```

---

## 🎯 PASO 4: CONFIGURAR CORS EN EL BACKEND

Este paso es CRÍTICO para que el frontend pueda comunicarse con el backend.

### 4.1 Editar server.js del Backend

En tu proyecto backend, edita `server.js`, línea 14:

```javascript
// ANTES
const allowedOrigins = [
    'http://localhost:3000',
    'https://crypto-bot-frontend.onrender.com', // Genérico
    /\.onrender\.com$/,
];

// DESPUÉS - Agregar tu URL específica
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://crypto-bot-frontend.onrender.com', // Cambiar por tu URL
    'https://tu-frontend-real.onrender.com', // ← Tu URL específica
    /\.onrender\.com$/,
];
```

### 4.2 Push cambios

```bash
cd crypto-bot-backend

git add server.js
git commit -m "Update CORS for frontend URL"
git push origin main
```

Render detectará el cambio y re-deployará automáticamente (~2 min).

---

## ✅ PASO 5: VERIFICACIÓN COMPLETA

### 5.1 Verificar Backend

1. Abre: `https://tu-backend.onrender.com`
2. Deberías ver JSON con `"status": "ok"`
3. Prueba el endpoint:
   - `https://tu-backend.onrender.com/api/binance/ticker`
   - Deberías ver lista de criptos con datos reales

### 5.2 Verificar Frontend

1. Abre: `https://tu-frontend.onrender.com`
2. Abre DevTools (F12) → Console
3. Deberías ver:
   ```
   ✅ Backend conectado: ok
   ✅ 15 pares actualizados desde Binance
   ```

### 5.3 Verificar Datos Reales

1. En tu frontend, mira los precios
2. Abre [Binance.com](https://www.binance.com/es/price/bitcoin) en otra pestaña
3. Compara el precio de BTC
4. **Deben coincidir** (±$10)

✅ Si todo coincide, ¡FUNCIONA PERFECTAMENTE!

---

## 🔄 WORKFLOW DE ACTUALIZACIÓN

### Actualizar Backend:

```bash
cd crypto-bot-backend

# Hacer cambios en server.js...

git add .
git commit -m "Update: mejoras en el backend"
git push origin main

# Render auto-deploya en ~2 minutos
```

### Actualizar Frontend:

```bash
cd crypto-bot-frontend

# Hacer cambios en app-backend.js...

git add .
git commit -m "Update: mejoras en el frontend"
git push origin main

# Render auto-deploya en ~30 segundos
```

---

## ⚠️ MANEJO DEL SLEEP

Render free tier duerme después de 15 min de inactividad.

### Solución: Cron-job.org (GRATIS)

1. Ve a [cron-job.org](https://cron-job.org)
2. Create account (gratis)
3. Create cronjob:
   - **Title:** Keep backend awake
   - **URL:** `https://tu-backend.onrender.com/health`
   - **Schedule:** Every 5 minutes
   - **Enabled:** Yes
4. Save

Ahora tu backend NUNCA dormirá.

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch" en Console

**Causa:** Frontend no puede conectar con backend

**Solución:**
1. Verifica que backend esté corriendo: `https://tu-backend.onrender.com`
2. Verifica URL en `app-backend.js` línea 5
3. Revisa CORS en `server.js` del backend

### Error: "Not allowed by CORS"

**Causa:** CORS no configurado correctamente

**Solución:**
1. En `server.js` del backend, agrega tu URL de frontend
2. Push cambios
3. Espera 2 min a que re-deploye

### Backend muestra status "Building"

**Causa:** Está deployando

**Solución:** Espera 2-3 minutos. Refresh la página.

### Backend muestra status "Failed"

**Causa:** Error en el código o dependencias

**Solución:**
1. Click en el servicio
2. Tab **Logs**
3. Busca el error
4. Comúnmente: falta dependencia en `package.json`

### Precios no coinciden con Binance

**Causa:** Backend desconectado o usando simulación

**Solución:**
1. Abre DevTools → Console
2. Busca: "Backend conectado"
3. Si dice "simulación", el backend no responde
4. Verifica que backend esté running

---

## 📊 MONITOREO

### Ver Logs del Backend:

1. Render Dashboard → crypto-bot-backend
2. Tab **Logs**
3. Ves requests en tiempo real

### Ver Logs del Frontend:

1. Abre tu sitio
2. DevTools (F12) → Console
3. Ves todas las operaciones del bot

---

## 💰 COSTOS

| Servicio | Tipo | Costo |
|----------|------|-------|
| Backend | Web Service | **$0** (750h/mes) |
| Frontend | Static Site | **$0** (ilimitado) |
| Cron-job | Externo | **$0** |
| **TOTAL** | | **$0** 🎉 |

**Sin tarjeta de crédito necesaria.**

---

## 🎨 PERSONALIZACIÓN

### Cambiar criptos monitoreadas:

**Backend:** `server.js`, línea ~70
```javascript
const mainPairs = [
    'BTCUSDT', 'ETHUSDT',
    'TUUSDT', // ← Agregar el tuyo
];
```

**Frontend:** `app-backend.js`
No necesitas cambiar nada, se adapta automáticamente.

### Cambiar frecuencia de actualización:

**Frontend:** `app-backend.js`, línea ~20
```javascript
this.apiRateLimit = 5000; // 5 segundos (default)
// o
this.apiRateLimit = 10000; // 10 segundos (menos peticiones)
```

---

## 🔒 SEGURIDAD ADICIONAL

### Restringir CORS solo a tu frontend:

En `server.js`:

```javascript
const allowedOrigins = [
    'https://tu-frontend-exacto.onrender.com', // Solo este
];
```

Elimina la línea con `/\.onrender\.com$/` para mayor seguridad.

---

## ✅ CHECKLIST FINAL

- [ ] Backend deployado en Render
- [ ] Backend responde en `/health`
- [ ] URL del backend copiada
- [ ] `app-backend.js` con URL correcta
- [ ] `index.html` apunta a `app-backend.js`
- [ ] Frontend deployado en Render
- [ ] CORS actualizado en backend con URL de frontend
- [ ] Console muestra "Backend conectado: ok"
- [ ] Precios coinciden con Binance.com
- [ ] Cron-job configurado (opcional pero recomendado)

---

## 🎉 ¡FELICIDADES!

Ahora tienes:
- ✅ Frontend en Render (GRATIS)
- ✅ Backend en Render (GRATIS)
- ✅ Datos REALES de Binance
- ✅ Actualización cada 5 segundos
- ✅ Todo sin tarjeta de crédito
- ✅ Auto-deploy desde GitHub

**Total invertido: $0**
**Tiempo de setup: 30 minutos**

---

## 📞 SOPORTE

¿Problemas?
1. Revisa los logs en Render (Backend y Frontend)
2. Verifica las URLs están correctas
3. Prueba los endpoints con curl
4. Abre un issue en GitHub

---

**Última actualización:** 2026-01-15
