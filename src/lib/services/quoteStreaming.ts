import type { QuoteInitialLoadData } from '$lib/types';

let socket: WebSocket;
let channel = 3;

export const loadInitialData = async (
	token: string,
	symbol: string
): Promise<QuoteInitialLoadData> => {
	const response = await fetch(
		`https://api.cert.tastyworks.com/market-data/${encodeURIComponent(symbol)}`,
		{
			headers: {
				Authorization: `${token}`
			}
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch initial data: ${response.statusText}`);
	}

	const json = await response.json();
	return await json.data;
};

export const connectToDxLink = async (
	token: string,
	url: string,
	symbols: string[],
	onQuoteUpdate: (
		symbol: string,
		update: { bidPrice?: number; askPrice?: number; lastPrice?: number }
	) => void
) => {
	if (socket) socket.close();

	socket = new WebSocket(url);

	socket.onopen = () => {
		socket.send(
			JSON.stringify({
				type: 'SETUP',
				channel: 0,
				version: '0.1-DXF-JS/0.3.0',
				keepaliveTimeout: 60,
				acceptKeepaliveTimeout: 60
			})
		);
	};

	socket.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		if (msg.type === 'AUTH_STATE' && msg.state === 'UNAUTHORIZED') {
			socket.send(JSON.stringify({ type: 'AUTH', channel: 0, token }));
		}

		if (msg.type === 'AUTH_STATE' && msg.state === 'AUTHORIZED') {
			socket.send(
				JSON.stringify({
					type: 'CHANNEL_REQUEST',
					channel,
					service: 'FEED',
					parameters: { contract: 'AUTO' }
				})
			);
		}

		if (msg.type === 'CHANNEL_OPENED') {
			socket.send(
				JSON.stringify({
					type: 'FEED_SETUP',
					channel,
					acceptAggregationPeriod: 0.1,
					acceptDataFormat: 'COMPACT',
					acceptEventFields: {
						Quote: ['eventType', 'eventSymbol', 'bidPrice', 'askPrice'],
						Trade: ['eventType', 'eventSymbol', 'price']
					}
				})
			);

			socket.send(
				JSON.stringify({
					type: 'FEED_SUBSCRIPTION',
					channel,
					reset: true,
					add: symbols.flatMap((symbol) => [
						{ type: 'Quote', symbol },
						{ type: 'Trade', symbol }
					])
				})
			);
		}

		if (msg.type === 'FEED_DATA') {
			const [eventType, data] = msg.data;

			if (eventType === 'Quote') {
				const [, symbol, bidPrice, askPrice] = data;
				onQuoteUpdate(symbol, { bidPrice, askPrice });
			}

			if (eventType === 'Trade') {
				const [, symbol, lastPrice] = data;
				onQuoteUpdate(symbol, { lastPrice });
			}
		}
	};

	setInterval(() => {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: 'KEEPALIVE', channel: 0 }));
		}
	}, 30000);
	return () => {
		socket.close();
	};
};

export const get24HourPriceData = async (
	token: string,
	url: string,
	symbol: string
): Promise<{ timestamp: number; open: number; close: number; high: number; low: number }[]> => {
	return new Promise((resolve, reject) => {
		const candleSocket = new WebSocket(url);
		const candleData: any[] = [];
		let isComplete = false;

		const cleanup = () => {
			candleSocket.close();
		};

		const timeout = setTimeout(() => {
			if (!isComplete) {
				cleanup();
				reject(new Error('Timeout waiting for candle data'));
			}
		}, 30000);

		candleSocket.onopen = () => {
			candleSocket.send(
				JSON.stringify({
					type: 'SETUP',
					channel: 0,
					version: '0.1-DXF-JS/0.3.0',
					keepaliveTimeout: 60,
					acceptKeepaliveTimeout: 60
				})
			);
		};

		candleSocket.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === 'AUTH_STATE' && msg.state === 'UNAUTHORIZED') {
				candleSocket.send(JSON.stringify({ type: 'AUTH', channel: 0, token }));
			}

			if (msg.type === 'AUTH_STATE' && msg.state === 'AUTHORIZED') {
				candleSocket.send(
					JSON.stringify({
						type: 'CHANNEL_REQUEST',
						channel: 4,
						service: 'FEED',
						parameters: { contract: 'AUTO' }
					})
				);
			}

			if (msg.type === 'CHANNEL_OPENED' && msg.channel === 4) {
				candleSocket.send(
					JSON.stringify({
						type: 'FEED_SETUP',
						channel: 4,
						acceptAggregationPeriod: 0.1,
						acceptDataFormat: 'COMPACT',
						acceptEventFields: {
							Candle: ['eventType', 'eventSymbol', 'time', 'open', 'close', 'high', 'low']
						}
					})
				);

				// Get timestamp for 24 hours ago
				const fromTime = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
				const candleSymbol = `${symbol}{=5m,fromTime=${fromTime}}`;

				candleSocket.send(
					JSON.stringify({
						type: 'FEED_SUBSCRIPTION',
						channel: 4,
						reset: true,
						add: [{ type: 'Candle', symbol: candleSymbol }]
					})
				);
			}

			if (msg.type === 'FEED_DATA' && msg.channel === 4) {
				const [eventType, data] = msg.data;

				if (eventType === 'Candle') {
					for (let i = 1; i < data.length; i += 6) {
						const [, candleSymbol, timestamp, open, close, high, low] = data.slice(i, i + 6);
						candleData.push({
							timestamp: timestamp * 1000, // Convert to milliseconds
							open,
							close,
							high,
							low
						});
					}

					// Check if we're done receiving data (no new data for a bit)
					setTimeout(() => {
						if (!isComplete) {
							isComplete = true;
							clearTimeout(timeout);
							cleanup();
							resolve(candleData.sort((a, b) => a.timestamp - b.timestamp));
						}
					}, 2000);
				}
			}
		};

		candleSocket.onerror = (error) => {
			clearTimeout(timeout);
			cleanup();
			reject(error);
		};
	});
};
