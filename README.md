# Delcom Courses — Studi Kasus 2

Starter implementasi SvelteKit + TypeScript + Svelte 5 untuk aplikasi Delcom Courses.

## Menjalankan di Windows PowerShell

1. Ekstrak ZIP ke `E:\Semester 5\PABWE\ifs24051-pabwe2026-sk-p6-sveltekit` (atau lokasi lain).
2. Buka folder yang berisi `package.json` di VS Code.
3. Salin `.env.example` menjadi `.env`.
4. Jalankan:

```powershell
bun install
bun run dev
```

Buka `http://localhost:3005`.

Untuk validasi/build:

```powershell
bun run check
bun run build
bun start
```

## Catatan penting

- API dasar: `https://open-api.delcom.org/api/v1`.
- Login diperlukan untuk endpoint yang membutuhkan bearer token. Gunakan akun API yang memang disediakan/didaftarkan untuk praktikum.
- Implementasi API pada `src/features/courses/api/courseApi.ts` mengikuti pola endpoint yang dijabarkan pada brief tugas. Jika nama endpoint pada dokumentasi resmi berbeda, sesuaikan di file tersebut.
- API profile dan user juga diletakkan terpusat pada `src/features/users/api/usersApi.ts`.
- Ini merupakan paket kode awal yang mencakup halaman utama, auth, profil, daftar pengguna, detail kursus, materi video, helpers, dan API wrappers. Pengujian 100% coverage belum dijamin oleh starter ini; tambahkan test untuk seluruh modul dan cocokkan endpoint dengan dokumentasi praktikum sebelum dikumpulkan.
- Pastikan proyek memakai versi package/config yang diwajibkan dosen atau versi dari latihan SvelteKit sebelumnya, jika tersedia.


## Menjalankan dan menguji

```powershell
bun install
bun run check
bun run test
bun run test:coverage
bun run build
bun run dev
```

Konfigurasi URL API dapat diatur melalui `VITE_DELCOM_BASEURL` di `.env` (gunakan `.env.example` sebagai acuan). Jangan commit token atau rahasia dari `.env`.

Tes otomatis mencakup helper dan API wrapper. Tetap cocokkan endpoint/struktur respons dengan dokumentasi resmi praktikum Delcom sebelum pengumpulan; tes unit dengan mock tidak membuktikan bahwa server API nyata menerima endpoint atau kredensial.
