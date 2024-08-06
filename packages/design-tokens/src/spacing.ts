/**
 * Design Tokens - Spacing System
 * 8px base unit scale
 */

export interface SpacingTokens {
	xs: string; // 4px
	sm: string; // 8px
	md: string; // 16px
	lg: string; // 24px
	xl: string; // 32px
	xxl: string; // 48px
	xxxl: string; // 64px
}

/**
 * Spacing scale (8px base unit)
 */
export const spacing: SpacingTokens = {
	xs: '4px', // 0.5 * 8
	sm: '8px', // 1 * 8
	md: '16px', // 2 * 8
	lg: '24px', // 3 * 8
	xl: '32px', // 4 * 8
	xxl: '48px', // 6 * 8
	xxxl: '64px', // 8 * 8
};

/**
 * Component-specific spacing
 */
export const componentSpacing = {
	// Padding
	paddingCompact: spacing.sm, // 8px - Dense layouts
	paddingStandard: spacing.md, // 16px - Default
	paddingComfortable: spacing.lg, // 24px - Spacious layouts

	// Gaps
	gapTight: spacing.xs, // 4px - Inline elements
	gapStandard: spacing.sm, // 8px - List items
	gapRelaxed: spacing.md, // 16px - Card layouts

	// Margins
	marginSection: spacing.xl, // 32px - Between sections
	marginPage: spacing.xxl, // 48px - Page margins
} as const;

/**
 * Grid system spacing
 */
export const gridSpacing = {
	gutter: spacing.md, // 16px - Grid gutter
	columnGap: spacing.md, // 16px - Between columns
	rowGap: spacing.lg, // 24px - Between rows
} as const;
