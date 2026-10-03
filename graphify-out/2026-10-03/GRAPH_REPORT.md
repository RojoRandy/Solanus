# Graph Report - Solanus  (2026-09-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2133 nodes · 5887 edges · 138 communities (94 shown, 44 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `983cb500`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InventarioController
- inventario.controller.ts
- voluntarios.controller.ts
- asistencia.controller.ts
- api-client.ts
- PrismaService
- ComensalDetalleView.tsx
- sidebar.tsx
- usuarios.controller.ts
- PaginationQueryDto
- comensales/api.ts
- cn
- useAuth
- comensales.controller.ts
- ComensalFormView.tsx
- reportes.controller.ts
- inventario/api.ts
- combobox.tsx
- RegistrarEntradaPage.tsx
- AsistenciaPage.tsx
- devDependencies
- crear-producto.usecase.ts
- VoluntariosListView.tsx
- subir-ine-frente-comensal.usecase.ts
- input-group.tsx
- ComensalesController
- AuthenticatedUser
- ComensalDetalleView
- compilerOptions
- devDependencies
- ApiOkSchemaResponse
- registrar-entrada.usecase.ts
- IdParamDto
- inventario/dto/reportes.dto.ts
- components.json
- bienhechores.controller.ts
- variante.dto.ts
- compilerOptions
- compilerOptions
- auth.decorator.ts
- response.dto.ts
- app.module.ts
- BienhechoresController
- date-picker.tsx
- AuthProvider.tsx
- generar-pdf-expediente.usecase.ts
- theme-provider.tsx
- dependencies
- scripts
- ApiOkSchemaArrayResponse
- firmar-carta-uso-imagen.usecase.ts
- comensal.dto.ts
- usuarios/api.ts
- package.json
- RegistrarDonativoDto
- apps/api (CLAUDE.md)
- bienhechores/api.ts
- apps/web (CLAUDE.md)
- asistencia-descuento.spec.ts
- ErrorResponseDto
- PdfService
- dependencies
- Estado del proyecto (fases)
- apps/web — Convenciones (README)
- apps/api — Convenciones (README)
- nest-cli.json
- app.e2e-spec.ts
- GenerarPdfExpedienteUseCase
- Comedor Solanus (root CLAUDE.md)
- scripts
- shared/package.json
- api/package.json
- main.ts
- RegistrarAsistenciaDto
- ActualizarBienhechorUseCase
- exclude
- permisos.ts
- scripts
- LocalStorageService
- ListarBienhechoresUseCase
- web/package.json
- alert.tsx
- web/tsconfig.json
- Estructura por feature (src/features/<modulo>)
- .obtenerTurno
- DistintoDeCeroConstraint
- tooltip.tsx
- @eslint/js
- @types/node
- typescript
- typescript-eslint
- StorageModule
- class-variance-authority
- class-transformer
- class-validator
- multer
- @nestjs/common
- @nestjs/jwt
- @nestjs/passport
- @nestjs/platform-express
- @nestjs/swagger
- passport-jwt
- puppeteer
- @nestjs/schematics
- prettier
- @types/bcrypt
- @types/multer
- @types/supertest
- Capuchinos - Comedor Solanus Logo
- cmdk
- @comedor-solanus/shared
- date-fns
- @fontsource-variable/inter
- @hookform/resolvers
- lucide-react
- next-themes
- react
- react-day-picker
- react-dom
- react-hook-form
- react-router-dom
- sonner
- tailwind-merge
- tailwindcss
- @tanstack/react-query
- tw-animate-css
- Amigos de los Capuchinos ABP Logo
- Comedor Solanus Logo (Capuchinos)
- ApiConsumes
- UploadedFile
- UseInterceptors
- IsBooleanString
- ValidateNested

