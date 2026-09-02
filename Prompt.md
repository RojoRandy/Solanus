# Prompt para Claude Code — Comedor Solanus

> Copia y pega este documento completo como prompt inicial en Claude Code, dentro de la carpeta vacía (o con el boilerplate ya clonado) donde vayas a construir el proyecto.

---

## 0. Setup de skills y plugins (ejecutar ANTES de empezar a programar)

Instala estos skills en Claude Code. Están verificados y seleccionados específicamente porque esta app es un **sistema interno de gestión (CRUD + dashboards + reportes)**, no un sitio de marketing — eso descarta algunos skills orientados a landing pages.

```bash
# 1. Frontend design base de Anthropic (imprescindible, cubre dashboards y apps de producto)
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills

# 2. Generador de sistema de diseño (colores, tipografía, componentes) adaptado al giro del proyecto
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# 3. Detector "anti-slop" que revisa cada archivo de UI que se edite
npx impeccable install

# 4. Buenas prácticas de React (ignora las reglas específicas de Next.js — no usaremos Next.js)
npx add-skill vercel-labs/agent-skills

# 5. Pulido de micro-interacciones y animación (usar en la fase final, no desde el día 1)
npx skills@latest add emilkowalski/skills

# 6. Metodología de trabajo: TDD, debugging sistemático y planeación por fases
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# 7. Testing E2E
/plugin marketplace add anthropics/skills
/plugin install webapp-testing@anthropic-agent-skills
```

**No instalar** `leonxlnx/taste-skill` ni `ConardLi/garden-skills`: ambos están diseñados para landing pages/portfolios/artículos de una sola página y su propia documentación indica explícitamente que no están pensados para dashboards, tablas de datos ni UI de producto multi-paso, que es justo lo que necesitamos aquí.

**Flujo de trabajo esperado:** antes de escribir código, usa `/superpowers:brainstorm` para afinar decisiones ambiguas de este documento (marcadas como "🟡 Pendiente de definir" más abajo) y `/superpowers:write-plan` para generar un plan por fases. Ejecuta el plan por fases (no todo el proyecto de un solo tirón), corriendo tests después de cada fase, y usa subagentes en paralelo solo donde la sección 3.1 lo indique — ahí está definido qué se puede paralelizar sin solaparse y qué debe quedarse secuencial.

---

## 1. Contexto y misión

Vamos a construir **Comedor Solanus**, una aplicación de gestión interna para un comedor comunitario altruista administrado por una orden franciscana capuchina, en honor al Beato Solanus Casey.

Esto **no es un producto SaaS ni un sitio público de marketing** — es una herramienta de trabajo diario para administradores y voluntarios que reciben, registran y dan seguimiento a comensales, inventario y voluntarios. El tono visual debe sentirse **profesional, cálido, confiable y accesible** (muchos usuarios pueden no ser expertos en tecnología), evitando por igual la estética "genérica de IA" (gradientes morado-rosa, cards infinitas, iconos emoji) y la estética fría de dashboard corporativo. Piensa en algo con la calidez de una organización sin fines de lucro seria, pero con la solidez de una herramienta operativa real.

**Alcance de esta fase**: esta primera versión **no incluye el módulo de Estudio Socioeconómico ni el módulo de Despensas** — ambos quedan planeados para un desarrollo futuro. La especificación completa de ambos se conserva en la sección 11 para no perder el detalle, pero **no los implementes en este ciclo de trabajo**.

---

## 2. Stack técnico

**Backend**
- NestJS + Prisma ORM + PostgreSQL
- Autenticación propia (sin Clerk ni Auth0): username + password, JWT, Passport Strategies y Guards por rol
- Base de arranque: `https://github.com/RojoRandy/nestjs-mikro-boilerplate` — clónalo y **sustituye MikroORM por Prisma** (mantén la estructura de módulos/carpetas del boilerplate, pero regenera la capa de persistencia)
- Roles: `administrador`, `usuario`, `usuario_simple` (define permisos granulares por módulo antes de construir los guards)

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS como base de estilos
- shadcn/ui para componentes complejos (tablas, formularios, modales, comboboxes)
- Headless UI donde shadcn/ui no cubra un patrón específico (p. ej. combinaciones de listboxes/transiciones muy custom)
- React Hook Form + Zod para formularios y validación (recomendado dado el volumen de formularios del sistema)

