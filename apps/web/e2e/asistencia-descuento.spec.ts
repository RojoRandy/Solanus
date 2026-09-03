import { test, expect } from '@playwright/test';

async function loginComoAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('Solanus2026!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function leerExistencia(page: import('@playwright/test').Page, producto: string): Promise<number> {
  await page.goto('/inventario');
  const fila = page.getByRole('row', { name: new RegExp(producto) });
  await expect(fila).toBeVisible();
  const texto = await fila.locator('td').nth(4).innerText(); // columna "Existencia", solo el número
  return Number(texto.trim());
}

test.describe('Turno de comida: asistencia con descuento automático de inventario', () => {
  test('registrar asistencia por folio suma al contador del turno, y evita el doble conteo', async ({ page }) => {
    await loginComoAdmin(page);

    // Se crea un comensal propio del test (en vez de asumir un folio del seed)
    // para que la corrida sea repetible sin depender de resetear la base de
    // datos ni de qué haya quedado registrado en corridas anteriores.
    const apellido = `Asistencia-${Date.now()}`;
    await page.goto('/comensales/nuevo');
    await page.getByLabel('Nombres').fill('Folio E2E');
    await page.getByLabel('Apellidos').fill(apellido);
    await page.getByRole('button', { name: 'Selecciona una fecha' }).click();
    await page.locator('select[aria-label="Choose the Year"]').selectOption('1990');
    await page.locator('select[aria-label="Choose the Month"]').selectOption('5');
    await page.getByRole('button', { name: /June 10th, 1990/ }).click();
    await page.getByRole('button', { name: 'Registrar comensal' }).click();
    await expect(page.getByText('Comensal registrado correctamente')).toBeVisible();

    const folioTexto = await page.getByText(/^Folio \d+$/).innerText();
    const folio = folioTexto.replace('Folio ', '');

    await page.goto('/asistencia');
    await page.getByRole('tab', { name: 'Comida' }).click();

    const contador = page.getByText('Comensales de este turno').locator('..').getByText(/^\d+$/);
    const totalInicial = Number(await contador.innerText());

    const buscador = page.getByPlaceholder('Folio y Enter, o nombre del comensal…');
    await buscador.fill(folio);
    await buscador.press('Enter');

    // El texto "Folio N — asistencia registrada" es exclusivo de la tarjeta de
    // confirmación (el nombre solo, en cambio, se repite también en la lista
    // de abajo, así que no sirve como selector único).
    await expect(page.getByText(`Folio ${folio} — asistencia registrada`)).toBeVisible();
    await expect(contador).toHaveText(String(totalInicial + 1));

    // Repetir el mismo folio en el mismo turno debe rechazarse, no duplicar el conteo.
    await buscador.fill(folio);
    await buscador.press('Enter');
    await expect(page.getByText(/ya tiene asistencia registrada/i)).toBeVisible();
    await expect(contador).toHaveText(String(totalInicial + 1));
  });

  test('registrar un insumo usado en el turno descuenta exactamente esa cantidad del inventario', async ({ page }) => {
    await loginComoAdmin(page);

    const existenciaAntes = await leerExistencia(page, 'Arroz');

    await page.goto('/asistencia');
    await page.getByRole('tab', { name: 'Comida' }).click();

    await page.getByRole('combobox', { name: 'Producto…' }).click();
    await page.getByRole('option', { name: /^Arroz/ }).click();
    await page.getByPlaceholder('Cantidad').fill('3');
    await page.getByRole('button', { name: 'Descontar' }).click();

    await expect(page.getByText('Insumo descontado del inventario.')).toBeVisible();

    const existenciaDespues = await leerExistencia(page, 'Arroz');
    expect(existenciaDespues).toBe(existenciaAntes - 3);
  });

  test('rechaza un descuento mayor a la existencia disponible', async ({ page }) => {
    await loginComoAdmin(page);

    const existenciaActual = await leerExistencia(page, 'Frijol');

    await page.goto('/asistencia');
    await page.getByRole('tab', { name: 'Comida' }).click();

    await page.getByRole('combobox', { name: 'Producto…' }).click();
    await page.getByRole('option', { name: /^Frijol/ }).click();
    await page.getByPlaceholder('Cantidad').fill(String(existenciaActual + 1000));
    await page.getByRole('button', { name: 'Descontar' }).click();

    await expect(page.getByText(/existencia suficiente/i)).toBeVisible();

    const existenciaSinCambio = await leerExistencia(page, 'Frijol');
    expect(existenciaSinCambio).toBe(existenciaActual);
  });
});
