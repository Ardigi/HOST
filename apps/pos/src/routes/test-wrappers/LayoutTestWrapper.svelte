<script lang="ts">
/**
 * Test wrapper for Layout component
 * Provides a simple interface for testing snippet-based children
 */
import Layout from '../+layout.svelte';

interface Props {
	testContent: string;
	showMultipleElements?: boolean;
}

let { testContent, showMultipleElements = false }: Props = $props();
</script>

<Layout>
	{#if showMultipleElements}
		<h2>Test Heading</h2>
		<p>{testContent}</p>
		<button type="button">Test Button</button>
	{:else}
		<p>{testContent}</p>
	{/if}
</Layout>
