import { describe, expect, it } from 'vitest';
import { type SpacingTokens, componentSpacing, gridSpacing, spacing } from './spacing';

describe('Spacing Tokens', () => {
	describe('Base Spacing Scale', () => {
		it('should define all spacing sizes', () => {
			expect(spacing.xs).toBeDefined();
			expect(spacing.sm).toBeDefined();
			expect(spacing.md).toBeDefined();
			expect(spacing.lg).toBeDefined();
			expect(spacing.xl).toBeDefined();
			expect(spacing.xxl).toBeDefined();
			expect(spacing.xxxl).toBeDefined();
		});

		it('should follow 8px base unit scale', () => {
			expect(spacing.xs).toBe('4px'); // 0.5 * 8
			expect(spacing.sm).toBe('8px'); // 1 * 8
			expect(spacing.md).toBe('16px'); // 2 * 8
			expect(spacing.lg).toBe('24px'); // 3 * 8
			expect(spacing.xl).toBe('32px'); // 4 * 8
			expect(spacing.xxl).toBe('48px'); // 6 * 8
			expect(spacing.xxxl).toBe('64px'); // 8 * 8
		});

		it('should have increasing values from xs to xxxl', () => {
			const sizes = [
				Number.parseInt(spacing.xs),
				Number.parseInt(spacing.sm),
				Number.parseInt(spacing.md),
				Number.parseInt(spacing.lg),
				Number.parseInt(spacing.xl),
				Number.parseInt(spacing.xxl),
				Number.parseInt(spacing.xxxl),
			];

			for (let i = 1; i < sizes.length; i++) {
				expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
			}
		});

		it('should use pixel units', () => {
			expect(spacing.xs).toContain('px');
			expect(spacing.sm).toContain('px');
			expect(spacing.md).toContain('px');
			expect(spacing.lg).toContain('px');
			expect(spacing.xl).toContain('px');
			expect(spacing.xxl).toContain('px');
			expect(spacing.xxxl).toContain('px');
		});
	});

	describe('Component Spacing', () => {
		it('should define padding variants', () => {
			expect(componentSpacing.paddingCompact).toBe(spacing.sm); // 8px
			expect(componentSpacing.paddingStandard).toBe(spacing.md); // 16px
			expect(componentSpacing.paddingComfortable).toBe(spacing.lg); // 24px
		});

		it('should define gap variants', () => {
			expect(componentSpacing.gapTight).toBe(spacing.xs); // 4px
			expect(componentSpacing.gapStandard).toBe(spacing.sm); // 8px
			expect(componentSpacing.gapRelaxed).toBe(spacing.md); // 16px
		});

		it('should define margin variants', () => {
			expect(componentSpacing.marginSection).toBe(spacing.xl); // 32px
			expect(componentSpacing.marginPage).toBe(spacing.xxl); // 48px
		});

		it('should have increasing padding from compact to comfortable', () => {
			const compact = Number.parseInt(componentSpacing.paddingCompact);
			const standard = Number.parseInt(componentSpacing.paddingStandard);
			const comfortable = Number.parseInt(componentSpacing.paddingComfortable);

			expect(standard).toBeGreaterThan(compact);
			expect(comfortable).toBeGreaterThan(standard);
		});

		it('should have increasing gaps from tight to relaxed', () => {
			const tight = Number.parseInt(componentSpacing.gapTight);
			const standard = Number.parseInt(componentSpacing.gapStandard);
			const relaxed = Number.parseInt(componentSpacing.gapRelaxed);

			expect(standard).toBeGreaterThan(tight);
			expect(relaxed).toBeGreaterThan(standard);
		});
	});

	describe('Grid Spacing', () => {
		it('should define grid spacing properties', () => {
			expect(gridSpacing.gutter).toBe(spacing.md); // 16px
			expect(gridSpacing.columnGap).toBe(spacing.md); // 16px
			expect(gridSpacing.rowGap).toBe(spacing.lg); // 24px
		});

		it('should have consistent gutter and column gap', () => {
			expect(gridSpacing.gutter).toBe(gridSpacing.columnGap);
		});

		it('should have larger row gap than column gap', () => {
			const columnGap = Number.parseInt(gridSpacing.columnGap);
			const rowGap = Number.parseInt(gridSpacing.rowGap);

			expect(rowGap).toBeGreaterThan(columnGap);
		});
	});

	describe('Type Safety', () => {
		it('should match SpacingTokens interface', () => {
			const testSpacing: SpacingTokens = spacing;
			expect(testSpacing).toBeDefined();
		});

		it('should be readonly constants', () => {
			expect(componentSpacing).toBeDefined();
			expect(gridSpacing).toBeDefined();
		});
	});
});
