
<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import {
    getCourse,
    rateCourse,
    createContent,
    deleteContent,
    uploadCover,
    updateCourse
  } from '../../../features/courses/api/courseApi';
  import {
    GraduationCap,
    ArrowLeft,
    Star,
    Plus,
    Video
  } from 'lucide-svelte';

  let course = $state<any>(null);
  let error = $state('');
  let title = $state('');
  let description = $state('');
  let contentTitle = $state('');
  let videoUrl = $state('');
  let contentDescription = $state('');
  let rating = $state(5);
  let edit = $state(false);
  let adding = $state(false);
  let profile = $state<any>({});

  const courseId = $derived(page.params.courseId ?? '');

  const isOwner = $derived(
    String(course?.user_id ?? '') ===
      String(profile?.id ?? profile?.user_id ?? '')
  );

  async function load() {
    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    try {
      error = '';

      const response: any = await getCourse(courseId);

      course =
        response?.data?.course ??
        response?.data ??
        null;

      if (typeof localStorage !== 'undefined') {
        try {
          profile = JSON.parse(
            localStorage.getItem('profile') ?? '{}'
          );
        } catch {
          profile = {};
        }
      }

      title = course?.title ?? '';
      description = course?.description ?? '';
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal memuat detail kursus.';
    }
  }

  onMount(() => {
    void load();
  });

  async function save() {
    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    try {
      error = '';

      await updateCourse(courseId, title, description);

      edit = false;
      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal menyimpan informasi kursus.';
    }
  }

  async function addContent(event: SubmitEvent) {
    event.preventDefault();

    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    try {
      error = '';

      await createContent(courseId, {
        title: contentTitle,
        description: contentDescription,
        video_url: videoUrl
      });

      adding = false;
      contentTitle = '';
      contentDescription = '';
      videoUrl = '';

      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal menambahkan materi.';
    }
  }

  async function rate() {
    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    try {
      error = '';

      await rateCourse(courseId, Number(rating));

      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal memberikan penilaian.';
    }
  }

  async function cover(event: Event) {
    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      error = '';

      await uploadCover(courseId, file);

      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal mengunggah sampul.';
    } finally {
      input.value = '';
    }
  }

  async function removeContent(contentId: string | number) {
    if (!courseId) {
      error = 'ID kursus tidak ditemukan.';
      return;
    }

    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus materi ini?'
    );

    if (!confirmed) return;

    try {
      error = '';

      await deleteContent(courseId, contentId);

      await load();
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal menghapus materi.';
    }
  }
</script>

<svelte:head>
  <title>
    {course?.title ?? 'Detail Kursus'} - Delcom Courses
  </title>
  <meta
    name="description"
    content="Detail kursus dan materi pembelajaran Delcom Courses."
  />
</svelte:head>

<div class="shell">
  <header class="topbar">
    <a class="brand" href="/">
      <GraduationCap size={27} />
      <span>Delcom <b>Courses</b></span>
    </a>

    <nav>
      <a href="/">Semua Kursus</a>
      <a href="/users">Pengguna</a>
      <a href="/profile">Profil</a>
    </nav>
  </header>

  <main class="container detail">
    <a href="/" class="back">
      <ArrowLeft size={17} />
      Kembali ke kursus
    </a>

    {#if error}
      <div class="alert" role="alert">
        {error}
      </div>
    {/if}

    {#if course}
      <section class="detail-hero">
        {#if course.cover}
          <img
            src={course.cover}
            alt="Sampul kursus {course.title}"
          />
        {:else}
          <GraduationCap size={62} />
        {/if}

        <div>
          <span class="eyebrow">DETAIL KURSUS</span>
          <h1>{course.title}</h1>
          <p>
            {course.description ||
              'Belajar bersama komunitas Delcom.'}
          </p>
        </div>
      </section>

      {#if isOwner}
        <section class="panel">
          <h2>Kelola Kursus</h2>

          {#if edit}
            <form
              class="form-grid"
              onsubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <label>
                Judul kursus
                <input bind:value={title} required />
              </label>

              <label>
                Deskripsi kursus
                <textarea bind:value={description}></textarea>
              </label>

              <div class="actions">
                <button class="primary" type="submit">
                  Simpan Perubahan
                </button>

                <button
                  class="secondary"
                  type="button"
                  onclick={() => (edit = false)}
                >
                  Batal
                </button>
              </div>
            </form>
          {:else}
            <div class="actions">
              <button
                class="secondary"
                onclick={() => (edit = true)}
              >
                Ubah Informasi
              </button>

              <label class="secondary upload">
                Ubah Sampul
                <input
                  type="file"
                  accept="image/*"
                  onchange={cover}
                />
              </label>

              <button
                class="primary"
                onclick={() => (adding = !adding)}
              >
                <Plus size={16} />
                Tambah Materi
              </button>
            </div>
          {/if}

          {#if adding}
            <form
              class="form-grid"
              onsubmit={addContent}
            >
              <label>
                Judul materi
                <input
                  bind:value={contentTitle}
                  required
                />
              </label>

              <label>
                Deskripsi materi
                <textarea
                  bind:value={contentDescription}
                ></textarea>
              </label>

              <label>
                URL video YouTube
                <input
                  bind:value={videoUrl}
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <div class="actions">
                <button class="primary" type="submit">
                  Simpan Materi
                </button>

                <button
                  class="secondary"
                  type="button"
                  onclick={() => (adding = false)}
                >
                  Batal
                </button>
              </div>
            </form>
          {/if}
        </section>
      {/if}

      <section class="section-heading">
        <div>
          <h2>Materi Kursus</h2>
          <p>Ikuti materi sesuai urutan belajar.</p>
        </div>
      </section>

      {#if course.contents?.length}
        <div class="content-list">
          {#each course.contents as item (item.id)}
            <article class="content-row">
              <span class="video-icon">
                <Video size={22} />
              </span>

              <div class="grow">
                <h3>{item.title}</h3>
                <p>
                  {item.description || 'Materi pembelajaran'}
                </p>
              </div>

              <a
                class="secondary small"
                href={`/courses/${courseId}/contents/${item.id}`}
              >
                Buka Materi
              </a>

              {#if isOwner}
                <button
                  class="danger small"
                  onclick={() => void removeContent(item.id)}
                >
                  Hapus
                </button>
              {/if}
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty">
          Belum ada materi yang ditambahkan.
        </div>
      {/if}

      <section class="panel rating">
        <h2>Beri Penilaian Kursus</h2>

        <div class="rating-controls">
          <select bind:value={rating} aria-label="Rating kursus">
            {#each [1, 2, 3, 4, 5] as number}
              <option value={number}>
                {number} bintang
              </option>
            {/each}
          </select>

          <button class="primary" onclick={rate}>
            <Star size={16} />
            Kirim Rating
          </button>
        </div>
      </section>
    {:else}
      <div class="empty">
        {error || 'Memuat detail kursus...'}
      </div>
    {/if}
  </main>
</div>
