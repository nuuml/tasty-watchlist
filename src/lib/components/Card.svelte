<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, ...rest }: { children: Snippet; class?: string } = $props();
</script>

<div
	class={`flex max-w-2xl flex-col items-center justify-center rounded-md bg-gray-100 p-5 shadow-2xl dark:bg-gray-700 ${rest.class ?? ''}`}
>
	{@render children?.()}
</div>
