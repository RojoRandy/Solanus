# Graph Report - Solanus  (2026-09-02)

## Corpus Check
- 263 files · ~75,157 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1873 nodes · 4691 edges · 140 communities (87 shown, 53 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 98 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Voluntarios — Errores y DTOs
- Asistencia — Controller y Turnos
- Asistencia — Hooks de API Web
- Bienhechores — Controller CRUD
- Inventario — Hooks de API Web
- Casos de Uso — Constructores (Asistencia/Inventario)
- UI — EmptyState y AlertDialog
- UI — Button, Calendar, Card, Input
- Dashboard — DTOs y Usecase
- UI — Avatar, Card, Command (variantes)
- Comensales — Controller y Upload
- Inventario — Catálogos DTO y Controller
- Usuarios — DTO y Usecases
- UI — Separator y Sheet
- Inventario — Item DTO
- Auth — Controller y Service
- Comensales — Errores y Storage Local
- apps/web — devDependencies
- Reportes — API Web y UI Tabs
- Comensales — Controller (uploads/expediente)
- Módulos NestJS — Registro en AppModule
- Common — Response DTO y Filtros de Error
- Web — App Shell y Páginas
- apps/web — tsconfig.app compilerOptions
- CLAUDE.md — Documentación del proyecto
- apps/web — dependencies
- Dashboard/Voluntarios — Types y API Web
- Reportes — DTOs
- Comensales — DTO crear/actualizar
- UI — Combobox
- apps/web — components.json (shadcn)
- Auth — Decorators y Guards
- Inventario — Entrada DTO (lotes)
- apps/api — tsconfig compilerOptions
- apps/web — tsconfig.node compilerOptions
- Misceláneo
- Inventario Controller Inventariocontroller
- Components Ui
- Claude Modulos
- Comensales Utils
- Package Dependencies
- Package Scripts
- Features Comensales
- Package
- Inventario Movimiento
- Components Ui Dropdown Menu
- Apiresponseproperty
- Prompt Entidad
- Misceláneo
- Packages Shared
- Comensales Generar Pdf
- Dashboard Controller
- Usuarios Controller
- Components Theme Provider
- Features Bienhechores
- Package
- Misceláneo
- Reportes Reporte
- Readme
- E2e Asistencia
- Features Comensales
- Claude Seed
- Features Comensales Comensaldetalleview
- Prompt Emilkowalski Skills
- Comensales
- Components Ui Input Group
- Packages Shared Package
- Package
- Asistencia
- Inventario Salida
- Tsconfig Build
- Misceláneo
- Components Ui Popover
- Nest Cli
- Auth Controller
- Misceláneo
- Tsconfig
- Claude
- Prisma Seed
- Auth Strategies Jwt Strategy
- Index
- Features
- Claude
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package
- Package Devdependencies
- Package Devdependencies
- Package
- Package
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package Devdependencies
- Package
- Package Devdependencies
- Package Devdependencies
- Package
- Package
- E2e Fixtures Foto Prueba
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Package Dependencies
- Public Logo Abp
- Public Logo Comedor
- Logotipo Principal
- Logotipo Secundario

## God Nodes (most connected - your core abstractions)
1. `cn()` - 161 edges
2. `PrismaService` - 114 edges
3. `UseCase` - 105 edges
4. `ApiOkSchemaResponse()` - 41 edges
5. `IdParamDto` - 36 edges
6. `Auth()` - 33 edges
7. `Button()` - 30 edges
8. `@prisma/client` - 29 edges
9. `Card()` - 23 edges
10. `useAuth()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `E2E: login-roles, comensal-expediente, asistencia-descuento` --shares_data_with--> `Testing E2E — flujos críticos (sección 8)`  [INFERRED]
  apps/web/CLAUDE.md → Prompt.md
- `Puertos no estándar a propósito (5442/3210/5173/5183)` --shares_data_with--> `servicio postgres (comedor-solanus-db, 5442:5432)`  [INFERRED]
  CLAUDE.md → docker-compose.yml
- `Seed — usuarios admin/operativo/captura (Solanus2026!)` --shares_data_with--> `Roles del sistema: administrador, usuario, usuario_simple`  [INFERRED]
  README.md → Prompt.md
- `schema.prisma — un solo dueño a la vez` --references--> `Estrategia de subagentes y trabajo en paralelo (3.1)`  [EXTRACTED]
  apps/api/README.md → Prompt.md
- `Módulos existentes: auth, usuarios, comensales, asistencia, inventario, bienhechores, voluntarios, dashboard, reportes` --shares_data_with--> `Módulo Voluntarios (4.4)`  [INFERRED]
  apps/api/CLAUDE.md → Prompt.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de descuento automático de inventario al registrar asistencia** — prompt_asistencia_comensales_modulo, prompt_inventario_modulo, prompt_entidad_movimientoinventario, apps_web_claude_e2e_tests [INFERRED 0.85]
- **Tracks A/B/C paralelizables bajo la estrategia de subagentes** — prompt_track_a_comensales, prompt_track_b_inventario_bienhechores, prompt_track_c_voluntarios, prompt_estrategia_subagentes [EXTRACTED 1.00]
- **packages/shared como fuente de verdad de roles/permisos, consumida por api y web** — packages_shared_claude_roles, apps_api_claude_auth_guard, apps_web_readme_navegacion_rol [INFERRED 0.85]

## Communities (140 total, 53 thin omitted)

### Community 0 - "Voluntarios — Errores y DTOs"
Cohesion: 0.06
Nodes (47): Exceptions, Responses, VoluntarioErrors, telefonoMxRegex, ActualizarVoluntarioDto, CrearVoluntarioDto, ListarVoluntariosQueryDto, ApiProperty (+39 more)

### Community 1 - "Asistencia — Controller y Turnos"
Cohesion: 0.06
Nodes (51): AsistenciaErrors, Exceptions, Responses, UseCase, ROLES_CAPTURA, ROLES_DESHACER, Get, Inject (+43 more)

### Community 2 - "Asistencia — Hooks de API Web"
Cohesion: 0.07
Nodes (47): Avatar(), AvatarFallback(), AvatarImage(), Textarea(), buildQuery(), QK, useActualizarTurno(), useAsignarVoluntario() (+39 more)

### Community 3 - "Bienhechores — Controller CRUD"
Cohesion: 0.08
Nodes (31): BienhechoresController, ApiTags, Body, Controller, Delete, Get, Inject, Param (+23 more)

### Community 4 - "Inventario — Hooks de API Web"
Cohesion: 0.08
Nodes (41): SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), buildQuery(), QK, useActualizarInventarioItem(), useCategorias() (+33 more)

### Community 5 - "Casos de Uso — Constructores (Asistencia/Inventario)"
Cohesion: 0.08
Nodes (18): Exceptions, InventarioErrors, Responses, RegistrarInsumoTurnoArgs, EliminarInventarioItemUseCase, Injectable, LOTE_SELECT, LoteConRelaciones (+10 more)

### Community 6 - "UI — EmptyState y AlertDialog"
Cohesion: 0.18
Nodes (24): EmptyState(), EmptyStateProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter() (+16 more)

### Community 7 - "UI — Button, Calendar, Card, Input"
Cohesion: 0.14
Nodes (26): Button(), buttonVariants, Calendar(), Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+18 more)

### Community 8 - "Dashboard — DTOs y Usecase"
Cohesion: 0.09
Nodes (24): now(), AsistenciaResumenDto, DonativosResumenDto, ResumenDashboardResponseDto, ApiProperty, ObtenerResumenDashboardUseCase, Injectable, ProximoAVencerResponseDto (+16 more)

### Community 9 - "UI — Avatar, Card, Command (variantes)"
Cohesion: 0.09
Nodes (32): AlertDialogMedia(), AlertDialogOverlay(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), CalendarDayButton(), CardAction(), CardFooter() (+24 more)

### Community 10 - "Comensales — Controller y Upload"
Cohesion: 0.09
Nodes (24): ALLOWED_MIME_TYPES, ImageUploadInterceptor(), ROLES_ESCRITURA, ROLES_LECTURA, Inject, ActualizarComensalUseCase, Injectable, CrearComensalUseCase (+16 more)

### Community 11 - "Inventario — Catálogos DTO y Controller"
Cohesion: 0.10
Nodes (19): CategoriaInventarioResponseDto, MotivoMovimientoResponseDto, ApiProperty, UbicacionResponseDto, UnidadMedidaResponseDto, Inject, ActualizarInventarioItemUseCase, Injectable (+11 more)

### Community 12 - "Usuarios — DTO y Usecases"
Cohesion: 0.11
Nodes (20): ActualizarUsuarioDto, CrearUsuarioDto, ApiProperty, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString (+12 more)

### Community 13 - "UI — Separator y Sheet"
Cohesion: 0.08
Nodes (25): Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+17 more)

### Community 14 - "Inventario — Item DTO"
Cohesion: 0.16
Nodes (21): ActualizarInventarioItemDto, CategoriaRefDto, CrearInventarioItemDto, InventarioItemResponseDto, ListarInventarioItemsQueryDto, ApiProperty, IsBoolean, IsInt (+13 more)

### Community 15 - "Auth — Controller y Service"
Cohesion: 0.15
Nodes (16): AuthErrors, Exceptions, Responses, Get, AuthService, Injectable, AuthUser, AuthenticatedUser (+8 more)

### Community 16 - "Comensales — Errores y Storage Local"
Cohesion: 0.11
Nodes (15): ComensalErrors, Exceptions, Responses, LocalStorageService, Injectable, IStorageService, STORAGE_SERVICE, ExpedienteComensalPdf (+7 more)

### Community 17 - "apps/web — devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test, prettier (+23 more)

### Community 18 - "Reportes — API Web y UI Tabs"
Cohesion: 0.11
Nodes (26): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), buildQuery(), useReporteAsistencia(), useReporteDonativos() (+18 more)

### Community 19 - "Comensales — Controller (uploads/expediente)"
Cohesion: 0.14
Nodes (17): ApiOkSchemaResponse(), ComensalesController, ApiConsumes, ApiTags, Body, Controller, Delete, Get (+9 more)

### Community 20 - "Módulos NestJS — Registro en AppModule"
Cohesion: 0.09
Nodes (24): StorageModule, Global, Module, AsistenciaModule, Module, AuthModule, Module, BienhechoresModule (+16 more)

### Community 21 - "Common — Response DTO y Filtros de Error"
Cohesion: 0.11
Nodes (15): AppModule, Module, ErrorResponseDto, SchemaResponse, ApiProperty, CommonErrors, Exceptions, Responses (+7 more)

### Community 22 - "Web — App Shell y Páginas"
Cohesion: 0.14
Nodes (19): AppLayout(), LoginPage(), ComensalesPage(), useResumenDashboard(), DashboardPage(), diasRestantes(), formatFecha(), formatMoneda() (+11 more)

### Community 23 - "apps/web — tsconfig.app compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+18 more)

### Community 24 - "CLAUDE.md — Documentación del proyecto"
Cohesion: 0.12
Nodes (25): apps/api (CLAUDE.md), Variables de entorno API (.env.example), Errores catalogados en common/errors/<x>.errors.ts, Patrón de módulo: un caso de uso por archivo, prisma/schema.prisma — punto de sincronización, Tests: jest unitarios + e2e (requiere Postgres), UseCase<T,U> (use-case.interface.ts), apps/web (CLAUDE.md) (+17 more)

### Community 25 - "apps/web — dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, @comedor-solanus/shared, date-fns, @fontsource-variable/inter, react-day-picker (+17 more)

### Community 26 - "Dashboard/Voluntarios — Types y API Web"
Cohesion: 0.11
Nodes (18): ProximoAVencer, ResumenDashboard, StockBajoItem, ActualizarVoluntarioInput, API_ORIGIN, CrearVoluntarioInput, ErrorResponseBody, ListarVoluntariosParams (+10 more)

### Community 27 - "Reportes — DTOs"
Cohesion: 0.16
Nodes (16): AsistenciaPorDiaDto, DonativosPorBienhechorDto, ExistenciaReporteDto, MovimientoResumenDto, RangoFechaQueryDto, ReporteAsistenciaResponseDto, ReporteDonativosResponseDto, ReporteInventarioResponseDto (+8 more)

### Community 28 - "Comensales — DTO crear/actualizar"
Cohesion: 0.15
Nodes (19): Query, ActualizarComensalDto, CartaUsoImagenResponseDto, ComensalTutorResumenDto, CrearComensalDto, FirmarCartaUsoImagenDto, ListarComensalesQueryDto, ApiProperty (+11 more)

### Community 29 - "UI — Combobox"
Cohesion: 0.13
Nodes (17): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+9 more)

### Community 30 - "apps/web — components.json (shadcn)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 31 - "Auth — Decorators y Guards"
Cohesion: 0.16
Nodes (8): Auth(), META_ROLES, RoleProtected(), ControladorConMetodoProtegido, ControladorProtegidoPorClase, SinRolesController, Injectable, UserRoleGuard

### Community 32 - "Inventario — Entrada DTO (lotes)"
Cohesion: 0.11
Nodes (18): LoteBienhechorRefDto, LoteItemRefDto, LoteResponseDto, RegistrarEntradaDto, ApiProperty, IsDateString, IsEnum, IsInt (+10 more)

### Community 33 - "apps/api — tsconfig compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 34 - "apps/web — tsconfig.node compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 35 - "Misceláneo"
Cohesion: 0.21
Nodes (13): EmisorParamDto, EmisorRelationParamDto, IdParamDto, ApiProperty, AsistenciaController, ApiTags, Body, Controller (+5 more)

### Community 36 - "Inventario Controller Inventariocontroller"
Cohesion: 0.21
Nodes (8): ApiOkSchemaArrayResponse(), InventarioController, ApiTags, Controller, Delete, Get, Param, Query

### Community 37 - "Components Ui"
Cohesion: 0.12
Nodes (18): iniciales(), NAV_ITEMS, NavItem, Sidebar(), SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent() (+10 more)

### Community 38 - "Claude Modulos"
Cohesion: 0.22
Nodes (19): Módulos existentes: auth, usuarios, comensales, asistencia, inventario, bienhechores, voluntarios, dashboard, reportes, Arquitectura del repositorio (sección 3), Módulo Asistencia de comensales (4.2), Prompt Comedor Solanus — brief funcional, Módulo Comensales (4.1), Módulo Dashboard (4.6), Entregables esperados (sección 10), Estrategia de subagentes y trabajo en paralelo (3.1) (+11 more)

### Community 39 - "Comensales Utils"
Cohesion: 0.29
Nodes (10): ComensalResponseDto, ComensalDetalle, ComensalListado, comensalListSelect, mapComensalResponse(), tutorResumenSelect, calcularEdad(), esMayorDeEdad() (+2 more)

### Community 40 - "Package Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-transformer, class-validator, @nestjs/jwt, @nestjs/platform-express, @nestjs/serve-static, passport-jwt, puppeteer (+9 more)

### Community 41 - "Package Scripts"
Cohesion: 0.12
Nodes (17): scripts, build, dev, format, lint, prisma:deploy, prisma:generate, prisma:migrate (+9 more)

### Community 42 - "Features Comensales"
Cohesion: 0.19
Nodes (15): construirQueryString(), queryKeys, SERVER_ROOT_URL, subirArchivo(), useSubirArchivoComensal(), useSubirFotoComensal(), useSubirIneFrenteComensal(), useSubirIneReversoComensal() (+7 more)

### Community 43 - "Package"
Cohesion: 0.12
Nodes (16): description, engines, node, name, packageManager, private, scripts, build (+8 more)

### Community 44 - "Inventario Movimiento"
Cohesion: 0.17
Nodes (13): ListarMovimientosQueryDto, MovimientoItemRefDto, MovimientoMotivoRefDto, MovimientoResponseDto, MovimientoUsuarioRefDto, ApiProperty, IsDateString, IsEnum (+5 more)

### Community 45 - "Components Ui Dropdown Menu"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 46 - "Apiresponseproperty"
Cohesion: 0.21
Nodes (11): ApiResponseProperty, ApiBadRequestResponseError(), ApiForbiddenResponseError(), ApiInternalServerErrorResponseError(), ApiMultiResponseErrorDecorator(), ApiNotFoundResponseError(), ApiNotImplementedResponseError(), ApiUnauthorizedResponseError() (+3 more)

### Community 47 - "Prompt Entidad"
Cohesion: 0.19
Nodes (15): Estudio Socioeconómico y Despensas — diferido, no implementar, Despensas (futuro, sección 11.2), Módulo Despensas — diferido (4.5), Entidad Asistencia, Entidad Bienhechor (donador), Entidad CartaUsoImagen, Entidad Comensal, Entidad InventarioItem (+7 more)

### Community 48 - "Misceláneo"
Cohesion: 0.14
Nodes (14): @Auth(...roles) requiere importar AuthModule, Commit c1323ba — fix interceptor no envuelve binarios, SchemaResponse vía response.interceptor.ts (binarios excluidos), Comandos propios: prisma:migrate, prisma:studio, prisma:seed, apps/api — Convenciones (README), schema.prisma — un solo dueño a la vez, Protección de rutas: @Auth combina JWT + UserRoleGuard, Respuesta uniforme { data, success, message } (+6 more)

### Community 49 - "Packages Shared"
Cohesion: 0.21
Nodes (10): AuthProvider(), setToken(), AuthContext, AuthContextValue, AuthenticatedUser, SignInRequest, SignInResponse, MODULOS_POR_ROL (+2 more)

### Community 50 - "Comensales Generar Pdf"
Cohesion: 0.21
Nodes (5): PdfService, Injectable, GenerarPdfExpedienteUseCase, Inject, Injectable

### Community 51 - "Dashboard Controller"
Cohesion: 0.15
Nodes (11): DashboardController, ApiTags, Controller, Get, Inject, Query, ResumenDashboardQueryDto, IsInt (+3 more)

### Community 52 - "Usuarios Controller"
Cohesion: 0.18
Nodes (9): ApiTags, Body, Controller, Delete, Get, Param, Patch, Post (+1 more)

### Community 53 - "Components Theme Provider"
Cohesion: 0.21
Nodes (11): disableTransitionsTemporarily(), getSystemTheme(), isEditableTarget(), isTheme(), ResolvedTheme, Theme, THEME_VALUES, ThemeProvider() (+3 more)

### Community 54 - "Features Bienhechores"
Cohesion: 0.23
Nodes (10): RegistrarDonativoDialog(), limpiar(), registrar(), buildQuery(), useBienhechores(), useEliminarBienhechor(), BienhechoresListPage(), ActualizarBienhechorInput (+2 more)

### Community 55 - "Package"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, lint, preview, test:e2e (+3 more)

### Community 56 - "Misceláneo"
Cohesion: 0.18
Nodes (9): PdfModule, Global, Module, pnpm, onlyBuiltDependencies, prisma, @prisma/engines, puppeteer (+1 more)

### Community 57 - "Reportes Reporte"
Cohesion: 0.18
Nodes (7): Inject, ReporteAsistenciaUseCase, Injectable, ReporteDonativosUseCase, Injectable, ReporteInventarioUseCase, Injectable

### Community 58 - "Readme"
Cohesion: 0.22
Nodes (11): Tailwind v4 CSS-first + shadcn/ui sobre Base UI (base-nova), Contrato de API (tipos compartidos en packages/shared), apps/web — Convenciones (README), Navegación por rol (nav-config.ts + puedeAcceder()), Paleta y tokens (src/index.css) — vino/marrón sobre crema, Rutas protegidas (ProtectedRoute.tsx con prop modulo), Componentes shadcn/ui (src/components/ui/, npx shadcn add), src/auth.ts (tipos de auth) (+3 more)

### Community 59 - "E2e Asistencia"
Cohesion: 0.18
Nodes (3): __dirname, FOTO_PRUEBA, CREDENCIALES

### Community 60 - "Features Comensales"
Cohesion: 0.22
Nodes (9): useActualizarComensal(), useComensal(), useCrearComensal(), ComensalFormView(), comensalSchema, fechaISOSinHora(), calcularEdad(), esMayorDeEdad() (+1 more)

### Community 61 - "Claude Seed"
Cohesion: 0.20
Nodes (10): prisma/seed.ts (admin/operativo/captura, Solanus2026!), Comedor Solanus (README raíz), Estado del proyecto (fases), Fase 0 — Andamiaje del monorepo (completada), Fase 1 — Auth, roles, usuarios, layout (completada), Fase 2 — Comensales, Inventario, Voluntarios, Fase 3 — Turno de comida (asistencia + descuento), Fase 4 — Dashboard y reportes (+2 more)

### Community 62 - "Features Comensales Comensaldetalleview"
Cohesion: 0.29
Nodes (10): resolverUrlArchivo(), useEliminarComensal(), useFirmarCartaUsoImagen(), ComensalDetalleView(), handleDescargarPdf(), handleEliminar(), handleFirmarCarta(), manejarErrorMutacion() (+2 more)

### Community 63 - "Prompt Emilkowalski Skills"
Cohesion: 0.20
Nodes (10): emilkowalski/skills (pulido de animación), example-skills@anthropic-agent-skills, ConardLi/garden-skills (excluido explícitamente), impeccable (anti-slop UI detector), Setup de skills y plugins (sección 0), superpowers@superpowers-marketplace (TDD, planeación por fases), leonxlnx/taste-skill (excluido explícitamente), ui-ux-pro-max@ui-ux-pro-max-skill (+2 more)

### Community 64 - "Comensales"
Cohesion: 0.44
Nodes (3): extensionFromMimeType(), ComensalDetalleResponseDto, mapComensalDetalleResponse()

### Community 65 - "Components Ui Input Group"
Cohesion: 0.28
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 66 - "Packages Shared Package"
Cohesion: 0.22
Nodes (8): description, exports, main, name, private, type, types, version

### Community 67 - "Package"
Cohesion: 0.25
Nodes (7): description, license, name, prisma, seed, private, version

### Community 68 - "Asistencia"
Cohesion: 0.43
Nodes (7): AsignarVoluntarioDto, RegistrarAsistenciaDto, RegistrarInsumoTurnoDto, ApiProperty, IsEnum, IsInt, IsOptional

### Community 69 - "Inventario Salida"
Cohesion: 0.25
Nodes (7): RegistrarSalidaDto, ApiProperty, IsInt, IsNumber, IsOptional, IsPositive, IsString

### Community 70 - "Tsconfig Build"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 71 - "Misceláneo"
Cohesion: 0.29
Nodes (7): devDependencies, eslint-plugin-prettier, ts-jest, tsconfig-paths, eslint-plugin-prettier, ts-jest, tsconfig-paths

### Community 72 - "Components Ui Popover"
Cohesion: 0.29
Nodes (6): Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger()

### Community 73 - "Nest Cli"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 74 - "Auth Controller"
Cohesion: 0.40
Nodes (4): AuthController, ApiTags, Controller, Inject

### Community 75 - "Misceláneo"
Cohesion: 0.50
Nodes (3): App(), Toaster(), queryClient

### Community 76 - "Tsconfig"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 77 - "Claude"
Cohesion: 0.50
Nodes (4): DTOs con class-validator + @ApiProperty (Swagger /api/docs), src/lib/api-client.ts — único punto de red, auth-context.ts + ProtectedRoute.tsx (guard por rol), Estructura por feature (src/features/<modulo>)

### Community 80 - "Index"
Cohesion: 0.50
Nodes (3): /logo-comedor.png (favicon), /src/main.tsx (entry script), #root mount point

### Community 81 - "Features"
Cohesion: 0.50
Nodes (4): descargarExpedientePdf(), subirFoto(), getToken(), request()

### Community 83 - "Claude"
Cohesion: 0.67
Nodes (3): common/pdf/pdf.service.ts (Puppeteer, expedientes PDF), Reusar antes de crear (utils, pdf, storage), common/storage/local-storage.service.ts + image-upload.interceptor.ts

## Knowledge Gaps
- **379 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+374 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `Casos de Uso — Constructores (Asistencia/Inventario)` to `Inventario — Entrada DTO (lotes)`, `Asistencia — Controller y Turnos`, `Voluntarios — Errores y DTOs`, `Bienhechores — Controller CRUD`, `Comensales Utils`, `Dashboard — DTOs y Usecase`, `Comensales — Controller y Upload`, `Inventario — Catálogos DTO y Controller`, `Inventario Movimiento`, `Usuarios — DTO y Usecases`, `Inventario — Item DTO`, `Auth Strategies Jwt Strategy`, `Auth — Controller y Service`, `Comensales — Errores y Storage Local`, `Comensales Generar Pdf`, `Reportes Reporte`, `Comensales — DTO crear/actualizar`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `UseCase` connect `Asistencia — Controller y Turnos` to `Inventario — Entrada DTO (lotes)`, `Voluntarios — Errores y DTOs`, `Bienhechores — Controller CRUD`, `Casos de Uso — Constructores (Asistencia/Inventario)`, `Comensales Utils`, `Dashboard — DTOs y Usecase`, `Comensales — Controller y Upload`, `Inventario — Catálogos DTO y Controller`, `Inventario Movimiento`, `Usuarios — DTO y Usecases`, `Inventario — Item DTO`, `Auth — Controller y Service`, `Comensales — Errores y Storage Local`, `Comensales Generar Pdf`, `Reportes Reporte`, `Comensales — DTO crear/actualizar`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `cn()` connect `UI — Avatar, Card, Command (variantes)` to `Components Ui Input Group`, `Asistencia — Hooks de API Web`, `Inventario — Hooks de API Web`, `Components Ui`, `UI — EmptyState y AlertDialog`, `UI — Button, Calendar, Card, Input`, `Components Ui Popover`, `Components Ui Dropdown Menu`, `UI — Separator y Sheet`, `Reportes — API Web y UI Tabs`, `Features Comensales`, `UI — Combobox`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _379 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Voluntarios — Errores y DTOs` be split into smaller, more focused modules?**
  _Cohesion score 0.05927405927405927 - nodes in this community are weakly interconnected._
- **Should `Asistencia — Controller y Turnos` be split into smaller, more focused modules?**
  _Cohesion score 0.06322624743677376 - nodes in this community are weakly interconnected._
- **Should `Asistencia — Hooks de API Web` be split into smaller, more focused modules?**
  _Cohesion score 0.07377049180327869 - nodes in this community are weakly interconnected._