const DEFAULT_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Unico ponto que faz fetch, parse e tratamento de erro. A mensagem do
// servidor ({ error }) tem prioridade; `fallback` so e usado se ela faltar.
export async function request(path, { method = 'GET', body, fallback } = {}) {
  const init = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const data = await readBody(res);
  if (!res.ok) {
    const serverMessage = data?.error || data?.message || (typeof data === 'string' && data);
    throw new ApiError(serverMessage || `${fallback} (HTTP ${res.status})`, res.status);
  }
  return data;
}
