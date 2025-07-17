<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
	export let variant: 'primary' | 'secondary' = 'primary';
	const variants = {
		primary: 'bg-indigo-900 text-white hover:bg-indigo-700',
		secondary: 'bg-white text-[#0e23bc] hover:bg-gray-100',
		disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
	};

    const dispatch = createEventDispatcher()
</script>

<button
	{type}
	class:active:scale-95={!disabled}
	{disabled}
	on:click={(e) => dispatch('click', e)}
	class="{variants[
		disabled ? 'disabled' : variant
	]}  elevation-5 rounded-md px-4 py-1 my-1 shadow-md transition-colors"
>
	<slot />
</button>