**Infraestructura de archivos**
- Fotografías de comensales/voluntarios, escaneos de INE, PDFs de expedientes
- 🟡 *Pendiente de definir con Rojo*: almacenamiento en disco local (MVP simple) vs. bucket S3-compatible (MinIO) desde el inicio. Sugerencia: empezar con almacenamiento local estructurado por entidad (`/uploads/comensales/{folio}/...`) con una capa de abstracción que permita migrar a S3 sin reescribir lógica de negocio.

**Generación de PDF**
- Necesario para: expediente del comensal (con carta de uso de imagen) y reportes mensuales
- Sugerencia: Puppeteer (renderiza plantillas HTML/CSS a PDF, permite reutilizar los mismos componentes de diseño del frontend) o PDFKit si se prefiere generación programática sin HTML

**Testing**
- Playwright para flujos críticos end-to-end (ver sección 8)

---

## 3. Arquitectura del repositorio

Monorepo sugerido:

```
comedor-solanus/
├── apps/
│   ├── api/          # NestJS + Prisma
│   └── web/           # React + Vite + Tailwind + shadcn/ui
├── packages/
│   └── shared/         # tipos/DTOs compartidos entre api y web (opcional pero recomendado)
├── docs/
└── README.md
```

Si Rojo prefiere dos repos separados, ajusta la estructura pero mantén el mismo criterio de módulos.

### 3.1 Estrategia de subagentes y trabajo en paralelo

Usa subagentes de Claude Code para paralelizar el desarrollo **donde el trabajo esté genuinamente desacoplado**, y evita paralelizar donde dos agentes puedan tocar el mismo archivo al mismo tiempo — esa es la causa #1 de solapamiento y conflictos de merge.

**Regla general**: un archivo o carpeta de módulo = un solo dueño en un momento dado. Antes de lanzar subagentes en paralelo, apóyate en el skill `superpowers` (soporta git worktrees) para darle a cada subagente su propia rama/worktree aislado, y define por escrito qué carpetas puede tocar cada uno antes de arrancar.

**Punto de sincronización obligatorio — NO paralelizar esto**: el `schema.prisma`, los DTOs/tipos compartidos en `packages/shared` y la configuración base de auth/Guards deben quedar definidos por **un solo agente** antes de repartir el trabajo. Si dos subagentes editan el mismo `schema.prisma` en paralelo vas a terminar con migraciones en conflicto.

**Dónde SÍ paralelizar (una vez cerrado el punto anterior):**

| Track | Módulo | Puede correr en paralelo con |
|---|---|---|
| A | Comensales (backend + frontend) | Track B, Track C |
| B | Inventario + catálogo + bienhechores (backend + frontend) | Track A, Track C |
| C | Voluntarios (backend + frontend) | Track A, Track B |

Estos tres módulos no comparten tablas ni endpoints entre sí, así que son candidatos naturales a tres subagentes trabajando en paralelo, cada uno en su propio worktree y dueño exclusivo de su carpeta de módulo NestJS y su carpeta de feature en el frontend.

**Dónde NO paralelizar (dependencias reales):**

- **Asistencia** depende de que Comensales e Inventario ya estén integrados (necesita `Comensal` e `InventarioItem`/`MovimientoInventario` ya mergeados). Constrúyela con un solo agente **después** de integrar los Tracks A y B, no en paralelo con ellos.
- **Dashboard y Reportes** dependen de casi todos los módulos anteriores. Constrúyelos al final. Si quieres paralelizar dentro de esta fase, puedes dividir por reporte individual (Asistencia / Inventario / Donativos), ya que son consultas de solo lectura sobre tablas que ya existen y no se pisan entre sí.
- El **schema de base de datos** y los **Guards/roles** son responsabilidad de un solo agente durante todo el proyecto; nunca los repartas entre subagentes.

**Dentro de un mismo módulo**: backend y frontend sí se pueden paralelizar entre sí una vez que el contrato de API (DTOs de entrada/salida) esté congelado por escrito — un subagente construye el endpoint contra ese contrato, el otro construye la UI contra un mock que respeta el mismo contrato, y se integran al cerrar el track.

