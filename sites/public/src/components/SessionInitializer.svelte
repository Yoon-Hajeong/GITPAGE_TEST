<script>
  import { onMount } from 'svelte';
  import { session } from '../lib/sessionStore';

  onMount(() => {
    session.loadSession();
  });
</script>
