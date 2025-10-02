/**
 * HOST POS Design Tokens
 * Material Design 3 tokens for consistent theming
 */

// Color system
export {
	HOST_BRAND_COLORS,
	generateHostTheme,
	generatePalette,
	generateThemeColors,
	hexToHct,
	hctToHex,
	type ColorPalette,
	type CustomColors,
	type HctColor,
	type ThemeColors,
} from './colors.js';

// Typography
export {
	fontFamilies,
	fontWeights,
	typography,
	type TypeScale,
	type TypographyTokens,
} from './typography.js';

// Spacing
export {
	componentSpacing,
	gridSpacing,
	spacing,
	type SpacingTokens,
} from './spacing.js';

// Touch targets
export {
	componentTouchTargets,
	touchSpacing,
	touchTargets,
	type TouchTargetTokens,
} from './touch-targets.js';

// Elevation
export {
	componentElevation,
	elevation,
	type ElevationTokens,
} from './elevation.js';

// Motion
export {
	animations,
	duration,
	easing,
	transition,
	type DurationTokens,
	type EasingTokens,
} from './motion.js';

// Theme
export {
	createTheme,
	darkTheme,
	lightTheme,
	themeToCSS,
	themeToCssVariables,
	type Theme,
} from './theme.js';
