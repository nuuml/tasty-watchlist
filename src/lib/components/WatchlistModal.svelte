<script lang="ts">
	import {
		mapSymbolDataFromApi,
		type SymbolData,
		type Watchlist,
		type WatchlistEntry
	} from '$lib/types';

	import { Button, Card, TextField } from './index';

	import { watchlistStore } from '$lib/stores';

	const searchMap = new Map();
	let { watchlist, close }: { watchlist?: Watchlist; close: () => void } = $props();
	let searchResults: SymbolData[] = $state([]);
	let showDropdown = $state(false);
	let debounceTimeout: number;

	let name = $state('');
	let groupName = $state('');
	let symbols: WatchlistEntry[] = $state([]);
	let symbolSearch = $state('');
	let newSymbol: WatchlistEntry = $state({ symbol: '', instrumentType: '' });
	let searchFocused = $state(false);
	let dropdownHovered = $state(false);
	let confirmDelete = $state(false);

	if (watchlist) {
		name = watchlist.name;
		groupName = watchlist.groupName;
		symbols = watchlist.watchlistEntries;
	}

	$effect(() => {
		if (symbolSearch.length >= 2) {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(fetchSymbols, 1000);
		} else {
			searchResults = [];
			showDropdown = false;
		}
	});

	const fetchSymbols = async () => {
		try {
			const res = await fetch(`https://api.tastyworks.com/symbols/search/${symbolSearch}`);
			if (res.ok) {
				const data = await res.json();
				searchResults = data.data.items.map((item: any) => mapSymbolDataFromApi(item));
				searchMap.set(symbolSearch, searchResults);
				showDropdown = searchResults.length > 0;
			} else {
				searchResults = [];
				showDropdown = false;
			}
		} catch (err) {
			console.error(err);
			searchResults = [];
			showDropdown = false;
		}
	};

	const selectSymbol = (symbol: SymbolData) => {
		symbolSearch = symbol.symbol;
		newSymbol = { symbol: symbol.symbol, instrumentType: symbol.instrumentType };
		showDropdown = false;
		searchFocused = false;
		dropdownHovered = false;
		searchResults = [];
	};

	const addSymbol = () => {
		symbols.push(newSymbol);
		newSymbol = { symbol: '', instrumentType: '' };
		symbolSearch = '';
	};

	const removeSymbol = (index: number) => {
		symbols.splice(index, 1);
	};
	const handleSubmit = async () => {
		const orderIndex = watchlistStore.getNextOrderIndex();
		const watchlistData: Watchlist = {
			orderIndex: watchlist?.orderIndex ?? orderIndex,
			name,
			watchlistEntries: symbols,
			groupName
		};
		if (watchlist) {
			await watchlistStore.updateWatchlist(watchlistData, watchlist.name);
		} else {
			await watchlistStore.createWatchlist(watchlistData);
		}
		close();
	};

	const handleDelete = async () => {
		if (watchlist) watchlistStore.deleteWatchlist(watchlist?.name);
		closeConfirmDelete();
		close();
	};

	const openConfirmDelete = () => {
		confirmDelete = true;
	};

	const closeConfirmDelete = () => {
		confirmDelete = false;
	};
</script>

<Card class="w-3xl">
	<h2 class="w-full text-left text-2xl">
		{watchlist ? `Edit watchlist: ${watchlist.name}` : 'Create a watchlist'}
	</h2>
	<TextField label={'Watchlist name'} bind:value={name} />
	<TextField label={'Group name'} bind:value={groupName} />
	<div
		class="my-2 flex max-h-60 w-full flex-col overflow-y-scroll rounded-xl bg-gray-200 py-2 dark:bg-gray-500"
	>
		<h2 class="ml-2 text-xl">Watched symbols</h2>
		{#each symbols as symbol, index}
			<div class="flex w-full flex-row items-center justify-between px-5 hover:bg-blue-400">
				<p>{symbol.symbol}</p>
				<Button onclick={() => removeSymbol(index)}><p class="-mx-5">🗑️</p></Button>
			</div>
		{/each}
	</div>
	<div class=" w-full flex-row">
		<TextField
			onfocus={() => (searchFocused = true)}
			onblur={() =>
				setTimeout(() => {
					if (!dropdownHovered) {
						searchFocused = false;
					}
				}, 100)}
			label={'Add a symbol'}
			bind:value={symbolSearch}
		>
			<Button
				disabled={symbolSearch.length === 0 || newSymbol.symbol !== symbolSearch}
				onclick={addSymbol}><p class="-mx-3">➕</p></Button
			>
		</TextField>
		{#if showDropdown && searchFocused}
			<ul
				onmouseenter={() => (dropdownHovered = true)}
				onmouseleave={() => (dropdownHovered = false)}
				role="listbox"
				class="transition:fly absolute z-10 -mx-1 mt-1 max-h-40 max-w-xl overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:bg-black"
			>
				{#each searchResults as result}
					<li
						role="option"
						tabindex="0"
						aria-selected="false"
						class=" cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								selectSymbol(result);
							}
						}}
						onclick={() => selectSymbol(result)}
					>
						<strong>{result.symbol}</strong> – {result.description}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="mt-2 flex w-full gap-3">
		<Button onclick={() => close()}>Close</Button>
		<Button onclick={handleSubmit}>{watchlist ? 'Update' : 'Submit'}</Button>
		{#if watchlist}
			<Button variant="danger" onclick={openConfirmDelete}>Delete</Button>
		{/if}
	</div>
</Card>

{#if confirmDelete && watchlist}
	<div class="bg-opacity-50 fixed inset-0 z-100 flex items-center justify-center bg-black/20">
		<Card>
			<p class="mb-5">Are you sure you want to delete: {watchlist.name} ?</p>
			<div class="flex w-full flex-row gap-4">
				<Button onclick={handleDelete} variant="danger"><p class="mx-3">Yes</p></Button>
				<Button onclick={closeConfirmDelete}><p class="mx-3">No</p></Button>
			</div>
		</Card>
	</div>
{/if}
