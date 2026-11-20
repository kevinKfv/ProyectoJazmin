# 🪡 SewStudio — Plataforma Integral para Costura y Patronaje

![SewStudio Banner](https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop)

**SewStudio** es una aplicación web moderna diseñada para modistas, diseñadoras de moda, patronistas y talleres textiles. Centraliza la gestión de proyectos, inventario de insumos, costeo financiero, diseño de etiquetas, patronaje vectorial interactivo y catálogo público de prendas.

---

## 🌟 Características Principales

* **📊 Dashboard de Métricas:** Resumen en tiempo real de proyectos activos, materiales en inventario, horas invertidas y alertas de bajo stock.
* **📋 Tablero Kanban de Proyectos:** Seguimiento visual por fases (*Idea ➡️ Diseño ➡️ Corte ➡️ Costura ➡️ Ajustes ➡️ Finalizado*).
* **🧵 Inventario & Historial de Movimientos:** Control de existencias de telas, hilos, cierres, botones y fornituras con trazabilidad de entradas y salidas.
* **💰 Calculadora de Costos (Módulo 4):** Cálculo automático del costo total de prendas sumando mano de obra (horas × tarifa) e insumos consumidos.
* **📐 Editor Vectorial de Moldes y Patrones:**
  * Mesa de trabajo interactiva basada en canvas HTML5 (`react-konva`).
  * Inserción de **moldes base predefinidos** (Delantero, Espalda, Manga, Falda, Cuello, Bolsillo).
  * Control de **Margen de Costura** (*Seam Allowance*) de 0.7cm a 2.0cm con visualización de líneas de corte.
  * Cálculo dinámico de distancias en **centímetros** por segmento.
  * Herramientas de **Cinta Métrica**, Anotación de Texto, Zoom/Pan con rueda del mouse e historial de **Deshacer/Rehacer** (`Ctrl+Z`).
* **🏷️ Diseñador e Historial de Etiquetas:**
  * Editor gráfico para etiquetas de Marca, Lavado/Cuidado, Producto y Códigos QR.
  * Historial de etiquetas guardadas en base de datos con exportación a PNG en alta resolución.
* **🤖 Asistente de Costura con IA:** Chat bot integrado asistido por LLM (Groq / OpenAI) para consulta de técnicas, tensiones de aguja e hilado.
* **🌟 Catálogo Público & Portfolio:** Galería de creaciones terminadas con precios de venta y opción de compartir enlaces públicos con clientes.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Frontend & Backend** | [Next.js 16 (App Router)](https://nextjs.org/) con TypeScript |
| **Biblioteca UI** | [React 19](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Base de Datos & ORM** | PostgreSQL con [Prisma ORM 5.22](https://www.prisma.io/) |
| **Autenticación** | [NextAuth.js v5](https://next-auth.js.org/) |
| **Lienzo Gráfico / Canvas** | [Konva.js](https://konvajs.org/) & `react-konva` |
| **Inteligencia Artificial** | [Vercel AI SDK](https://sdk.vercel.ai/) & [@ai-sdk/groq](https://groq.com/) |

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="postgresql://postgres@localhost:5432/sewstudio?schema=public"
NEXTAUTH_SECRET="secret1234567890"
GROQ_API_KEY="tu_api_key_de_groq"
```

### 3. Sincronizar esquema de Base de Datos

```bash
npx prisma db push
```

### 4. Poblar datos de prueba (Seeding)

Ejecuta el script de siembra para generar automáticamente usuarios demo, proyectos en todos los estados del Kanban, inventario, patrones vectoriales y etiquetas:

```bash
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador e ingresa con las credenciales demo.

---

## 🌐 Despliegue en Producción (Render & Cloudflare)

El proyecto incluye configuración lista para producción:

* **Render:** Despliegue en 1 clic utilizando el blueprint `render.yaml` (crea el servicio web Next.js y la base de datos PostgreSQL) o mediante el `Dockerfile` multi-etapa.
* **Cloudflare:** Configuración optimizada con `wrangler.toml`, reglas de caché estática inmutable en `public/_headers` y enrutamiento en `public/_routes.json`.

👉 Consulta la **[Guía Completa de Despliegue](GUIA_DESPLIEGUE.md)** para ver el paso a paso detallado.

---

## 👤 Credenciales Demo para Pruebas

* **Email:** `jazmin@sewstudio.com`
* **Contraseña:** *(Cualquier contraseña es válida en desarrollo local)*

---

## 📁 Estructura del Proyecto

```text
programa jazmin/
├── prisma/
│   ├── schema.prisma       # Esquema ORM (User, Project, Material, Pattern, Label, AiRequest)
│   └── seed.js             # Script de siembra de datos de prueba
├── public/                 # Archivos estáticos y subidas de usuario
├── src/
│   ├── app/
│   │   ├── actions/        # Server Actions (Proyectos, Inventario, Patrones, Etiquetas)
│   │   ├── api/            # API Routes (NextAuth, Chat IA)
│   │   ├── dashboard/      # Rutas del panel principal (Proyectos, Patrones, Inventario, Etiquetas)
│   │   ├── portfolio/      # Vista pública de catálogo para clientes
│   │   └── login/          # Página de inicio de sesión
│   ├── components/
│   │   ├── pattern-editor/ # Componentes de lienzo y herramientas del Editor de Moldes
│   │   ├── catalogo/       # Tarjetas y componentes del catálogo público
│   │   └── ui/             # Componentes de diseño shadcn/ui
│   ├── lib/                # Instancia de Prisma Client y utilidades
│   └── store/              # Zustand Store para el estado del Editor Vectorial
├── package.json
└── README.md
```

---

## 📜 Licencia

Desarrollado para la gestión integral de patronaje y diseño de moda.
