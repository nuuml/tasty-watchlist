<script lang="ts">
	export let value = '';
	export let placeholder = '';
	export let type = 'text';
	export let label = '';
	export let id = '';
	export let required = false;
</script>

<div class="w-full max-w-sm my-2">
    <label class="block text-sm font-medium  w-full">
        {label}{required ? ' *' : ''}
        <input
            {type}
            {placeholder}
            {id}
            {required}
            bind:value
            class="w-full mt-1 rounded-lg dark:text-gray-100 dark:bg-gray-600 bg-gray-300 px-4 py-2 text-base transition-colors focus:ring-blue-600"
        />
    </label>
</div>

