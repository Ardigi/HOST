/**
 * Shared component types
 */

/**
 * Select component option type
 */
export interface SelectOption {
	/**
	 * Display text for the option
	 */
	text: string;

	/**
	 * Value of the option
	 */
	value: string;

	/**
	 * Optional icon name (Material Symbols)
	 */
	icon?: string;
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
