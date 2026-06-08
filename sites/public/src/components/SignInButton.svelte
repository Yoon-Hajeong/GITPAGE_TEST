<script lang="ts">
  import { session } from '../lib/sessionStore';

  let email = '';
  let isLoading = false;
  let error = '';
  let showMagicLink = false;

  async function handleMagicLink() {
    if (!email) {
      error = 'Please enter your email';
      return;
    }

    isLoading = true;
    error = '';

    try {
      await session.signIn(email);
      showMagicLink = false;
      email = '';
      // Show success message
      alert('Check your email for the sign-in link!');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send email';
    } finally {
      isLoading = false;
    }
  }

  async function handleGoogleSignIn() {
    try {
      await session.signInWithGoogle();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to sign in with Google';
    }
  }
</script>

{#if $session.isAuthenticated}
  <div class="auth-user">
    <span>{$session.user?.email}</span>
    <button on:click={() => session.signOut()}>Sign Out</button>
  </div>
{:else}
  <div class="auth-buttons">
    {#if showMagicLink}
      <div class="magic-link-form">
        <input
          type="email"
          bind:value={email}
          placeholder="Enter your email"
          disabled={isLoading}
        />
        <button on:click={handleMagicLink} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Link'}
        </button>
        <button on:click={() => (showMagicLink = false)}>Cancel</button>
        {#if error}
          <p class="error">{error}</p>
        {/if}
      </div>
    {:else}
      <button on:click={() => (showMagicLink = true)}>Sign In with Email</button>
      <button on:click={handleGoogleSignIn}>Sign In with Google</button>
    {/if}
  </div>
{/if}

<style>
  .auth-user {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .auth-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .magic-link-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    background: white;
  }

  button:hover:not(:disabled) {
    background: #f0f0f0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .error {
    color: red;
    font-size: 0.875rem;
  }
</style>
