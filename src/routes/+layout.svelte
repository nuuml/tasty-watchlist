<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/index.js';
	import { page } from '$app/stores';
	import '../app.css';

	import { get } from 'svelte/store';

	let { children } = $props();

	onMount(() => {
		session.init();

		const token = get(session.sessionToken);
		if (!token && $page.url.pathname !== '/login') {
			session.logout();
			goto('/login');
		}
		if (token && $page.url.pathname === '/login') {
			goto('/');
		}
	});

	$effect: if (get(session.sessionToken) && $page.url.pathname === '/login') {
		goto('/');
	}
</script>

<div class="h-screen w-full bg-gray-200 dark:bg-gray-800 dark:text-gray-100">
	{@render children()}
</div>
