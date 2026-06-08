import { writable } from 'svelte/store';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  auth_method: string;
  tier: string;
};

export type SessionStore = {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

function createSessionStore() {
  const { subscribe, set, update } = writable<SessionStore>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  async function loadSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = (await res.json()) as { user: SessionUser | null };

      update(() => ({
        user: data.user,
        isLoading: false,
        isAuthenticated: !!data.user,
      }));
    } catch (error) {
      console.error('Failed to load session:', error);
      update(() => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }

  async function signIn(email: string) {
    const res = await fetch('/api/auth/magic-link/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = (await res.json()) as { error: string };
      throw new Error(error.error);
    }

    return { success: true };
  }

  async function signInWithGoogle() {
    window.location.href = '/api/auth/google/start';
  }

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });

    update(() => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }));
  }

  return {
    subscribe,
    loadSession,
    signIn,
    signInWithGoogle,
    signOut,
  };
}

export const session = createSessionStore();
