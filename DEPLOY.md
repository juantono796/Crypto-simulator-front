# 🚀 Guía de Deployment

Esta guía te ayudará a deployar el Crypto Trading Bot Simulator en diferentes plataformas.

## 📋 Contenido

- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Render](#render)
- [GitHub + Render (Recomendado)](#github--render-recomendado)

---

## 🌐 GitHub Pages

### Pasos:

1. **Crear repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/crypto-trading-bot.git
   git push -u origin main
   ```

2. **Activar GitHub Pages**
   - Ve a tu repositorio en GitHub
   - Click en **Settings** → **Pages**
   - En **Source**, selecciona **main** branch
   - Carpeta: **/ (root)**
   - Click **Save**

3. **Acceder**
   - URL: `https://tu-usuario.github.io/crypto-trading-bot/`
   - Tarda ~2 minutos en activarse

### ✅ Ventajas:
- Gratis
- Fácil de configurar
- Integrado con Git

### ❌ Desventajas:
- Sin SSL personalizado
- Solo sitios estáticos

---

## 🎨 Netlify

### Opción A: Desde GitHub

1. **Conectar GitHub**
   - Ve a [Netlify](https://netlify.com)
   - Click **Add new site** → **Import from Git**
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio

2. **Configuración**
   ```
   Build command: (vacío)
   Publish directory: .
   ```

3. **Deploy**
   - Click **Deploy site**
   - Tu sitio estará en: `https://random-name-123.netlify.app`

4. **Personalizar dominio** (opcional)
   - Site settings → Domain management
   - Add custom domain

### Opción B: Drag & Drop

1. Ve a [Netlify Drop](https://app.netlify.com/drop)
2. Arrastra toda la carpeta del proyecto
3. ¡Listo en 10 segundos!

### ✅ Ventajas:
- Super rápido
- SSL automático
- Deploy automático con cada push
- Dominio personalizado gratis

---

## ⚡ Vercel

### Desde CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio del proyecto
vercel

# Seguir las instrucciones
# Presiona Enter para aceptar defaults
```

### Desde Dashboard:

1. Ve a [Vercel](https://vercel.com)
2. Click **Add New** → **Project**
3. Import desde GitHub
4. Configuración:
   ```
   Framework Preset: Other
   Build Command: (vacío)
   Output Directory: .
   ```
5. Deploy

### ✅ Ventajas:
- Ultra rápido (Edge Network)
- SSL automático
- Analytics incluido
- Deploy automático

---

## 🎯 Render

### Pasos:

1. **Crear cuenta en Render**
   - Ve a [Render](https://render.com)
   - Sign up con GitHub

2. **Nuevo Static Site**
   - Click **New** → **Static Site**
   - Conecta tu repositorio

3. **Configuración**
   ```
   Name: crypto-trading-bot
   Branch: main
   Build Command: (vacío)
   Publish Directory: .
   ```

4. **Environment Variables** (opcional)
   - No necesarias para este proyecto

5. **Create Static Site**
   - URL: `https://crypto-trading-bot.onrender.com`

### ✅ Ventajas:
- Gratis para static sites
- SSL automático
- Deploy automático
- Buen uptime

### ❌ Desventajas:
- Más lento que Vercel/Netlify
- UI menos intuitiva

---

## 🏆 GitHub + Render (Recomendado)

Esta es la mejor opción para proyectos open-source.

### Ventajas Combinadas:
- ✅ Código en GitHub (versionado, colaboración)
- ✅ Deploy automático en Render
- ✅ Gratis para siempre
- ✅ SSL incluido
- ✅ Fácil de actualizar

### Workflow:

```bash
# 1. Hacer cambios localmente
git add .
git commit -m "Mejoras en el algoritmo"
git push origin main

# 2. Render detecta el push y re-deploya automáticamente
# 3. Tu sitio se actualiza en ~30 segundos
```

### Setup Completo:

```bash
# 1. Clonar/crear proyecto
git clone https://github.com/tu-usuario/crypto-trading-bot.git
cd crypto-trading-bot

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit
git add .
git commit -m "Update: mejoras en la estrategia"

# 4. Push a GitHub
git push origin main

# 5. Render auto-deploya
# Ver en: https://crypto-trading-bot.onrender.com
```

---

## 🔧 Troubleshooting

### Error: "Site not found"
- Verifica que el repositorio sea público
- Revisa que la rama sea correcta (main vs master)

### Error: "Build failed"
- Este es un sitio 100% frontend (HTML/CSS/JS)
- NO necesita build command
- Deja el build command VACÍO

### Sitio se ve roto
- Verifica que todos los archivos estén en el repositorio:
  - index.html
  - styles.css
  - app.js
- Revisa las rutas en index.html (deben ser relativas)

### Deploy muy lento
- GitHub Pages: Normal (2-5 min)
- Netlify: Rápido (10-30 seg)
- Vercel: Muy rápido (5-15 seg)
- Render: Moderado (30-60 seg)

---

## 📱 Testing Local

Antes de deployar, prueba localmente:

```bash
# Opción 1: Python (si tienes Python instalado)
python -m http.server 8000
# Abre: http://localhost:8000

# Opción 2: Node.js
npx serve .
# Abre: http://localhost:3000

# Opción 3: Live Server (VS Code extension)
# Click derecho en index.html → Open with Live Server
```

---

## 🎨 Personalización Post-Deploy

### Cambiar el nombre del sitio:

**Netlify:**
- Site settings → General → Change site name

**Vercel:**
- Settings → Domains → Edit

**Render:**
- Settings → Name → Update

### Agregar dominio personalizado:

1. Compra un dominio (Namecheap, GoDaddy, Google Domains)
2. En tu plataforma de hosting:
   - Netlify: Site settings → Domain management
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domains
3. Agrega records DNS según las instrucciones

---

## 📊 Monitoreo

### Analytics (opcional):

**Google Analytics:**
```html
<!-- Agregar antes de </head> en index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## ✅ Checklist Pre-Deploy

- [ ] Todos los archivos commiteados en Git
- [ ] index.html, styles.css, app.js presentes
- [ ] README.md actualizado
- [ ] package.json con info correcta
- [ ] .gitignore incluido
- [ ] Probado localmente
- [ ] Sin errores en consola del navegador
- [ ] Responsive (probado en móvil)

---

## 🚀 Quick Deploy

**La forma más rápida:**

```bash
# 1. Netlify Drop
# Ve a: https://app.netlify.com/drop
# Arrastra la carpeta del proyecto
# ¡Listo en 10 segundos!

# 2. Vercel CLI
vercel
# Sigue las instrucciones
# ¡Listo en 30 segundos!
```

---

¿Problemas? Abre un [issue en GitHub](https://github.com/tu-usuario/crypto-trading-bot/issues)
