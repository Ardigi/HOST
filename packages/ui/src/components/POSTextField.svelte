<script lang="ts">
/**
 * POS-optimized TextField component
 * Wraps m3-svelte TextField with enhanced touch targets and spacing
 *
 * @component
 */
import { TextField } from 'm3-svelte';
import type { IconifyIcon } from '@iconify/types';
import type { HTMLInputAttributes } from 'svelte/elements';

interface Props extends Omit<HTMLInputAttributes, 'size'> {
	/**
	 * Field label text
	 */
	label: string;

	/**
	 * Input value (bindable)
	 */
	value: string;

	/**
	 * Touch target size
	 * - minimum: 48px (WCAG 2.1 AA)
	 * - comfortable: 56px (default, recommended for POS)
	 * - critical: 80px (critical actions)
	 */
	size?: 'minimum' | 'comfortable' | 'critical';

	/**
	 * Field disabled state
	 */
	disabled?: boolean;

	/**
	 * Field required state
	 */
	required?: boolean;

	/**
	 * Error state
	 */
	error?: boolean;

	/**
	 * Placeholder text
	 */
	placeholder?: string;

	/**
	 * Input type
	 */
	type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

	/**
	 * Leading icon (Iconify format)
	 */
	leadingIcon?: IconifyIcon;

	/**
	 * Input event handler
	 */
	oninput?: (event: Event) => void;

	/**
	 * Blur event handler
	 */
	onblur?: (event: FocusEvent) => void;

	/**
	 * Focus event handler
	 */
	onfocus?: (event: FocusEvent) => void;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

// biome-ignore lint/correctness/noUnusedVariables: All props are forwarded to TextField component
let {
	label,
	value = $bindable(''),
	size = 'comfortable',
	disabled = false,
	required = false,
	error = false,
	placeholder = '',
	type = 'text',
	leadingIcon,
	oninput,
	onblur,
	onfocus,
	class: className = '',
	...restProps
}: Props = $props();

// Calculate height based on size
const heightMap = {
	minimum: '48px',
	comfortable: '56px',
	critical: '80px',
};

const fieldHeight = $derived(heightMap[size]);
</script>

<div class="pos-text-field {className}" style:min-height={fieldHeight}>
	<TextField
		{label}
		bind:value
		{disabled}
		{required}
		{error}
		{placeholder}
		{type}
		leadingIcon={leadingIcon}
		{oninput}
		{onblur}
		{onfocus}
		aria-required={required}
		{...restProps}
	/>
</div>

<style>
	/* POS-optimized text field styling */
	:global(.pos-text-field) {
		width: 100%;
		position: relative;
	}

	/* Enhanced touch target */
	:global(.pos-text-field input) {
		min-height: inherit;
		font-size: 16px; /* Prevent zoom on mobile */
		padding: 0.75rem 1rem; /* 12px 16px - comfortable spacing */
	}

	/* Focus state for better visibility */
	:global(.pos-text-field input:focus) {
		outline-offset: 2px;
	}

	/* Error state styling */
	:global(.pos-text-field[data-error='true']) {
		--md-sys-color-error: var(--color-error, #dc2626);
	}

	/* Disabled state */
	:global(.pos-text-field input:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Label spacing for touch targets */
	:global(.pos-text-field label) {
		margin-bottom: 0.5rem; /* 8px */
	}
</style>
