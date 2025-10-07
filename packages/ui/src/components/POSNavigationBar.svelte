<script lang="ts">
/**
 * POS-optimized Bottom Navigation Bar component
 * Material Design 3 Bottom Navigation with POS-specific touch targets
 *
 * Touch target requirements:
 * - Navigation bar height: 80px (critical POS actions)
 * - Navigation items: 56px minimum height (comfortable)
 *
 * @component
 */

interface NavigationItem {
	id: string;
	label: string;
	icon: string;
}

interface Props {
	/**
	 * Array of navigation items
	 */
	items: NavigationItem[];

	/**
	 * ID of the currently active navigation item
	 */
	activeId: string;

	/**
	 * Click handler for navigation items
	 */
	onItemClick?: (itemId: string) => void;

	/**
	 * Custom aria-label for the navigation
	 */
	ariaLabel?: string;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	items,
	activeId,
	onItemClick,
	ariaLabel = 'Main navigation',
	class: className = '',
}: Props = $props();

function handleItemClick(itemId: string) {
	if (onItemClick) {
		onItemClick(itemId);
	}
}
</script>

<nav
	aria-label={ariaLabel}
	class="pos-navigation-bar {className}"
>
	{#each items as item (item.id)}
		<a
			href="#{item.id}"
			class="pos-nav-item {item.id === activeId ? 'active' : ''}"
			aria-current={item.id === activeId ? 'page' : undefined}
			onclick={(e) => {
				e.preventDefault();
				handleItemClick(item.id);
			}}
		>
			<span class="material-symbols-outlined pos-nav-icon">{item.icon}</span>
			<span class="pos-nav-label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* Base POS navigation bar styling */
	.pos-navigation-bar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		min-height: 80px;
		height: 80px;
		background-color: var(--md-sys-color-surface-container, #f3edf7);
		box-shadow: var(--md-sys-elevation-2, 0 -1px 3px rgba(0, 0, 0, 0.12));
		width: 100%;
	}

	/* Note: Add position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
	 * in the parent layout for actual POS application use */

	/* Navigation item */
	.pos-nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 56px;
		height: 100%;
		padding: 0.75rem 0.5rem;
		text-decoration: none;
		color: var(--md-sys-color-on-surface-variant, #49454f);
		transition: all var(--host-transition-fast, 200ms) ease;
		cursor: pointer;
		gap: 0.25rem;
	}

	.pos-nav-item:hover {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	.pos-nav-item:focus-visible {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: -2px;
	}

	/* Active state */
	.pos-nav-item.active {
		color: var(--md-sys-color-on-secondary-container, #1d192b);
		background-color: var(--md-sys-color-secondary-container, #e8def8);
	}

	.pos-nav-item.active .pos-nav-icon {
		font-variation-settings: 'FILL' 1;
	}

	/* Navigation icon */
	.pos-nav-icon {
		font-size: 24px;
		user-select: none;
	}

	/* Navigation label */
	.pos-nav-label {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-align: center;
		line-height: 1.2;
	}

	.pos-nav-item.active .pos-nav-label {
		font-weight: 700;
	}

	/* Responsive adjustments */
	@media (max-width: 600px) {
		.pos-navigation-bar {
			justify-content: space-between;
		}

		.pos-nav-item {
			padding: 0.5rem 0.25rem;
		}

		.pos-nav-label {
			font-size: 0.625rem;
		}
	}

	/* Material Symbols icons */
	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}
</style>