**Después de cada track paralelo**: corre un paso de integración explícito (un solo agente hace merge de los worktrees, resuelve cualquier conflicto de schema/migraciones y corre la suite de tests completa) antes de avanzar a la siguiente fase. No avances a Asistencia, ni a Dashboard/Reportes, con integraciones pendientes.

---

## 4. Especificación funcional por módulo

### 4.1 Comensales

- **Registro de comensal** (expediente propio por persona):
  - Folio (autogenerado, único)
  - Nombres, Apellidos
  - Fecha de nacimiento
  - INE (escaneo/foto del documento)
  - Fotografía del comensal
- **Lista de comensales** con búsqueda y filtros
- **Asistencias al comedor** visibles dentro del expediente, una vez registrado
- 🟡 *Pendiente de definir*: los **menores de edad** deben tener su propio registro pero **asignado a un tutor**. Antes de programar este módulo, define con Rojo: ¿el menor tiene folio propio o hereda el del tutor? ¿Qué campos aplica a un menor (INE no aplica, ¿CURP?) ¿Puede un menor tener más de un tutor?
- **Carta de uso de imagen**: parte del expediente; en menores de edad, el tutor es quien firma/autoriza el uso de imagen del menor
- **PDF del expediente**: incluye todos los datos del comensal y, si es tutor, de los menores a su cargo, con espacio de firma para autorización de uso de imagen e información para uso interno del comedor

> 🔵 **Diferido**: el módulo de **Estudio Socioeconómico** (captura por familia, versión imprimible, indicador de pendientes en el listado) no se construye en esta fase. Ver especificación completa en la sección 11.

### 4.2 Asistencia de comensales

- Registro de horarios de comida diarios: **Desayuno, Comida (Almuerzo), Cena**
- Debe permitir **más de una asistencia por día** (un comensal puede desayunar y cenar el mismo día, por ejemplo)
- **Captura ágil de asistencia**: dado el volumen esperado de personas, propone una UI optimizada para captura rápida (búsqueda por folio/nombre con autocompletado, escaneo de código si el folio se imprime como código de barras/QR, o una vista de "lista de hoy" con toggle rápido). 🟡 *Nota de producto para Rojo*: el reconocimiento facial queda fuera del alcance de este MVP, pero la arquitectura de datos de asistencia debe diseñarse de forma que integrar ese dispositivo en el futuro no implique rediseñar el modelo (piensa en un evento de asistencia con `metodo_captura: manual | facial | qr` desde ahora).
- **Asignación de voluntarios por horario** (qué voluntario cubre qué turno de comida)
- **Registro de insumos usados** por horario de comida: producto, cantidad, unidad de medida — y esto debe **descontar automáticamente** del inventario

### 4.3 Inventario

- Catálogo general: no solo alimentos, también utensilios (cubiertos, platos, vasos, etc.)
- **Entrada de artículo/insumo** con estos campos:
  - Nombre del producto, Marca
  - Cantidad, Unidad de medida
  - Fecha de caducidad, Fecha de ingreso
  - Costo unitario, Costo total
  - Origen: Comprado o Donado (si es donado, capturar quién donó → referencia a Lista de bienhechores)
  - Número de factura, CFDI
- **Lista de bienhechores (donadores)**
- Los movimientos de inventario (entradas y salidas) deben actualizarse automáticamente al registrar comidas servidas (sección 4.2)
- Diseña el modelo de inventario con un histórico de movimientos (`MovimientoInventario`), no solo un stock actual, para poder auditar y generar reportes. Modela el motivo del movimiento como un catálogo abierto (compra, donación, consumo en comida, merma, etc.) para poder **agregar "despensa" como motivo en la fase futura sin rediseñar el modelo**.

### 4.4 Voluntarios

- **Registro de voluntario**: nombre completo, foto, teléfono de contacto (validar formato — solo dígitos telefónicos, con longitud apropiada para México)
- **Lista de voluntarios**

### 4.5 Despensas — 🔵 Diferido a fase futura

Este módulo **no se construye en esta fase**. Ver especificación completa en la sección 11.

### 4.6 Dashboard

