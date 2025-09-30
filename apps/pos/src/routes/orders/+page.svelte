<script lang="ts">
	import type { PageData } from './$types';

	// Props from load function
	let { data }: { data: PageData } = $props();

	// Svelte 5 runes for reactive state
	let selectedOrder = $state<string | null>(null);
	let filter = $state('all');

	// Derived state using $derived
	let filteredOrders = $derived(() => {
		if (filter === 'all') return data.orders;
		return data.orders.filter(order => order.status === filter);
	});

	// Effect using $effect
	$effect(() => {
		console.log('Orders updated:', data.orders.length);
	});

	function selectOrder(orderId: string) {
		selectedOrder = orderId;
	}
</script>

<div class="orders-page">
	<header>
		<h1>Orders</h1>

		<div class="filters">
			<button
				class:active={filter === 'all'}
				onclick={() => filter = 'all'}
			>
				All
			</button>
			<button
				class:active={filter === 'open'}
				onclick={() => filter = 'open'}
			>
				Open
			</button>
			<button
				class:active={filter === 'completed'}
				onclick={() => filter = 'completed'}
			>
				Completed
			</button>
		</div>
	</header>

	<div class="orders-grid">
		{#each filteredOrders() as order (order.id)}
			<button
				class="order-card"
				class:selected={selectedOrder === order.id}
				onclick={() => selectOrder(order.id)}
			>
				<div class="order-number">#{order.orderNumber}</div>
				<div class="order-table">Table {order.tableNumber}</div>
				<div class="order-status" data-status={order.status}>
					{order.status}
				</div>
				<div class="order-total">${order.total.toFixed(2)}</div>
			</button>
		{:else}
			<p>No orders found</p>
		{/each}
	</div>
</div>

<style>
	.orders-page {
		padding: 2rem;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.filters button {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		background: white;
		cursor: pointer;
	}

	.filters button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
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

	.order-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}
</style>