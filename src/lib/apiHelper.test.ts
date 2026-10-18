
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  apiRequest,
  clearToken,
  getToken,
  queryString,
  setToken
} from './apiHelper';

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('getToken', () => {
    it('mengembalikan string kosong jika token belum tersedia', () => {
      expect(getToken()).toBe('');
    });

    it('mengembalikan token yang tersimpan', () => {
      localStorage.setItem('token', 'token-test');
      expect(getToken()).toBe('token-test');
    });

    it('mengembalikan string kosong jika localStorage tidak tersedia', () => {
      vi.stubGlobal('localStorage', undefined);
      expect(getToken()).toBe('');
    });
  });

  describe('setToken', () => {
    it('menyimpan token ke localStorage', () => {
      setToken('token-baru');
      expect(localStorage.getItem('token')).toBe('token-baru');
    });

    it('tidak error ketika localStorage tidak tersedia', () => {
      vi.stubGlobal('localStorage', undefined);
      expect(() => setToken('token-baru')).not.toThrow();
    });
  });

  describe('clearToken', () => {
    it('menghapus token dan profile', () => {
      localStorage.setItem('token', 'token-test');
      localStorage.setItem('profile', '{"name":"Karina"}');

      clearToken();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('profile')).toBeNull();
    });

    it('tidak error ketika localStorage tidak tersedia', () => {
      vi.stubGlobal('localStorage', undefined);
      expect(() => clearToken()).not.toThrow();
    });
  });

  describe('queryString', () => {
    it('membuat query string dari parameter', () => {
      expect(queryString({ page: 1, search: 'Karina' })).toBe(
        '?page=1&search=Karina'
      );
    });

    it('mengodekan karakter khusus', () => {
      expect(queryString({ search: 'hello world' })).toBe(
        '?search=hello+world'
      );
    });

    it('melewati nilai kosong, null, dan undefined', () => {
      expect(
        queryString({
          empty: '',
          nil: null,
          missing: undefined,
          page: 1
        })
      ).toBe('?page=1');
    });

    it('mendukung boolean dan angka nol', () => {
      expect(queryString({ active: false, page: 0 })).toBe(
        '?active=false&page=0'
      );
    });

    it('mengembalikan string kosong jika tidak ada parameter', () => {
      expect(queryString({})).toBe('');
    });
  });

  describe('apiRequest', () => {
    it('melakukan GET dan mengembalikan respons JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ status: 'success', data: [] })
        })
      );

      await expect(apiRequest('users')).resolves.toEqual({
        status: 'success',
        data: []
      });
    });

    it('mengirim bearer token jika tersedia', async () => {
      localStorage.setItem('token', 'token-test');

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);
      await apiRequest('users');

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).get('Authorization')).toBe(
        'Bearer token-test'
      );
    });

    it('tidak mengirim bearer token jika tidak tersedia', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);
      await apiRequest('users');

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).has('Authorization')).toBe(false);
    });

    it('mengatur header Accept menjadi application/json', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);
      await apiRequest('users');

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).get('Accept')).toBe(
        'application/json'
      );
    });

    it('mengatur Content-Type untuk body JSON', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);

      await apiRequest('users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Karina' })
      });

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).get('Content-Type')).toBe(
        'application/json'
      );
    });

    it('mempertahankan Content-Type yang telah ditentukan', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);

      await apiRequest('users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/custom' },
        body: '{"name":"Karina"}'
      });

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).get('Content-Type')).toBe(
        'application/custom'
      );
    });

    it('tidak mengatur Content-Type otomatis untuk FormData', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);

      const formData = new FormData();
      formData.append('name', 'Karina');

      await apiRequest('users', {
        method: 'POST',
        body: formData
      });

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(new Headers(options.headers).has('Content-Type')).toBe(false);
      expect(options.body).toBe(formData);
    });

    it('mempertahankan method dan header tambahan', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);

      await apiRequest('users', {
        method: 'PATCH',
        headers: { 'X-Test': 'test-value' }
      });

      const options = fetchMock.mock.calls[0][1] as RequestInit;

      expect(options.method).toBe('PATCH');
      expect(new Headers(options.headers).get('X-Test')).toBe('test-value');
    });

    it('menghapus garis miring berlebih pada path', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      });

      vi.stubGlobal('fetch', fetchMock);
      await apiRequest('///users');

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://open-api.delcom.org/api/v1/users'
      );
    });

    it('mengubah kegagalan jaringan menjadi pesan error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Tidak dapat terhubung ke server. Periksa koneksi internet dan alamat API.'
      );
    });

    it('menampilkan pesan dan detail validasi server', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({
            message: 'Validasi gagal',
            data: {
              email: ['Email tidak valid'],
              password: ['Password terlalu pendek']
            }
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Validasi gagal: Email tidak valid, Password terlalu pendek'
      );
    });

    it('menggunakan detail jika pesan server kosong', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({
            message: '',
            data: { email: ['Email tidak valid'] }
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Email tidak valid'
      );
    });

    it('mengabaikan detail error yang bukan string', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({
            success: false,
            data: { field: [null, 123, 'Data salah'] }
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow('Data salah');
    });

    it('menangani data error yang tidak tersedia', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            message: 'Permintaan tidak valid'
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Permintaan tidak valid'
      );
    });

    it('menangani data error berupa string', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            message: '',
            data: 'Data tidak valid'
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Request gagal (400)'
      );
    });

    it('menangani data error berupa array', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            message: '',
            data: ['Data tidak valid']
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Data tidak valid'
      );
    });

    it('mengembalikan error default untuk HTTP 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({})
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Request gagal (404)'
      );
    });

    it('menangani respons error yang bukan JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => {
            throw new Error('Invalid JSON');
          }
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Request gagal (500)'
      );
    });

    it('menangani status fail dari API', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            status: 'fail',
            message: 'Permintaan gagal'
          })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Permintaan gagal'
      );
    });

    it('menangani success false tanpa pesan', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ success: false })
        })
      );

      await expect(apiRequest('users')).rejects.toThrow(
        'Request gagal (200)'
      );
    });

    it('mengembalikan objek kosong jika respons JSON bernilai null', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => null
        })
      );

      await expect(apiRequest('users')).resolves.toEqual({});
    });

    it('mengembalikan objek kosong jika JSON gagal dibaca pada respons sukses', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 204,
          json: async () => {
            throw new Error('No content');
          }
        })
      );

      await expect(apiRequest('users')).resolves.toEqual({});
    });
  });
});

describe('apiHelper - BASE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('menggunakan URL default ketika environment variable kosong', async () => {
    vi.stubEnv('VITE_DELCOM_BASEURL', '');
    vi.resetModules();

    const { apiRequest } = await import('./apiHelper');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success' })
    });

    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('users');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://open-api.delcom.org/api/v1/users'
    );
  });

  it('menggunakan URL default ketika environment variable undefined', async () => {
    vi.stubEnv('VITE_DELCOM_BASEURL', undefined);
    vi.resetModules();

    const { apiRequest } = await import('./apiHelper');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success' })
    });

    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('users');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://open-api.delcom.org/api/v1/users'
    );
  });

  it('menggunakan URL environment dan menghapus slash akhir', async () => {
    vi.stubEnv('VITE_DELCOM_BASEURL', 'https://example.com/api/v1/');
    vi.resetModules();

    const { apiRequest } = await import('./apiHelper');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success' })
    });

    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('users');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://example.com/api/v1/users'
    );
  });
});
