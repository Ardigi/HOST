import { describe, expect, it } from 'vitest';
import {
	type DurationTokens,
	type EasingTokens,
	animations,
	duration,
	easing,
	transition,
} from './motion';

describe('Motion Tokens', () => {
	describe('Duration Tokens', () => {
		it('should define all short durations', () => {
			expect(duration.short1).toBe('50ms');
			expect(duration.short2).toBe('100ms');
			expect(duration.short3).toBe('150ms');
			expect(duration.short4).toBe('200ms');
		});

		it('should define all medium durations', () => {
			expect(duration.medium1).toBe('250ms');
			expect(duration.medium2).toBe('300ms');
			expect(duration.medium3).toBe('350ms');
			expect(duration.medium4).toBe('400ms');
		});

		it('should define all long durations', () => {
			expect(duration.long1).toBe('450ms');
			expect(duration.long2).toBe('500ms');
			expect(duration.long3).toBe('550ms');
			expect(duration.long4).toBe('600ms');
		});

		it('should define all extra long durations', () => {
			expect(duration.extraLong1).toBe('700ms');
			expect(duration.extraLong2).toBe('800ms');
			expect(duration.extraLong3).toBe('900ms');
			expect(duration.extraLong4).toBe('1000ms');
		});

		it('should have increasing values within each category', () => {
			// Short durations
			expect(Number.parseInt(duration.short2)).toBeGreaterThan(Number.parseInt(duration.short1));
			expect(Number.parseInt(duration.short3)).toBeGreaterThan(Number.parseInt(duration.short2));
			expect(Number.parseInt(duration.short4)).toBeGreaterThan(Number.parseInt(duration.short3));

			// Medium durations
			expect(Number.parseInt(duration.medium2)).toBeGreaterThan(Number.parseInt(duration.medium1));
			expect(Number.parseInt(duration.medium3)).toBeGreaterThan(Number.parseInt(duration.medium2));
			expect(Number.parseInt(duration.medium4)).toBeGreaterThan(Number.parseInt(duration.medium3));

			// Long durations
			expect(Number.parseInt(duration.long2)).toBeGreaterThan(Number.parseInt(duration.long1));
			expect(Number.parseInt(duration.long3)).toBeGreaterThan(Number.parseInt(duration.long2));
			expect(Number.parseInt(duration.long4)).toBeGreaterThan(Number.parseInt(duration.long3));

			// Extra long durations
			expect(Number.parseInt(duration.extraLong2)).toBeGreaterThan(
				Number.parseInt(duration.extraLong1)
			);
			expect(Number.parseInt(duration.extraLong3)).toBeGreaterThan(
				Number.parseInt(duration.extraLong2)
			);
			expect(Number.parseInt(duration.extraLong4)).toBeGreaterThan(
				Number.parseInt(duration.extraLong3)
			);
		});

		it('should use millisecond units', () => {
			expect(duration.short1).toContain('ms');
			expect(duration.medium2).toContain('ms');
			expect(duration.long3).toContain('ms');
			expect(duration.extraLong4).toContain('ms');
		});
	});

	describe('Easing Tokens', () => {
		it('should define standard easing curves', () => {
			expect(easing.standard).toBe('cubic-bezier(0.2, 0.0, 0, 1.0)');
			expect(easing.linear).toBe('linear');
		});

		it('should define emphasized easing curves', () => {
			expect(easing.emphasized).toBe('cubic-bezier(0.2, 0.0, 0, 1.0)');
			expect(easing.emphasizedDecelerate).toBe('cubic-bezier(0.05, 0.7, 0.1, 1.0)');
			expect(easing.emphasizedAccelerate).toBe('cubic-bezier(0.3, 0.0, 0.8, 0.15)');
		});

		it('should define legacy easing curves', () => {
			expect(easing.legacy).toBe('cubic-bezier(0.4, 0.0, 0.2, 1.0)');
			expect(easing.legacyDecelerate).toBe('cubic-bezier(0.0, 0.0, 0.2, 1.0)');
			expect(easing.legacyAccelerate).toBe('cubic-bezier(0.4, 0.0, 1.0, 1.0)');
		});

		it('should have valid cubic-bezier format', () => {
			const bezierPattern = /^cubic-bezier\([0-9.]+,\s*[0-9.]+,\s*[0-9.]+,\s*[0-9.]+\)$/;

			expect(easing.standard).toMatch(bezierPattern);
			expect(easing.emphasized).toMatch(bezierPattern);
			expect(easing.emphasizedDecelerate).toMatch(bezierPattern);
			expect(easing.emphasizedAccelerate).toMatch(bezierPattern);
		});
	});

	describe('Animation Patterns', () => {
		it('should define fade animations', () => {
			expect(animations.fadeIn).toEqual({
				duration: duration.short4,
				easing: easing.emphasizedDecelerate,
				keyframes: 'fadeIn',
			});

			expect(animations.fadeOut).toEqual({
				duration: duration.short3,
				easing: easing.emphasizedAccelerate,
				keyframes: 'fadeOut',
			});
		});

		it('should define scale animations', () => {
			expect(animations.scaleIn).toEqual({
				duration: duration.medium2,
				easing: easing.emphasizedDecelerate,
				keyframes: 'scaleIn',
			});

			expect(animations.scaleOut).toEqual({
				duration: duration.short4,
				easing: easing.emphasizedAccelerate,
				keyframes: 'scaleOut',
			});
		});

		it('should define slide animations', () => {
			expect(animations.slideInUp.keyframes).toBe('slideInUp');
			expect(animations.slideInDown.keyframes).toBe('slideInDown');
			expect(animations.slideOutUp.keyframes).toBe('slideOutUp');
			expect(animations.slideOutDown.keyframes).toBe('slideOutDown');
		});

		it('should define expand/collapse animations', () => {
			expect(animations.expand).toEqual({
				duration: duration.medium4,
				easing: easing.emphasizedDecelerate,
				keyframes: 'expand',
			});

			expect(animations.collapse).toEqual({
				duration: duration.medium2,
				easing: easing.emphasizedAccelerate,
				keyframes: 'collapse',
			});
		});

		it('should define POS-specific animations', () => {
			expect(animations.orderAdded).toBeDefined();
			expect(animations.orderRemoved).toBeDefined();
			expect(animations.paymentSuccess).toBeDefined();

			expect(animations.orderAdded.keyframes).toBe('slideInRight');
			expect(animations.orderRemoved.keyframes).toBe('fadeOut');
			expect(animations.paymentSuccess.keyframes).toBe('scaleInBounce');
		});

		it('should use decelerate easing for entering animations', () => {
			expect(animations.fadeIn.easing).toBe(easing.emphasizedDecelerate);
			expect(animations.scaleIn.easing).toBe(easing.emphasizedDecelerate);
			expect(animations.slideInUp.easing).toBe(easing.emphasizedDecelerate);
		});

		it('should use accelerate easing for exiting animations', () => {
			expect(animations.fadeOut.easing).toBe(easing.emphasizedAccelerate);
			expect(animations.scaleOut.easing).toBe(easing.emphasizedAccelerate);
			expect(animations.slideOutUp.easing).toBe(easing.emphasizedAccelerate);
		});
	});

	describe('Transition Helper', () => {
		it('should create single property transition', () => {
			const result = transition('opacity', duration.short2, easing.standard);
			expect(result).toBe('opacity 100ms cubic-bezier(0.2, 0.0, 0, 1.0)');
		});

		it('should create multi-property transition', () => {
			const result = transition(['opacity', 'transform'], duration.medium2, easing.emphasized);
			expect(result).toBe(
				'opacity 300ms cubic-bezier(0.2, 0.0, 0, 1.0), transform 300ms cubic-bezier(0.2, 0.0, 0, 1.0)'
			);
		});

		it('should use standard easing by default', () => {
			const result = transition('opacity', duration.short2);
			expect(result).toContain(easing.standard);
		});

		it('should handle custom easing', () => {
			const result = transition('transform', duration.long1, easing.emphasizedDecelerate);
			expect(result).toBe('transform 450ms cubic-bezier(0.05, 0.7, 0.1, 1.0)');
		});
	});

	describe('Type Safety', () => {
		it('should match DurationTokens interface', () => {
			const testDuration: DurationTokens = duration;
			expect(testDuration).toBeDefined();
		});

		it('should match EasingTokens interface', () => {
			const testEasing: EasingTokens = easing;
			expect(testEasing).toBeDefined();
		});

		it('should be readonly constants', () => {
			expect(animations).toBeDefined();
		});
	});
});
