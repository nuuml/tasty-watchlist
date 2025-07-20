<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Card, WatchlistModal } from '$lib/components/index';
	import { connectToDxLink, loadInitialData, get24HourPriceData } from '$lib/services';
	import { session, watchlistStore } from '$lib/stores/index';
	import { type QuoteUpdate, type Watchlist, type WatchlistEntry } from '$lib/types';
	import { onDestroy } from 'svelte';

	const watchlists = watchlistStore.watchlists;

	let showModal = $state(false);
	let editWatchlist: Watchlist | undefined = $state();
	let watchedWatchlist: Watchlist | undefined = $state();
	let quoteMap: Record<string, QuoteUpdate> = $state({});
	let localToken = $state('');
	let graphedSymbol = $state('');
	let historicalData: {
		timestamp: number;
		open: number;
		close: number;
		high: number;
		low: number;
	}[] = $state([]);
	let isLoadingHistorical = $state(false);

	const edit = (entry: Watchlist) => {
		editWatchlist = entry;
		showModal = true;
	};

	const closeModal = () => {
		if (watchedWatchlist && editWatchlist && watchedWatchlist?.name === editWatchlist?.name) {
			watchedWatchlist = $watchlists.find((list) => list.name === watchedWatchlist?.name);
		}
		editWatchlist = undefined;
		showModal = false;
	};

	const openModal = () => {
		showModal = true;
	};

	const logout = () => {
		session.logout();
		goto('/login');
	};

	let unsub = session.sessionToken.subscribe((token) => {
		if (token) {
			localToken = token;
			watchlistStore.init();
		}
	});

	const watch = (list: Watchlist) => {
		watchedWatchlist = list;
	};
	const safeParse = (val: any) => {
		const num = parseFloat(val);
		return isFinite(num) ? num : undefined;
	};

	const viewGraph = (symbol: WatchlistEntry) => {
		graphedSymbol = symbol.symbol;
	};

	$effect(() => {
		if (!graphedSymbol || !localToken) return;

		const fetchData = async () => {
			isLoadingHistorical = true;
			try {
				const { token, ['dxlink-url']: url } = await session.fetchQuoteToken();
				const data = await get24HourPriceData(token, url, graphedSymbol);
				historicalData = data;
			} catch (error) {
				console.error('Error fetching 24-hour data for', graphedSymbol, error);
				historicalData = [];
			} finally {
				isLoadingHistorical = false;
			}
		};

		fetchData();
	});

	onDestroy(unsub);

	$effect(() => {
		if (!watchedWatchlist) return;

		const symbols = watchedWatchlist.watchlistEntries.map((e) => e.symbol);

		const loadData = async () => {
			const updates: Record<string, QuoteUpdate> = {};

			await Promise.all(
				symbols.map(async (symbol) => {
					try {
						const data = await loadInitialData(localToken, symbol);
						updates[data.symbol] = {
							bidPrice: safeParse(data.bid),
							askPrice: safeParse(data.ask),
							lastPrice: safeParse(data.last)
						};
					} catch (err) {
						console.error(`Failed to load data for ${symbol}`, err);
					}
				})
			);

			quoteMap = updates;

			initQuoteStream(symbols);
		};

		loadData();
	});

	const initQuoteStream = async (symbols: string[]) => {
		try {
			const { token, ['dxlink-url']: url } = await session.fetchQuoteToken();

			const cleanup = connectToDxLink(token, url, symbols, (symbol, update) => {
				quoteMap = {
					...quoteMap,
					[symbol]: {
						...quoteMap[symbol],
						...update
					}
				};
			});

			return cleanup;
		} catch (error) {
			console.error('Error initializing quote stream:', error);
		}
	};
</script>

