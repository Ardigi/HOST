/**
 * Test setup file for POS app
 * Configures global test environment for Vitest Browser Mode
 */

/// <reference types="vitest" />
/// <reference types="@vitest/browser/matchers" />
/// <reference types="playwright" />

import { expect } from 'vitest';

// vitest-browser-svelte is automatically loaded via setupFiles in vite.config.ts
// Custom matchers can be added here if needed
