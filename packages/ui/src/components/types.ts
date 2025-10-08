/**
 * Shared component types
 */

import type { HTMLOptionAttributes } from 'svelte/elements';

/**
 * Select component option type
 * Extends HTMLOptionAttributes to support all standard option attributes
 */
export interface SelectOption extends HTMLOptionAttributes {
	/**
	 * Display text for the option
	 */
	text: string;

	/**
	 * Value of the option
	 */
	value: string;
}

/**
 * List component item type
 */
export interface ListItem {
	/**
	 * Unique identifier for the item
	 */
	id: string;

	/**
	 * Primary text to display
	 */
	text: string;

	/**
	 * Optional secondary/supporting text
	 */
	secondaryText?: string;

	/**
	 * Optional icon name (Material Symbols)
	 */
	icon?: string;
}
