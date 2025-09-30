/**
 * Order calculation utilities
 */

export interface OrderItem {
	price: number;
	quantity: number;
}

export interface OrderTotals {
	subtotal: number;
	tax: number;
	total: number;
}

/**
 * Calculate order subtotal from items
 */
export function calculateSubtotal(items: OrderItem[]): number {
	return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate: number): number {
	return subtotal * taxRate;
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(items: OrderItem[], taxRate = 0.08): OrderTotals {
	const subtotal = calculateSubtotal(items);
	const tax = calculateTax(subtotal, taxRate);
	const total = subtotal + tax;

	return {
		subtotal: Math.round(subtotal * 100) / 100,
		tax: Math.round(tax * 100) / 100,
		total: Math.round(total * 100) / 100,
	};
}
