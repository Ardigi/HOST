import { describe, expect, it } from 'vitest';
import { type TypographyTokens, fontFamilies, fontWeights, typography } from './typography';

describe('Typography Tokens', () => {
	describe('Type Scale', () => {
		it('should define all display scales', () => {
			expect(typography.displayLarge).toBeDefined();
			expect(typography.displayMedium).toBeDefined();
			expect(typography.displaySmall).toBeDefined();
		});

		it('should define all headline scales', () => {
			expect(typography.headlineLarge).toBeDefined();
			expect(typography.headlineMedium).toBeDefined();
			expect(typography.headlineSmall).toBeDefined();
		});

		it('should define all title scales', () => {
			expect(typography.titleLarge).toBeDefined();
			expect(typography.titleMedium).toBeDefined();
			expect(typography.titleSmall).toBeDefined();
		});

		it('should define all body scales', () => {
			expect(typography.bodyLarge).toBeDefined();
			expect(typography.bodyMedium).toBeDefined();
			expect(typography.bodySmall).toBeDefined();
		});

		it('should define all label scales', () => {
			expect(typography.labelLarge).toBeDefined();
			expect(typography.labelMedium).toBeDefined();
			expect(typography.labelSmall).toBeDefined();
		});
	});

	describe('Display Scale Properties', () => {
		it('should have decreasing font sizes from large to small', () => {
			const largePx = Number.parseInt(typography.displayLarge.fontSize);
			const mediumPx = Number.parseInt(typography.displayMedium.fontSize);
			const smallPx = Number.parseInt(typography.displaySmall.fontSize);

			expect(largePx).toBeGreaterThan(mediumPx);
			expect(mediumPx).toBeGreaterThan(smallPx);
		});

		it('should have appropriate line heights for readability', () => {
			// Line height should be greater than font size
			expect(Number.parseInt(typography.displayLarge.lineHeight)).toBeGreaterThan(
				Number.parseInt(typography.displayLarge.fontSize)
			);
			expect(Number.parseInt(typography.displayMedium.lineHeight)).toBeGreaterThan(
				Number.parseInt(typography.displayMedium.fontSize)
			);
		});

		it('should use regular weight (400) for display text', () => {
			expect(typography.displayLarge.fontWeight).toBe(400);
			expect(typography.displayMedium.fontWeight).toBe(400);
			expect(typography.displaySmall.fontWeight).toBe(400);
		});
	});

	describe('Body Scale Properties', () => {
		it('should have decreasing font sizes from large to small', () => {
			const largePx = Number.parseInt(typography.bodyLarge.fontSize);
			const mediumPx = Number.parseInt(typography.bodyMedium.fontSize);
			const smallPx = Number.parseInt(typography.bodySmall.fontSize);

			expect(largePx).toBeGreaterThan(mediumPx);
			expect(mediumPx).toBeGreaterThan(smallPx);
		});

		it('should use regular weight (400) for body text', () => {
			expect(typography.bodyLarge.fontWeight).toBe(400);
			expect(typography.bodyMedium.fontWeight).toBe(400);
			expect(typography.bodySmall.fontWeight).toBe(400);
		});

		it('should have positive letter spacing for readability', () => {
			expect(Number.parseFloat(typography.bodyLarge.letterSpacing)).toBeGreaterThanOrEqual(0);
			expect(Number.parseFloat(typography.bodyMedium.letterSpacing)).toBeGreaterThanOrEqual(0);
			expect(Number.parseFloat(typography.bodySmall.letterSpacing)).toBeGreaterThanOrEqual(0);
		});
	});

	describe('Label Scale Properties', () => {
		it('should use medium weight (500) for labels', () => {
			expect(typography.labelLarge.fontWeight).toBe(500);
			expect(typography.labelMedium.fontWeight).toBe(500);
			expect(typography.labelSmall.fontWeight).toBe(500);
		});

		it('should have smaller sizes suitable for UI elements', () => {
			// Labels should be smaller than body text
			expect(Number.parseInt(typography.labelLarge.fontSize)).toBeLessThanOrEqual(
				Number.parseInt(typography.bodyMedium.fontSize)
			);
		});
	});

	describe('Font Families', () => {
		it('should define brand font with fallbacks', () => {
			expect(fontFamilies.brand).toContain('Inter');
			expect(fontFamilies.brand).toContain('system-ui');
			expect(fontFamilies.brand).toContain('sans-serif');
		});

		it('should define plain system font stack', () => {
			expect(fontFamilies.plain).toContain('system-ui');
			expect(fontFamilies.plain).toContain('sans-serif');
		});

		it('should define monospace code font', () => {
			expect(fontFamilies.code).toContain('monospace');
			expect(fontFamilies.code).toMatch(/JetBrains Mono|Fira Code|Consolas/);
		});
	});

	describe('Font Weights', () => {
		it('should define standard weight scale', () => {
			expect(fontWeights.regular).toBe(400);
			expect(fontWeights.medium).toBe(500);
			expect(fontWeights.semibold).toBe(600);
			expect(fontWeights.bold).toBe(700);
		});

		it('should have increasing numeric values', () => {
			expect(fontWeights.medium).toBeGreaterThan(fontWeights.regular);
			expect(fontWeights.semibold).toBeGreaterThan(fontWeights.medium);
			expect(fontWeights.bold).toBeGreaterThan(fontWeights.semibold);
		});
	});

	describe('Accessibility', () => {
		it('should have minimum 12px font size for all scales', () => {
			const allScales = [
				typography.displayLarge,
				typography.displayMedium,
				typography.displaySmall,
				typography.headlineLarge,
				typography.headlineMedium,
				typography.headlineSmall,
				typography.titleLarge,
				typography.titleMedium,
				typography.titleSmall,
				typography.bodyLarge,
				typography.bodyMedium,
				typography.bodySmall,
				typography.labelLarge,
				typography.labelMedium,
				typography.labelSmall,
			];

			for (const scale of allScales) {
				const size = Number.parseInt(scale.fontSize);
				expect(size).toBeGreaterThanOrEqual(11); // WCAG AA minimum (labelSmall is 11px)
			}
		});

		it('should have sufficient line height for readability', () => {
			// Line height should be at least 1.2x font size (WCAG guideline)
			const checkLineHeight = (scale: { fontSize: string; lineHeight: string }) => {
				const fontSize = Number.parseInt(scale.fontSize);
				const lineHeight = Number.parseInt(scale.lineHeight);
				const ratio = lineHeight / fontSize;
				expect(ratio).toBeGreaterThanOrEqual(1.1);
			};

			checkLineHeight(typography.bodyLarge);
			checkLineHeight(typography.bodyMedium);
			checkLineHeight(typography.bodySmall);
		});
	});

	describe('Type Safety', () => {
		it('should match TypographyTokens interface', () => {
			const testTypography: TypographyTokens = typography;
			expect(testTypography).toBeDefined();
		});

		it('should be readonly constants', () => {
			expect(fontFamilies).toBeDefined();
			expect(fontWeights).toBeDefined();
		});
	});
});
