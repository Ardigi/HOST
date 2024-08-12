<script lang="ts">
/**
 * Test wrapper for POSCard component
 * Provides a simple interface for testing snippet-based children
 */
import POSCard from '../POSCard.svelte';

interface Props {
	variant?: 'elevated' | 'filled' | 'outlined';
	onclick?: () => void;
	class?: string;
	testContent: string;
	showTitle?: boolean;
}

let { variant, onclick, class: className, testContent, showTitle = false }: Props = $props();
</script>

<POSCard {variant} {onclick} class={className}>
	{#if showTitle}
		<h2>Card Title</h2>
	{/if}
	<p>{testContent}</p>
</POSCard>
