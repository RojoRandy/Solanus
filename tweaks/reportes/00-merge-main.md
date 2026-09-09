# Paso 0 — Traer main a la rama

**Estado:** ✅ hecho · **Depende de:** —

La rama de trabajo (`claude/plan-reportes-adjustments-066566`) estaba en `d76f7dc`; `main`
(`236e23f`) tiene commits más nuevos que este plan da por existentes:

- Modelo `DonativoDinero` + enum `MetodoPagoDonativo` en `apps/api/prisma/schema.prisma`.
- Módulo `apps/api/src/modules/donativos/` — `GET/POST /donativos`, `DELETE /donativos/:id`,
  `ListarDonativosDineroUseCase` que ya devuelve `{ items, meta, totalMonto }` con filtros
  `desde`/`hasta`/`bienhechorId`/`turnoId`/`metodoPago` + paginación.
- Feature `apps/web/src/features/donativos/` — `useDonativosDinero`, `useRegistrarDonativoDinero`,
  `useEliminarDonativoDinero`, componentes `HistorialDonativos` y
  `RegistrarDonativoDineroDialog`.
- `exceljs` como dependencia de `apps/api`, y `exportar-comensales-{xlsx,pdf}.usecase.ts` en
  `apps/api/src/modules/comensales/usecases/` como segundo precedente de exportación a PDF
  (además del expediente de comensal).
- La carpeta `tweaks/` (ronda 1, ya cerrada) con el formato a replicar en `tweaks/reportes/`.

## Comandos ejecutados

```bash
git merge main --no-edit
pnpm install
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
```

## Terminado cuando

- `git log --oneline -1` muestra el merge commit con `236e23f` como ancestro.
- `pnpm install` sin errores (entra `exceljs`).
- El cliente de Prisma regenerado reconoce `prisma.donativoDinero` y `MetodoPagoDonativo`.
- Sin conflictos de merge (confirmado: merge limpio, sin archivos en estado `both modified`).

**Sin este paso nada de los pasos 1-7 compila** — todos asumen que `DonativoDinero`, el módulo
`donativos` y `exceljs` ya existen en el working tree.
