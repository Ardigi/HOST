/**
 * Design Tokens - Touch Target Sizes
 * POS-optimized for touch interaction (WCAG 2.1 AA compliant)
 */

export interface TouchTargetTokens {
	minimum: string; // 48px - WCAG 2.1 AA minimum
	comfortable: string; // 56px - Recommended for primary actions
	critical: string; // 80px - Critical POS transaction buttons
}

/**
 * Touch target sizes (POS optimized)
 */
export const touchTargets: TouchTargetTokens = {
	minimum: '48px', // WCAG 2.1 AA (Level AA Success Criterion 2.5.5)
	comfortable: '56px', // Material Design 3 recommended
	critical: '80px', // Critical actions (payment, void, etc.)
};

/**
 * Component-specific touch targets
 */
export const componentTouchTargets = {
	// Buttons
	buttonSmall: touchTargets.minimum, // 48px - Secondary actions
	buttonMedium: touchTargets.comfortable, // 56px - Primary actions
	buttonLarge: touchTargets.critical, // 80px - Critical POS actions

	// Form inputs
	inputHeight: touchTargets.comfortable, // 56px
	checkboxSize: touchTargets.minimum, // 48px
	radioSize: touchTargets.minimum, // 48px
	switchWidth: '52px', // Toggle switches

	// Navigation
	tabHeight: touchTargets.comfortable, // 56px
	listItemHeight: touchTargets.comfortable, // 56px
	menuItemHeight: touchTargets.minimum, // 48px

	// Icons
	iconButtonSmall: touchTargets.minimum, // 48px
	iconButtonMedium: touchTargets.comfortable, // 56px
	iconButtonLarge: touchTargets.critical, // 80px

	// POS specific
	menuItemCard: '120px', // Menu item selection cards
	tableButton: touchTargets.critical, // 80px - Table selection
	paymentButton: touchTargets.critical, // 80px - Payment type
} as const;

/**
 * Minimum spacing between touch targets
 * WCAG 2.1 recommends at least 8px spacing
 */
export const touchSpacing = {
	minimum: '8px', // WCAG 2.1 recommended
	comfortable: '16px', // Better for dense interfaces
} as const;
