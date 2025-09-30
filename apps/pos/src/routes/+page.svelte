<script lang="ts">
import POSCard from '$lib/components/POSCard.svelte';
import { onMount } from 'svelte';

// biome-ignore lint/correctness/noUnusedVariables: currentTime is used in template
let currentTime = $state(new Date().toLocaleTimeString());

onMount(() => {
	const interval = setInterval(() => {
		currentTime = new Date().toLocaleTimeString();
	}, 1000);

	return () => clearInterval(interval);
});
</script>

<svelte:head>
	<title>HOST POS - Dashboard</title>
</svelte:head>

<div class="dashboard">
	<div class="welcome-section">
		<h1 class="text-4xl font-bold mb-2">Welcome to HOST POS</h1>
		<p class="text-xl text-gray-600 mb-4">Modern Point of Sale System for Hospitality</p>
		<p class="text-lg font-mono text-primary">{currentTime}</p>
	</div>

	<div class="quick-actions">
		<h2 class="text-2xl font-semibold mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a href="/orders" style="text-decoration: none;">
				<POSCard variant="elevated">
					<div class="action-content">
						<div class="action-icon">📋</div>
						<h3 class="text-xl font-semibold">Orders</h3>
						<p class="text-on-surface-variant">Manage customer orders</p>
					</div>
				</POSCard>
			</a>

			<a href="/menu" style="text-decoration: none;">
				<POSCard variant="elevated">
					<div class="action-content">
						<div class="action-icon">🍽️</div>
						<h3 class="text-xl font-semibold">Menu</h3>
						<p class="text-on-surface-variant">Update menu items</p>
					</div>
				</POSCard>
			</a>

			<a href="/reports" style="text-decoration: none;">
				<POSCard variant="elevated">
					<div class="action-content">
						<div class="action-icon">📊</div>
						<h3 class="text-xl font-semibold">Reports</h3>
						<p class="text-on-surface-variant">View analytics</p>
					</div>
				</POSCard>
			</a>
		</div>
	</div>

	<div class="status-section">
		<h2 class="text-2xl font-semibold mb-4">System Status</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<POSCard variant="filled" class="status-success">
				<div class="status-content">
					<h3 class="font-semibold text-on-success-container">Development Mode</h3>
					<p class="font-bold text-success">Active</p>
				</div>
			</POSCard>

			<POSCard variant="filled" class="status-primary">
				<div class="status-content">
					<h3 class="font-semibold text-on-primary-container">Week 1</h3>
					<p class="font-bold text-primary-on-container">Infrastructure Setup</p>
				</div>
			</POSCard>
		</div>
	</div>
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	.welcome-section {
		text-align: center;
		padding: 3rem 1rem;
		border-bottom: 1px solid var(--md-sys-color-outline-variant);
		margin-bottom: 2rem;
	}

	.quick-actions {
		margin-bottom: 2rem;
	}

	.action-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.action-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.text-on-surface-variant {
		color: var(--md-sys-color-on-surface-variant);
	}

	/* Status Cards */
	.status-section {
		margin-bottom: 2rem;
	}

	:global(.status-success) {
		background: var(--md-sys-color-success-container);
	}

	:global(.status-primary) {
		background: var(--md-sys-color-primary-container);
	}

	.status-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* M3 Color Utilities */
	.text-on-success-container {
		color: var(--md-sys-color-on-success-container);
	}

	.text-success {
		color: var(--md-sys-color-success);
	}

	.text-on-primary-container {
		color: var(--md-sys-color-on-primary-container);
	}

	.text-primary-on-container {
		color: var(--md-sys-color-primary);
	}
</style>