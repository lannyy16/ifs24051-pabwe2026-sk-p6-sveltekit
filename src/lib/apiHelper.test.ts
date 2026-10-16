
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  apiRequest,
  clearToken,
  getToken,
  queryString,
  setToken
} from './apiHelper';

describe('Token helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mengembalikan string kosong saat token tidak ada', () => {
    expect(getToken()).toBe('');
  });

  it('menyimpan dan membaca token', () => {
    setToken('abc123');
    expect(getToken()).toBe('abc123');
  });

  it('mengembalikan string kosong saat token tersimpan kosong', () => {
    localStorage.setItem('token', '');
    expect(getToken()).toBe('');
  });

  it('membersihkan token dan profil', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('profile', '{"name":"Karina"}');

    clearToken();

    expect(getToken()).toBe('');
    expect(localStorage.getItem('profile')).toBeNull();
  });

  it('mengembalikan string kosong saat localStorage tidak tersedia', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(getToken()).toBe('');
  });

  it('tidak melakukan apa pun saat setToken tanpa localStorage', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => setToken('abc123')).not.toThrow();
  });

  it('tidak melakukan apa pun saat clearToken tanpa localStorage', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => clearToken()).not.toThrow();
  });
});

describe('queryString', () => {
  it('membuat query string dan meng-encode nilai', () => {
    expect(
      queryString({ page: 2, search: 'web development' })
    ).toBe('?page=2&search=web+development');
  });

  it('mengabaikan string kosong, null, dan undefined', () => {
    expect(
      queryString({
        a: '',
        b: null,
        c: undefined,
        d: 0,
        e: false
      })
    ).toBe('?d=0&e=false');
  });

  it('mengembalikan string kosong untuk objek kosong', () => {
    expect(queryString({})).toBe('');
  });

  it('mengembalikan string kosong saat semua nilai diabaikan', () => {
    expect(
      queryString({ a: '', b: null, c: undefined })
    ).toBe('');
  });

  it('mengubah boolean dan angka menjadi string', () => {
    expect(queryString({ active: true, count: 5 }))
      .toBe('?active=true&count=5');
  });

  it('meng-encode karakter khusus', () => {
    expect(queryString({ search: 'a&b=c' }))
      .toBe('?search=a%26b%3Dc');
  });
});

describe('apiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function response(
    body: unknown = { success: true },
    ok = true,
    status = 200
  ) {
    return {
      ok,
      status,
      json: vi.fn().mockResolvedValue(body)
    };
  }

  it('mengirim GET dan mengembalikan JSON', async () => {
    const body = { success: true, data: [] };
    fetchMock.mockResolvedValue(response(body));

    await expect(apiRequest('/courses')).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain('/courses');
  });

  it('menambahkan bearer token', async () => {
    setToken('abc123');
    fetchMock.mockResolvedValue(response());

    await apiRequest('/users/me');

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('tidak menambahkan Authorization saat token tidak ada', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/users/me');

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.has('Authorization')).toBe(false);
  });

  it('menambahkan Content-Type untuk body biasa', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/courses', {
      method: 'POST',
      body: '{"title":"Web"}'
    });

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('mempertahankan Content-Type yang diberikan', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'data'
    });

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.get('Content-Type')).toBe('text/plain');
  });

  it('tidak menambahkan Content-Type untuk FormData', async () => {
    fetchMock.mockResolvedValue(response());

    const form = new FormData();
    form.append('file', new Blob(['isi']), 'file.txt');

    await apiRequest('/upload', {
      method: 'POST',
      body: form
    });

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('tidak menambahkan Content-Type tanpa body', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/courses');

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('tidak menambahkan Content-Type jika body string kosong', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/courses', {
      method: 'POST',
      body: ''
    });

    const headers = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('meneruskan method dan header khusus', async () => {
    fetchMock.mockResolvedValue(response());

    await apiRequest('/courses', {
      method: 'PATCH',
      headers: { 'X-Test': 'yes' }
    });

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(options.headers);

    expect(options.method).toBe('PATCH');
    expect(headers.get('X-Test')).toBe('yes');
  });

  it('melempar pesan server saat HTTP error', async () => {
    fetchMock.mockResolvedValue(
      response({ message: 'Server bermasalah' }, false, 500)
    );

    await expect(apiRequest('/x')).rejects.toThrow(
      'Server bermasalah'
    );
  });

  it('menggunakan pesan default jika HTTP error tidak memiliki pesan', async () => {
    fetchMock.mockResolvedValue(response({}, false, 404));

    await expect(apiRequest('/x')).rejects.toThrow(
      'Request gagal (404)'
    );
  });

  it('menggunakan pesan default saat respons error bukan JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      }
    });

    await expect(apiRequest('/x')).rejects.toThrow(
      'Request gagal (500)'
    );
  });

  it('melempar error jika success bernilai false', async () => {
    fetchMock.mockResolvedValue(
      response({ success: false, message: 'Data tidak valid' })
    );

    await expect(apiRequest('/x')).rejects.toThrow(
      'Data tidak valid'
    );
  });

  it('menggunakan pesan default jika success false tanpa message', async () => {
    fetchMock.mockResolvedValue(response({ success: false }));

    await expect(apiRequest('/x')).rejects.toThrow(
      'Request gagal (200)'
    );
  });

  it('mengembalikan objek kosong jika body respons bukan JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('Empty response');
      }
    });

    await expect(apiRequest('/x')).resolves.toEqual({});
  });
});

describe('BASE_URL configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('menggunakan URL default jika environment kosong', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_DELCOM_BASEURL', '');

    const { apiRequest: request } = await import('./apiHelper');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    vi.stubGlobal('fetch', fetchMock);

    await request('/test');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://open-api.delcom.org/api/v1/test'
    );
  });

  it('menggunakan URL dari environment jika tersedia', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_DELCOM_BASEURL', 'https://example.test/api');

    const { apiRequest: request } = await import('./apiHelper');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    vi.stubGlobal('fetch', fetchMock);

    await request('/test');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://example.test/api/test'
    );
  });
});