## God Nodes (most connected - your core abstractions)
1. `cn()` - 172 edges
2. `PrismaService` - 105 edges
3. `UseCase` - 96 edges
4. `Button()` - 50 edges
5. `@prisma/client` - 41 edges
6. `InventarioController` - 34 edges
7. `ApiError` - 34 edges
8. `Input()` - 28 edges
9. `ApiOkSchemaResponse()` - 28 edges
10. `useAuth()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Puertos no estándar a propósito (5442/3210/5173/5183)` --shares_data_with--> `servicio postgres (comedor-solanus-db, 5442:5432)`  [INFERRED]
  CLAUDE.md → docker-compose.yml
- `Variables de entorno API (.env.example)` --conceptually_related_to--> `servicio postgres (comedor-solanus-db, 5442:5432)`  [INFERRED]
  apps/api/CLAUDE.md → docker-compose.yml
- `Estructura del repositorio (README raíz)` --references--> `apps/web (CLAUDE.md)`  [INFERRED]
  README.md → apps/web/CLAUDE.md
- `Estructura del repositorio (README raíz)` --references--> `packages/shared (CLAUDE.md)`  [INFERRED]
  README.md → packages/shared/CLAUDE.md
- `Skills y plugins de este proyecto` --conceptually_related_to--> `Librerías clave (TanStack Query, RHF+Zod, sonner, lucide-react, next-themes, cmdk...)`  [INFERRED]
  CLAUDE.md → apps/web/CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **packages/shared como fuente de verdad de roles/permisos, consumida por api y web** — packages_shared_claude_roles, apps_api_claude_auth_guard, apps_web_readme_navegacion_rol [INFERRED 0.85]

## Communities (138 total, 44 thin omitted)

### Community 0 - "InventarioController"
Cohesion: 0.05
Nodes (47): ApiOkSchemaArrayResponse, RegistrarAjusteDto, ApiProperty, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+39 more)

### Community 1 - "inventario.controller.ts"
Cohesion: 0.06
Nodes (43): ActualizarCategoriaDto, ActualizarUnidadDto, CategoriaInventarioResponseDto, CrearCategoriaDto, CrearUnidadDto, MotivoMovimientoResponseDto, ApiProperty, IsBoolean (+35 more)

### Community 2 - "voluntarios.controller.ts"
Cohesion: 0.06
Nodes (47): Exceptions, Responses, VoluntarioErrors, telefonoMxRegex, ActualizarVoluntarioDto, CrearVoluntarioDto, ListarVoluntariosQueryDto, ApiProperty (+39 more)

### Community 3 - "asistencia.controller.ts"
Cohesion: 0.06
Nodes (46): ROLES_CAPTURA, ROLES_DESHACER, Inject, ActualizarTurnoDto, AsistenciaResponseDto, ComensalRefDto, ListarTurnosQueryDto, ObtenerTurnoQueryDto (+38 more)

### Community 4 - "api-client.ts"
Cohesion: 0.06
Nodes (63): Avatar(), AvatarFallback(), AvatarImage(), Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+55 more)

### Community 5 - "PrismaService"
Cohesion: 0.10
Nodes (23): AsistenciaErrors, Exceptions, Responses, Exceptions, InventarioErrors, Responses, UseCase, AsignarVoluntarioTurnoArgs (+15 more)

### Community 6 - "ComensalDetalleView.tsx"
Cohesion: 0.18
Nodes (30): EmptyState(), EmptyStateProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter() (+22 more)

### Community 7 - "sidebar.tsx"
Cohesion: 0.06
Nodes (40): AppLayout(), iniciales(), NAV_ITEMS, NavItem, Separator(), Sheet(), SheetContent(), SheetDescription() (+32 more)

### Community 8 - "usuarios.controller.ts"
Cohesion: 0.09
Nodes (25): prisma, AuthErrors, Exceptions, Responses, ActualizarUsuarioDto, CrearUsuarioDto, ApiProperty, IsBoolean (+17 more)

