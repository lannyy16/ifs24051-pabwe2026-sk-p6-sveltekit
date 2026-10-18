<script lang="ts">
  import { onMount } from 'svelte';
  import {
    GraduationCap,
    Search,
    Plus,
    BookOpen
  } from 'lucide-svelte';

  import {
    listCourses,
    createCourse,
    deleteCourse
  } from '../features/courses/api/courseApi';

  import { logout } from '../features/auth/api/authApi';
  import type { Course } from '../lib/types';

  let courses = $state<Course[]>([]);
  let loading = $state(true);
  let error = $state('');
  let search = $state('');
  let mine = $state(false);
  let showAdd = $state(false);
  let title = $state('');
  let description = $state('');
  let profile = $state<any>({});

  async function load() {
    loading = true;
    error = '';

    try {
      const response: any = await listCourses();

      courses =
        response?.data?.courses ||
        response?.data?.data?.courses ||
        [];

      if (typeof localStorage !== 'undefined') {
        profile = JSON.parse(
          localStorage.getItem('profile') || '{}'
        );
      }
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal memuat kursus';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  const filtered = $derived(
    courses.filter(
      (course) =>
        course.title
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (
          !mine ||
          String(course.user_id) ===
            String(profile?.id || profile?.user_id)
        )
    )
  );

  async function add() {
    if (!title.trim()) return;

    try {
      await createCourse(title, description);

      title = '';
      description = '';
      showAdd = false;

      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal menambah kursus';
    }
  }

  async function remove(course: Course) {
    if (!confirm(`Hapus kursus "${course.title}"?`)) {
      return;
    }

    try {
      await deleteCourse(course.id);
      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal menghapus kursus';
    }
  }
</script>

<div class="shell">
  <header class="topbar">
    <a class="brand" href="/">
      <span class="brand-icon" aria-hidden="true">
        <GraduationCap size={24} />
      </span>
      <span>Delcom <b>Courses</b></span>
    </a>

    <nav aria-label="Navigasi utama">
      <a href="/">Semua Kursus</a>
      <a href="/users">Pengguna</a>
      <a href="/profile">Profil</a>
      <a href="/auth/login">Masuk</a>
    </nav>
  </header>

  <main class="container">
    <section class="hero">
      <div>
        <span class="eyebrow">RUANG BELAJAR DIGITAL</span>

        <h1>
          Temukan kursus,
          <br />
          <em>kembangkan potensimu.</em>
        </h1>

        <p>
          Belajar hal baru dan bagikan pengetahuan
          bersama komunitas Delcom.
        </p>
      </div>

      <div class="hero-art" aria-hidden="true">
        <GraduationCap size={96} />
        <span>LEARN · CREATE · SHARE</span>
      </div>
    </section>

    <section aria-labelledby="courses-heading">
      <div class="section-heading">
        <div>
          <h2 id="courses-heading">Jelajahi Kursus</h2>
          <p>Pilih kursus yang sesuai dengan minatmu.</p>
        </div>

        <button
          class="primary"
          type="button"
          aria-expanded={showAdd}
          onclick={() => (showAdd = !showAdd)}
        >
          <Plus size={18} aria-hidden="true" />
          Buat Kursus
        </button>
      </div>

      {#if showAdd}
        <form
          class="panel form-grid"
          onsubmit={(event) => {
            event.preventDefault();
            add();
          }}
        >
          <label>
            Judul kursus
            <input
              bind:value={title}
              required
              placeholder="Contoh: Dasar Pemrograman"
            />
          </label>

          <label>
            Deskripsi
            <textarea
              bind:value={description}
              placeholder="Ceritakan tentang kursus ini"
            ></textarea>
          </label>

          <div class="actions">
            <button class="primary" type="submit">
              Simpan Kursus
            </button>

            <button
              class="secondary"
              type="button"
              onclick={() => (showAdd = false)}
            >
              Batal
            </button>
          </div>
        </form>
      {/if}

      <div class="toolbar">
        <label class="search">
          <Search size={18} aria-hidden="true" />
          <input
            bind:value={search}
            placeholder="Cari kursus..."
            aria-label="Cari kursus"
          />
        </label>

        <label class="check">
          <input type="checkbox" bind:checked={mine} />
          Kursus saya
        </label>
      </div>

      {#if error}
        <div class="alert" role="alert">
          <p>{error}</p>
          <button
            type="button"
            class="secondary"
            onclick={load}
          >
            Coba lagi
          </button>
        </div>
      {/if}

      {#if loading}
        <p class="empty" role="status">Memuat kursus...</p>
      {:else if filtered.length === 0}
        <div class="empty">
          <BookOpen size={36} aria-hidden="true" />
          <h3>Belum ada kursus ditemukan</h3>
          <p>Coba kata kunci lain atau buat kursus baru.</p>
        </div>
      {:else}
        <div class="course-grid">
          {#each filtered as course (course.id)}
            <article class="course-card">
              <div class="cover">
                {#if course.cover}
                  <img
                    src={course.cover}
                    alt="Sampul {course.title}"
                  />
                {:else}
                  <GraduationCap
                    size={44}
                    aria-hidden="true"
                  />
                {/if}

                <span class="tag">KURSUS</span>
              </div>

              <div class="course-body">
                <h3>{course.title}</h3>

                <p>
                  {course.description ||
                    'Belajar bersama komunitas Delcom.'}
                </p>

                <div class="card-bottom">
                  <span>
                    {course.students?.length || 0} peserta
                  </span>

                  <div class="actions">
                    <a
                      class="secondary small"
                      href={'/courses/' + course.id}
                    >
                      Detail
                    </a>

                    {#if String(course.user_id) === String(profile?.id || profile?.user_id)}
                      <button
                        class="danger small"
                        type="button"
                        onclick={() => remove(course)}
                      >
                        Hapus
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <footer>
    © 2026 Delcom Courses · Belajar bersama, tumbuh bersama.
  </footer>
</div>