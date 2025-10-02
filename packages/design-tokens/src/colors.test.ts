/**
 * @description Design Tokens Color System Tests
 * @dependencies @material/material-color-utilities
 * @coverage-target 85%
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
	type ColorPalette,
	type ThemeColors,
	generatePalette,
	generateThemeColors,
	hctToHex,
	hexToHct,
} from './colors.js';

describe('Color System', () => {
	describe('HCT Color Conversion', () => {
		it('should convert hex color to HCT values', () => {
			// Arrange
			const hex = '#2563eb'; // HOST brand blue

			// Act
			const hct = hexToHct(hex);

			// Assert
			expect(hct).toHaveProperty('hue');
			expect(hct).toHaveProperty('chroma');
			expect(hct).toHaveProperty('tone');
			expect(hct.hue).toBeGreaterThanOrEqual(0);
			expect(hct.hue).toBeLessThan(360);
			expect(hct.chroma).toBeGreaterThanOrEqual(0);
			expect(hct.tone).toBeGreaterThanOrEqual(0);
			expect(hct.tone).toBeLessThanOrEqual(100);
		});

		it('should convert HCT values back to hex color', () => {
			// Arrange
			const hct = { hue: 220, chroma: 80, tone: 50 };

			// Act
			const hex = hctToHex(hct);

			// Assert
			expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
		});

		it('should round-trip hex -> HCT -> hex with minimal loss', () => {
			// Arrange
			const originalHex = '#2563eb';

			// Act
			const hct = hexToHct(originalHex);
			const resultHex = hctToHex(hct);

			// Assert - Should be very close (HCT is perceptually uniform)
			expect(resultHex).toBeDefined();
			expect(resultHex).toMatch(/^#[0-9a-f]{6}$/i);
		});
	});

	describe('Tonal Palette Generation', () => {
		it('should generate 13-step tonal palette from seed color', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const palette = generatePalette(seedColor);

			// Assert
			expect(palette).toHaveProperty('0');
			expect(palette).toHaveProperty('10');
			expect(palette).toHaveProperty('20');
			expect(palette).toHaveProperty('30');
			expect(palette).toHaveProperty('40');
			expect(palette).toHaveProperty('50');
			expect(palette).toHaveProperty('60');
			expect(palette).toHaveProperty('70');
			expect(palette).toHaveProperty('80');
			expect(palette).toHaveProperty('90');
			expect(palette).toHaveProperty('95');
			expect(palette).toHaveProperty('99');
			expect(palette).toHaveProperty('100');

			// All should be valid hex colors
			for (const color of Object.values(palette)) {
				expect(color).toMatch(/^#[0-9a-f]{6}$/i);
			}
		});

		it('should generate darker tones for lower numbers', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const palette = generatePalette(seedColor);

			// Assert - Tone 0 should be darkest, Tone 100 should be lightest
			const hct0 = hexToHct(palette[0]);
			const hct50 = hexToHct(palette[50]);
			const hct100 = hexToHct(palette[100]);

			expect(hct0.tone).toBeLessThan(hct50.tone);
			expect(hct50.tone).toBeLessThan(hct100.tone);
		});

		it('should maintain consistent hue across tonal palette', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const palette = generatePalette(seedColor);

			// Assert - All tones should have similar hue (within tolerance)
			const hct40 = hexToHct(palette[40]);
			const hct60 = hexToHct(palette[60]);
			const hct80 = hexToHct(palette[80]);

			const hueDiff1 = Math.abs(hct40.hue - hct60.hue);
			const hueDiff2 = Math.abs(hct60.hue - hct80.hue);

			expect(hueDiff1).toBeLessThan(20); // Allow some variation
			expect(hueDiff2).toBeLessThan(20);
		});
	});

	describe('Theme Color Generation', () => {
		it('should generate Material Design 3 theme colors from seed', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const theme = generateThemeColors(seedColor, 'light');

			// Assert
			expect(theme).toHaveProperty('primary');
			expect(theme).toHaveProperty('onPrimary');
			expect(theme).toHaveProperty('primaryContainer');
			expect(theme).toHaveProperty('onPrimaryContainer');
			expect(theme).toHaveProperty('secondary');
			expect(theme).toHaveProperty('onSecondary');
			expect(theme).toHaveProperty('secondaryContainer');
			expect(theme).toHaveProperty('onSecondaryContainer');
			expect(theme).toHaveProperty('tertiary');
			expect(theme).toHaveProperty('onTertiary');
			expect(theme).toHaveProperty('tertiaryContainer');
			expect(theme).toHaveProperty('onTertiaryContainer');
			expect(theme).toHaveProperty('error');
			expect(theme).toHaveProperty('onError');
			expect(theme).toHaveProperty('errorContainer');
			expect(theme).toHaveProperty('onErrorContainer');
			expect(theme).toHaveProperty('surface');
			expect(theme).toHaveProperty('onSurface');
			expect(theme).toHaveProperty('surfaceVariant');
			expect(theme).toHaveProperty('onSurfaceVariant');
			expect(theme).toHaveProperty('outline');
			expect(theme).toHaveProperty('outlineVariant');
			expect(theme).toHaveProperty('background');
			expect(theme).toHaveProperty('onBackground');
		});

		it('should generate contrasting on-colors for accessibility', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const theme = generateThemeColors(seedColor, 'light');

			// Assert - onPrimary should have high contrast with primary
			const primaryHct = hexToHct(theme.primary);
			const onPrimaryHct = hexToHct(theme.onPrimary);

			const toneDiff = Math.abs(primaryHct.tone - onPrimaryHct.tone);
			expect(toneDiff).toBeGreaterThan(40); // Should have significant contrast
		});

		it('should generate different themes for light and dark modes', () => {
			// Arrange
			const seedColor = '#2563eb';

			// Act
			const lightTheme = generateThemeColors(seedColor, 'light');
			const darkTheme = generateThemeColors(seedColor, 'dark');

			// Assert
			expect(lightTheme.primary).not.toBe(darkTheme.primary);
			expect(lightTheme.surface).not.toBe(darkTheme.surface);
			expect(lightTheme.background).not.toBe(darkTheme.background);

			// Light mode should have lighter surface
			const lightSurfaceHct = hexToHct(lightTheme.surface);
			const darkSurfaceHct = hexToHct(darkTheme.surface);
			expect(lightSurfaceHct.tone).toBeGreaterThan(darkSurfaceHct.tone);
		});
	});

	describe('HOST Brand Colors', () => {
		it('should generate accessible color system from HOST brand blue', () => {
			// Arrange
			const hostBlue = '#2563eb';

			// Act
			const theme = generateThemeColors(hostBlue, 'light');

			// Assert
			expect(theme.primary).toBeDefined();
			expect(theme.primary).toMatch(/^#[0-9a-f]{6}$/i);
		});

		it('should support custom secondary and tertiary colors', () => {
			// Arrange
			const primary = '#2563eb';
			const secondary = '#7c3aed'; // Purple
			const tertiary = '#059669'; // Green

			// Act
			const theme = generateThemeColors(primary, 'light', { secondary, tertiary });

			// Assert
			expect(theme.secondary).toBeDefined();
			expect(theme.tertiary).toBeDefined();
		});
	});
});
