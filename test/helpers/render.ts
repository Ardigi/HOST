/**
 * Render Helpers for Svelte Component Testing
 */

import { type RenderOptions, render } from '@testing-library/svelte';
import type { Component, ComponentProps } from 'svelte';

/**
 * Custom render function with common test setup
 */
export function renderWithDefaults<T extends Component>(
	component: T,
	options?: RenderOptions<ComponentProps<T>>
) {
	return render(component, {
		...options,
	});
}

/**
 * Wait for next tick (Svelte reactivity)
 */
export function tick(): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, 0);
	});
}
