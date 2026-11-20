# 🚀 Guía de Despliegue: Frontend en Cloudflare Pages + Backend & Base de Datos en Render

Esta guía está diseñada específicamente para la arquitectura:
* **Frontend:** Alojado en **Cloudflare Pages** (distribución global en el Edge, SSL automático y velocidad ultra rápida).
* **Backend y Base de Datos:** Alojado en **Render** (Node.js para el servidor y PostgreSQL administrado para los datos con Prisma).

---

## 🏛️ Diagrama de Arquitectura

```
                  [ Navegador del Usuario ]
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │       CLOUDFLARE PAGES (Frontend)     │
         │   https://tu-proyecto.pages.dev       │
         │  (React 19, Tailwind, Konva, Canvas)  │
         └───────────────────┬───────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │ Peticiones API / Rutas          │ Conexión Externa Prisma
            │ (/api/* rewrite sin CORS)       │ (DATABASE_URL)
            ▼                                 ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│       RENDER WEB SERVICE      │  │       RENDER POSTGRESQL       │
│  (APIs, AI Groq, MercadoPago) │  │  (Base de Datos sewstudio-db) │
└───────────────┬───────────────┘  └───────────────────────────────┘
                │
                └─────────── Internal Connection ──────────┘
```

---

## 🟣 Paso 1: Configurar la Base de Datos y Backend en Render

Primero creamos la base de datos en Render para obtener las credenciales de conexión.

