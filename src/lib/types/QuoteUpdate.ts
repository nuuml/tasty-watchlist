export interface QuoteUpdate {
	bidPrice?: number;
	askPrice?: number;
	lastPrice?: number;
}

export interface QuoteInitialLoadData {
	symbol: string;
	ask?: string;
	bid?: string;
	last?: string;
}

export interface HistoricalData {
	close: number;
	high: number;
	low: number;
	open: number;
	timestamp: number;
}