### Community 9 - "PaginationQueryDto"
Cohesion: 0.09
Nodes (33): paginado(), PaginatedDto, PaginationMetaDto, PaginationQueryDto, toSkipTake(), ApiProperty, IsInt, IsOptional (+25 more)

### Community 10 - "comensales/api.ts"
Cohesion: 0.15
Nodes (19): construirQueryString(), queryKeys, SERVER_ROOT_URL, subirArchivo(), useComensales(), useSubirArchivoComensal(), useSubirFotoComensal(), useSubirIneFrenteComensal() (+11 more)

### Community 11 - "cn"
Cohesion: 0.07
Nodes (35): AlertDialogMedia(), AlertDialogOverlay(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), CardAction(), CardFooter(), Command() (+27 more)

### Community 12 - "useAuth"
Cohesion: 0.12
Nodes (19): LoginPage(), useResumenDashboard(), StatCard(), StatCardProps, TONE_CLASSES, DashboardPage(), diasRestantes(), formatFecha() (+11 more)

### Community 13 - "comensales.controller.ts"
Cohesion: 0.07
Nodes (25): ImageUploadInterceptor(), ROLES_ESCRITURA, ROLES_LECTURA, Inject, ActualizarComensalUseCase, Injectable, CrearComensalUseCase, Injectable (+17 more)

### Community 14 - "ComensalFormView.tsx"
Cohesion: 0.22
Nodes (12): useActualizarComensal(), useComensal(), useCrearComensal(), ComensalesListView(), ComensalesPage(), ComensalFormValues, ComensalFormView(), comensalSchema (+4 more)

### Community 15 - "reportes.controller.ts"
Cohesion: 0.11
Nodes (24): AsistenciaPorDiaDto, DonativosPorBienhechorDto, ExistenciaReporteDto, MovimientoResumenDto, MovimientosPorTipoDto, RangoFechaQueryDto, ReporteAsistenciaResponseDto, ReporteDonativosResponseDto (+16 more)

### Community 16 - "inventario/api.ts"
Cohesion: 0.04
Nodes (59): LineaForm, nuevaLinea(), RegistrarDonativoDialog(), limpiar(), registrar(), EditarCategoriaDialog(), EditarUnidadDialog(), EditarUnidadDialogProps (+51 more)

### Community 17 - "combobox.tsx"
Cohesion: 0.13
Nodes (17): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+9 more)

### Community 18 - "RegistrarEntradaPage.tsx"
Cohesion: 0.12
Nodes (43): Button(), DatePicker(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+35 more)

### Community 19 - "AsistenciaPage.tsx"
Cohesion: 0.07
Nodes (39): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), buildQuery(), useTurno(), useTurnosDelDia() (+31 more)

### Community 20 - "devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, eslint-config-prettier, @eslint/eslintrc, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/testing, source-map-support (+23 more)

### Community 21 - "crear-producto.usecase.ts"
Cohesion: 0.15
Nodes (19): ActualizarProductoDto, CrearProductoDto, ListarProductosQueryDto, ProductoResponseDto, ApiProperty, IsBoolean, IsInt, IsOptional (+11 more)

### Community 22 - "VoluntariosListView.tsx"
Cohesion: 0.09
Nodes (22): useRegistrarInsumoTurno(), InsumosTurno(), StockMinimoTab(), useActualizarVariante(), useLotesVariante(), useMovimientos(), useProducto(), useVariante() (+14 more)

### Community 23 - "subir-ine-frente-comensal.usecase.ts"
Cohesion: 0.17
Nodes (13): ComensalErrors, Exceptions, Responses, IStorageService, STORAGE_SERVICE, ALLOWED_MIME_TYPES, extensionFromMimeType(), ComensalDetalleResponseDto (+5 more)

### Community 24 - "input-group.tsx"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 25 - "ComensalesController"
Cohesion: 0.19
Nodes (16): ApiConsumes, ComensalesController, ApiOkSchemaResponse, ApiTags, Auth, Body, Controller, Delete (+8 more)