### 1.1 Crear la Base de Datos PostgreSQL
1. Ve a [Render Dashboard](https://dashboard.render.com/) y haz clic en **New +** ➡️ **PostgreSQL**.
2. Configura los campos:
   * **Name:** `sewstudio-db`
   * **Database:** `sewstudio`
   * **User:** `sewstudio_user`
   * **Region:** Selecciona la más cercana (ej: `Oregon (US West)` o `Frankfurt (EU)`).
   * **Plan:** **Free**.
3. Haz clic en **Create Database**.
4. Una vez creada, en la sección **Connections**, copia la **External Database URL** (tiene el formato `postgresql://sewstudio_user:PASSWORD@dpg-xxxxxx.oregon-postgres.render.com/sewstudio`).
   > [!IMPORTANT]
   > Copia la **External Database URL** (no la Internal), ya que Cloudflare Pages se conectará desde fuera de la red privada de Render.

### 1.2 (Opcional / Recomendado) Crear el Servicio Web en Render
Si además deseas que Render maneje las rutas pesadas de API o Server Actions:
1. En Render Dashboard, haz clic en **New +** ➡️ **Blueprint**.
2. Conecta el repositorio: `https://github.com/kevinKfv/ProyectoJazmin.git`.
3. Render usará el archivo `render.yaml` y creará el servicio `sewstudio-web`.
4. Copia la URL que te asigne Render (ej: `https://sewstudio-web.onrender.com`).

---

## 🟠 Paso 2: Desplegar el Frontend en Cloudflare Pages

Cloudflare Pages compilará la interfaz de Next.js y la distribuirá globalmente.

### 2.1 Conectar el Repositorio a Cloudflare Pages
1. Inicia sesión en el [Panel de Cloudflare](https://dash.cloudflare.com/).
2. En el menú lateral izquierdo, ve a **Workers & Pages**.
3. Haz clic en el botón **Create application** (o **Create**).
4. Selecciona la pestaña **Pages** y luego **Connect to Git**.
5. Autoriza tu cuenta de GitHub y selecciona el repositorio:
   **`kevinKfv/ProyectoJazmin`**
6. Haz clic en **Begin setup**.

### 2.2 Configuración de Build (Build Settings)
Configura la pantalla de compilación exactamente con estos valores:

* **Project name:** `sewstudio` (o el nombre que prefieras).
* **Production branch:** `main`.
* **Framework preset:** Selecciona **Next.js**.
* **Build command:**
  ```bash
  npx @cloudflare/next-on-pages
  ```
  *(o `npm run pages:build`)*
* **Build output directory:**
  ```text
  .vercel/output/static
  ```
* **Root directory:** `/` *(dejar en blanco o barra)*.

### 2.3 Variables de Entorno en Cloudflare Pages
En la sección desplegable **Environment variables (advanced)**, añade las siguientes variables:

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Versión de Node.js requerida por Next.js 16 |
| `DATABASE_URL` | *(Pega la **External Database URL** de Render)* | Conexión a la base de datos PostgreSQL |
| `AUTH_SECRET` | `openssl rand -base64 32` | Secreto para tokens de autenticación NextAuth |
| `NEXTAUTH_SECRET` | *(El mismo valor que `AUTH_SECRET`)* | Compatibilidad con NextAuth v5 |
| `AUTH_TRUST_HOST` | `true` | Para confiar en el dominio de Cloudflare Pages |
| `NEXTAUTH_URL` | `https://tu-proyecto.pages.dev` | La URL de tu app en Cloudflare Pages |
| `GROQ_API_KEY` | `gsk_tu_clave_de_groq` | Clave gratuita para la IA en [console.groq.com](https://console.groq.com/keys) |
| `BACKEND_URL` | *(Opcional)* `https://sewstudio-web.onrender.com` | Si creaste el Web Service en Render para llamadas API |

> [!TIP]
> Ya incluimos los archivos `.nvmrc` y `.node-version` fijados en `20` en el repositorio, por lo que Cloudflare Pages seleccionará Node 20 automáticamente.

### 2.4 Habilitar Compatibilidad con Node.js en Cloudflare Pages
Una vez creado el proyecto en Cloudflare Pages:
1. Ve a tu proyecto en Cloudflare Pages ➡️ **Settings** ➡️ **Functions**.
2. En la sección **Compatibility flags**, asegúrate de que esté añadida la flag:
   * **`nodejs_compat`**
3. En **Compatibility date**, coloca: `2024-09-23` (o posterior).
   *(Nota: Ya está especificado en `wrangler.toml`, pero es bueno verificarlo en el panel).*

---

## 🟢 Paso 3: Inicializar y Poblar la Base de Datos

Una vez que tengas la base de datos de Render creada:

1. En tu terminal local (o desde el Shell de Render si creaste el Web Service), ejecuta:
   ```bash
   # Aplica el esquema a la base de datos de Render
   npx prisma db push
   
   # Carga los usuarios demo, proyectos y patrones iniciales
   npm run db:seed
   ```
2. ¡Listo! La base de datos PostgreSQL en Render ya tendrá todas las tablas creadas y los datos listos para ser consumidos por Cloudflare Pages.

---

## 🌐 Paso 4: (Opcional) Dominio Personalizado en Cloudflare Pages

Si tienes un dominio propio gestionado en Cloudflare (ej. `tudominio.com`):
1. En tu proyecto de Cloudflare Pages, ve a la pestaña **Custom domains**.
2. Haz clic en **Set up a custom domain**.
3. Escribe tu subdominio o dominio principal (ej: `app.tudominio.com`).
4. Cloudflare configurará el DNS y el certificado SSL de inmediato en cuestión de segundos de forma 100% automática.

---

## 📁 Archivos Clave incluidos en el Repositorio

* **`next.config.ts`**: Configura rewrites automáticos para `/api/*` hacia Render si defines `BACKEND_URL`, y habilita encabezados CORS para llamadas cruzadas.
* **`wrangler.toml`**: Configuración para Cloudflare Pages con `nodejs_compat`.
* **`.nvmrc` y `.node-version`**: Garantizan que Cloudflare Pages compile con Node.js 20.
* **`public/_headers`**: Caché inmutable (`Cache-Control: immutable`) para assets estáticos y seguridad.
* **`public/_routes.json`**: Enrutamiento optimizado de Cloudflare Pages.
* **`render.yaml`**: Blueprint para levantar la base de datos y backend en Render con 1 clic.
