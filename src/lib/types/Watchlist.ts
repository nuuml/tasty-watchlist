export interface Watchlist {
	name: string;
	watchlistEntries: WatchlistEntry[];
	cmsId?: string;
	groupName: string;
	orderIndex: number;
}

export interface WatchlistEntry {
	symbol: string;
	instrumentType: string;
}

export const mapWatchlistFromApi = (apiData: any): Watchlist => {
	return {
		name: apiData.name,
		watchlistEntries: apiData['watchlist-entries'].map((entry: any) => ({
			symbol: entry.symbol,
			instrumentType: entry['instrument-type']
		})),
		cmsId: apiData['cms-id'],
		groupName: apiData['group-name'],
		orderIndex: apiData['order-index']
	};
};

export const mapWatchlistToApi = (data: Watchlist): any => {
	return {
		name: data.name,
		'watchlist-entries': data.watchlistEntries.map((entry) => ({
			symbol: entry.symbol,
			'instrument-type': entry.instrumentType
		})),
		'cms-id': data.cmsId,
		'group-name': data.groupName,
		'order-index': data.orderIndex
	};
};
