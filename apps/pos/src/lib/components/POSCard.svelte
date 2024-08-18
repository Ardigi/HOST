<script lang="ts">
/**
 * POS-optimized Card component
 * Wraps m3-svelte Card with enhanced touch targets and spacing
 *
 * @component
 */
// Import from source path to bypass index.js barrel export (which loads Slider → svelte/motion → SSR error)
// See docs/m3-svelte-integration.md for details on this pattern
import Card from 'm3-svelte/package/containers/Card.svelte';
import type { Snippet } from 'svelte';

interface Props {
	/**
	 * Card visual variant
	 * - elevated: Floating with shadow (default)
	 * - filled: Filled background
	 * - outlined: Border outline
	 */
	variant?: 'elevated' | 'filled' | 'outlined';

	/**
	 * Card content (Svelte 5 snippet)
	 */
	children: Snippet;

	/**
	 * Optional click handler
	 */
	onclick?: () => void;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

// biome-ignore lint/correctness/noUnusedVariables: All props are forwarded to Card component
let { variant = 'elevated', children, onclick, class: className = '' }: Props = $props();
</script>

<Card {variant} {onclick} class="pos-card {className}">
	{@render children()}
</Card>

<style>
	/* POS-optimized spacing */
	:global(.pos-card) {
		padding: 1.5rem; /* 24px - Enhanced from MD3 default 16px */
		min-height: 56px; /* 56px minimum for comfortable touch */
		border-radius: var(--md-sys-shape-corner-medium);
		transition: all 200ms;
	}

	/* Ensure adequate spacing for touch */
	:global(.pos-card > *) {
		margin-bottom: 0.75rem;
	}

	:global(.pos-card > *:last-child) {
		margin-bottom: 0;
	}
</style>