### Community 26 - "AuthenticatedUser"
Cohesion: 0.12
Nodes (14): Get, Inject, AuthService, Injectable, AuthenticatedUser, SignInDto, SignInResponseDto, ApiProperty (+6 more)

### Community 27 - "ComensalDetalleView"
Cohesion: 0.25
Nodes (11): resolverUrlArchivo(), useAsistenciasComensal(), useEliminarComensal(), useFirmarCartaUsoImagen(), ComensalDetalleView(), handleDescargarPdf(), handleEliminar(), handleFirmarCarta() (+3 more)

### Community 28 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+18 more)

### Community 29 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, globals, devDependencies, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+17 more)

### Community 30 - "ApiOkSchemaResponse"
Cohesion: 0.12
Nodes (18): ApiOkSchemaResponse(), Auth(), DashboardController, ApiTags, Controller, Get, Inject, Query (+10 more)

### Community 31 - "registrar-entrada.usecase.ts"
Cohesion: 0.16
Nodes (15): RegistrarDonativoResponseDto, LoteBienhechorRefDto, LoteResponseDto, LoteVarianteRefDto, ApiProperty, validarCategoria(), RegistrarDonativoUseCase, Injectable (+7 more)

### Community 32 - "IdParamDto"
Cohesion: 0.18
Nodes (13): EmisorParamDto, EmisorRelationParamDto, IdParamDto, ApiProperty, AsistenciaController, ApiTags, Body, Controller (+5 more)

### Community 33 - "inventario/dto/reportes.dto.ts"
Cohesion: 0.14
Nodes (14): AsistenciaResumenDto, DonativosResumenDto, ResumenDashboardResponseDto, ApiProperty, ObtenerResumenDashboardUseCase, Injectable, ProximoAVencerResponseDto, StockBajoResponseDto (+6 more)

### Community 34 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 35 - "bienhechores.controller.ts"
Cohesion: 0.25
Nodes (12): ActualizarBienhechorDto, BienhechorResponseDto, CrearBienhechorDto, ListarBienhechoresQueryDto, ApiProperty, IsBoolean, IsOptional, IsString (+4 more)

### Community 36 - "variante.dto.ts"
Cohesion: 0.16
Nodes (18): CategoriaRefDto, ActualizarVarianteDto, CrearVarianteDto, ListarVariantesQueryDto, ProductoRefDto, ApiProperty, IsBoolean, IsEnum (+10 more)

### Community 37 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 39 - "auth.decorator.ts"
Cohesion: 0.17
Nodes (7): META_ROLES, RoleProtected(), ControladorConMetodoProtegido, ControladorProtegidoPorClase, SinRolesController, Injectable, UserRoleGuard

### Community 40 - "response.dto.ts"
Cohesion: 0.16
Nodes (15): ApiResponseProperty, ApiBadRequestResponseError(), ApiForbiddenResponseError(), ApiInternalServerErrorResponseError(), ApiMultiResponseErrorDecorator(), ApiNotFoundResponseError(), ApiNotImplementedResponseError(), ApiUnauthorizedResponseError() (+7 more)

### Community 41 - "app.module.ts"
Cohesion: 0.11
Nodes (17): AsistenciaModule, Module, BienhechoresModule, Module, ComensalesModule, Module, DashboardModule, Module (+9 more)

### Community 42 - "BienhechoresController"
Cohesion: 0.12
Nodes (11): BienhechoresController, ApiTags, Body, Controller, Delete, Get, Param, Patch (+3 more)

### Community 43 - "date-picker.tsx"
Cohesion: 0.19
Nodes (15): buttonVariants, Calendar(), CalendarDayButton(), DatePickerProps, fechaAIso(), isoAFecha(), DateRangePicker(), DateRangePickerProps (+7 more)

### Community 44 - "AuthProvider.tsx"
Cohesion: 0.27
Nodes (9): AuthProvider(), descargarExpedientePdf(), subirFoto(), getToken(), request(), setToken(), AuthContext, AuthContextValue (+1 more)

