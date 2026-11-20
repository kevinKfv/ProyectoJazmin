# Estado del Proyecto: SewStudio

## 🟢 Lo que ya está construido (Base del MVP)

* **Base de Datos y ORM:** Esquema completo en PostgreSQL con Prisma (Usuarios, Proyectos, Materiales, Patrones, Etiquetas).
* **Autenticación:** Implementada con NextAuth.js (acceso rápido para desarrollo local).
* **Módulo 1 (Dashboard):** Maquetado con menú lateral estilo Notion, widgets de resumen y métricas iniciales.
* **Módulo 2 (Proyectos):** Creación de proyectos, lista en formato de tarjetas y vista de detalle básica. Además de un tablero Kanban real arrastrable (Idea ➡️ Diseño ➡️ Corte ➡️ Costura).
* **Módulo 3 (Inventario):** Catálogo de materiales, creación de insumos con control de stock inicial y costo. Historial visible de movimientos (entradas y salidas).
* **Módulo 4 (Costeo):** Cálculo de "Horas Invertidas × Tarifa" y suma automática del costo exacto de materiales asignados a proyectos.
* **Módulo 5 (Etiquetas):** Lienzo interactivo usando `react-konva` para exportar en PNG, con función para insertar Códigos QR y logotipos externos.
* **Módulo 6 (Patrones):** Biblioteca de tarjetas para registrar metadatos de moldes y guardar referencias de imágenes.
* **Conexión Proyecto ↔ Material:** Interfaz dentro del Proyecto para asignar materiales descontando stock automáticamente del Inventario.
* **Gestor de Archivos (Local):** Subida de archivos (PDFs de patrones, fotos) al sistema de almacenamiento local.
* **Módulo 7 (Editor de Moldes):** Editor vectorial básico completado. 🟢
* **Módulo 8 (Inteligencia Artificial):** Integración del Chat Asistente de costura con Grok API. 🟢
* **Módulo 9 (Catálogo):** Portfolio público para compartir creaciones terminadas y generar enlaces para clientes completado. 🟢
* **Ficha de Clientes & CRM Textil (Toma de Medidas):** Ficha anatómica con silueta humana interactiva (>20 medidas), historial comparativo de evolución, calendario de pruebas de calce con recordatorios por WhatsApp/Email, y presupuestos formales exportables a PDF con seguimiento de seña (50%) y saldo. 🟢
* **Módulo 2 (Patronaje Avanzado & Optimización de Tela):** Escalado automático de tallas (Grading XS-XXL) con nido multitalla en vivo, optimización de corte sobre rollo de tela (Nesting) con métricas de desperdicio/eficiencia y metros de tela a comprar, y exportación industrial en formatos DXF-AAMA, PLT (Plóter) y PDF A0 por capas. 🟢
* **Costeo Financiero & Amortización de Maquinaria:** Registro de maquinaria industrial (Overlock, Recta, Collareta, Plancha industrial), cálculo del desgaste y consumo eléctrico por hora, prorrateo de gastos fijos del taller (luz, alquiler, internet) por horas trabajadas, calculadora gráfica de margen de ganancia comercial (Mayorista vs Minorista) y control de variaciones de costo con alertas de sobrecosto. 🟢
* **Inventario Inteligente & Proveedores:** Escáner de código de barras/QR para movimientos ultrarrápidos de stock, conversor de mermas y encogimiento de tela por lavado previo con recálculo de costo por metro útil, y directorio de proveedores con calificación de 1 a 5 estrellas e historial de precios por unidad. 🟢

---

## 🟡 Lo que falta completar (Próximos Pasos)

* **Módulo 9 (Catálogo):** Portfolio público para compartir creaciones terminadas y generar enlaces para clientes.

---

## 🔴 Lo que está a futuro (Fases Posteriores al MVP)

* **Despliegue a Producción:** Migrar la base de datos local a Railway.

---
---

## Documento Original de Especificación

# SewStudio - Plataforma Integral para Costura y Patronaje

## Visión

Construir una aplicación web moderna para costureras, modistas, diseñadoras de moda y pequeños emprendimientos textiles que centralice:

* Gestión de proyectos.
* Inventario de materiales.
* Generación de etiquetas.
* Cálculo de costes.
* Gestión de patrones y moldes.
* Catálogo de creaciones.
* Asistencia mediante IA.

La aplicación debe ser intuitiva para usuarios no técnicos y tener una interfaz visual similar a Notion, Canva y Figma.

---

# Stack Tecnológico

## Frontend