- Total de comensales registrados
- Lista de alimentos próximos a vencer (define un umbral configurable, p. ej. 7/15 días)
- Lista de alimentos con stock bajo (define un umbral mínimo por producto, configurable en el catálogo de inventario)
- Indicadores adicionales sugeridos (para validar con Rojo):
  - Asistencias del día/semana en curso, comparadas con el promedio
  - Comidas servidas hoy vs. capacidad/meta
  - Donativos recibidos en el mes (en especie y, si aplica, monetarios)

### 4.7 Reportes

- Asistencia general y por horario (desayuno/comida/cena)
- Inventario (existencias, movimientos, mermas/caducados)
- Donativos
- Reporte mensual general — 🟡 *este reporte está marcado como "por definir" en el brief original*: antes de construirlo, pregúntale a Rojo qué secciones exactas debe incluir (probablemente una combinación de los reportes anteriores + KPIs del dashboard). No lo inventes sin confirmar.

### 4.8 Manejo de usuarios

- CRUD simple de usuarios del sistema (no confundir con comensales/voluntarios)
- Login por **nombre de usuario** (no correo electrónico) + contraseña
- Roles: `administrador`, `usuario`, `usuario_simple` — define explícitamente qué puede hacer cada rol en cada módulo antes de implementar los Guards (sugerido: tabla de permisos módulo × rol × acción como parte del plan inicial)

---

## 5. Modelo de datos sugerido (punto de partida para el schema de Prisma)

Entidades principales y relaciones clave a modelar (ajusta nombres/campos según lo definido en la sección 4):

- `Usuario` (sistema) — con rol
- `Comensal` — con relación opcional `tutorId` (autorreferencia, para menores de edad)
- `Asistencia` — relación N-a-1 con `Comensal`, incluye horario (`desayuno|comida|cena`), fecha, `metodoCaptura`
- `TurnoVoluntario` — asigna `Voluntario` a un horario/fecha
- `Voluntario`
- `InventarioItem` (catálogo) y `MovimientoInventario` (histórico, con tipo entrada/salida y motivo abierto: compra, donación, consumo en comida, merma — deja el catálogo de motivos extensible para poder sumar "despensa" más adelante)
- `Bienhechor` (donador)
- `CartaUsoImagen` — asociada al expediente del comensal o del tutor

No incluyas `EstudioSocioeconomico`, `Despensa` ni `DespensaItem` en esta fase — están diferidos (ver sección 11).

No conviertas esto en el schema final sin antes correr `/superpowers:brainstorm` para resolver los puntos marcados como 🟡 pendientes, ya que afectan directamente las relaciones (sobre todo el modelo de menores/tutores).

---

## 6. Requisitos de UI/UX

- Interfaz **moderna, ultra intuitiva y de alta usabilidad** — este es un requisito explícito, no solo "que se vea bien". Prioriza claridad sobre densidad en pantallas de captura (los usuarios finales incluyen voluntarios sin formación técnica).
- Responsive: la captura de asistencia y consulta rápida de expedientes debe funcionar bien en tablet/móvil, ya que probablemente se use en el punto de servicio del comedor.
- Estados vacíos, de carga y de error cuidados en cada módulo (no dejar pantallas en blanco).
- Navegación clara por roles: un `usuario_simple` no debería ni ver en el menú los módulos a los que no tiene acceso.
- Accesibilidad básica: contraste adecuado, tamaños de touch target suficientes para uso en tablet, foco visible en navegación por teclado.

---

## 7. Requisitos no funcionales

- **Validaciones**: teléfono de voluntarios solo numérico con formato válido; tipos y tamaño máximo de archivo para fotos/INE; campos obligatorios claramente indicados en formularios.
- **Auditoría básica**: sugerido (validar con Rojo) — registrar qué usuario del sistema realizó cada movimiento de inventario, entrega de despensa y registro de asistencia, con timestamp. Es una buena práctica para una organización que maneja donativos e inventario físico, aunque no estaba en el brief original.
- **Integridad de inventario**: los descuentos automáticos (comidas y despensas) deben ejecutarse dentro de transacciones de base de datos para evitar inconsistencias si algo falla a mitad del proceso.
- **Seguridad**: hashing de contraseñas (bcrypt/argon2), JWT con expiración razonable y refresh tokens, protección de endpoints por rol tanto en backend (Guards) como en frontend (rutas protegidas).