### Community 45 - "generar-pdf-expediente.usecase.ts"
Cohesion: 0.17
Nodes (16): now(), ComensalResponseDto, ASSETS_DIR, ComensalExpediente, EXPEDIENTE_SELECT, ExpedienteComensalPdf, MIME_POR_EXTENSION, ComensalDetalle (+8 more)

### Community 46 - "theme-provider.tsx"
Cohesion: 0.17
Nodes (15): App(), disableTransitionsTemporarily(), getSystemTheme(), isEditableTarget(), isTheme(), ResolvedTheme, Theme, THEME_VALUES (+7 more)

### Community 47 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, bcrypt, dayjs, @nestjs/config, @nestjs/core, @nestjs/serve-static, passport, @prisma/client (+9 more)

### Community 48 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, dev, format, lint, prisma:deploy, prisma:generate, prisma:migrate (+9 more)

### Community 49 - "ApiOkSchemaArrayResponse"
Cohesion: 0.13
Nodes (10): ApiOkSchemaArrayResponse(), ApiTags, Body, Controller, Delete, Get, Param, Patch (+2 more)

### Community 50 - "firmar-carta-uso-imagen.usecase.ts"
Cohesion: 0.29
Nodes (5): FirmarCartaUsoImagenDto, IsBoolean, FirmarCartaUsoImagenArgs, FirmarCartaUsoImagenUseCase, Injectable

### Community 51 - "comensal.dto.ts"
Cohesion: 0.21
Nodes (16): ActualizarComensalDto, AsistenciaComensalUsuarioRefDto, CartaUsoImagenResponseDto, ComensalTutorResumenDto, CrearComensalDto, ListarComensalesQueryDto, ApiProperty, IsInt (+8 more)

### Community 52 - "usuarios/api.ts"
Cohesion: 0.17
Nodes (10): useActualizarUsuario(), useCrearUsuario(), useEliminarUsuario(), useUsuarios(), UsuarioFormDialog(), UsuarioFormDialogProps, ActualizarUsuarioInput, CrearUsuarioInput (+2 more)

### Community 53 - "package.json"
Cohesion: 0.14
Nodes (13): prisma, description, engines, node, name, packageManager, pnpm, onlyBuiltDependencies (+5 more)

### Community 54 - "RegistrarDonativoDto"
Cohesion: 0.20
Nodes (14): LineaDonativoDto, RegistrarDonativoDto, ApiProperty, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+6 more)

### Community 55 - "apps/api (CLAUDE.md)"
Cohesion: 0.17
Nodes (13): apps/api (CLAUDE.md), Variables de entorno API (.env.example), Errores catalogados en common/errors/<x>.errors.ts, Módulos existentes: auth, usuarios, comensales, asistencia, inventario, bienhechores, voluntarios, dashboard, reportes, Patrón de módulo: un caso de uso por archivo, common/pdf/pdf.service.ts (Puppeteer, expedientes PDF), Reusar antes de crear (utils, pdf, storage), common/storage/local-storage.service.ts + image-upload.interceptor.ts (+5 more)

### Community 56 - "bienhechores/api.ts"
Cohesion: 0.17
Nodes (13): buildQuery(), useActualizarBienhechor(), useBienhechores(), useCrearBienhechor(), useEliminarBienhechor(), BienhechoresListPage(), BienhechorFormPage(), NuevoBienhechorDialog() (+5 more)

### Community 57 - "apps/web (CLAUDE.md)"
Cohesion: 0.17
Nodes (11): apps/web (CLAUDE.md), E2E: login-roles, comensal-expediente, asistencia-descuento, VITE_API_URL (.env.local), Librerías clave (TanStack Query, RHF+Zod, sonner, lucide-react, next-themes, cmdk...), Skills al trabajar en apps/web, Tailwind v4 CSS-first + shadcn/ui sobre Base UI (base-nova), Verificación: lint, typecheck, test:e2e, /logo-comedor.png (favicon) (+3 more)

