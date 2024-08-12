<script lang="ts">
/**
 * POS-optimized List component
 * Native HTML list with Material Design 3 styling and POS touch targets
 *
 * Touch target requirements:
 * - Minimum: 48px (WCAG 2.1 AA compliance)
 * - Comfortable: 56px (recommended for tablets)
 *
 * @component
 */

import type { ListItem } from './types';

interface Props {
	/**
	 * Array of list items to display
	 */
	items: ListItem[];

	/**
	 * List size variant optimized for POS
	 * - standard: 48px minimum (WCAG 2.1 AA)
	 * - comfortable: 56px (tablet optimized)
	 */
	size?: 'standard' | 'comfortable';

	/**
	 * Whether list items are interactive (clickable)
	 */
	interactive?: boolean;

	/**
	 * Click handler for list items
	 */
	onItemClick?: (itemId: string) => void;

	/**
	 * Custom aria-label for the list
	 */
	ariaLabel?: string;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	items = [],
	size = 'standard',
	interactive = true,
	onItemClick,
	ariaLabel,
	class: className = '',
}: Props = $props();

// Calculate size class based on size prop
const sizeClass = $derived(() => {
	switch (size) {
		case 'comfortable':
			return 'pos-list-comfortable';
		default:
			return 'pos-list-standard';
	}
});

// Handle item click
function handleItemClick(itemId: string) {
	if (interactive && onItemClick) {
		onItemClick(itemId);
	}
}
</script>

<ul
	role="list"
	aria-label={ariaLabel}
	class="pos-list {sizeClass()} {className}"
>
	{#each items as listItem (listItem.id)}
		{#if interactive}
			<li role="listitem">
				<button
					type="button"
					class="pos-list-item interactive"
					onclick={() => handleItemClick(listItem.id)}
				>
					<div class="pos-list-item-content">
						<span class="pos-list-item-text">{listItem.text}</span>
						{#if listItem.secondaryText}
							<span class="pos-list-item-secondary">{listItem.secondaryText}</span>
						{/if}
					</div>
				</button>
			</li>
		{:else}
			<li role="listitem" class="pos-list-item">
				<div class="pos-list-item-content">
					<span class="pos-list-item-text">{listItem.text}</span>
					{#if listItem.secondaryText}
						<span class="pos-list-item-secondary">{listItem.secondaryText}</span>
					{/if}
				</div>
			</li>
		{/if}
	{/each}
</ul>

<style>
	/* Base POS list styling */
	:global(.pos-list) {
		/* Ensure readable font size for POS environment */
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0.03125em;

		/* Remove default list styling */
		list-style: none;
		padding: 0;
		margin: 0;

		/* Material Design 3 surface styling */
		background-color: var(--md-sys-color-surface, #fef7ff);
	}

	/* List item base styling */
	:global(.pos-list-item) {
		display: flex;
		align-items: center;
		padding-inline: 1rem;
		width: 100%;
		border: none;
		background: transparent;
		text-align: left;
		transition: background-color var(--host-transition-fast, 200ms) ease;
	}

	/* Standard size: WCAG 2.1 AA minimum (48px) */
	:global(.pos-list-standard .pos-list-item) {
		min-height: 48px;
	}

	/* Comfortable size: Tablet optimized (56px) */
	:global(.pos-list-comfortable .pos-list-item) {
		min-height: 56px;
	}

	/* Interactive list items (buttons) */
	:global(.pos-list-item.interactive) {
		cursor: pointer;
	}

	:global(.pos-list-item.interactive:hover) {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	:global(.pos-list-item.interactive:focus-visible) {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: -2px;
	}

	:global(.pos-list-item.interactive:active) {
		background-color: var(--md-sys-color-secondary-container, #e8def8);
	}

	/* List item content */
	:global(.pos-list-item-content) {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	:global(.pos-list-item-text) {
		color: var(--md-sys-color-on-surface, #1d1b20);
		line-height: 1.5;
		font-size: 1rem;
	}

	:global(.pos-list-item-secondary) {
		color: var(--md-sys-color-on-surface-variant, #49454f);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Remove default button styling for interactive items */
	:global(.pos-list-item.interactive) {
		font: inherit;
	}
</style>
