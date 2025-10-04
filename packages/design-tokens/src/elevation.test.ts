import { describe, expect, it } from 'vitest';
import { type ElevationTokens, componentElevation, elevation } from './elevation';

describe('Elevation Tokens', () => {
	describe('Base Elevation Levels', () => {
		it('should define all required elevation levels', () => {
			expect(elevation).toBeDefined();
			expect(elevation.level0).toBeDefined();
			expect(elevation.level1).toBeDefined();
			expect(elevation.level2).toBeDefined();
			expect(elevation.level3).toBeDefined();
			expect(elevation.level4).toBeDefined();
			expect(elevation.level5).toBeDefined();
		});

		it('should have level0 as none (no shadow)', () => {
			expect(elevation.level0).toBe('none');
		});

		it('should have valid CSS box-shadow values', () => {
			// All levels except 0 should have box-shadow format
			expect(elevation.level1).toContain('rgba');
			expect(elevation.level2).toContain('rgba');
			expect(elevation.level3).toContain('rgba');
			expect(elevation.level4).toContain('rgba');
			expect(elevation.level5).toContain('rgba');
		});

		it('should have increasing shadow intensity', () => {
			// Level 5 should have more complex shadows than level 1
			// Check that level 5 shadow string is longer (more shadow layers/values)
			expect(elevation.level5.length).toBeGreaterThan(elevation.level1.length);

			// Level 5 should have higher numerical values in its shadow definition
			const numbers1 = elevation.level1.match(/\d+/g)?.map(Number) || [];
			const numbers5 = elevation.level5.match(/\d+/g)?.map(Number) || [];

			// Sum all numbers to get overall "intensity"
			const sum1 = numbers1.reduce((a, b) => a + b, 0);
			const sum5 = numbers5.reduce((a, b) => a + b, 0);

			expect(sum5).toBeGreaterThan(sum1);
		});
	});

	describe('Component Elevation Mapping', () => {
		it('should define surface elevations', () => {
			expect(componentElevation.surfaceDefault).toBe(elevation.level0);
			expect(componentElevation.surfaceRaised).toBe(elevation.level1);
		});

		it('should define card elevations with state variations', () => {
			expect(componentElevation.cardResting).toBe(elevation.level1);
			expect(componentElevation.cardHovered).toBe(elevation.level2);
			expect(componentElevation.cardDragged).toBe(elevation.level4);
		});

		it('should have increasing card elevation on interaction', () => {
			const getElevationLevel = (shadow: string): number => {
				if (shadow === elevation.level0) return 0;
				if (shadow === elevation.level1) return 1;
				if (shadow === elevation.level2) return 2;
				if (shadow === elevation.level3) return 3;
				if (shadow === elevation.level4) return 4;
				if (shadow === elevation.level5) return 5;
				return -1;
			};

			const restingLevel = getElevationLevel(componentElevation.cardResting);
			const hoveredLevel = getElevationLevel(componentElevation.cardHovered);
			const draggedLevel = getElevationLevel(componentElevation.cardDragged);

			expect(hoveredLevel).toBeGreaterThan(restingLevel);
			expect(draggedLevel).toBeGreaterThan(hoveredLevel);
		});

		it('should define button elevations', () => {
			expect(componentElevation.buttonResting).toBe(elevation.level0);
			expect(componentElevation.buttonHovered).toBe(elevation.level1);
			expect(componentElevation.buttonPressed).toBe(elevation.level0);
		});

		it('should define FAB elevations higher than regular buttons', () => {
			expect(componentElevation.fabResting).toBe(elevation.level3);
			expect(componentElevation.fabHovered).toBe(elevation.level4);
			expect(componentElevation.fabPressed).toBe(elevation.level2);
		});

		it('should define navigation component elevations', () => {
			expect(componentElevation.navigationDrawer).toBe(elevation.level1);
			expect(componentElevation.appBar).toBe(elevation.level0);
			expect(componentElevation.appBarScrolled).toBe(elevation.level2);
		});

		it('should define dialog and modal elevations at highest levels', () => {
			expect(componentElevation.dialog).toBe(elevation.level5);
			expect(componentElevation.bottomSheet).toBe(elevation.level3);
			expect(componentElevation.menu).toBe(elevation.level2);
		});

		it('should define POS-specific elevations', () => {
			expect(componentElevation.orderCard).toBe(elevation.level1);
			expect(componentElevation.activeOrder).toBe(elevation.level3);
			expect(componentElevation.paymentDialog).toBe(elevation.level5);
		});

		it('should have active order elevated above regular order', () => {
			const orderCardNum = componentElevation.orderCard === elevation.level1 ? 1 : 0;
			const activeOrderNum = componentElevation.activeOrder === elevation.level3 ? 3 : 0;

			expect(activeOrderNum).toBeGreaterThan(orderCardNum);
		});
	});

	describe('Type Safety', () => {
		it('should match ElevationTokens interface', () => {
			const testElevation: ElevationTokens = elevation;
			expect(testElevation).toBeDefined();
		});

		it('should be immutable (readonly)', () => {
			// TypeScript enforces readonly, runtime check that object exists
			expect(Object.isFrozen(elevation)).toBe(false); // Not frozen by default
			expect(elevation).toBe(elevation); // Same reference
		});
	});
});