### Community 58 - "asistencia-descuento.spec.ts"
Cohesion: 0.17
Nodes (3): __dirname, FOTO_PRUEBA, CREDENCIALES

### Community 59 - "ErrorResponseDto"
Cohesion: 0.24
Nodes (6): ErrorResponseDto, CommonErrors, Exceptions, Responses, HttpExceptionFilter, Catch

### Community 60 - "PdfService"
Cohesion: 0.22
Nodes (6): PdfModule, Global, Module, PdfService, Injectable, puppeteer

### Community 61 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, @base-ui/react, clsx, shadcn, @tailwindcss/vite, zod, @base-ui/react, clsx (+3 more)

### Community 62 - "Estado del proyecto (fases)"
Cohesion: 0.20
Nodes (10): prisma/seed.ts (admin/operativo/captura, Solanus2026!), Comedor Solanus (README raíz), Estado del proyecto (fases), Fase 0 — Andamiaje del monorepo (completada), Fase 1 — Auth, roles, usuarios, layout (completada), Fase 2 — Comensales, Inventario, Voluntarios, Fase 3 — Turno de comida (asistencia + descuento), Fase 4 — Dashboard y reportes (+2 more)

### Community 63 - "apps/web — Convenciones (README)"
Cohesion: 0.29
Nodes (10): Contrato de API (tipos compartidos en packages/shared), apps/web — Convenciones (README), Navegación por rol (nav-config.ts + puedeAcceder()), Paleta y tokens (src/index.css) — vino/marrón sobre crema, Rutas protegidas (ProtectedRoute.tsx con prop modulo), src/auth.ts (tipos de auth), src/index.ts (barrel export), packages/shared (CLAUDE.md) (+2 more)

### Community 64 - "apps/api — Convenciones (README)"
Cohesion: 0.22
Nodes (9): @Auth(...roles) requiere importar AuthModule, Commit c1323ba — fix interceptor no envuelve binarios, prisma/schema.prisma — punto de sincronización, SchemaResponse vía response.interceptor.ts (binarios excluidos), Comandos propios: prisma:migrate, prisma:studio, prisma:seed, apps/api — Convenciones (README), schema.prisma — un solo dueño a la vez, Protección de rutas: @Auth combina JWT + UserRoleGuard (+1 more)

### Community 65 - "nest-cli.json"
Cohesion: 0.22
Nodes (8): collection, compilerOptions, assets, deleteOutDir, watchAssets, $schema, sourceRoot, common/pdf/assets/**/*

### Community 66 - "app.e2e-spec.ts"
Cohesion: 0.28
Nodes (5): AppModule, Module, SchemaResponse, ApiProperty, ApiResponseInterceptor

### Community 67 - "GenerarPdfExpedienteUseCase"
Cohesion: 0.33
Nodes (3): GenerarPdfExpedienteUseCase, Inject, Injectable

