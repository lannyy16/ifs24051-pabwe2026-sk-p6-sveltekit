import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../lib/apiHelper';
import { changePassword, getMe, listUsers, updateMe, updatePhoto } from './usersApi';
vi.mock('../../../lib/apiHelper', () => ({ apiRequest: vi.fn() }));
const req = vi.mocked(apiRequest);
describe('usersApi', () => {
  beforeEach(() => req.mockReset());
  it('getMe memanggil endpoint me', async () => { req.mockResolvedValue({} as never); await getMe(); expect(req).toHaveBeenCalledWith('/users/me'); });
  it('updateMe mengirim data JSON', async () => { req.mockResolvedValue({} as never); await updateMe({ name: 'K' }); expect(req).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: JSON.stringify({ name: 'K' }) }); });
  it('updatePhoto mengirim FormData', async () => {
    req.mockResolvedValue({} as never); const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    await updatePhoto(file); const call = req.mock.calls[0]; expect(call[0]).toBe('/users/me/photo'); expect(call[1]?.method).toBe('POST');
    expect(call[1]?.body).toBeInstanceOf(FormData); expect((call[1]?.body as FormData).get('photo')).toBe(file);
  });
  it('changePassword mengirim password lama dan baru', async () => { req.mockResolvedValue({} as never); await changePassword('old', 'new'); expect(req).toHaveBeenCalledWith('/users/me/password', { method: 'PUT', body: JSON.stringify({ old_password: 'old', new_password: 'new' }) }); });
  it('listUsers memanggil endpoint users', async () => { req.mockResolvedValue({} as never); await listUsers(); expect(req).toHaveBeenCalledWith('/users'); });
});
