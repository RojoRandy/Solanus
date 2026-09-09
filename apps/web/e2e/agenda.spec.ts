import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3210/api';

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

async function loginComoAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('Solanus2026!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

// El botón del día en el Calendar usa un aria-label como
// "miércoles, 9 de septiembre de 2026" (o "Today, miércoles, 9 de..." para hoy).
async function seleccionarFechaHoy(page: import('@playwright/test').Page) {
  await page.getByLabel('Fecha').click();
  const hoy = new Date();
  const mes = MESES_ES[hoy.getMonth()];
  // La coma antes del día evita que "9" haga match parcial con "19" o "29".
  await page.getByRole('button', { name: new RegExp(`, ${hoy.getDate()} de ${mes} de ${hoy.getFullYear()}`) }).click();
}

async function seleccionarHora(page: import('@playwright/test').Page, etiqueta: string) {
  await page.getByLabel('Hora').click();
  await page.getByPlaceholder('Buscar hora…').fill(etiqueta);
  await page.getByRole('option', { name: etiqueta }).click();
}

/** Localiza la fila (Card) del listado que contiene `texto`, entre las que ya traen acciones. */
function filaDelEvento(page: import('@playwright/test').Page, texto: string) {
  return page
    .locator('div', { hasText: texto })
    .filter({ has: page.getByRole('button', { name: 'Editar' }) })
    .last();
}

test.describe('Agenda', () => {
  test('crea, edita y da de baja un evento próximo', async ({ page }) => {
    await loginComoAdmin(page);
    await page.goto('/agenda');

    const descripcion = `Evento E2E ${Date.now()}`;

    await page.getByRole('button', { name: 'Nuevo evento' }).first().click();
    await seleccionarFechaHoy(page);
    await seleccionarHora(page, '10:00 AM');
    await page.getByLabel('Descripción').fill(descripcion);
    await page.getByLabel('Color de etiqueta').click();
    await page.getByRole('button', { name: 'Rojo' }).click();
    await page.getByRole('button', { name: 'Crear evento' }).click();

    await expect(page.getByText('Evento creado')).toBeVisible();
    // El texto aparece dos veces: en el calendario de 5 días (tooltip truncado) y en el listado.
    await expect(page.getByText(descripcion).first()).toBeVisible();
    await expect(page.getByText('10:00 AM').first()).toBeVisible();

    const descripcionEditada = `${descripcion} (editado)`;
    await filaDelEvento(page, descripcion).getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Descripción').fill(descripcionEditada);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Evento actualizado')).toBeVisible();
    await expect(page.getByText(descripcionEditada).first()).toBeVisible();

    await filaDelEvento(page, descripcionEditada).getByRole('button', { name: 'Dar de baja' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Dar de baja' }).click();

    await expect(page.getByText('Evento dado de baja')).toBeVisible();
    await expect(page.getByText(descripcionEditada)).toHaveCount(0);
  });

  test('un evento pasado no se puede editar ni dar de baja, ni desde la UI ni desde la API', async ({ page, request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/sign-in`, {
      data: { username: 'admin', password: 'Solanus2026!' },
    });
    const { data: { token } } = await loginResponse.json();

    const descripcion = `Pasado E2E ${Date.now()}`;
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    const crearResponse = await request.post(`${API_URL}/agenda`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { fechaHora: ayer.toISOString(), descripcion, color: '#22C55E' },
    });
    expect(crearResponse.ok()).toBeTruthy();
    const evento = (await crearResponse.json()).data as { id: number };

    await loginComoAdmin(page);
    await page.goto('/agenda');
    await page.getByRole('button', { name: 'Pasados' }).click();

    // El filtro "Pasados" no renderiza acciones para ningún evento — no solo se ocultan las de este.
    await expect(page.getByText(descripcion)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Dar de baja' })).toHaveCount(0);

    // El backend rechaza la edición/baja aunque se llame directo a la API (enforcement real, no solo de UI).
    const patchResponse = await request.patch(`${API_URL}/agenda/${evento.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { descripcion: 'Intento de editar' },
    });
    expect(patchResponse.status()).toBe(400);
    expect((await patchResponse.json()).code).toBe('EVENTO_PASADO_NO_EDITABLE');

    const deleteResponse = await request.delete(`${API_URL}/agenda/${evento.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteResponse.status()).toBe(400);
  });

  test('usuario_simple no ve Agenda en el menú y /agenda lo redirige', async ({ page, request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/sign-in`, {
      data: { username: 'admin', password: 'Solanus2026!' },
    });
    const { data: { token } } = await loginResponse.json();

    const username = `simple_e2e_${Date.now()}`;
    const crearUsuarioResponse = await request.post(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { username, nombre: 'Simple E2E', rol: 'USUARIO_SIMPLE', password: 'Prueba2026!' },
    });
    expect(crearUsuarioResponse.ok()).toBeTruthy();
    const usuario = (await crearUsuarioResponse.json()).data as { id: number };

    await page.goto('/login');
    await page.getByLabel('Usuario').fill(username);
    await page.getByLabel('Contraseña').fill('Prueba2026!');
    await page.getByRole('button', { name: 'Entrar' }).click();
    // Sin esperar la redirección aquí, el goto('/agenda') de abajo puede ganarle
    // a la petición de login en curso y quedar sin sesión (ver login-roles.spec.ts).
    await expect(page).toHaveURL(/\/asistencia$/);

    const confirmar = page.getByRole('button', { name: 'Empezar captura' });
    if (await confirmar.isVisible().catch(() => false)) {
      await confirmar.click();
    }

    await expect(page.getByRole('link', { name: 'Agenda' })).toHaveCount(0);

    await page.goto('/agenda');
    await expect(page).toHaveURL(/\/asistencia$/);

    await request.delete(`${API_URL}/usuarios/${usuario.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});
