/**
 * Tests for Theme System
 * Validates theme generation, CSS variable conversion, and theme composition
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { animations, duration, easing } from './motion';
import { componentSpacing, spacing } from './spacing';
import {
	type Theme,
	createTheme,
	darkTheme,
	lightTheme,
	themeToCSS,
	themeToCssVariables,
} from './theme';
import { componentTouchTargets, touchTargets } from './touch-targets';
import { typography } from './typography';

describe('Theme System', () => {
	describe('createTheme', () => {
		it('should create light theme with correct mode', () => {
			const theme = createTheme('light');

			expect(theme.mode).toBe('light');
			expect(theme.name).toBe('host-pos-light');
		});

		it('should create dark theme with correct mode', () => {
			const theme = createTheme('dark');

			expect(theme.mode).toBe('dark');
			expect(theme.name).toBe('host-pos-dark');
		});

		it('should include all required theme properties', () => {
			const theme = createTheme('light');

			expect(theme).toHaveProperty('name');
			expect(theme).toHaveProperty('mode');
			expect(theme).toHaveProperty('colors');
			expect(theme).toHaveProperty('typography');
			expect(theme).toHaveProperty('spacing');
			expect(theme).toHaveProperty('touchTargets');
			expect(theme).toHaveProperty('elevation');
			expect(theme).toHaveProperty('motion');
			expect(theme).toHaveProperty('fonts');
			expect(theme).toHaveProperty('fontWeights');
			expect(theme).toHaveProperty('components');
		});

		it('should include typography system', () => {
			const theme = createTheme('light');

			expect(theme.typography).toBe(typography);
			expect(theme.typography).toHaveProperty('displayLarge');
			expect(theme.typography).toHaveProperty('bodyMedium');
			expect(theme.typography).toHaveProperty('labelSmall');
		});

		it('should include spacing system', () => {
			const theme = createTheme('light');

			expect(theme.spacing).toBe(spacing);
			expect(theme.spacing).toHaveProperty('xs');
			expect(theme.spacing).toHaveProperty('md');
			expect(theme.spacing).toHaveProperty('xxl');
		});

		it('should include touch targets', () => {
			const theme = createTheme('light');

			expect(theme.touchTargets).toBe(touchTargets);
			expect(theme.touchTargets).toHaveProperty('minimum');
			expect(theme.touchTargets).toHaveProperty('comfortable');
			expect(theme.touchTargets).toHaveProperty('critical');
		});

		it('should include motion system with duration, easing, and animations', () => {
			const theme = createTheme('light');

			expect(theme.motion.duration).toBe(duration);
			expect(theme.motion.easing).toBe(easing);
			expect(theme.motion.animations).toBe(animations);
		});

		it('should include component systems', () => {
			const theme = createTheme('light');

			expect(theme.components.spacing).toBe(componentSpacing);
			expect(theme.components.touchTargets).toBe(componentTouchTargets);
			expect(theme.components).toHaveProperty('elevation');
		});

		it('should generate different color palettes for light and dark modes', () => {
			const light = createTheme('light');
			const dark = createTheme('dark');

			// Light and dark should have different color values
			expect(light.colors.primary).not.toBe(dark.colors.primary);
			expect(light.colors.background).not.toBe(dark.colors.background);
		});

		it('should have consistent structure across light and dark themes', () => {
			const light = createTheme('light');
			const dark = createTheme('dark');

			// Both should have the same keys
			expect(Object.keys(light)).toEqual(Object.keys(dark));
			expect(Object.keys(light.colors)).toEqual(Object.keys(dark.colors));
		});
	});

	describe('themeToCssVariables', () => {
		let theme: Theme;

		beforeEach(() => {
			theme = createTheme('light');
		});

		it('should convert theme to CSS custom properties object', () => {
			const vars = themeToCssVariables(theme);

			expect(typeof vars).toBe('object');
			expect(Object.keys(vars).length).toBeGreaterThan(0);
		});

		it('should convert color properties with --color prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--color-primary');
			expect(vars).toHaveProperty('--color-background');
			expect(vars).toHaveProperty('--color-surface');
			expect(vars).toHaveProperty('--color-error');
		});

		it('should convert spacing properties with --spacing prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--spacing-xs');
			expect(vars).toHaveProperty('--spacing-md');
			expect(vars).toHaveProperty('--spacing-xxl');
			expect(vars['--spacing-md']).toBe(spacing.md);
		});

		it('should convert touch target properties with --touch prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--touch-minimum');
			expect(vars).toHaveProperty('--touch-comfortable');
			expect(vars).toHaveProperty('--touch-critical');
			expect(vars['--touch-minimum']).toBe(touchTargets.minimum);
		});

		it('should convert typography properties with kebab-case', () => {
			const vars = themeToCssVariables(theme);

			// displayLarge -> display-large
			expect(vars).toHaveProperty('--type-display-large-size');
			expect(vars).toHaveProperty('--type-display-large-line-height');
			expect(vars).toHaveProperty('--type-display-large-weight');
			expect(vars).toHaveProperty('--type-display-large-letter-spacing');

			// bodyMedium -> body-medium
			expect(vars).toHaveProperty('--type-body-medium-size');
			expect(vars).toHaveProperty('--type-body-medium-line-height');
		});

		it('should convert typography scale values correctly', () => {
			const vars = themeToCssVariables(theme);

			expect(vars['--type-display-large-size']).toBe(typography.displayLarge.fontSize);
			expect(vars['--type-display-large-line-height']).toBe(typography.displayLarge.lineHeight);
			expect(vars['--type-display-large-weight']).toBe(String(typography.displayLarge.fontWeight));
		});

		it('should convert font family properties with --font prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--font-brand');
			expect(vars).toHaveProperty('--font-plain');
			expect(vars).toHaveProperty('--font-code');
		});

		it('should convert elevation properties with --elevation prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--elevation-level0');
			expect(vars).toHaveProperty('--elevation-level1');
			expect(vars).toHaveProperty('--elevation-level2');
			expect(vars).toHaveProperty('--elevation-level3');
			expect(vars).toHaveProperty('--elevation-level4');
		});

		it('should convert motion duration properties with --duration prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--duration-short1');
			expect(vars).toHaveProperty('--duration-medium1');
			expect(vars).toHaveProperty('--duration-long1');
			expect(vars['--duration-medium1']).toBe(duration.medium1);
		});

		it('should convert motion easing properties with --easing prefix', () => {
			const vars = themeToCssVariables(theme);

			expect(vars).toHaveProperty('--easing-emphasized');
			expect(vars).toHaveProperty('--easing-standard');
			expect(vars['--easing-standard']).toBe(easing.standard);
		});

		it('should handle camelCase to kebab-case conversion correctly', () => {
			const vars = themeToCssVariables(theme);

			// primaryContainer -> primary-container
			expect(vars).toHaveProperty('--color-primary-container');
			// onPrimaryContainer -> on-primary-container
			expect(vars).toHaveProperty('--color-on-primary-container');
		});

		it('should produce valid CSS variable names', () => {
			const vars = themeToCssVariables(theme);

			// All keys should start with --
			for (const key of Object.keys(vars)) {
				expect(key).toMatch(/^--/);
			}
		});

		it('should produce valid CSS values', () => {
			const vars = themeToCssVariables(theme);

			// All values should be strings
			for (const value of Object.values(vars)) {
				expect(typeof value).toBe('string');
			}
		});
	});

	describe('themeToCSS', () => {
		it('should generate CSS string for light theme', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			expect(typeof css).toBe('string');
			expect(css.length).toBeGreaterThan(0);
		});

		it('should generate CSS string for dark theme', () => {
			const theme = createTheme('dark');
			const css = themeToCSS(theme);

			expect(typeof css).toBe('string');
			expect(css.length).toBeGreaterThan(0);
		});

		it('should use :root selector for light theme', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			expect(css).toContain(':root {');
		});

		it('should use [data-theme="dark"] selector for dark theme', () => {
			const theme = createTheme('dark');
			const css = themeToCSS(theme);

			expect(css).toContain('[data-theme="dark"] {');
		});

		it('should include CSS custom property declarations', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			expect(css).toContain('--color-primary:');
			expect(css).toContain('--spacing-md:');
			expect(css).toContain('--touch-minimum:');
		});

		it('should format CSS properties with proper indentation', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			// Should have indented properties
			expect(css).toMatch(/ {2}--[\w-]+:/);
		});

		it('should end with closing brace', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			expect(css.trim()).toMatch(/}$/);
		});

		it('should include all theme properties as CSS variables', () => {
			const theme = createTheme('light');
			const css = themeToCSS(theme);

			// Colors
			expect(css).toContain('--color-primary');
			expect(css).toContain('--color-background');

			// Spacing
			expect(css).toContain('--spacing-md');

			// Touch targets
			expect(css).toContain('--touch-minimum');

			// Typography
			expect(css).toContain('--type-body-medium-size');

			// Elevation
			expect(css).toContain('--elevation-level1');

			// Motion
			expect(css).toContain('--duration-medium1');
			expect(css).toContain('--easing-standard');
		});
	});

	describe('Pre-generated themes', () => {
		it('should export lightTheme constant', () => {
			expect(lightTheme).toBeDefined();
			expect(lightTheme.mode).toBe('light');
			expect(lightTheme.name).toBe('host-pos-light');
		});

		it('should export darkTheme constant', () => {
			expect(darkTheme).toBeDefined();
			expect(darkTheme.mode).toBe('dark');
			expect(darkTheme.name).toBe('host-pos-dark');
		});

		it('should have all required properties in lightTheme', () => {
			expect(lightTheme).toHaveProperty('colors');
			expect(lightTheme).toHaveProperty('typography');
			expect(lightTheme).toHaveProperty('spacing');
			expect(lightTheme).toHaveProperty('touchTargets');
			expect(lightTheme).toHaveProperty('elevation');
			expect(lightTheme).toHaveProperty('motion');
			expect(lightTheme).toHaveProperty('fonts');
			expect(lightTheme).toHaveProperty('fontWeights');
			expect(lightTheme).toHaveProperty('components');
		});

		it('should have all required properties in darkTheme', () => {
			expect(darkTheme).toHaveProperty('colors');
			expect(darkTheme).toHaveProperty('typography');
			expect(darkTheme).toHaveProperty('spacing');
			expect(darkTheme).toHaveProperty('touchTargets');
			expect(darkTheme).toHaveProperty('elevation');
			expect(darkTheme).toHaveProperty('motion');
			expect(darkTheme).toHaveProperty('fonts');
			expect(darkTheme).toHaveProperty('fontWeights');
			expect(darkTheme).toHaveProperty('components');
		});

		it('should have different colors in light and dark themes', () => {
			expect(lightTheme.colors.primary).not.toBe(darkTheme.colors.primary);
			expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
		});

		it('should share the same typography system', () => {
			expect(lightTheme.typography).toBe(darkTheme.typography);
		});

		it('should share the same spacing system', () => {
			expect(lightTheme.spacing).toBe(darkTheme.spacing);
		});

		it('should share the same touch targets', () => {
			expect(lightTheme.touchTargets).toBe(darkTheme.touchTargets);
		});
	});
});
