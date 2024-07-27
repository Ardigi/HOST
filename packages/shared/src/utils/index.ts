// Utility functions

export * from './order.js';

/**
 * Format currency amount to USD string
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return (value / total) * 100;
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}
