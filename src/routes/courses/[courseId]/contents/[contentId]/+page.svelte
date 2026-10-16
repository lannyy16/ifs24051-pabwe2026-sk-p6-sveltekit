
<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  import {
    getContent,
    setContentStatus
  } from '../../../../../features/courses/api/courseApi';

  import {
    GraduationCap,
    ArrowLeft,
    Video,
    CheckCircle
  } from 'lucide-svelte';

  import {
    extractYouTubeId
  } from '../../../../../lib/toolsHelper';

  let item = $state<any>(null);
  let error = $state('');
  let completed = $state(false);
  let saving = $state(false);

  const contentId = $derived(
    page.params.contentId ?? ''
  );

  const courseId = $derived(
    page.params.courseId ?? ''
  );

  onMount(() => {
    void loadContent();
  });

  async function loadContent() {
    if (!contentId) {
      error = 'ID materi tidak ditemukan.';
      return;
    }

    try {
      error = '';

      const response: any = await getContent(contentId);

      item =
        response?.data?.course_content ??
        response?.data ??
        null;

      completed = Boolean(
        item?.is_completed ??
        item?.completed ??
        false
      );
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal memuat materi.';
    }
  }

  const videoId = $derived(
    extractYouTubeId(
      item?.video_url ??
      item?.youtube_url ??
      ''
    )
  );

  async function toggle() {
    if (!courseId || !contentId) {
      error = 'ID kursus atau materi tidak ditemukan.';
      return;
    }

    if (saving) return;

    try {
      saving = true;
      error = '';

      const nextStatus = completed ? 0 : 1;

      await setContentStatus(
        courseId,
        contentId,
        nextStatus
      );

      completed = !completed;
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Gagal memperbarui status materi.';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>
    {item?.title ?? 'Materi Kursus'} - Delcom Courses
  </title>
  <meta
    name="description"
    content="Pelajari materi kursus melalui Delcom Courses."
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
      <a href="/profile">Profil</a>
    </nav>
  </header>

  <main class="container detail">
    <a
      class="back"
      href={courseId ? `/courses/${courseId}` : '/'}
    >
      <ArrowLeft size={17} />
      Kembali ke kursus
    </a>

    {#if error}
      <div class="alert" role="alert">
        {error}
      </div>
    {/if}

    {#if item}
      <section class="panel lesson">
        <span class="eyebrow">
          <Video size={15} />
          MATERI PEMBELAJARAN
        </span>

        <h1>{item.title}</h1>

        <p>
          {item.description || 'Materi pembelajaran kursus.'}
        </p>

        {#if videoId}
          <div class="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={item.title || 'Video pembelajaran'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        {:else}
          <div class="empty">
            URL video belum tersedia atau bukan tautan
            YouTube yang valid.
          </div>
        {/if}

        <button
          class:done={completed}
          class="primary"
          onclick={toggle}
          disabled={saving}
        >
          <CheckCircle size={18} />

          {#if saving}
            Menyimpan...
          {:else if completed}
            Tandai Belum Selesai
          {:else}
            Tandai Selesai
          {/if}
        </button>
      </section>
    {:else}
      <div class="empty">
        {error || 'Memuat materi...'}
      </div>
    {/if}
  </main>
</div>
