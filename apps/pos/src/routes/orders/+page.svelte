<script lang="ts">
import { enhance } from '$app/forms';
import POSButton from '@host/ui/components/POSButton.svelte';
import POSDialog from '@host/ui/components/POSDialog.svelte';
import type { PageData } from './$types';

// Props from load function
let { data }: { data: PageData } = $props();

// State for create order dialog
let showCreateDialog = $state(false);
let selectedTable = $state('');
let guestCount = $state(1);

// Effect using $effect
$effect(() => {
	console.log('Orders updated:', data.orders.length);
});

function openCreateDialog() {
	showCreateDialog = true;
	selectedTable = '';
	guestCount = 1;
}

function closeCreateDialog() {
	showCreateDialog = false;
}
</script>

<div class="orders-page">
	<header>
		<h1>Orders</h1>
		<button class="btn-primary" onclick={openCreateDialog}>
			+ New Order
		</button>
	</header>

	<div class="orders-grid">
		{#each data.orders as order (order.id)}
			<div class="order-card" data-testid="order-card" data-order-id={order.id}>
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

<POSDialog headline="Create New Order" bind:open={showCreateDialog} type="standard">
	<form id="create-order-form" method="POST" action="?/createOrder" use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				closeCreateDialog();
			}
		};
	}}>
		<div class="form-group">
			<label for="tableNumber">Table Number</label>
			<select
				id="tableNumber"
				name="tableNumber"
				bind:value={selectedTable}
				required
			>
				<option value="" disabled>Select a table</option>
				{#each data.tables || [] as table (table.id)}
					<option value={table.tableNumber}>
						Table {table.tableNumber} ({table.sectionName}) - {table.capacity} seats
					</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="guestCount">Number of Guests</label>
			<input
				id="guestCount"
				type="number"
				name="guestCount"
				bind:value={guestCount}
				min="1"
				max="20"
				required
			/>
		</div>

		<input type="hidden" name="orderType" value="dine_in" />
	</form>

	{#snippet customButtons()}
		<POSButton
			label="Cancel"
			variant="text"
			size="standard"
			onclick={closeCreateDialog}
		/>
		<POSButton
			label="Create Order"
			variant="filled"
			size="standard"
			type="submit"
			form="create-order-form"
		/>
	{/snippet}
</POSDialog>

<style>
	.orders-page {
		padding: 2rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
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

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.form-group select,
	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 1rem;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		font-weight: 500;
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}
</style>
