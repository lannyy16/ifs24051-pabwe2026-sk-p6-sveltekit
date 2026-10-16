import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../lib/apiHelper';
import {
  createContent, createCourse, deleteAllCourses, deleteContent, deleteCourse,
  getContent, getCourse, leaveCourse, listCourses, listParticipants, rateCourse,
  setContentStatus, updateContent, updateCourse, uploadCover
} from './courseApi';
vi.mock('../../../lib/apiHelper', () => ({ apiRequest: vi.fn(), queryString: (values: Record<string, unknown>) => {
  const p = new URLSearchParams(); Object.entries(values).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)); });
  const s = p.toString(); return s ? `?${s}` : '';
} }));
const req = vi.mocked(apiRequest);
describe('courseApi', () => {
  beforeEach(() => req.mockReset());
  it('listCourses menambahkan filter query', async () => { req.mockResolvedValue({} as never); await listCourses({ search: 'web', page: 2 }); expect(req).toHaveBeenCalledWith('/courses?search=web&page=2'); });
  it('listCourses mendukung parameter default', async () => { req.mockResolvedValue({} as never); await listCourses(); expect(req).toHaveBeenCalledWith('/courses'); });
  it('getCourse memanggil detail', async () => { req.mockResolvedValue({} as never); await getCourse(7); expect(req).toHaveBeenCalledWith('/courses/7'); });
  it('createCourse mengirim title dan description', async () => { req.mockResolvedValue({} as never); await createCourse('Web', 'Belajar'); expect(req).toHaveBeenCalledWith('/courses', { method: 'POST', body: JSON.stringify({ title: 'Web', description: 'Belajar' }) }); });
  it('updateCourse mengirim perubahan', async () => { req.mockResolvedValue({} as never); await updateCourse(7, 'Web 2', 'Updated'); expect(req).toHaveBeenCalledWith('/courses/7', { method: 'PUT', body: JSON.stringify({ title: 'Web 2', description: 'Updated' }) }); });
  it('deleteCourse menghapus kursus tertentu', async () => { req.mockResolvedValue({} as never); await deleteCourse(7); expect(req).toHaveBeenCalledWith('/courses/7', { method: 'DELETE' }); });
  it('deleteAllCourses menghapus semua kursus', async () => { req.mockResolvedValue({} as never); await deleteAllCourses(); expect(req).toHaveBeenCalledWith('/courses', { method: 'DELETE' }); });
  it('uploadCover mengirim FormData', async () => { req.mockResolvedValue({} as never); const f = new File(['x'], 'cover.png'); await uploadCover(7, f); expect(req.mock.calls[0][0]).toBe('/courses/7/cover'); expect(req.mock.calls[0][1]?.method).toBe('POST'); expect((req.mock.calls[0][1]?.body as FormData).get('cover')).toBe(f); });
  it('listParticipants mengambil peserta', async () => { req.mockResolvedValue({} as never); await listParticipants(7); expect(req).toHaveBeenCalledWith('/courses/7/students'); });
  it('leaveCourse keluar dari kursus', async () => { req.mockResolvedValue({} as never); await leaveCourse(7); expect(req).toHaveBeenCalledWith('/courses/7/leave', { method: 'DELETE' }); });
  it('rateCourse mengirim rating', async () => { req.mockResolvedValue({} as never); await rateCourse(7, 5); expect(req).toHaveBeenCalledWith('/courses/7/rating', { method: 'POST', body: JSON.stringify({ rating: 5 }) }); });
  it('createContent membuat materi', async () => { req.mockResolvedValue({} as never); await createContent(7, { title: 'Intro' }); expect(req).toHaveBeenCalledWith('/courses/7/contents', { method: 'POST', body: JSON.stringify({ title: 'Intro' }) }); });
  it('updateContent memperbarui materi', async () => { req.mockResolvedValue({} as never); await updateContent(7, 3, { title: 'Updated' }); expect(req).toHaveBeenCalledWith('/courses/7/contents/3', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }); });
  it('getContent memakai endpoint materi global', async () => { req.mockResolvedValue({} as never); await getContent(3); expect(req).toHaveBeenCalledWith('/courses/-/contents/3'); });
  it('deleteContent menghapus materi', async () => { req.mockResolvedValue({} as never); await deleteContent(7, 3); expect(req).toHaveBeenCalledWith('/courses/7/contents/3', { method: 'DELETE' }); });
  it('setContentStatus mengubah status selesai', async () => { req.mockResolvedValue({} as never); await setContentStatus(7, 3, 1); expect(req).toHaveBeenCalledWith('/courses/7/contents/3/status', { method: 'PUT', body: JSON.stringify({ is_completed: 1 }) }); });
});
