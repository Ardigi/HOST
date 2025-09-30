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
			<a href="/orders" class="action-card">
				<div class="action-icon">📋</div>
				<h3 class="text-xl font-semibold">Orders</h3>
				<p class="text-gray-600">Manage customer orders</p>
			</a>

			<a href="/menu" class="action-card">
				<div class="action-icon">🍽️</div>
				<h3 class="text-xl font-semibold">Menu</h3>
				<p class="text-gray-600">Update menu items</p>
			</a>

			<a href="/reports" class="action-card">
				<div class="action-icon">📊</div>
				<h3 class="text-xl font-semibold">Reports</h3>
				<p class="text-gray-600">View analytics</p>
			</a>
		</div>
	</div>

	<div class="status-section">
		<h2 class="text-2xl font-semibold mb-4">System Status</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="status-card">
				<h3 class="font-semibold text-gray-700">Development Mode</h3>
				<p class="text-green-600 font-bold">Active</p>
			</div>
			<div class="status-card">
				<h3 class="font-semibold text-gray-700">Week 1</h3>
				<p class="text-blue-600 font-bold">Infrastructure Setup</p>
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
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 2rem;
	}

	.quick-actions {
		margin-bottom: 2rem;
	}

	.action-card {
		display: block;
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		text-align: center;
		transition: all 0.2s;
		text-decoration: none;
		color: inherit;
	}

	.action-card:hover {
		border-color: #2563eb;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.status-section {
		margin-bottom: 2rem;
	}

	.status-card {
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background: #f9fafb;
	}
</style>