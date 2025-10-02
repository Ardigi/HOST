/**
 * Design Tokens - Typography System
 * Material Design 3 type scale
 */

export interface TypeScale {
	fontSize: string;
	lineHeight: string;
	fontWeight: number;
	letterSpacing: string;
}

export interface TypographyTokens {
	// Display
	displayLarge: TypeScale;
	displayMedium: TypeScale;
	displaySmall: TypeScale;

	// Headline
	headlineLarge: TypeScale;
	headlineMedium: TypeScale;
	headlineSmall: TypeScale;

	// Title
	titleLarge: TypeScale;
	titleMedium: TypeScale;
	titleSmall: TypeScale;

	// Body
	bodyLarge: TypeScale;
	bodyMedium: TypeScale;
	bodySmall: TypeScale;

	// Label
	labelLarge: TypeScale;
	labelMedium: TypeScale;
	labelSmall: TypeScale;
}

/**
 * Material Design 3 Type Scale
 */
export const typography: TypographyTokens = {
	// Display - Largest text on screen (hero sections)
	displayLarge: {
		fontSize: '57px',
		lineHeight: '64px',
		fontWeight: 400,
		letterSpacing: '-0.25px',
	},
	displayMedium: {
		fontSize: '45px',
		lineHeight: '52px',
		fontWeight: 400,
		letterSpacing: '0px',
	},
	displaySmall: {
		fontSize: '36px',
		lineHeight: '44px',
		fontWeight: 400,
		letterSpacing: '0px',
	},

	// Headline - High-emphasis text (page titles)
	headlineLarge: {
		fontSize: '32px',
		lineHeight: '40px',
		fontWeight: 400,
		letterSpacing: '0px',
	},
	headlineMedium: {
		fontSize: '28px',
		lineHeight: '36px',
		fontWeight: 400,
		letterSpacing: '0px',
	},
	headlineSmall: {
		fontSize: '24px',
		lineHeight: '32px',
		fontWeight: 400,
		letterSpacing: '0px',
	},

	// Title - Medium-emphasis text (section headings)
	titleLarge: {
		fontSize: '22px',
		lineHeight: '28px',
		fontWeight: 400,
		letterSpacing: '0px',
	},
	titleMedium: {
		fontSize: '16px',
		lineHeight: '24px',
		fontWeight: 500,
		letterSpacing: '0.15px',
	},
	titleSmall: {
		fontSize: '14px',
		lineHeight: '20px',
		fontWeight: 500,
		letterSpacing: '0.1px',
	},

	// Body - Primary text content
	bodyLarge: {
		fontSize: '16px',
		lineHeight: '24px',
		fontWeight: 400,
		letterSpacing: '0.5px',
	},
	bodyMedium: {
		fontSize: '14px',
		lineHeight: '20px',
		fontWeight: 400,
		letterSpacing: '0.25px',
	},
	bodySmall: {
		fontSize: '12px',
		lineHeight: '16px',
		fontWeight: 400,
		letterSpacing: '0.4px',
	},

	// Label - Button text, form labels
	labelLarge: {
		fontSize: '14px',
		lineHeight: '20px',
		fontWeight: 500,
		letterSpacing: '0.1px',
	},
	labelMedium: {
		fontSize: '12px',
		lineHeight: '16px',
		fontWeight: 500,
		letterSpacing: '0.5px',
	},
	labelSmall: {
		fontSize: '11px',
		lineHeight: '16px',
		fontWeight: 500,
		letterSpacing: '0.5px',
	},
};

/**
 * Font family tokens
 */
export const fontFamilies = {
	brand: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	plain: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	code: '"JetBrains Mono", "Fira Code", Consolas, monospace',
} as const;

/**
 * Font weight scale
 */
export const fontWeights = {
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
} as const;
