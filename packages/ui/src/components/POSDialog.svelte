<script lang="ts">
/**
 * POS-optimized Dialog component
 * Wraps m3-svelte Dialog with enhanced touch targets for POS use
 *
 * Dialog types:
 * - Standard: General-purpose dialog
 * - Alert: Critical messages requiring user response
 *
 * Usage:
 * - Simple: Use content prop with primaryAction/secondaryAction
 * - Complex: Use children and customButtons snippets for forms
 *
 * @component
 */
import type { Snippet } from 'svelte';
import { Dialog } from 'm3-svelte';
import POSButton from './POSButton.svelte';

interface Props {
	/**
	 * Dialog headline text
	 */
	headline: string;

	/**
	 * Dialog content text (simple mode)
	 * Mutually exclusive with children snippet
	 */
	content?: string;

	/**
	 * Custom children snippet for complex content (e.g., forms)
	 * Mutually exclusive with content prop
	 */
	children?: Snippet;

	/**
	 * Custom buttons snippet for complex actions
	 * If not provided, uses primaryAction/secondaryAction props
	 */
	customButtons?: Snippet;

	/**
	 * Controls dialog visibility
	 */
	open?: boolean;

	/**
	 * Dialog type for accessibility
	 * - standard: General dialog
	 * - alert: Critical alert dialog
	 */
	type?: 'standard' | 'alert';

	/**
	 * Primary action button text (simple mode)
	 * Only used if customButtons snippet not provided
	 */
	primaryAction?: string;

	/**
	 * Secondary action button text (simple mode)
	 * Only used if customButtons snippet not provided
	 */
	secondaryAction?: string;

	/**
	 * Primary action button variant
	 * - standard: Regular action
	 * - critical: High-stakes action (e.g., delete, void)
	 */
	primaryActionVariant?: 'standard' | 'critical';

	/**
	 * Primary action click handler
	 */
	onPrimaryAction?: () => void;

	/**
	 * Secondary action click handler
	 */
	onSecondaryAction?: () => void;

	/**
	 * Dialog close handler
	 */
	onClose?: () => void;

	/**
	 * Custom aria-label (overrides headline)
	 */
	ariaLabel?: string;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	headline,
	content,
	children,
	customButtons,
	open = $bindable(false),
	type = 'standard',
	primaryAction,
	secondaryAction,
	primaryActionVariant = 'standard',
	onPrimaryAction,
	onSecondaryAction,
	onClose,
	ariaLabel,
	class: className = '',
}: Props = $props();

// Watch for open state changes to trigger onClose
let wasOpen = $state(false);
$effect(() => {
	// Only call onClose when transitioning from open to closed
	if (wasOpen && !open && onClose) {
		onClose();
	}
	wasOpen = open;
});

// Handle primary action
function handlePrimaryAction() {
	if (onPrimaryAction) {
		onPrimaryAction();
	}
}

// Handle secondary action
function handleSecondaryAction() {
	if (onSecondaryAction) {
		onSecondaryAction();
	}
}
</script>

<Dialog
	{headline}
	bind:open
	role={type === 'alert' ? 'alertdialog' : 'dialog'}
	aria-label={ariaLabel || headline}
	class="pos-dialog {className}"
>
	{#if children}
		{@render children()}
	{:else if content}
		<div class="pos-dialog-content">
			{content}
		</div>
	{/if}

	{#snippet buttons()}
		{#if customButtons}
			{@render customButtons()}
		{:else if primaryAction || secondaryAction}
			<div class="pos-dialog-actions">
				{#if secondaryAction}
					<POSButton
						label={secondaryAction}
						variant="text"
						size="standard"
						onclick={handleSecondaryAction}
					/>
				{/if}
				{#if primaryAction}
					<POSButton
						label={primaryAction}
						variant="filled"
						size={primaryActionVariant === 'critical' ? 'comfortable' : 'standard'}
						onclick={handlePrimaryAction}
					/>
				{/if}
			</div>
		{/if}
	{/snippet}
</Dialog>

<style>
	/* Dialog content styling */
	:global(.pos-dialog-content) {
		font-size: 1rem;
		line-height: 1.5;
		color: var(--md-sys-color-on-surface-variant, #49454f);
		padding: 1rem 0;
	}

	/* Actions container */
	:global(.pos-dialog-actions) {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding: 0;
	}

	/* Ensure proper dialog sizing */
	:global(.pos-dialog) {
		min-width: 280px;
		max-width: 560px;
	}
</style>
