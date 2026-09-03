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

test.describe('Alta de comensal con expediente completo', () => {
  test('registra un comensal mayor de edad, sube foto e INE, y descarga el PDF del expediente', async ({ page }) => {
    await loginComoAdmin(page);

    const apellidoUnico = `Playwright-${Date.now()}`;

    await page.goto('/comensales/nuevo');
    await page.getByLabel('Nombres').fill('Comensal');
    await page.getByLabel('Apellidos').fill(apellidoUnico);

    await page.getByRole('button', { name: 'Selecciona una fecha' }).click();
    await page.locator('select[aria-label="Choose the Year"]').selectOption('1985');
    await page.locator('select[aria-label="Choose the Month"]').selectOption('2'); // marzo (0-indexado)
    await page.getByRole('button', { name: /March 20th, 1985/ }).click();

    await expect(page.getByText('41 años')).toBeVisible();

    await page.getByRole('button', { name: 'Registrar comensal' }).click();
    await expect(page.getByText('Comensal registrado correctamente')).toBeVisible();
    await expect(page.getByRole('heading', { name: `Comensal ${apellidoUnico}` })).toBeVisible();

    // Un mayor de edad no debe pedir tutor, y su INE sí debe estar disponible para subir.
    await expect(page.getByText('No aplica — es mayor de edad')).toBeVisible();

    const inputsArchivo = page.locator('input[type="file"]');
    await inputsArchivo.nth(0).setInputFiles(FOTO_PRUEBA); // foto
    await expect(page.getByText('Foto actualizada')).toBeVisible();

    await inputsArchivo.nth(1).setInputFiles(FOTO_PRUEBA); // INE frente
    await expect(page.getByText('INE (frente) actualizado')).toBeVisible();

    await inputsArchivo.nth(2).setInputFiles(FOTO_PRUEBA); // INE reverso
    await expect(page.getByText('INE (reverso) actualizado')).toBeVisible();

    const descargaPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PDF del expediente' }).click();
    const descarga = await descargaPromise;

    expect(descarga.suggestedFilename()).toMatch(/^expediente-\d+\.pdf$/);
    const rutaGuardada = await descarga.path();
    expect(rutaGuardada).toBeTruthy();
  });

  test('un comensal menor de edad exige un tutor mayor de edad ya existente', async ({ page }) => {
    await loginComoAdmin(page);

    await page.goto('/comensales/nuevo');
    await page.getByLabel('Nombres').fill('Menor');
    await page.getByLabel('Apellidos').fill(`DePrueba-${Date.now()}`);

    await page.getByRole('button', { name: 'Selecciona una fecha' }).click();
    await page.locator('select[aria-label="Choose the Year"]').selectOption(String(new Date().getFullYear() - 10));
    await page.locator('select[aria-label="Choose the Month"]').selectOption('0');
    await page.getByRole('button', { name: /January 15th/ }).click();

    await expect(page.getByText(/años — menor de edad/)).toBeVisible();
    await expect(page.getByText('Tutor')).toBeVisible();

    // Sin tutor seleccionado, el formulario debe rechazar el envío con el mensaje de validación.
    await page.getByRole('button', { name: 'Registrar comensal' }).click();
    await expect(page.getByText('El comensal es menor de edad: selecciona un tutor')).toBeVisible();
  });
});
