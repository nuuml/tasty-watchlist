<script lang="ts">
	import Chart from 'svelte-frappe-charts';
	import type { HistoricalData } from '$lib/types';

	let { historicalData }: { historicalData: HistoricalData[] } = $props();

	const formattedLabels = historicalData.map((item) =>
		new Date(item.timestamp / 1000).toLocaleDateString([], {
			hour: '2-digit',
			minute: '2-digit'
		})
	);

	const chartData = {
		labels: formattedLabels,
		datasets: [
			{ name: 'Close', values: historicalData.map((item) => item.close) },
			{ name: 'Open', values: historicalData.map((item) => item.open) },
			{ name: 'High', values: historicalData.map((item) => item.high) },
			{ name: 'Low', values: historicalData.map((item) => item.low) }
		]
	};

	const chartOptions = {
		title: 'Price Chart (24h)',
		data: chartData,
		type: 'line',
		height: 300,
		colors: ['#34d399', '#60a5fa', '#f87171', '#fbbf24'], // nice Tailwind colors
		axisOptions: {
			xAxisMode: 'tick',
			yAxisMode: 'span',
			xIsSeries: true
		},
		lineOptions: {
			regionFill: 1,
			dotSize: 2
		}
	};
</script>

<Chart {...chartOptions} />