<div class="grid h-screen grid-cols-[400px_1fr] grid-rows-[60px_1fr]">
	<header
		class="col-span-2 flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-black dark:bg-gray-950"
	>
		<h1 class="text-2xl font-semibold">🍒 Tasty Watchlist</h1>
		<Button onclick={logout}>Logout</Button>
	</header>

	<div
		class="flex flex-col gap-4 border-r border-gray-200 bg-gray-100 p-4 dark:border-gray-950 dark:bg-gray-900"
	>
		<h1 class="text-xl"><strong>My lists</strong></h1>
		{#each $watchlists.sort((a, b) => a.orderIndex - b.orderIndex) as watchlist}
			<div class="flex w-full flex-row items-center justify-between">
				<p class="mr-2 truncate" title={watchlist.name}><em>{watchlist.name}</em></p>
				<div class="-mr-3 flex flex-row gap-1 text-xs">
					<Button title="move up" onclick={() => watchlistStore.moveWatchlistUp(watchlist.name)}>
						<p class="-mx-2">⬆️</p>
					</Button>
					<Button
						title="move down"
						onclick={() => watchlistStore.moveWatchlistDown(watchlist.name)}
					>
						<p class="-mx-2">⬇️</p>
					</Button>
					<Button title="edit" onclick={() => edit(watchlist)}>
						<p class="-mx-2">✏️</p>
					</Button>
					<Button title="view" onclick={() => watch(watchlist)}>
						<div class="-mx-2">👀</div>
					</Button>
				</div>
			</div>
		{/each}
		<Button onclick={openModal}>Create watchlist</Button>
	</div>

	<main class=" w-full overflow-y-auto p-4">
		{#if watchedWatchlist}
			<Card class="flex w-full">
				<table class="min-w-full table-auto text-left text-sm">
					<thead class="border-b font-medium">
						<tr>
							<th class="px-4 py-2">Stock Symbol</th>
							<th class="px-4 py-2">Bid Price ($USD)</th>
							<th class="px-4 py-2">Ask Price ($USD)</th>
							<th class="px-4 py-2">Last Price ($USD)</th>
						</tr>
					</thead>
					<tbody>
						{#each watchedWatchlist.watchlistEntries as entry}
							<tr
								onclick={() => viewGraph(entry)}
								class="border-t hover:bg-gray-300 dark:hover:bg-gray-800"
							>
								<td class="px-4 py-2">{entry.symbol}</td>
								<td class="px-4 py-2">{quoteMap[entry.symbol]?.bidPrice ?? '--'}</td>
								<td class="px-4 py-2">{quoteMap[entry.symbol]?.askPrice ?? '--'}</td>
								<td class="px-4 py-2">{quoteMap[entry.symbol]?.lastPrice ?? '--'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Card>
		{/if}

		{#if graphedSymbol}
			<Card class="mt-4 w-full">
				<h2 class="mb-4 text-lg font-semibold">24-Hour Price Data for {graphedSymbol}</h2>
				{#if isLoadingHistorical}
					<p class="text-gray-500">Loading historical data...</p>
				{:else if historicalData.length > 0}
					<div class="text-sm">
						<p class="mb-2">Data points: {historicalData.length}</p>
						<p class="mb-2">
							Time range: {new Date(historicalData[0]?.timestamp).toLocaleString()} - {new Date(
								historicalData[historicalData.length - 1]?.timestamp
							).toLocaleString()}
						</p>

						<!-- Simple data display - you can replace this with a chart component -->
						<div class="max-h-64 overflow-y-auto">
							<table class="min-w-full table-auto text-xs">
								<thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
									<tr>
										<th class="px-2 py-1">Time</th>
										<th class="px-2 py-1">Open</th>
										<th class="px-2 py-1">Close</th>
										<th class="px-2 py-1">High</th>
										<th class="px-2 py-1">Low</th>
									</tr>
								</thead>
								<tbody>
									{#each historicalData.slice(-20) as candle}
										<tr class="border-t">
											<td class="px-2 py-1">{new Date(candle.timestamp).toLocaleTimeString()}</td>
											<td class="px-2 py-1">{candle.open.toFixed(2)}</td>
											<td class="px-2 py-1">{candle.close.toFixed(2)}</td>
											<td class="px-2 py-1">{candle.high.toFixed(2)}</td>
											<td class="px-2 py-1">{candle.low.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else}
					<p class="text-gray-500">No historical data available for {graphedSymbol}</p>
				{/if}

				<Button
					onclick={() => {
						graphedSymbol = '';
						historicalData = [];
					}}
				>
					Close Chart
				</Button>
			</Card>
		{/if}
	</main>
</div>

{#if showModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/20">
		<WatchlistModal close={closeModal} watchlist={editWatchlist} />
	</div>
{/if}
