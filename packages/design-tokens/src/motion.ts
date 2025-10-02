/**
 * Design Tokens - Motion System
 * Material Design 3 animation tokens
 */

export interface DurationTokens {
	short1: string; // 50ms - Icon state changes
	short2: string; // 100ms - Selection controls
	short3: string; // 150ms - Small component state
	short4: string; // 200ms - Large component state
	medium1: string; // 250ms - Simple transitions
	medium2: string; // 300ms - Complex transitions
	medium3: string; // 350ms - Entering/exiting
	medium4: string; // 400ms - Large area transitions
	long1: string; // 450ms - Complex entering
	long2: string; // 500ms - Large complex entering
	long3: string; // 550ms - Complex exiting
	long4: string; // 600ms - Large complex exiting
	extraLong1: string; // 700ms - Large screen transitions
	extraLong2: string; // 800ms - Complex screen transitions
	extraLong3: string; // 900ms - Activity transitions
	extraLong4: string; // 1000ms - Emphasized transitions
}

export interface EasingTokens {
	standard: string; // Default easing
	emphasized: string; // Emphasized motion
	emphasizedDecelerate: string; // Entering elements
	emphasizedAccelerate: string; // Exiting elements
	legacy: string; // Legacy ease-in-out
	legacyDecelerate: string; // Legacy ease-out
	legacyAccelerate: string; // Legacy ease-in
	linear: string; // No easing
}

/**
 * Material Design 3 duration tokens
 */
export const duration: DurationTokens = {
	// Short (50-200ms)
	short1: '50ms',
	short2: '100ms',
	short3: '150ms',
	short4: '200ms',

	// Medium (250-400ms)
	medium1: '250ms',
	medium2: '300ms',
	medium3: '350ms',
	medium4: '400ms',

	// Long (450-600ms)
	long1: '450ms',
	long2: '500ms',
	long3: '550ms',
	long4: '600ms',

	// Extra Long (700-1000ms)
	extraLong1: '700ms',
	extraLong2: '800ms',
	extraLong3: '900ms',
	extraLong4: '1000ms',
};

/**
 * Material Design 3 easing functions
 */
export const easing: EasingTokens = {
	// Standard easing
	standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',

	// Emphasized easing (for important transitions)
	emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
	emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', // Entering
	emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)', // Exiting

	// Legacy easing (for compatibility)
	legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
	legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
	legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',

	// Linear (no easing)
	linear: 'linear',
};

/**
 * Common animation patterns
 */
export const animations = {
	// Fade
	fadeIn: {
		duration: duration.short4,
		easing: easing.emphasizedDecelerate,
		keyframes: 'fadeIn',
	},
	fadeOut: {
		duration: duration.short3,
		easing: easing.emphasizedAccelerate,
		keyframes: 'fadeOut',
	},

	// Scale
	scaleIn: {
		duration: duration.medium2,
		easing: easing.emphasizedDecelerate,
		keyframes: 'scaleIn',
	},
	scaleOut: {
		duration: duration.short4,
		easing: easing.emphasizedAccelerate,
		keyframes: 'scaleOut',
	},

	// Slide
	slideInUp: {
		duration: duration.medium3,
		easing: easing.emphasizedDecelerate,
		keyframes: 'slideInUp',
	},
	slideInDown: {
		duration: duration.medium3,
		easing: easing.emphasizedDecelerate,
		keyframes: 'slideInDown',
	},
	slideOutUp: {
		duration: duration.medium2,
		easing: easing.emphasizedAccelerate,
		keyframes: 'slideOutUp',
	},
	slideOutDown: {
		duration: duration.medium2,
		easing: easing.emphasizedAccelerate,
		keyframes: 'slideOutDown',
	},

	// Expand/Collapse
	expand: {
		duration: duration.medium4,
		easing: easing.emphasizedDecelerate,
		keyframes: 'expand',
	},
	collapse: {
		duration: duration.medium2,
		easing: easing.emphasizedAccelerate,
		keyframes: 'collapse',
	},

	// POS specific animations
	orderAdded: {
		duration: duration.medium2,
		easing: easing.emphasized,
		keyframes: 'slideInRight',
	},
	orderRemoved: {
		duration: duration.short4,
		easing: easing.emphasizedAccelerate,
		keyframes: 'fadeOut',
	},
	paymentSuccess: {
		duration: duration.long2,
		easing: easing.emphasized,
		keyframes: 'scaleInBounce',
	},
} as const;

/**
 * Transition helper
 */
export function transition(
	property: string | string[],
	durationValue: string,
	easingValue: string = easing.standard
): string {
	const properties = Array.isArray(property) ? property : [property];
	return properties.map(prop => `${prop} ${durationValue} ${easingValue}`).join(', ');
}
