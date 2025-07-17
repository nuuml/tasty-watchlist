<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { goto } from '$app/navigation';

	let { children } = $props();
	onMount(() => {
		if (!localStorage.getItem('session-token')) {
			goto('/login')
		}
	})
</script>

<div class="w-full h-screen dark:bg-gray-800 dark:text-gray-100 bg-gray-200">
	{@render children()}
</div>