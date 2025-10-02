/**
 * Design Tokens - Color System
 * Material Design 3 color generation using HCT color space
 */

import {
	Hct,
	TonalPalette,
	argbFromHex,
	hexFromArgb,
	themeFromSourceColor,
} from '@material/material-color-utilities';

export interface HctColor {
	hue: number; // 0-360
	chroma: number; // 0-150+
	tone: number; // 0-100
}

export interface ColorPalette {
	0: string;
	10: string;
	20: string;
	30: string;
	40: string;
	50: string;
	60: string;
	70: string;
	80: string;
	90: string;
	95: string;
	99: string;
	100: string;
}

export interface ThemeColors {
	// Primary
	primary: string;
	onPrimary: string;
	primaryContainer: string;
	onPrimaryContainer: string;

	// Secondary
	secondary: string;
	onSecondary: string;
	secondaryContainer: string;
	onSecondaryContainer: string;

	// Tertiary
	tertiary: string;
	onTertiary: string;
	tertiaryContainer: string;
	onTertiaryContainer: string;

	// Error
	error: string;
	onError: string;
	errorContainer: string;
	onErrorContainer: string;

	// Surface
	surface: string;
	onSurface: string;
	surfaceVariant: string;
	onSurfaceVariant: string;

	// Outline
	outline: string;
	outlineVariant: string;

	// Background
	background: string;
	onBackground: string;
}

export interface CustomColors {
	secondary?: string;
	tertiary?: string;
	error?: string;
}

/**
 * Convert hex color to HCT color space
 */
export function hexToHct(hex: string): HctColor {
	const argb = argbFromHex(hex);
	const hct = Hct.fromInt(argb);

	return {
		hue: hct.hue,
		chroma: hct.chroma,
		tone: hct.tone,
	};
}

/**
 * Convert HCT color to hex
 */
export function hctToHex(hct: HctColor): string {
	const color = Hct.from(hct.hue, hct.chroma, hct.tone);
	return hexFromArgb(color.toInt());
}

/**
 * Generate 13-step tonal palette from seed color
 */
export function generatePalette(seedColor: string): ColorPalette {
	const argb = argbFromHex(seedColor);
	const hct = Hct.fromInt(argb);
	const palette = TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);

	return {
		0: hexFromArgb(palette.tone(0)),
		10: hexFromArgb(palette.tone(10)),
		20: hexFromArgb(palette.tone(20)),
		30: hexFromArgb(palette.tone(30)),
		40: hexFromArgb(palette.tone(40)),
		50: hexFromArgb(palette.tone(50)),
		60: hexFromArgb(palette.tone(60)),
		70: hexFromArgb(palette.tone(70)),
		80: hexFromArgb(palette.tone(80)),
		90: hexFromArgb(palette.tone(90)),
		95: hexFromArgb(palette.tone(95)),
		99: hexFromArgb(palette.tone(99)),
		100: hexFromArgb(palette.tone(100)),
	};
}

/**
 * Generate Material Design 3 theme colors from seed color
 */
export function generateThemeColors(
	seedColor: string,
	mode: 'light' | 'dark',
	customColors?: CustomColors
): ThemeColors {
	const sourceArgb = argbFromHex(seedColor);
	const theme = themeFromSourceColor(sourceArgb, [
		{
			name: 'custom',
			value: sourceArgb,
			blend: true,
		},
	]);

	const scheme = mode === 'light' ? theme.schemes.light : theme.schemes.dark;

	return {
		// Primary
		primary: hexFromArgb(scheme.primary),
		onPrimary: hexFromArgb(scheme.onPrimary),
		primaryContainer: hexFromArgb(scheme.primaryContainer),
		onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),

		// Secondary
		secondary: customColors?.secondary
			? hexFromArgb(argbFromHex(customColors.secondary))
			: hexFromArgb(scheme.secondary),
		onSecondary: hexFromArgb(scheme.onSecondary),
		secondaryContainer: hexFromArgb(scheme.secondaryContainer),
		onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),

		// Tertiary
		tertiary: customColors?.tertiary
			? hexFromArgb(argbFromHex(customColors.tertiary))
			: hexFromArgb(scheme.tertiary),
		onTertiary: hexFromArgb(scheme.onTertiary),
		tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
		onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),

		// Error
		error: customColors?.error
			? hexFromArgb(argbFromHex(customColors.error))
			: hexFromArgb(scheme.error),
		onError: hexFromArgb(scheme.onError),
		errorContainer: hexFromArgb(scheme.errorContainer),
		onErrorContainer: hexFromArgb(scheme.onErrorContainer),

		// Surface
		surface: hexFromArgb(scheme.surface),
		onSurface: hexFromArgb(scheme.onSurface),
		surfaceVariant: hexFromArgb(scheme.surfaceVariant),
		onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),

		// Outline
		outline: hexFromArgb(scheme.outline),
		outlineVariant: hexFromArgb(scheme.outlineVariant),

		// Background
		background: hexFromArgb(scheme.background),
		onBackground: hexFromArgb(scheme.onBackground),
	};
}

/**
 * HOST POS Brand Colors
 */
export const HOST_BRAND_COLORS = {
	primary: '#2563eb', // HOST brand blue
	secondary: '#7c3aed', // Purple accent
	tertiary: '#059669', // Success green
	error: '#dc2626', // Error red
} as const;

/**
 * Generate HOST POS theme
 */
export function generateHostTheme(mode: 'light' | 'dark'): ThemeColors {
	return generateThemeColors(HOST_BRAND_COLORS.primary, mode, {
		secondary: HOST_BRAND_COLORS.secondary,
		tertiary: HOST_BRAND_COLORS.tertiary,
		error: HOST_BRAND_COLORS.error,
	});
}
