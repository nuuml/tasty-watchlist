<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = '',
		type = 'text',
		label = '',
		id = '',
		required = false,
		childRight = true,
		onfocus,
		onblur,
		children
	}: {
		value: string;
		placeholder?: string;
		type?: string;
		label?: string;
		id?: string;
		required?: boolean;
		childRight?: boolean;
		children?: Snippet;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	} = $props();
</script>

<div class="my-2 w-full">
	<label class="block w-full text-sm font-medium">
		{label}{required ? ' *' : ''}
		<div class="relative mt-1 flex w-full flex-row">
			<input
				{type}
				{placeholder}
				{id}
				{required}
				bind:value
				{onblur}
				{onfocus}
				class="w-full rounded-lg bg-gray-300 px-4 py-2 pr-10 text-base transition-colors focus:ring-blue-600 dark:bg-gray-600 dark:text-gray-100"
			/>
			{#if children}
				<div
					class="absolute inset-y-0 {childRight
						? 'right-2'
						: 'left-2'} flex items-center text-gray-600 dark:text-gray-300"
				>
					{@render children()}
				</div>
			{/if}
		</div>
	</label>
</div>
