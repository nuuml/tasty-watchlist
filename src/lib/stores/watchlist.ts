import { writable, get } from 'svelte/store';
import { session } from './auth';
import { mapWatchlistFromApi, mapWatchlistToApi, type Watchlist } from '$lib/types';

const createWatchlistStore = () => {
	const watchlists = writable<Watchlist[]>([]);

	const init = async () => {
		const token = get(session.sessionToken);

		if (!token) return;

		try {
			const res = await fetch('https://api.cert.tastyworks.com/watchlists', {
				headers: {
					Authorization: token
				}
			});
			if (res.ok) {
				const data = await res.json();
				watchlists.set(
					data.data.items
						.map((item: any) => mapWatchlistFromApi(item))
						.sort((a: Watchlist, b: Watchlist) => a.orderIndex - b.orderIndex)
				);
			}
		} catch (err) {
			console.error('Watchlist fetch error:', err);
		}
	};

	const createWatchlist = async (newData: Watchlist) => {
		const watchlistBody = mapWatchlistToApi(newData);
		const token = get(session.sessionToken);

		if (!token || !watchlistBody) return;
		try {
			const res = await fetch('https://api.cert.tastyworks.com/watchlists', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token
				},
				body: JSON.stringify(watchlistBody)
			});
			if (res.ok) {
				const data = await res.json();
				const newWatchlist = mapWatchlistFromApi(data.data);
				watchlists.update((lists) => [...lists, newWatchlist]);
			}
		} catch (err) {
			console.error('Watchlist create error', err);
		}
	};

	const updateWatchlist = async (newData: Watchlist, oldName: string) => {
		const watchlistBody = mapWatchlistToApi(newData);
		const token = get(session.sessionToken);
		if (!token || !watchlistBody) return;
		try {
			const res = await fetch(
				`https://api.cert.tastyworks.com/watchlists/${encodeURIComponent(oldName)}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token
					},
					body: JSON.stringify(watchlistBody)
				}
			);
			if (res.ok) {
				const data = await res.json();
				const newWatchlist = mapWatchlistFromApi(data.data);
				watchlists.update((lists) =>
					lists.map((list) => (list.name === oldName ? newWatchlist : list))
				);
			}
		} catch (err) {
			console.error('Watchlist update error', err);
		}
	};

	const deleteWatchlist = async (name: string) => {
		const token = get(session.sessionToken);
		if (!token) return;
		try {
			const res = await fetch(
				`https://api.cert.tastyworks.com/watchlists/${encodeURIComponent(name)}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token
					}
				}
			);
			if (res.ok) {
				watchlists.update((lists) => lists.filter((list) => list.name !== name));
			}
		} catch (err) {
			console.error('Watchlist delete error', err);
		}
	};
	const moveWatchlistUp = async (name: string) => {
		const currentWatchlists = get(watchlists);
		const sorted = [...currentWatchlists].sort((a, b) => a.orderIndex - b.orderIndex);
		const index = sorted.findIndex((w) => w.name === name);
		if (index <= 0) return;

		const current = sorted[index];
		const above = sorted[index - 1];

		const updatedCurrent = { ...current, orderIndex: above.orderIndex };
		const updatedAbove = { ...above, orderIndex: current.orderIndex };

		const updatedList = currentWatchlists.map((w) => {
			if (w.name === current.name) return updatedCurrent;
			if (w.name === above.name) return updatedAbove;
			return w;
		});

		watchlists.set(updatedList);

		await Promise.all([
			updateWatchlist(updatedCurrent, updatedCurrent.name),
			updateWatchlist(updatedAbove, updatedAbove.name)
		]);
	};

	const moveWatchlistDown = async (name: string) => {
		const currentWatchlists = get(watchlists);
		const sorted = [...currentWatchlists].sort((a, b) => a.orderIndex - b.orderIndex);
		const index = sorted.findIndex((w) => w.name === name);
		if (index === -1 || index === sorted.length - 1) return;

		const current = sorted[index];
		const below = sorted[index + 1];

		const updatedCurrent = { ...current, orderIndex: below.orderIndex };
		const updatedBelow = { ...below, orderIndex: current.orderIndex };

		const updatedList = currentWatchlists.map((w) => {
			if (w.name === current.name) return updatedCurrent;
			if (w.name === below.name) return updatedBelow;
			return w;
		});

		watchlists.set(updatedList);

		await Promise.all([
			updateWatchlist(updatedCurrent, updatedCurrent.name),
			updateWatchlist(updatedBelow, updatedBelow.name)
		]);
	};

	const getNextOrderIndex = () => {
		if (get(watchlists).length === 0) return 1000;
		return Math.max(...get(watchlists).map((w) => w.orderIndex)) + 100;
	};

	return {
		watchlists,
		getNextOrderIndex,
		createWatchlist,
		updateWatchlist,
		deleteWatchlist,
		moveWatchlistDown,
		moveWatchlistUp,
		init
	};
};

export const watchlistStore = createWatchlistStore();
