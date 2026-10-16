import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, clearToken, getToken } from '../../../lib/apiHelper';
import { getProfile, login, logout, register } from './authApi';
vi.mock('../../../lib/apiHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/apiHelper')>();
  return { ...actual, apiRequest: vi.fn(), setToken: actual.setToken, clearToken: actual.clearToken };
});
const mockedRequest = vi.mocked(apiRequest);
describe('authApi', () => {
  beforeEach(() => { localStorage.clear(); mockedRequest.mockReset(); });
  afterEach(() => vi.restoreAllMocks());
  it('login menyimpan token dan profil dari data.user', async () => {
    mockedRequest.mockResolvedValue({ data: { token: 't1', user: { id: 1, name: 'Karina' } } } as never);
    await login('a@b.com', 'secret');
    expect(mockedRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'a@b.com', password: 'secret' }) });
    expect(getToken()).toBe('t1'); expect(JSON.parse(localStorage.getItem('profile')!)).toEqual({ id: 1, name: 'Karina' });
  });
  it('login mendukung token dan profile di root', async () => {
    mockedRequest.mockResolvedValue({ token: 'root-token', data: { profile: { id: 2 } } } as never);
    await login('a@b.com', 'x'); expect(getToken()).toBe('root-token');
    expect(JSON.parse(localStorage.getItem('profile')!)).toEqual({ id: 2 });
  });
  it('login tetap berhasil jika respons tidak memiliki token/profil', async () => {
    mockedRequest.mockResolvedValue({ success: true } as never);
    await expect(login('a@b.com', 'x')).resolves.toEqual({ success: true });
    expect(localStorage.getItem('profile')).toBeNull();
  });
  it('register mengirim data', async () => {
    mockedRequest.mockResolvedValue({ success: true } as never);
    await register('Karina', 'a@b.com', 'secret');
    expect(mockedRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Karina', email: 'a@b.com', password: 'secret' }) });
  });
  it('logout membersihkan token dan profil', () => {
    localStorage.setItem('token', 't'); localStorage.setItem('profile', '{}');
    logout(); expect(getToken()).toBe(''); expect(localStorage.getItem('profile')).toBeNull();
  });
  it('getProfile memanggil endpoint profil', async () => {
    mockedRequest.mockResolvedValue({ data: {} } as never);
    await getProfile(); expect(mockedRequest).toHaveBeenCalledWith('/users/me');
  });
});
