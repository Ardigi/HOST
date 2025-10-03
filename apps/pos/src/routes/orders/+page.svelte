<script lang="ts">
import { enhance } from '$app/forms';
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

function handleOverlayKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		closeCreateDialog();
	}
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

{#if showCreateDialog}
	<div
		class="dialog-overlay"
		role="button"
		tabindex="0"
		aria-label="Close dialog"
		onclick={closeCreateDialog}
		onkeydown={handleOverlayKeydown}
	>
		<div
			class="dialog"
			role="dialog"
			aria-labelledby="dialog-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<h2 id="dialog-title">Create New Order</h2>

			<form method="POST" action="?/createOrder" use:enhance={() => {
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

				<div class="dialog-actions">
					<button type="button" class="btn-secondary" onclick={closeCreateDialog}>
						Cancel
					</button>
					<button type="submit" class="btn-primary">
						Create Order
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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

	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.dialog h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
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

	.dialog-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		font-weight: 500;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}
</style>