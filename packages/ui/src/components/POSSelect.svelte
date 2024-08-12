<script lang="ts">
/**
 * POS-optimized Select component
 * Wraps m3-svelte Select with enhanced touch targets for POS use
 *
 * Touch target requirements:
 * - Minimum: 48px (WCAG 2.1 AA compliance)
 * - Comfortable: 56px (recommended for tablets)
 *
 * @component
 */
import { Select } from 'm3-svelte';

import type { SelectOption } from './types';

interface Props {
	/**
	 * Label text for the select
	 */
	label: string;

	/**
	 * Array of selectable options
	 */
	options: SelectOption[];

	/**
	 * Selected value (bindable)
	 */
	value?: string;

	/**
	 * Select size variant optimized for POS
	 * - standard: 48px minimum (WCAG 2.1 AA)
	 * - comfortable: 56px (tablet optimized)
	 */
	size?: 'standard' | 'comfortable';

	/**
	 * Disabled state
	 */
	disabled?: boolean;

	/**
	 * Required attribute
	 */
	required?: boolean;

	/**
	 * Custom width (e.g., "300px", "100%")
	 */
	width?: string;

	/**
	 * Change handler
	 */
	onChange?: (value: string) => void;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	label,
	options,
	value = $bindable(''),
	size = 'standard',
	disabled = false,
	required = false,
	width = 'auto',
	onChange,
	class: className = '',
}: Props = $props();

// Calculate size class based on size prop
const sizeClass = $derived(() => {
	switch (size) {
		case 'comfortable':
			return 'pos-select-comfortable';
		default:
			return 'pos-select-standard';
	}
});

// Handle value changes
function handleChange(event: Event) {
	const target = event.target as HTMLSelectElement;
	value = target.value;
	if (onChange) {
		onChange(value);
	}
}
</script>

<Select
	{label}
	{options}
	bind:value
	{width}
	{disabled}
	{required}
	onchange={handleChange}
	class="pos-select {sizeClass()} {className}"
/>

<style>
	/* Base POS select styling */
	:global(.pos-select) {
		/* Ensure readable font size for POS environment */
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0.03125em;

		/* Touch-friendly padding */
		padding-inline: 1rem;

		/* Smooth transitions */
		transition: all var(--host-transition-fast, 200ms) ease;
	}

	/* Standard size: WCAG 2.1 AA minimum (48px) */
	:global(.pos-select-standard) {
		min-height: 48px;
		height: 48px;
	}

	/* Comfortable size: Tablet optimized (56px) */
	:global(.pos-select-comfortable) {
		min-height: 56px;
		height: 56px;
		font-size: 1.0625rem; /* Slightly larger text for comfortable size */
	}

	/* Enhanced touch feedback */
	:global(.pos-select:focus-within:not(:disabled)) {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: 2px;
	}

	/* Disabled state */
	:global(.pos-select:disabled) {
		opacity: 0.38;
		cursor: not-allowed;
	}
</style>
