<script lang="ts">
import '../app.css';
import type { Snippet } from 'svelte';

interface Props {
	children: Snippet;
}

// biome-ignore lint/correctness/noUnusedVariables: children is used in template via @render
let { children }: Props = $props();
</script>

<div class="app">
	<header class="app-header">
		<nav class="container mx-auto flex items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-bold text-primary">HOST POS</a>
			<div class="flex gap-4">
				<a href="/orders" class="hover:text-primary">Orders</a>
				<a href="/menu" class="hover:text-primary">Menu</a>
				<a href="/reports" class="hover:text-primary">Reports</a>
			</div>
		</nav>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<div class="container mx-auto px-4 py-3 text-center text-sm text-gray-600">
			© 2025 HOST POS - Modern Point of Sale System
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		border-bottom: 1px solid #e5e7eb;
		background: white;
	}

	.app-main {
		flex: 1;
		padding: 1.5rem;
	}

	.app-footer {
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}
</style>