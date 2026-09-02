/**
 * Cliente HTTP hacia la API de Comedor Solanus.
 * Envuelve la respuesta uniforme del backend { data, success, message }
 * y adjunta el JWT guardado en localStorage a cada petición.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'comedor-solanus:token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) return undefined as T;

  const body = await response.json();

  if (!response.ok) {
    const error = body as ErrorResponseBody;
    throw new ApiError(response.status, error.code ?? 'UNKNOWN_ERROR', error.description ?? 'Ocurrió un error inesperado', error.data);
  }

  return (body as SchemaResponse<T>).data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
