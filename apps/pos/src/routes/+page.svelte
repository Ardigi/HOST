<script lang="ts">
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
			<a href="/orders" class="action-card md-elevated">
				<div class="action-content">
					<div class="action-icon">📋</div>
					<h3 class="text-xl font-semibold">Orders</h3>
					<p class="text-on-surface-variant">Manage customer orders</p>
				</div>
			</a>

			<a href="/menu" class="action-card md-elevated">
				<div class="action-content">
					<div class="action-icon">🍽️</div>
					<h3 class="text-xl font-semibold">Menu</h3>
					<p class="text-on-surface-variant">Update menu items</p>
				</div>
			</a>

			<a href="/reports" class="action-card md-elevated">
				<div class="action-content">
					<div class="action-icon">📊</div>
					<h3 class="text-xl font-semibold">Reports</h3>
					<p class="text-on-surface-variant">View analytics</p>
				</div>
			</a>
		</div>
	</div>

	<div class="status-section">
		<h2 class="text-2xl font-semibold mb-4">System Status</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="status-card md-filled status-success">
				<div class="status-content">
					<h3 class="font-semibold text-on-success-container">Development Mode</h3>
					<p class="font-bold text-success">Active</p>
				</div>
			</div>
			<div class="status-card md-filled status-primary">
				<div class="status-content">
					<h3 class="font-semibold text-on-primary-container">Week 1</h3>
					<p class="font-bold text-primary-on-container">Infrastructure Setup</p>
				</div>
			</div>
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

	/* Material 3 Elevated Card */
	.action-card {
		display: block;
		text-decoration: none;
		color: var(--md-sys-color-on-surface);
		background: var(--md-sys-color-surface);
		border-radius: var(--md-sys-shape-corner-medium);
		min-height: var(--host-touch-target-comfortable);
		transition: all var(--host-transition-fast);
		cursor: pointer;
	}

	.md-elevated {
		box-shadow: var(--md-sys-elevation-1);
	}

	.md-elevated:hover {
		box-shadow: var(--md-sys-elevation-2);
		transform: translateY(-2px);
	}

	.md-elevated:active {
		box-shadow: var(--md-sys-elevation-1);
		transform: translateY(0);
	}

	.action-content {
		padding: 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
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

	.status-card {
		border-radius: var(--md-sys-shape-corner-medium);
		overflow: hidden;
	}

	.md-filled {
		box-shadow: var(--md-sys-elevation-0);
	}

	.status-success {
		background: var(--md-sys-color-success-container);
	}

	.status-primary {
		background: var(--md-sys-color-primary-container);
	}

	.status-content {
		padding: 1.5rem;
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