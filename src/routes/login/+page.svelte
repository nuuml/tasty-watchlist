<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Card, TextField } from '$lib/components/index';
	import { session } from '$lib/stores/index';
	import { onMount } from 'svelte';

	let username = '';
	let password = '';
	let errorMsg = '';
	let loading = false;
	const { sessionToken } = session;
	onMount(() => {
		if ($sessionToken) {
			goto('/');
		}
	});
	const handleSubmit = async () => {
		try {
			await session.login(username, password);
			if ($sessionToken) {
				goto('/');
			}
		} catch (err) {
			errorMsg = (err as Error).message || 'Login failed';
		}
	};
</script>

<div class="flex h-screen w-full flex-col items-center justify-center gap-4">
	<Card>
		<h1 class="m-4 text-6xl">🍒 Tasty Login</h1>
		<form onsubmit={handleSubmit} class="flex w-md flex-col gap-4">
			<TextField bind:value={username} id="usernameField" label="Username" />
			<TextField bind:value={password} id="passwordField" type="password" label="Password" />
			<Button type="submit" disabled={loading}>
				{#if loading}
					Logging in...
				{:else}
					Log in
				{/if}
			</Button>
		</form>
	</Card>
	{#if errorMsg}
		<Card>
			<p class="max-w-sm text-xs text-red-500">{errorMsg}</p>
		</Card>
	{/if}
</div>
