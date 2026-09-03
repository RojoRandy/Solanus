import { test, expect } from '@playwright/test';

const CREDENCIALES = {
  administrador: { usuario: 'admin', password: 'Solanus2026!' },
  usuario: { usuario: 'operativo', password: 'Solanus2026!' },
  usuario_simple: { usuario: 'captura', password: 'Solanus2026!' },
} as const;

async function login(page: import('@playwright/test').Page, usuario: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill(usuario);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/(asistencia)?$/);
}

test.describe('Login y control de acceso por rol', () => {
  test('administrador ve todos los módulos y accede al panel general', async ({ page }) => {
    await login(page, CREDENCIALES.administrador.usuario, CREDENCIALES.administrador.password);

    for (const modulo of ['Panel general', 'Turno de comida', 'Comensales', 'Inventario', 'Bienhechores', 'Voluntarios', 'Reportes', 'Usuarios del sistema']) {
      await expect(page.getByRole('link', { name: modulo })).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: /^Hola,/ })).toBeVisible();
  });

  test('usuario (operativo) ve todo salvo la administración de usuarios', async ({ page }) => {
    await login(page, CREDENCIALES.usuario.usuario, CREDENCIALES.usuario.password);

    for (const modulo of ['Panel general', 'Turno de comida', 'Comensales', 'Inventario', 'Bienhechores', 'Voluntarios', 'Reportes']) {
      await expect(page.getByRole('link', { name: modulo })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Usuarios del sistema' })).toHaveCount(0);
  });

  test('usuario_simple (captura) solo ve Turno de comida y Comensales, incluso navegando directo a una URL restringida', async ({ page }) => {
    await login(page, CREDENCIALES.usuario_simple.usuario, CREDENCIALES.usuario_simple.password);

    await expect(page.getByRole('link', { name: 'Turno de comida' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Comensales' })).toBeVisible();

    for (const modulo of ['Panel general', 'Inventario', 'Bienhechores', 'Voluntarios', 'Reportes', 'Usuarios del sistema']) {
      await expect(page.getByRole('link', { name: modulo })).toHaveCount(0);
    }

    // El menú ya lo oculta, pero la ruta también debe estar bloqueada si se entra por URL directa.
    await page.goto('/inventario');
    await expect(page).toHaveURL(/\/asistencia$/);

    await page.goto('/usuarios');
    await expect(page).toHaveURL(/\/asistencia$/);
  });

  test('rechaza credenciales inválidas con un mensaje claro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill('admin');
    await page.getByLabel('Contraseña').fill('contraseña-incorrecta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/contraseña|credenciales|incorrect/i)).toBeVisible();
  });
});
