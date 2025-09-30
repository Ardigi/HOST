<script lang="ts">
import type { PageData } from './$types';

// Props from load function
let { data }: { data: PageData } = $props();

// TODO: Implement order filtering and selection when feature is developed
// Example Svelte 5 runes patterns:
// let selectedOrder = $state<string | null>(null);
// let filter = $state('all');
// let filteredOrders = $derived(() => {
//   if (filter === 'all') return data.orders;
//   return data.orders.filter(order => order.status === filter);
// });

// Effect using $effect
$effect(() => {
	console.log('Orders updated:', data.orders.length);
});
</script>

<div class="orders-page">
	<header>
		<h1>Orders</h1>
		<!-- TODO: Add filters when feature is implemented -->
	</header>

	<div class="orders-grid">
		{#each data.orders as order (order.id)}
			<div class="order-card">
				<div class="order-number">#{order.orderNumber}</div>
				<div class="order-table">Table {order.tableNumber}</div>
				<div class="order-status" data-status={order.status}>
					{order.status}
				</div>
				<div class="order-total">${order.total.toFixed(2)}</div>
			</div>
		{:else}
			<p>No orders found</p>
		{/each}
	</div>
</div>

<style>
	.orders-page {
		padding: 2rem;
	}

	.orders-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 2rem;
	}

	.order-card {
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		background: white;
	}
</style>