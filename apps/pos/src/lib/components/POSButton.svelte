<script lang="ts">
/**
 * POS-optimized Button component
 * Wraps m3-svelte Button with enhanced touch targets for POS use
 *
 * Touch target requirements:
 * - Minimum: 48px (WCAG 2.1 AA compliance)
 * - Comfortable: 56px (recommended for tablets)
 * - Critical: 80px (for important POS actions)
 *
 * @component
 */
// Import from source path to bypass index.js barrel export (which loads Slider → svelte/motion → SSR error)
// See docs/m3-svelte-integration.md for details on this pattern
import Button from 'm3-svelte/package/buttons/Button.svelte';

interface Props {
	/**
	 * Button label text
	 */
	label: string;

	/**
	 * Button size variant optimized for POS
	 * - standard: 48px minimum (WCAG 2.1 AA)
	 * - comfortable: 56px (tablet optimized)
	 * - critical: 80px (transaction buttons)
	 */
	size?: 'standard' | 'comfortable' | 'critical';

	/**
	 * Material Design 3 variant
	 */
	variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';

	/**
	 * Disabled state
	 */
	disabled?: boolean;

	/**
	 * Leading icon name (Material Symbols)
	 */
	leadingIcon?: string;

	/**
	 * Trailing icon name (Material Symbols)
	 */
	trailingIcon?: string;

	/**
	 * Click handler
	 */
	onclick?: () => void;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	label,
	size = 'standard',
	variant = 'filled',
	disabled = false,
	leadingIcon,
	trailingIcon,
	onclick,
	class: className = '',
}: Props = $props();

// Calculate size class based on size prop
const sizeClass = $derived(() => {
	switch (size) {
		case 'comfortable':
			return 'pos-btn-comfortable';
		case 'critical':
			return 'pos-btn-critical';
		default:
			return 'pos-btn-standard';
	}
});
</script>

<Button
	{variant}
	{disabled}
	onclick={onclick}
	iconType={leadingIcon ? 'left' : 'none'}
	class="pos-button {sizeClass()} {className}"
>
	{#if leadingIcon}
		<span class="material-symbols-outlined">{leadingIcon}</span>
	{/if}
	{label}
	{#if trailingIcon}
		<span class="material-symbols-outlined">{trailingIcon}</span>
	{/if}
</Button>

<style>
	/* Base POS button styling */
	:global(.pos-button) {
		/* Ensure readable font size for POS environment */
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.0125em;

		/* Touch-friendly padding */
		padding-inline: 1.5rem;

		/* Smooth transitions */
		transition: all var(--host-transition-fast, 200ms) ease;
	}

	/* Standard size: WCAG 2.1 AA minimum (48px) */
	:global(.pos-btn-standard) {
		min-height: 48px;
		height: 48px;
	}

	/* Comfortable size: Tablet optimized (56px) */
	:global(.pos-btn-comfortable) {
		min-height: 56px;
		height: 56px;
		font-size: 1.0625rem; /* Slightly larger text for comfortable size */
	}

	/* Critical size: Transaction buttons (80px) */
	:global(.pos-btn-critical) {
		min-height: 80px;
		height: 80px;
		font-size: 1.125rem; /* Larger text for critical actions */
		font-weight: 600; /* Bolder for emphasis */
		padding-inline: 2rem; /* Extra padding for larger button */
	}

	/* Icon styling */
	:global(.pos-button .material-symbols-outlined) {
		font-size: 1.25em;
	}

	/* Enhanced touch feedback */
	:global(.pos-button:active:not(:disabled)) {
		transform: scale(0.98);
	}

	/* Ensure proper spacing between text and icons */
	:global(.pos-button > *) {
		margin-inline: 0.25rem;
	}
</style>
