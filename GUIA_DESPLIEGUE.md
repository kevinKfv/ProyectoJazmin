# 🚀 Guía de Despliegue: Render & Cloudflare

Esta guía detalla los pasos para desplegar **SewStudio** en **Render** (con base de datos PostgreSQL) y cómo integrarlo con **Cloudflare** para obtener máxima velocidad global (CDN), certificado SSL automático y protección DDoS.

---

## 🏛️ Arquitectura Recomendada de Producción

```
       [ Usuario / Cliente ]
                 │
                 ▼
    ┌──────────────────────────┐
    │     CLOUDFLARE CDN       │  <── SSL Full, Caché de assets estáticos
    │   (Dominio & Seguridad)  │      (/_next/static/*) y protección DDoS
    └────────────┬─────────────┘
                 │ Proxy (CNAME)
                 ▼
    ┌──────────────────────────┐
    │     RENDER WEB SERVICE   │  <── Next.js 16 (App Router + Server Actions)
    │     (Servidor Node.js)   │
    └────────────┬─────────────┘
                 │ TCP Connection
                 ▼
    ┌──────────────────────────┐
    │    RENDER POSTGRESQL     │  <── Base de datos relacional con Prisma
    └──────────────────────────┘
```

---

## 🟣 Parte 1: Despliegue en Render

El proyecto ya cuenta con el archivo `render.yaml` (Render Blueprint), lo que permite crear la Base de Datos PostgreSQL y el Servicio Web con **1 solo clic**.

### Opción A: Despliegue Automático con Blueprint (Recomendado)

1. Ve a tu cuenta de [Render Dashboard](https://dashboard.render.com/).
2. Haz clic en **New +** y selecciona **Blueprint**.
3. Conecta tu repositorio de GitHub: `https://github.com/kevinKfv/ProyectoJazmin.git`.
4. Render detectará automáticamente el archivo `render.yaml`.
5. Verás dos recursos que se crearán:
   * **Database:** `sewstudio-db` (PostgreSQL gratuito).
   * **Web Service:** `sewstudio-web` (Node.js).
6. En las variables de entorno, Render generará automáticamente `AUTH_SECRET` y vinculará `DATABASE_URL`. Solo ingresa tu `GROQ_API_KEY` (puedes obtenerla gratis en [console.groq.com](https://console.groq.com/keys)).
7. Haz clic en **Apply**. Render compilará el proyecto y aprovisionará la base de datos automáticamente.

### Opción B: Despliegue Manual en Render

Si prefieres crearlos paso a paso:

#### 1. Crear la Base de Datos PostgreSQL:
* En Render Dashboard, haz clic en **New +** ➡️ **PostgreSQL**.
* Nombre: `sewstudio-db`.
* Database: `sewstudio`.
* User: `sewstudio_user`.
* Plan: **Free**.
* Copia la **Internal Database URL** generada.

#### 2. Crear el Web Service:
* Haz clic en **New +** ➡️ **Web Service**.
* Conecta el repositorio: `https://github.com/kevinKfv/ProyectoJazmin.git`.
* **Runtime:** `Node`.
* **Build Command:**
  ```bash
  npm install && npx prisma generate && npx prisma db push && npm run build
  ```
* **Start Command:**
  ```bash
  npm run start
  ```
* **Environment Variables:**
  | Clave | Valor |
  | :--- | :--- |
  | `DATABASE_URL` | *(Pega la Internal Database URL de tu base de datos Render)* |
  | `NODE_ENV` | `production` |
  | `AUTH_TRUST_HOST` | `true` |
  | `AUTH_SECRET` | *(Genera un secreto aleatorio o usa `openssl rand -base64 32`)* |
  | `NEXTAUTH_SECRET` | *(El mismo valor que `AUTH_SECRET`)* |
  | `GROQ_API_KEY` | *(Tu API key de Groq)* |

#### 3. Ejecutar Semilla de Datos Inicial (Seed):
Una vez desplegado con éxito, puedes poblar los datos de prueba desde Render:
1. En el panel de tu Web Service en Render, ve a la pestaña **Shell**.
2. Ejecuta:
   ```bash
   npm run db:seed
   ```
¡Listo! Ya tendrás usuarios de prueba, proyectos y patrones cargados.

---

## 🟠 Parte 2: Conectar con Cloudflare (CDN, Dominio & SSL)

Para dotar a tu aplicación de un dominio personalizado (ej. `midominio.com`), SSL de grado empresarial y caché ultrarrápida:

### Paso 1: Configurar el DNS en Cloudflare
1. En el panel de **Cloudflare**, selecciona tu dominio.
2. Ve a **DNS** ➡️ **Records**.
3. Añade un registro **CNAME**:
   * **Type:** `CNAME`
   * **Name:** `@` (o tu subdominio, ej. `app`)
   * **Target:** El hostname de Render (ej. `sewstudio-web.onrender.com`).
   * **Proxy status:** **Proxied (Nube naranja ☁️)**.
4. Guarda los cambios.

### Paso 2: Configurar Dominio Personalizado en Render
1. En el Web Service en Render, ve a **Settings** ➡️ **Custom Domains**.
2. Añade tu dominio (ej. `midominio.com` o `app.midominio.com`).
3. Render verificará el registro CNAME automáticamente.

### Paso 3: SSL y Reglas de Rendimiento en Cloudflare
1. En Cloudflare, ve a **SSL/TLS**:
   * Modo de cifrado: Selecciona **Full** o **Full (strict)**.
2. Ve a **Caching** ➡️ **Cache Rules** (Opcional para máxima velocidad):
   * Puedes crear una regla para cachear en el Edge la carpeta estática de Next.js:
     * Si la URI contiene `/_next/static/` ➡️ **Eligible for cache**, Edge TTL: 1 mes.
     * Ya incluimos el archivo `public/_headers` en el repositorio para que Cloudflare y los navegadores apliquen `immutable` automáticamente a estos assets.

---

## ⚡ Parte 3: Despliegue Alternativo en Cloudflare Pages

Si deseas ejecutar la interfaz en **Cloudflare Pages** directamente:
* El repositorio incluye `wrangler.toml`, `public/_headers` y `public/_routes.json`.
* En Cloudflare Dashboard:
  1. Ve a **Workers & Pages** ➡️ **Create application** ➡️ **Pages** ➡️ **Connect to Git**.
  2. Framework preset: **Next.js**.
  3. Build command: `npx @cloudflare/next-on-pages` (o `npm run build`).
  4. Build output directory: `.vercel/output/static`.
  5. En **Variables de entorno**, añade `DATABASE_URL` (requiere un servicio de base de datos accesible públicamente como Render Postgres o Supabase con adaptador TCP/Hyperdrive) y `AUTH_SECRET`.

---

## 📋 Resumen de Archivos Agregados al Proyecto

* **`render.yaml`**: Blueprint para aprovisionar Web Service y PostgreSQL en 1 clic.
* **`Dockerfile`**: Compilación multi-etapa optimizada con Next.js standalone.
* **`.dockerignore`**: Exclusión de archivos innecesarios para optimizar peso del contenedor.
* **`wrangler.toml`**: Configuración para compatibilidad con Cloudflare Workers/Pages (`nodejs_compat`).
* **`public/_headers`**: Encabezados de caché inmutable (`_next/static`) y seguridad HTTP.
* **`public/_routes.json`**: Enrutamiento optimizado para Cloudflare Pages.
* **`.env.example`**: Documentación de variables requeridas.
* **`package.json`**: Añadido script `postinstall` para generar el cliente Prisma automáticamente y scripts de despliegue.
