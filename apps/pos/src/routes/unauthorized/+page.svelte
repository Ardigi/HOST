<script lang="ts">
	import type { PageData } from './$types';

	// Receive data from parent layout via props (standard SvelteKit pattern)
	let { data }: { data: PageData } = $props();
</script>

<div class="unauthorized-container">
	<div class="unauthorized-content">
		<h1>Access Denied</h1>
		<p>You don't have permission to access this page.</p>
		<p class="hint">Required roles: admin, manager, or server</p>

		<div class="actions">
			<a href="/" class="button">Go to Home</a>
			<a href="/auth/logout" class="button secondary">Logout</a>
		</div>

		{#if data?.user}
			<div class="user-info">
				<p>Current user: {data.user.email}</p>
				<p>Your roles: {data.user.roles.join(', ')}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.unauthorized-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		background: var(--surface);
	}

	.unauthorized-content {
		text-align: center;
		max-width: 500px;
	}

	h1 {
		color: var(--error);
		margin-bottom: 1rem;
	}

	p {
		margin-bottom: 0.5rem;
		color: var(--on-surface);
	}

	.hint {
		font-size: 0.875rem;
		color: var(--on-surface-variant);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.button {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		background: var(--primary);
		color: var(--on-primary);
		transition: background 0.2s;
	}

	.button:hover {
		background: var(--primary-container);
	}

	.button.secondary {
		background: transparent;
		color: var(--primary);
		border: 1px solid var(--outline);
	}

	.button.secondary:hover {
		background: var(--surface-variant);
	}

	.user-info {
		margin-top: 2rem;
		padding: 1rem;
		background: var(--surface-variant);
		border-radius: 8px;
		font-size: 0.875rem;
	}
</style>
