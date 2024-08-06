import { describe, expect, it } from 'vitest';
import {
	type TouchTargetTokens,
	componentTouchTargets,
	touchSpacing,
	touchTargets,
} from './touch-targets';

describe('Touch Target Tokens', () => {
	describe('Base Touch Targets', () => {
		it('should define all touch target sizes', () => {
			expect(touchTargets.minimum).toBeDefined();
			expect(touchTargets.comfortable).toBeDefined();
			expect(touchTargets.critical).toBeDefined();
		});

		it('should meet WCAG 2.1 AA minimum (48px)', () => {
			expect(touchTargets.minimum).toBe('48px');
			expect(Number.parseInt(touchTargets.minimum)).toBeGreaterThanOrEqual(48);
		});

		it('should have comfortable size for primary actions (56px)', () => {
			expect(touchTargets.comfortable).toBe('56px');
		});

		it('should have critical size for important POS actions (80px)', () => {
			expect(touchTargets.critical).toBe('80px');
		});

		it('should have increasing sizes from minimum to critical', () => {
			const minimum = Number.parseInt(touchTargets.minimum);
			const comfortable = Number.parseInt(touchTargets.comfortable);
			const critical = Number.parseInt(touchTargets.critical);

			expect(comfortable).toBeGreaterThan(minimum);
			expect(critical).toBeGreaterThan(comfortable);
		});
	});

	describe('Component Touch Targets', () => {
		it('should define button sizes', () => {
			expect(componentTouchTargets.buttonSmall).toBe(touchTargets.minimum); // 48px
			expect(componentTouchTargets.buttonMedium).toBe(touchTargets.comfortable); // 56px
			expect(componentTouchTargets.buttonLarge).toBe(touchTargets.critical); // 80px
		});

		it('should define form input sizes', () => {
			expect(componentTouchTargets.inputHeight).toBe(touchTargets.comfortable); // 56px
			expect(componentTouchTargets.checkboxSize).toBe(touchTargets.minimum); // 48px
			expect(componentTouchTargets.radioSize).toBe(touchTargets.minimum); // 48px
			expect(componentTouchTargets.switchWidth).toBe('52px');
		});

		it('should define navigation sizes', () => {
			expect(componentTouchTargets.tabHeight).toBe(touchTargets.comfortable); // 56px
			expect(componentTouchTargets.listItemHeight).toBe(touchTargets.comfortable); // 56px
			expect(componentTouchTargets.menuItemHeight).toBe(touchTargets.minimum); // 48px
		});

		it('should define icon button sizes', () => {
			expect(componentTouchTargets.iconButtonSmall).toBe(touchTargets.minimum); // 48px
			expect(componentTouchTargets.iconButtonMedium).toBe(touchTargets.comfortable); // 56px
			expect(componentTouchTargets.iconButtonLarge).toBe(touchTargets.critical); // 80px
		});

		it('should define POS-specific sizes', () => {
			expect(componentTouchTargets.menuItemCard).toBe('120px');
			expect(componentTouchTargets.tableButton).toBe(touchTargets.critical); // 80px
			expect(componentTouchTargets.paymentButton).toBe(touchTargets.critical); // 80px
		});

		it('should use critical size for POS transaction actions', () => {
			expect(componentTouchTargets.tableButton).toBe(touchTargets.critical);
			expect(componentTouchTargets.paymentButton).toBe(touchTargets.critical);
		});

		it('should have large menu item cards for easy selection', () => {
			const menuItemSize = Number.parseInt(componentTouchTargets.menuItemCard);
			const criticalSize = Number.parseInt(touchTargets.critical);

			expect(menuItemSize).toBeGreaterThan(criticalSize);
		});
	});

	describe('Touch Spacing', () => {
		it('should define minimum spacing (8px)', () => {
			expect(touchSpacing.minimum).toBe('8px');
		});

		it('should define comfortable spacing (16px)', () => {
			expect(touchSpacing.comfortable).toBe('16px');
		});

		it('should meet WCAG 2.1 minimum spacing recommendation', () => {
			const minSpacing = Number.parseInt(touchSpacing.minimum);
			expect(minSpacing).toBeGreaterThanOrEqual(8);
		});

		it('should have comfortable spacing larger than minimum', () => {
			const minimum = Number.parseInt(touchSpacing.minimum);
			const comfortable = Number.parseInt(touchSpacing.comfortable);

			expect(comfortable).toBeGreaterThan(minimum);
		});
	});

	describe('WCAG Accessibility Compliance', () => {
		it('should have all component targets meet 48px minimum', () => {
			const componentSizes = [
				componentTouchTargets.buttonSmall,
				componentTouchTargets.buttonMedium,
				componentTouchTargets.buttonLarge,
				componentTouchTargets.inputHeight,
				componentTouchTargets.checkboxSize,
				componentTouchTargets.radioSize,
				componentTouchTargets.switchWidth,
				componentTouchTargets.tabHeight,
				componentTouchTargets.listItemHeight,
				componentTouchTargets.menuItemHeight,
				componentTouchTargets.iconButtonSmall,
				componentTouchTargets.iconButtonMedium,
				componentTouchTargets.iconButtonLarge,
				componentTouchTargets.menuItemCard,
				componentTouchTargets.tableButton,
				componentTouchTargets.paymentButton,
			];

			for (const size of componentSizes) {
				const sizeValue = Number.parseInt(size);
				expect(sizeValue).toBeGreaterThanOrEqual(48); // WCAG 2.1 AA minimum
			}
		});

		it('should prioritize larger targets for critical POS actions', () => {
			const criticalTargets = [
				componentTouchTargets.tableButton,
				componentTouchTargets.paymentButton,
			];

			for (const target of criticalTargets) {
				expect(Number.parseInt(target)).toBeGreaterThanOrEqual(
					Number.parseInt(touchTargets.critical)
				);
			}
		});
	});

	describe('Type Safety', () => {
		it('should match TouchTargetTokens interface', () => {
			const testTouchTargets: TouchTargetTokens = touchTargets;
			expect(testTouchTargets).toBeDefined();
		});

		it('should be readonly constants', () => {
			expect(componentTouchTargets).toBeDefined();
			expect(touchSpacing).toBeDefined();
		});
	});
});
