<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		type = 'button',
		disabled = false,
		variant = 'primary',
		children,
		id,
		title,
		onclick
	}: {
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		variant?: 'primary' | 'secondary' | 'danger';
		title?: string;
		id?: string;
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const variants = {
		primary: 'bg-blue-600 text-white hover:bg-indigo-700',
		danger: 'bg-red-600 text-white hover:bg-red-700',
		secondary: 'bg-white text-[#0e23bc] hover:bg-gray-100',
		disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
	};
</script>

<button
	{title}
	{id}
	{type}
	class:active:scale-95={!disabled}
	{disabled}
	{onclick}
	class="{variants[
		disabled ? 'disabled' : variant
	]}  elevation-5 my-1 rounded-md px-4 py-1 shadow-md transition-colors"
>
	{@render children?.()}
</button>
