
function getBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_DELCOM_BASEURL;

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return 'https://open-api.delcom.org/api/v1';
}

const BASE_URL = getBaseUrl();

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

function getApiErrorMessage(body: any): string {
  const message =
    typeof body?.message === 'string' && body.message.trim()
      ? body.message
      : '';

  const data = body?.data;

  let details = '';

  if (data && typeof data === 'object') {
    details = Object.values(data)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(
        (value): value is string =>
          typeof value === 'string' && value.length > 0
      )
      .join(', ');
  }

  if (message && details) {
    return `${message}: ${details}`;
  }

  return message || details;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  if (
    options.body &&
    !isFormData &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}/${path.replace(/^\/+/, '')}`,
      {
        ...options,
        headers
      }
    );
  } catch {
    throw new Error(
      'Tidak dapat terhubung ke server. Periksa koneksi internet dan alamat API.'
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getApiErrorMessage(body);

    throw new Error(
      message || `Request gagal (${response.status})`
    );
  }

  if (body?.status === 'fail' || body?.success === false) {
    const message = getApiErrorMessage(body);

    throw new Error(
      message || `Request gagal (${response.status})`
    );
  }

  return (body ?? {}) as T;
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
