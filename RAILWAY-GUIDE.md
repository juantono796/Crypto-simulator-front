# 🚂 DEPLOY PROXY EN RAILWAY (Sin Tarjeta - GRATIS)

## ✅ Ventajas de Railway

- ✅ NO requiere tarjeta de crédito
- ✅ $5 de crédito gratis al mes (más que suficiente)
- ✅ Deploy súper rápido (1-2 min)
- ✅ UI moderna e intuitiva
- ✅ Soporte para Docker, Node.js, Python, etc.

---

## 🚀 PASO A PASO

### 1. Crear Cuenta

1. Ve a [railway.app](https://railway.app)
2. Click **Login** → **Login with GitHub**
3. Autoriza Railway

### 2. Crear Nuevo Proyecto

1. En el dashboard, click **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Busca y selecciona `binance-cors-proxy`
4. Click en el repo

### 3. Configuración Automática

Railway detecta automáticamente que es Node.js y configura:
- ✅ Build command: `npm install`
- ✅ Start command: `npm start`
- ✅ Puerto: Automático

**No necesitas configurar nada más.**

### 4. Deploy

Click **Deploy**

Espera 1-2 minutos.

### 5. Obtener URL

1. En el proyecto, click en el servicio
2. Tab **Settings**
3. Sección **Networking**
4. Click **Generate Domain**
5. Tu URL será algo como:
   ```
   https://binance-cors-proxy-production.up.railway.app
   ```

### 6. Verificar

Abre la URL en tu navegador. Deberías ver el JSON de status.

---

## 🔧 CONFIGURAR FRONTEND

En `app-binance-heroku.js`:

```javascript
const HEROKU_PROXY_URL = 'https://binance-cors-proxy-production.up.railway.app';
```

---

## 💰 CRÉDITOS GRATUITOS

Railway te da:
- **$5/mes GRATIS** sin tarjeta
- Un proxy simple consume ~$0.50-1/mes
- **Suficiente para 5+ meses gratis**

### Monitorear uso

Dashboard → Tu proyecto → **Usage**

Verás cuánto has usado este mes.

---

## ⚡ VENTAJAS

1. **No duerme**: Railway no tiene sleep automático
2. **Rápido**: Deploy en 1-2 min
3. **Simple**: Detección automática
4. **Logs**: Tiempo real sin configuración

---

## 📊 LIMITACIONES

- $5/mes gratis (suficiente para un proxy simple)
- Después de $5, necesitas agregar tarjeta
- Pero un proxy consume muy poco (~$0.50/mes)

---

## ✅ CHECKLIST

- [ ] Cuenta en Railway con GitHub
- [ ] Proyecto creado desde repo
- [ ] Deploy exitoso
- [ ] Dominio generado
- [ ] URL copiada
- [ ] Frontend actualizado

---

**Resultado: Proxy funcionando 24/7 sin sleep, sin tarjeta.**
