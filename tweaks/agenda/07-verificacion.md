# Paso 7 — Verificación y cierre

```bash
pnpm --filter api test
pnpm --filter web lint && pnpm --filter web typecheck
```

## En el navegador

`preview_start` (config `web`, puerto 5183) — **nunca `pnpm dev` por Bash**.
Con la API y Postgres arriba (`pnpm db:up`, `pnpm --filter api dev`):

1. Login como **admin** → menú muestra **Agenda**; login como **captura**
   (usuario simple) → no la muestra y `/agenda` redirige.
2. Crear 3 eventos en días distintos: uno con un swatch preset, uno con color
   personalizado del `<input type="color">`, uno con descripción larga →
   verificar truncado + tooltip con el texto completo.
3. Clic en un día → modal con fecha en el título y eventos ordenados por hora.
4. Panel general → el mismo calendario arriba.
5. Filtro Pasados → sin botones de editar/baja.
6. Modo oscuro: los chips tintados siguen legibles con cualquier color elegido.

## Cierre

```bash
graphify . --update
```

Commitear `graphify-out/` junto con el cambio. Mensaje estilo del historial:
`feat: agregar módulo de agenda con calendario de próximos eventos`.

Antes de abrir PR: `/code-review` y `/security-review`.
