/**
 * Cliente HTTP hacia la API de Comedor Solanus.
 * Envuelve la respuesta uniforme del backend { data, success, message }
 * y adjunta el JWT guardado en localStorage a cada petición.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const TOKEN_STORAGE_KEY = 'comedor-solanus:token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Los archivos (foto, INE, evidencias) se sirven como estáticos en la raíz del servidor, fuera del prefijo /api. */
export function resolverUrlArchivo(rutaPublica: string): string {
  return `${SERVER_ROOT_URL}${rutaPublica}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly data?: unknown;

  constructor(status: number, code: string, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

interface SchemaResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface ErrorResponseBody {
  code: string;
  description: string;
  data?: unknown;
}

/** Lee el cuerpo de error de una respuesta no-ok y lanza el `ApiError` correspondiente. */
async function lanzarErrorDeRespuesta(response: Response): Promise<never> {
  let error: ErrorResponseBody = { code: 'UNKNOWN_ERROR', description: 'Ocurrió un error inesperado' };
  try {
    error = (await response.json()) as ErrorResponseBody;
  } catch {
    // El cuerpo no era JSON; se mantiene el mensaje genérico.
  }
  throw new ApiError(response.status, error.code ?? 'UNKNOWN_ERROR', error.description ?? 'Ocurrió un error inesperado', error.data);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  // FormData fija su propio Content-Type con boundary; forzarlo aquí rompe el multipart.
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) return undefined as T;

  if (!response.ok) return lanzarErrorDeRespuesta(response);

  const body = (await response.json()) as SchemaResponse<T>;
  return body.data;
}

/** Descarga un archivo binario (PDF, xlsx) y dispara el guardado en el navegador. */
async function descargar(path: string, filename: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) return lanzarErrorDeRespuesta(response);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
  descargar,
};
