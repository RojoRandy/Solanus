import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOTO_PRUEBA = path.join(__dirname, 'fixtures', 'foto-prueba.jpg');

async function loginComoAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('Solanus2026!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** Confirma el modal de fecha/horario que bloquea la captura al entrar a /asistencia. */
async function irATurnoComida(page: import('@playwright/test').Page) {
  await page.goto('/asistencia');
  await page.getByRole('button', { name: 'Empezar captura' }).click();
  await page.getByRole('tab', { name: 'Comida' }).click();
}

test.describe('Reportes mensuales', () => {
  test('asistencia, movimientos, donativos y evidencias capturados hoy aparecen en el reporte del mes, y el PDF se descarga', async ({ page }) => {
    await loginComoAdmin(page);

    // ── Comensal propio del test + asistencia de hoy ──────────────────────
    const apellido = `Reportes-${Date.now()}`;
    await page.goto('/comensales/nuevo');
    await page.getByLabel('Nombres').fill('Matriz E2E');
    await page.getByLabel('Apellidos').fill(apellido);
    await page.getByRole('button', { name: 'Selecciona una fecha' }).click();
    await page.locator('select[aria-label="Choose the Year"]').selectOption('1990');
    await page.locator('select[aria-label="Choose the Month"]').selectOption('5');
    await page.getByRole('button', { name: /June 10th, 1990/ }).click();
    await page.getByRole('button', { name: 'Registrar comensal' }).click();
    await expect(page.getByText('Comensal registrado correctamente')).toBeVisible();

    const folioTexto = await page.getByText(/^Folio \d+$/).innerText();
    const folio = folioTexto.replace('Folio ', '');

    await irATurnoComida(page);
    const buscador = page.getByPlaceholder('Folio y Enter, o nombre del comensal…');
    await buscador.fill(folio);
    await buscador.press('Enter');
    await expect(page.getByText(`Folio ${folio} — asistencia registrada`)).toBeVisible();

    // ── Insumo de inventario (movimiento del mes) ─────────────────────────
    // .first(): puede haber más de una variante de Arroz acumulada entre corridas de la suite.
    await page.getByRole('combobox', { name: 'Producto…' }).click();
    await page.getByRole('option', { name: /^Arroz/ }).first().click();
    await page.getByPlaceholder('Cantidad').fill('2');
    await page.getByRole('button', { name: 'Descontar' }).click();
    await expect(page.getByText('Insumo descontado del inventario.')).toBeVisible();

    // ── Donativo en dinero del turno ───────────────────────────────────────
    await page.getByRole('button', { name: 'En dinero' }).click();
    await page.getByRole('combobox', { name: '¿Quién donó?' }).click();
    await page.getByRole('option', { name: 'Público en General' }).click();
    await page.getByLabel('Monto').fill('250.75');
    await page.getByRole('button', { name: 'Registrar donativo' }).click();
    await expect(page.getByText(/registrado\.$/)).toBeVisible();

    // ── Reporte del mes: las 4 secciones ───────────────────────────────────
    const hoy = new Date();
    const dia = hoy.getDate();

    await page.goto('/reportes');

    // Asistencia: la fila del comensal trae "1" en la columna del día de hoy.
    const encabezadoFila = page.getByRole('rowheader', { name: new RegExp(`${folio}.*${apellido}`) });
    await expect(encabezadoFila).toBeVisible();
    const filaAsistencia = page.locator('tr', { has: encabezadoFila });
    await expect(filaAsistencia.locator('td').nth(dia - 1)).toHaveText('1');

    // Inventario: el insumo de Arroz aparece como movimiento del mes (puede haber más de
    // uno si otro spec de la suite ya registró un consumo del mismo producto).
    await page.getByRole('tab', { name: 'Inventario' }).click();
    await expect(page.getByRole('row', { name: /Arroz.*kg.*Salida/ }).first()).toBeVisible();

    // Donativos: el donativo en dinero recién registrado aparece con su monto (.first():
    // reintentar la suite localmente puede dejar más de uno con el mismo monto fijo).
    await page.getByRole('tab', { name: 'Donativos' }).click();
    await expect(page.getByText('$250.75').first()).toBeVisible();

    // Evidencias: subir una foto, verla, y borrarla.
    await page.getByRole('tab', { name: 'Evidencias' }).click();
    await expect(page.getByText('Sin evidencias')).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles(FOTO_PRUEBA);
    const tarjetaEvidencia = page.locator('.group', { has: page.locator('img[alt*="Evidencia"]') });
    await expect(tarjetaEvidencia).toBeVisible();

    await tarjetaEvidencia.hover();
    await tarjetaEvidencia.getByRole('button').click(); // botón de borrar (icono, sin texto)
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Evidencia eliminada.')).toBeVisible();

    // ── Exportar PDF ────────────────────────────────────────────────────────
    const descargaPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar PDF' }).click();
    const descarga = await descargaPromise;
    expect(descarga.suggestedFilename()).toMatch(/^reporte-\d{4}-\d{2}\.pdf$/);
    expect(await descarga.path()).toBeTruthy();
  });

  test('el selector de mes cambia el periodo y un mes sin datos muestra los estados vacíos', async ({ page }) => {
    await loginComoAdmin(page);
    await page.goto('/reportes');

    await page.getByRole('button', { name: 'Mes anterior' }).click();
    await expect(page.getByText(/^Asistencia por día — /)).toBeVisible();

    await page.getByRole('tab', { name: 'Evidencias' }).click();
    await expect(page.getByText('Sin evidencias')).toBeVisible();

    await page.getByRole('button', { name: 'Mes siguiente' }).click();
  });
});
