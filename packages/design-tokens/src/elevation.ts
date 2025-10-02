/**
 * Design Tokens - Elevation System
 * Material Design 3 shadow levels
 */

export interface ElevationTokens {
	level0: string; // No elevation
	level1: string; // 1dp - Lowest elevation
	level2: string; // 3dp - Cards, contained buttons
	level3: string; // 6dp - FABs, top app bar (scrolled)
	level4: string; // 8dp - Navigation drawer
	level5: string; // 12dp - Dialogs, pickers
}

/**
 * Material Design 3 elevation levels
 */
export const elevation: ElevationTokens = {
	level0: 'none',

	level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',

	level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',

	level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',

	level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',

	level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
};

/**
 * Component-specific elevation mapping
 */
export const componentElevation = {
	// Surfaces
	surfaceDefault: elevation.level0, // Flat surface
	surfaceRaised: elevation.level1, // Slightly raised

	// Cards
	cardResting: elevation.level1, // Default card
	cardHovered: elevation.level2, // Card on hover
	cardDragged: elevation.level4, // Card being dragged

	// Buttons
	buttonResting: elevation.level0, // Flat button
	buttonHovered: elevation.level1, // Button on hover
	buttonPressed: elevation.level0, // Button pressed

	// FAB (Floating Action Button)
	fabResting: elevation.level3, // Default FAB
	fabHovered: elevation.level4, // FAB on hover
	fabPressed: elevation.level2, // FAB pressed

	// Navigation
	navigationDrawer: elevation.level1, // Side drawer
	appBar: elevation.level0, // Top bar (flat)
	appBarScrolled: elevation.level2, // Top bar (scrolled)

	// Dialogs & Modals
	dialog: elevation.level5, // Modal dialogs
	bottomSheet: elevation.level3, // Bottom sheets
	menu: elevation.level2, // Dropdown menus

	// POS specific
	orderCard: elevation.level1, // Order cards
	activeOrder: elevation.level3, // Selected/active order
	paymentDialog: elevation.level5, // Payment modal
} as const;
