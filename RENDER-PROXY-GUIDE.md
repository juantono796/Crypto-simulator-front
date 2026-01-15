# 🚀 DEPLOY PROXY EN RENDER (Sin Tarjeta - GRATIS)

## ✅ Ventajas de Render vs Heroku

| Feature | Heroku | Render |
|---------|--------|--------|
| Requiere tarjeta | ✅ Sí | ❌ NO |
| Plan gratis | Limitado | ✅ 750h/mes |
| Sleep automático | Sí (30 min) | Sí (15 min) |
| Deploy desde GitHub | ✅ | ✅ |
| SSL gratis | ✅ | ✅ |

---

## 🚀 PASO A PASO

### 1. Preparar el Código

Ya tienes todo listo en `heroku-cors-proxy/`

Solo necesitas agregar un archivo de configuración:

**Crear `render.yaml`** (opcional pero recomendado):

```yaml
services:
  - type: web
    name: binance-cors-proxy
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.16.0
```

### 2. Subir a GitHub

```bash
cd heroku-cors-proxy

# Inicializar git (si aún no lo hiciste)
git init
git add .
git commit -m "Initial commit: CORS proxy for Binance"

# Crear repo en GitHub y conectarlo
git remote add origin https://github.com/tu-usuario/binance-cors-proxy.git
git branch -M main
git push -u origin main
```

### 3. Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Click **Get Started** o **Sign Up**
3. **Sign up with GitHub** (más fácil)
4. Autoriza Render a acceder a tus repos

### 4. Crear Web Service

1. En el dashboard, click **New +** → **Web Service**
2. Conecta tu repositorio `binance-cors-proxy`
3. Click **Connect**

### 5. Configuración

```
Name: binance-cors-proxy
Region: Oregon (o el más cercano)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 6. Deploy

1. Click **Create Web Service**
2. Espera ~2-3 minutos
3. ¡Listo!

### 7. Obtener URL

Tu proxy estará en:
```
https://binance-cors-proxy.onrender.com
```

### 8. Verificar

Abre esa URL en el navegador. Deberías ver:

```json
{
  "status": "ok",
  "message": "Binance CORS Proxy is running",
  ...
}
```

---

## 🔧 CONFIGURAR FRONTEND

En `app-binance-heroku.js`, línea 5:

```javascript
// CAMBIAR
const HEROKU_PROXY_URL = 'https://tu-proxy-binance.herokuapp.com';

// POR
const HEROKU_PROXY_URL = 'https://binance-cors-proxy.onrender.com';
```

---

## ⚡ EVITAR SLEEP (Gratis)

El proxy duerme después de 15 min sin actividad.

**Solución: Cron-job.org** (sin registro, más fácil que UptimeRobot)

1. Ve a [cron-job.org](https://cron-job.org)
2. Create account (gratis)
3. Create cronjob:
   - URL: `https://binance-cors-proxy.onrender.com`
   - Interval: Every 5 minutes
4. Save

Ahora tu proxy NUNCA dormirá.

---

## 💡 VENTAJAS ADICIONALES

### Auto-deploy desde GitHub

Cada vez que hagas `git push`:

```bash
git add server.js
git commit -m "Update: mejora en el proxy"
git push origin main
```

Render detecta el cambio y re-deploya automáticamente (~2 min).

### Logs en vivo

En el dashboard de Render:
- Click en tu servicio
- Tab **Logs**
- Ves logs en tiempo real

### Environment Variables

Si necesitas configurar variables:
- Tab **Environment**
- Add environment variable
- Example: `API_KEY=tu_key`

---

## 🔒 SEGURIDAD

### Restringir a tu dominio

En `server.js`:

```javascript
app.use(cors({
    origin: 'https://tu-bot.onrender.com',  // Solo tu frontend
    methods: ['GET'],
    credentials: true
}));
```

---

## 📊 LIMITACIONES DEL PLAN GRATIS

```
✅ 750 horas/mes (suficiente para 1 servicio 24/7)
✅ SSL gratis
✅ Auto-deploy
✅ Logs
⚠️ Sleep después de 15 min inactividad (solucionable con cron-job)
⚠️ Builds pueden tardar 2-3 min
```

---

## 🐛 TROUBLESHOOTING

### "Build failed"

Revisa que `package.json` tenga:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### "Service unavailable"

El servicio está dormido. Espera 30 seg a que despierte o configura cron-job.

### "CORS error persiste"

1. Verifica que el proxy esté corriendo (abre la URL)
2. Revisa que `server.js` tenga `app.use(cors())`
3. Check DevTools → Network → ve si la petición llega al proxy

---

## ✅ CHECKLIST

- [ ] Código en GitHub
- [ ] Cuenta creada en Render (con GitHub)
- [ ] Web Service creado
- [ ] Deploy exitoso (status: Live)
- [ ] URL copiada
- [ ] `app-binance-heroku.js` actualizado con nueva URL
- [ ] Frontend re-deployado
- [ ] Cron-job configurado (opcional pero recomendado)

---

## 🎉 RESULTADO FINAL

```
┌─────────────────────┐
│   Frontend          │
│   Render            │  ← Static Site (GRATIS)
│   (tu-bot...)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Proxy             │
│   Render            │  ← Web Service (GRATIS - SIN TARJETA)
│   (binance-cors...) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Binance API       │
└─────────────────────┘
```

**Total costo: $0**
**Tarjeta requerida: NO**

---

¡Listo! Sin Heroku, sin tarjeta, 100% gratis. 🚀
