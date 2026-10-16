
const BASE_URL =
  import.meta.env.VITE_DELCOM_BASEURL ||
  'https://open-api.delcom.org/api/v1';

export function getToken(): string {
  if (typeof localStorage === 'undefined') {
    return '';
  }

  return localStorage.getItem('token') || '';
}

export function setToken(token: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function clearToken(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (
    !(options.body instanceof FormData) &&
    options.body &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.message || `Request gagal (${response.status})`
    );
  }

  return body as T;
}

export function queryString(
  values: Record<
    string,
    string | number | boolean | undefined | null
  >
): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      params.set(key, String(value));
    }
  });

  const result = params.toString();

  return result ? `?${result}` : '';
}
