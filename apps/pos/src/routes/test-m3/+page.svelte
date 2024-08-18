<script lang="ts">
// Import from source paths to bypass index.js barrel export (which loads Slider → svelte/motion → SSR error)
// See docs/m3-svelte-integration.md for details on this pattern
import Button from 'm3-svelte/package/buttons/Button.svelte';
import Card from 'm3-svelte/package/containers/Card.svelte';

// biome-ignore lint/correctness/noUnusedVariables: Used in onclick handlers
function handleClick() {
	console.log('Button clicked!');
}
</script>

<div style="padding: 2rem;">
	<h1>Testing m3-svelte Components</h1>

	<h2>Button Test</h2>
	<Button variant="filled" onclick={handleClick}>
		Filled Button
	</Button>

	<Button variant="outlined" onclick={handleClick}>
		Outlined Button
	</Button>

	<Button variant="text" onclick={handleClick}>
		Text Button
	</Button>

	<h2>Card Test</h2>
	<Card variant="filled">
		<div style="padding: 1.5rem;">
			<h3>Filled Card</h3>
			<p>This is a test card using m3-svelte Card component.</p>
		</div>
	</Card>

	<Card variant="elevated">
		<div style="padding: 1.5rem;">
			<h3>Elevated Card</h3>
			<p>This card has elevation (shadow).</p>
		</div>
	</Card>

	<Card variant="outlined">
		<div style="padding: 1.5rem;">
			<h3>Outlined Card</h3>
			<p>This card has a border outline.</p>
		</div>
	</Card>
</div>
