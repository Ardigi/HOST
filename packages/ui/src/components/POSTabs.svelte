<script lang="ts">
/**
 * POS-optimized Tabs component
 * Material Design 3 Tabs with POS-specific touch targets
 *
 * Touch target requirements:
 * - Tab height: 48px minimum (WCAG 2.1 AA)
 *
 * @component
 */

interface Tab {
	id: string;
	label: string;
}

interface Props {
	/**
	 * Array of tab items
	 */
	tabs: Tab[];

	/**
	 * ID of the currently active tab
	 */
	activeId: string;

	/**
	 * Tab change handler
	 */
	onTabChange?: (tabId: string) => void;

	/**
	 * Custom aria-label for the tabs
	 */
	ariaLabel?: string;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	tabs,
	activeId,
	onTabChange,
	ariaLabel = 'Tabs',
	class: className = '',
}: Props = $props();

function handleTabClick(tabId: string) {
	if (onTabChange) {
		onTabChange(tabId);
	}
}
</script>

<div
	role="tablist"
	aria-label={ariaLabel}
	class="pos-tabs {className}"
>
	{#each tabs as tab (tab.id)}
		<button
			role="tab"
			type="button"
			aria-selected={tab.id === activeId}
			aria-controls="{tab.id}-panel"
			tabindex={tab.id === activeId ? 0 : -1}
			class="pos-tab {tab.id === activeId ? 'active' : ''}"
			onclick={() => handleTabClick(tab.id)}
		>
			<span class="pos-tab-label">{tab.label}</span>
			{#if tab.id === activeId}
				<div class="pos-tab-indicator"></div>
			{/if}
		</button>
	{/each}
</div>

<style>
	/* Base POS tabs styling */
	.pos-tabs {
		display: flex;
		align-items: center;
		width: 100%;
		background-color: var(--md-sys-color-surface, #fef7ff);
		border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
	}

	/* Tab button */
	.pos-tab {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 48px;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		color: var(--md-sys-color-on-surface-variant, #49454f);
		cursor: pointer;
		transition: all var(--host-transition-fast, 200ms) ease;
	}

	.pos-tab:hover {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	.pos-tab:focus-visible {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: -2px;
	}

	/* Active tab */
	.pos-tab.active {
		color: var(--md-sys-color-primary, #6750a4);
	}

	/* Tab label */
	.pos-tab-label {
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.00714em;
		line-height: 1.4;
		text-align: center;
	}

	.pos-tab.active .pos-tab-label {
		font-weight: 700;
	}

	/* Active tab indicator */
	.pos-tab-indicator {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
		background-color: var(--md-sys-color-primary, #6750a4);
		border-radius: 3px 3px 0 0;
	}

	/* Responsive adjustments */
	@media (max-width: 600px) {
		.pos-tab {
			padding: 0.5rem 0.75rem;
		}

		.pos-tab-label {
			font-size: 0.75rem;
		}
	}
</style>
