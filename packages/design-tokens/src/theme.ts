/**
 * Design Tokens - Theme System
 * Complete theme generation for light and dark modes
 */

import type { ThemeColors } from './colors.js';
import { generateHostTheme } from './colors.js';
import { componentElevation, elevation } from './elevation.js';
import { animations, duration, easing } from './motion.js';
import { componentSpacing, spacing } from './spacing.js';
import { componentTouchTargets, touchTargets } from './touch-targets.js';
import { fontFamilies, fontWeights, typography } from './typography.js';

export interface Theme {
	name: string;
	mode: 'light' | 'dark';
	colors: ThemeColors;
	typography: typeof typography;
	spacing: typeof spacing;
	touchTargets: typeof touchTargets;
	elevation: typeof elevation;
	motion: {
		duration: typeof duration;
		easing: typeof easing;
		animations: typeof animations;
	};
	fonts: typeof fontFamilies;
	fontWeights: typeof fontWeights;
	components: {
		spacing: typeof componentSpacing;
		touchTargets: typeof componentTouchTargets;
		elevation: typeof componentElevation;
	};
}

/**
 * Generate complete theme
 */
export function createTheme(mode: 'light' | 'dark'): Theme {
	return {
		name: `host-pos-${mode}`,
		mode,
		colors: generateHostTheme(mode),
		typography,
		spacing,
		touchTargets,
		elevation,
		motion: {
			duration,
			easing,
			animations,
		},
		fonts: fontFamilies,
		fontWeights,
		components: {
			spacing: componentSpacing,
			touchTargets: componentTouchTargets,
			elevation: componentElevation,
		},
	};
}

/**
 * Generate CSS custom properties from theme
 */
export function themeToCssVariables(theme: Theme): Record<string, string> {
	const vars: Record<string, string> = {};

	// Colors
	for (const [key, value] of Object.entries(theme.colors)) {
		const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
		vars[`--color-${kebabKey}`] = value;
	}

	// Spacing
	for (const [key, value] of Object.entries(theme.spacing)) {
		vars[`--spacing-${key}`] = value;
	}

	// Touch targets
	for (const [key, value] of Object.entries(theme.touchTargets)) {
		vars[`--touch-${key}`] = value;
	}

	// Typography
	for (const [key, scale] of Object.entries(theme.typography)) {
		const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
		vars[`--type-${kebabKey}-size`] = scale.fontSize;
		vars[`--type-${kebabKey}-line-height`] = scale.lineHeight;
		vars[`--type-${kebabKey}-weight`] = String(scale.fontWeight);
		vars[`--type-${kebabKey}-letter-spacing`] = scale.letterSpacing;
	}

	// Font families
	for (const [key, value] of Object.entries(theme.fonts)) {
		vars[`--font-${key}`] = value;
	}

	// Elevation
	for (const [key, value] of Object.entries(theme.elevation)) {
		vars[`--elevation-${key}`] = value;
	}

	// Motion durations
	for (const [key, value] of Object.entries(theme.motion.duration)) {
		vars[`--duration-${key}`] = value;
	}

	// Motion easing
	for (const [key, value] of Object.entries(theme.motion.easing)) {
		vars[`--easing-${key}`] = value;
	}

	return vars;
}

/**
 * Generate CSS string from theme
 */
export function themeToCSS(theme: Theme): string {
	const vars = themeToCssVariables(theme);
	const selector = theme.mode === 'dark' ? '[data-theme="dark"]' : ':root';

	const cssVars = Object.entries(vars)
		.map(([key, value]) => `  ${key}: ${value};`)
		.join('\n');

	return `${selector} {\n${cssVars}\n}`;
}

/**
 * Pre-generated themes
 */
export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');
