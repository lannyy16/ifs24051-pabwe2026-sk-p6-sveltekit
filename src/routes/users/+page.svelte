
<script lang="ts">
  import { onMount } from 'svelte';
  import { listUsers } from '../../features/users/api/usersApi';
  import { GraduationCap } from 'lucide-svelte';

  let users = $state<any[]>([]);
  let error = $state('');

  onMount(async () => {
    try {
      const response: any = await listUsers();
      users = response?.data?.users || response?.data || [];
    } catch (e) {
      error = e instanceof Error
        ? e.message
        : 'Gagal memuat pengguna';
    }
  });
</script>

<div class="shell">
  <header class="topbar">
    <a class="brand" href="/">
      <GraduationCap />
      Delcom <b>Courses</b>
    </a>

    <nav aria-label="Navigasi utama">
      <a href="/">Semua Kursus</a>
      <a href="/profile">Profil</a>
    </nav>
  </header>

  <main class="container">
    <div class="section-heading">
      <div>
        <h1>Pengguna</h1>
        <p>Komunitas pembelajar Delcom.</p>
      </div>
    </div>

    {#if error}
      <div class="alert" role="alert">
        {error}
      </div>
    {:else if users.length === 0}
      <p class="empty">Belum ada pengguna yang ditampilkan.</p>
    {:else}
      <div class="user-grid">
        {#each users as user (user.id || user.user_id || user.email)}
          <article class="panel user-card">
            <div class="avatar" aria-hidden="true">
              {(user.name || 'U').slice(0, 1).toUpperCase()}
            </div>

            <h2>{user.name || 'Pengguna'}</h2>
            <p>{user.email || ''}</p>
          </article>
        {/each}
      </div>
    {/if}
  </main>
</div>