* Next.js 15 (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui
* React Query
* Zustand

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Edge Functions

## IA

* OpenAI API
* Sistema preparado para múltiples proveedores de LLM

## Edición Gráfica

* Konva.js
* SVG nativo
* Exportación PDF

---

# Roles

## Usuario

Puede:

* Crear proyectos.
* Gestionar inventario.
* Crear etiquetas.
* Subir patrones.
* Editar moldes.
* Generar documentación.

## Administrador

Puede:

* Gestionar usuarios.
* Gestionar plantillas.
* Ver métricas globales.

---

# Módulo 1: Dashboard

Pantalla inicial con:

### Resumen

* Proyectos activos
* Proyectos completados
* Materiales bajos de stock
* Coste acumulado mensual
* Horas invertidas
* Últimos proyectos

### Widgets

* Inventario crítico
* Próximos trabajos
* Estadísticas

---

# Módulo 2: Gestión de Proyectos

Entidad Project

Campos:

* id
* name
* description
* status
* category
* start_date
* due_date
* notes
* images
* estimated_hours
* actual_hours
* total_cost
* created_at
* updated_at

Estados:

* Idea
* Diseño
* Corte
* Costura
* Ajustes
* Finalizado

Funciones:

* Crear
* Editar
* Duplicar
* Archivar
* Buscar
* Filtrar

Cada proyecto puede tener:

* Materiales asociados
* Patrones asociados
* Fotografías
* Costes
* Tareas

---

# Módulo 3: Inventario

Entidad Material

Campos:

* id
* name
* category
* quantity
* unit
* cost_per_unit
* supplier
* location
* reorder_level
* image

Categorías:

* Tela
* Hilo
* Cremallera
* Botón
* Elástico
* Entretela
* Agujas
* Otros

Características:

* Entradas
* Salidas
* Historial
* Ajustes manuales

Cuando un material es usado en un proyecto:

* Reducir stock automáticamente.

Alertas:

* Bajo stock.
* Sin stock.

---

# Módulo 4: Costeo

Para cada proyecto:

Registrar:

* Materiales utilizados.
* Horas de trabajo.
* Costes adicionales.

Fórmula:

Costo Total =
Materiales +
Horas * Tarifa +
Gastos Extra

Mostrar:

* Coste real.
* Precio recomendado.
* Margen de beneficio.

---

# Módulo 5: Etiquetas

Generador visual.

Tipos:

* Etiqueta de marca.
* Etiqueta de lavado.
* Etiqueta de producto.
* Etiqueta QR.

Funciones:

* Arrastrar elementos.
* Añadir logotipo.
* Generar QR.
* Exportar PDF.
* Exportar PNG.

Plantillas prediseñadas.

---

# Módulo 6: Biblioteca de Patrones

Entidad Pattern

Campos:

* id
* name
* category
* description
* tags
* image
* files

Permitir:

* PDF
* SVG
* DXF
* PNG

Funciones:

* Versionado.
* Historial.
* Comentarios.
* Duplicado.

---

# Módulo 7: Editor de Moldes

Objetivo:

Crear un editor vectorial estilo Figma simplificado.

Funciones:

* Crear piezas.
* Editar puntos.
* Curvas Bézier.
* Líneas.
* Márgenes de costura.
* Escalado.
* Rotación.
* Medidas automáticas.

Herramientas:

* Selección
* Nodo
* Línea
* Curva
* Texto
* Regla

Capas:

* Activar
* Desactivar
* Bloquear

Exportaciones:

* SVG
* PDF
* PNG
* DXF

---

# Módulo 8: IA

## Asistente de Costura

Chat contextual.

Puede responder:

* Técnicas de costura.
* Selección de materiales.
* Estimación de costes.
* Problemas comunes.

---

## Análisis de Imagen

Usuario sube una foto.

La IA:

* Detecta tipo de prenda.
* Estima complejidad.
* Sugiere materiales.
* Sugiere pasos de confección.

---

## Generación de Patrones (Fase futura)

Entrada:

* Tipo de prenda.
* Medidas corporales.

Salida:

* Patrón SVG editable.

Arquitectura preparada para integración futura.

---

# Módulo 9: Catálogo

Mostrar creaciones terminadas.

Campos:

* Nombre
* Fotografías
* Descripción
* Precio
* Fecha

Opciones:

* Compartir enlace público.
* Generar portfolio.

---

# Base de Datos

Diseñar usando PostgreSQL.

Tablas:

* users
* profiles
* projects
* materials
* inventory_movements
* project_materials
* labels
* patterns
* pattern_versions
* tasks
* project_images
* ai_requests

Incluir:

* índices
* relaciones
* cascadas
* auditoría

---

# Diseño UI

Inspiración:

* Notion
* Canva
* Figma
* Linear

Principios:

* Minimalista
* Muy visual
* Mobile responsive
* Accesible

Tema:

* Modo claro
* Modo oscuro

---

# Requisitos de Código

* Arquitectura limpia.
* Componentes reutilizables.
* Tipado estricto.
* Testing básico.
* ESLint.
* Prettier.
* Documentación.
* Seeds para desarrollo.
* Docker para entorno local.

---

# MVP Prioritario

Fase 1:

1. Autenticación.
2. Dashboard.
3. Proyectos.
4. Inventario.
5. Costeo.
6. Etiquetas.
7. Biblioteca de patrones.

No desarrollar aún:

* IA avanzada.
* Generación automática de moldes.
* Marketplace.

Objetivo:

Entregar un MVP funcional y desplegable en menos de 4 semanas de desarrollo.
