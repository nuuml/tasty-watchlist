<script lang="ts">
	import { Button, Card } from '$lib/components/index.js';
	import TextField from '$lib/components/TextField.svelte';
	import { goto } from '$app/navigation'
	let username = '';
	let password = '';
	let errorMsg = '';
	let loading = false;

	const login = async (event: Event) => {
		event.preventDefault();
		errorMsg = '';
		loading = true;

		try {
			const response = await fetch('https://api.cert.tastyworks.com/sessions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					login: username,
					password: password,
					'remember-me': true
				})
			});

			if (!response.ok) {
				const err = await response.json();
				errorMsg = err?.error?.message || 'Login failed';
				loading = false;
				return;
			}

			const data = await response.json();
			const sessionToken = data.data['session-token'];
			const rememberToken = data.data['remember-token'];

			localStorage.setItem('session-token', sessionToken);
			localStorage.setItem('remember-token', rememberToken);

		} catch (err) {
			errorMsg = 'An error occurred. Please try again.';
			console.error(err);
		} finally {
            if (!errorMsg) {
                goto('/home');
            }
			loading = false;
		}
	};
</script>

<div class="w-full h-screen flex items-center justify-center">
	<Card class="p-6 w-full max-w-md">
		<h1 class="text-3xl mb-4">Tastytrade Login</h1>
		<form on:submit|preventDefault={login} class="flex flex-col gap-4">
			<TextField bind:value={username} id="usernameField" label="Username" />
			<TextField bind:value={password} id="passwordField" type="password" label="Password" />
			{#if errorMsg}
				<p class="text-red-500 text-sm">{errorMsg}</p>
			{/if}
			<Button type="submit" disabled={loading}>
				{#if loading}
					Logging in...
				{:else}
					Log in
				{/if}
			</Button>
		</form>
	</Card>
</div>
