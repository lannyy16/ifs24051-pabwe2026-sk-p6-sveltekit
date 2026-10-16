import { describe, expect, it } from 'vitest';
import { isValidEmail, getInitials, formatDate, extractYouTubeId } from './toolsHelper';

describe('isValidEmail', () => {
  it.each([
    ['user@example.com', true], [' user@example.com ', true],
    ['user.name+tag@sub.example.co.id', true], ['', false],
    ['   ', false], ['userexample.com', false], ['user@', false],
    ['@example.com', false], ['user@example', false], ['user @example.com', false],
  ])('memvalidasi %s', (value, expected) => expect(isValidEmail(value)).toBe(expected));
});
describe('getInitials', () => {
  it.each([
    ['Karina Putri Sion', 'KP'], ['Karina', 'K'], ['  Karina   Putri  ', 'KP'],
    ['', ''], ['   ', ''], ['karina putri', 'KP'],
  ])('membuat inisial dari %s', (value, expected) => expect(getInitials(value)).toBe(expected));
  it('menggunakan nilai default saat argumen tidak diberikan', () => expect(getInitials()).toBe(''));
});
describe('formatDate', () => {
  it('mengembalikan strip saat tanggal tidak diberikan', () => expect(formatDate()).toBe('-'));
  it('mengembalikan strip saat tanggal kosong', () => expect(formatDate('')).toBe('-'));
  it('mengembalikan strip untuk tanggal tidak valid', () => expect(formatDate('tanggal-salah')).toBe('-'));
  it('memformat tanggal valid dalam locale Indonesia', () => {
    const result = formatDate('2025-01-15T12:00:00Z');
    expect(result).not.toBe('-'); expect(result).toContain('2025');
  });
});
describe('extractYouTubeId', () => {
  const id = 'abcdefghijk';
  it.each([
    [`https://youtu.be/${id}`, id],
    [`https://www.youtube.com/watch?v=${id}`, id],
    [`https://www.youtube.com/embed/${id}`, id],
    [`https://www.youtube.com/shorts/${id}`, id],
    ['https://example.com/video', ''],
    ['https://youtu.be/short', ''],
    ['', ''],
  ])('mengekstrak ID dari %s', (url, expected) => expect(extractYouTubeId(url)).toBe(expected));
  it('menggunakan nilai default jika URL tidak diberikan', () => expect(extractYouTubeId()).toBe(''));
});
