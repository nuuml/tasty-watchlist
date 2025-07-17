<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/index.js'
	
	let { children } = $props();
	const { sessionToken } = session
	onMount(() => {
		session.init()
		if (!$sessionToken) goto('/login')
	})

	$effect(() => {
		if ($sessionToken !== '' && window.location.pathname === '/login') goto('/')
		if ($sessionToken === '') goto('/login')
	})
</script>

<div class="w-full h-screen dark:bg-gray-800 dark:text-gray-100 bg-gray-200">
	{@render children()}
</div>