---

## 8. Testing

Usa el skill de Playwright para cubrir, como mínimo, estos flujos críticos end-to-end:

1. Login y control de acceso por rol
2. Alta de comensal completa (con carga de foto/INE) y generación de su PDF de expediente
3. Registro de asistencia con descuento correcto de inventario

Para el backend, sigue el enfoque TDD del skill `superpowers`: escribe pruebas unitarias para la lógica de negocio de descuento de inventario y cálculo de indicadores del dashboard antes de implementarla.

---

## 9. Preguntas que debes resolver con Rojo antes de construir (no asumas)

Antes de generar el plan de implementación, usa `/superpowers:brainstorm` para confirmar estos puntos, todos marcados como pendientes en el brief original:

1. Modelo de datos para menores de edad y su relación con el tutor (folio propio vs. heredado, campos aplicables).
2. Contenido exacto del "Reporte mensual general".
3. Estrategia de almacenamiento de archivos (local vs. S3/MinIO) para el MVP.
4. Umbrales configurables para "próximo a vencer" y "stock bajo" en el dashboard.
5. Tabla de permisos detallada por rol y módulo (qué puede ver/crear/editar/eliminar cada rol).
6. Si los donativos monetarios (no solo en especie) deben registrarse en este sistema o quedan fuera de alcance.

---

## 10. Entregables esperados

- Repositorio funcional con `apps/api` y `apps/web`
- Migraciones de Prisma versionadas y seed con datos de ejemplo (usuarios de cada rol, algunos comensales, inventario inicial)
- README con instrucciones claras de instalación, variables de entorno y comandos para correr backend, frontend y tests
- Suite de pruebas Playwright para los flujos de la sección 8
- Dashboard funcional con los indicadores de la sección 4.6

---

## 11. Fuera de alcance de esta fase — especificación para desarrollo futuro

Estos dos módulos **no se implementan ahora**. Se documentan aquí completos para que, cuando se retomen en un ciclo futuro, no se pierda el detalle original del brief.

### 11.1 Estudio Socioeconómico (futuro)

- Debe poder realizarse un estudio socioeconómico **por familia**, ya sea registrándose desde la plataforma o imprimiendo un PDF para llenado manual y captura posterior.
- Una vez realizado el estudio, debe poder saberse quién ya lo hizo y a quién le falta dentro del listado de comensales.
- Cuando se retome, revisar su relación con el modelo de `Comensal`/familia y con el módulo de menores/tutores, ya que probablemente se capture a nivel de núcleo familiar y no por comensal individual.

### 11.2 Despensas (futuro)

- Registro de despensa elaborada:
  - Lista de alimentos empacados: producto (referencia a inventario), cantidad, unidad de medida
  - A quién se entregó: puede ser un comensal registrado en el sistema **o una persona no registrada** (captura libre de nombre/datos mínimos)
  - Fecha de entrega
- Debe **descontar automáticamente** las cantidades correspondientes del inventario
- Al retomarlo: sumar `Despensa` y `DespensaItem` al schema, agregar "despensa" como motivo de `MovimientoInventario`, reactivar el reporte de "Despensas entregadas" y el indicador correspondiente en el Dashboard (sección 4.6/4.7 de este documento tienen el detalle original comentado).

---

**Instrucción final para Claude Code**: no implementes todos los módulos de un solo intento, y **no construyas la sección 11** — queda fuera de alcance de este ciclo. Sigue el flujo: `/superpowers:brainstorm` (resolver sección 9) → `/superpowers:write-plan` (fases sugeridas: 1. Auth + usuarios + schema base + contratos compartidos — secuencial, un solo agente; 2. Comensales, Inventario y Voluntarios — en paralelo vía subagentes según la sección 3.1; 3. Integración de los tracks anteriores + Asistencia con descuento — secuencial; 4. Dashboard + Reportes — secuencial, con paralelización opcional por reporte; 5. Pulido de UI con `emilkowalski/skills` + testing E2E) → ejecutar fase por fase, corriendo tests y mostrando avance antes de continuar a la siguiente fase.