### Community 68 - "Comedor Solanus (root CLAUDE.md)"
Cohesion: 0.25
Nodes (9): Amigos de los Capuchinos ABP, Comedor Comunitario Beato Solanus Casey, Comedor Solanus (root CLAUDE.md), Estudio Socioeconómico y Despensas — diferido, no implementar, Consultar graphify antes de explorar, Monorepo pnpm (apps/* + packages/*), Puertos no estándar a propósito (5442/3210/5173/5183), Skills y plugins de este proyecto (+1 more)

### Community 69 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:down, db:up, dev, dev:api, dev:web, lint (+1 more)

### Community 70 - "shared/package.json"
Cohesion: 0.22
Nodes (8): description, exports, main, name, private, type, types, version

### Community 71 - "api/package.json"
Cohesion: 0.25
Nodes (7): description, license, name, prisma, seed, private, version

### Community 72 - "main.ts"
Cohesion: 0.32
Nodes (4): MulterExceptionFilter, Catch, config, swaggerSetupOptions

### Community 73 - "RegistrarAsistenciaDto"
Cohesion: 0.43
Nodes (7): AsignarVoluntarioDto, RegistrarAsistenciaDto, RegistrarInsumoTurnoDto, ApiProperty, IsEnum, IsInt, IsOptional

### Community 74 - "ActualizarBienhechorUseCase"
Cohesion: 0.25
Nodes (5): Inject, ActualizarBienhechorUseCase, Injectable, ObtenerBienhechorUseCase, Injectable

### Community 75 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 76 - "permisos.ts"
Cohesion: 0.27
Nodes (7): SignInRequest, SignInResponse, Modulo, MODULOS_POR_ROL, TODOS_LOS_ROLES, UserRole, UserRoles

### Community 77 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test:e2e, typecheck

### Community 79 - "ListarBienhechoresUseCase"
Cohesion: 0.33
Nodes (3): Query, ListarBienhechoresUseCase, Injectable

### Community 80 - "web/package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 81 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 82 - "web/tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 83 - "Estructura por feature (src/features/<modulo>)"
Cohesion: 0.50
Nodes (4): DTOs con class-validator + @ApiProperty (Swagger /api/docs), src/lib/api-client.ts — único punto de red, auth-context.ts + ProtectedRoute.tsx (guard por rol), Estructura por feature (src/features/<modulo>)

### Community 86 - "tooltip.tsx"
Cohesion: 0.40
Nodes (3): Tooltip(), TooltipContent(), TooltipTrigger()

### Community 87 - "@eslint/js"
Cohesion: 0.67
Nodes (3): @eslint/js, @eslint/js, @eslint/js

### Community 88 - "@types/node"
Cohesion: 0.67
Nodes (3): @types/node, @types/node, @types/node

### Community 89 - "typescript"
Cohesion: 0.67
Nodes (3): typescript, typescript, typescript

### Community 90 - "typescript-eslint"
Cohesion: 0.67
Nodes (3): typescript-eslint, typescript-eslint, typescript-eslint

### Community 91 - "StorageModule"
Cohesion: 0.67
Nodes (3): StorageModule, Global, Module

## Knowledge Gaps
- **372 isolated node(s):** `ActualizarCatalogoArgs`, `ComensalFormValues`, `CartaUsoImagen`, `ComensalTutorResumen`, `SignInRequest` (+367 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `PrismaService` to `inventario.controller.ts`, `inventario/dto/reportes.dto.ts`, `asistencia.controller.ts`, `bienhechores.controller.ts`, `variante.dto.ts`, `voluntarios.controller.ts`, `auth.decorator.ts`, `usuarios.controller.ts`, `RegistrarAsistenciaDto`, `PaginationQueryDto`, `generar-pdf-expediente.usecase.ts`, `dependencies`, `reportes.controller.ts`, `comensal.dto.ts`, `crear-producto.usecase.ts`, `package.json`, `registrar-entrada.usecase.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `class-transformer`, `class-validator`, `multer`, `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/platform-express`, `api/package.json`, `@nestjs/swagger`, `passport-jwt`, `puppeteer`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `api/package.json`, `@nestjs/schematics`, `prettier`, `@types/bcrypt`, `@types/multer`, `@types/supertest`, `package.json`, `@eslint/js`, `@types/node`, `typescript`, `typescript-eslint`, `devDependencies`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `ActualizarCatalogoArgs`, `ComensalFormValues`, `CartaUsoImagen` to the rest of the system?**
  _372 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InventarioController` be split into smaller, more focused modules?**
  _Cohesion score 0.05031645569620253 - nodes in this community are weakly interconnected._
- **Should `inventario.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05582603050957481 - nodes in this community are weakly interconnected._
- **Should `voluntarios.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05927405927405927 - nodes in this community are weakly interconnected._