<script lang="ts">
	import { Button, Card, TextField } from '$lib/components/index';
    import { session } from '$lib/stores/index'

	let username = '';
	let password = '';
	let errorMsg = '';
	let loading = false;

	const handleSubmit = () => {
        session.login(username, password)
    }
</script>

<div class="w-full h-screen flex items-center justify-center">
	<Card class="p-6 w-full max-w-md">
		<h1 class="text-6xl m-4">🍒 Tasty Login</h1>
		<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
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
