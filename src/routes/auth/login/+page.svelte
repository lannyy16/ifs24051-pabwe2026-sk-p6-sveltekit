
<script lang="ts">
  import { goto } from '$app/navigation';
  import { GraduationCap } from 'lucide-svelte';
  import { login } from '../../../features/auth/api/authApi';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit(e: SubmitEvent) {
    e.preventDefault();

    error = '';
    loading = true;

    try {
      const r: any = await login(email, password);

      if (
        r?.data?.user &&
        typeof localStorage !== 'undefined'
      ) {
        localStorage.setItem(
          'profile',
          JSON.stringify(r.data.user)
        );
      }

      await goto('/');
    } catch (e) {
      error = e instanceof Error
        ? e.message
        : 'Login gagal';
    } finally {
      loading = false;
    }
  }
</script>

<main class="auth-page">
  <form class="auth-card" onsubmit={submit}>
    <a class="brand" href="/">
      <GraduationCap />
      Delcom <b>Courses</b>
    </a>

    <h1>Selamat datang kembali</h1>
    <p>Masuk untuk melanjutkan perjalanan belajarmu.</p>

    {#if error}
      <div class="alert" role="alert">
        {error}
      </div>
    {/if}

    <label for="login-email-input">
      Email
      <input
        id="login-email-input"
        type="email"
        name="email"
        bind:value={email}
        required
        autocomplete="email"
      />
    </label>

    <label for="login-password-input">
      Password
      <input
        id="login-password-input"
        type="password"
        name="password"
        bind:value={password}
        required
        autocomplete="current-password"
      />
    </label>

    <button
      id="login-submit-button"
      class="primary full"
      type="submit"
      disabled={loading}
    >
      {loading ? 'Memproses...' : 'Masuk'}
    </button>

    <p class="auth-foot">
      Belum punya akun?
      <a href="/auth/register">Daftar</a>
    </p>
  </form>
</main>
