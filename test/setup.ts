import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { handlers } from './mocks/handlers.js';

// Setup MSW server for API mocking
export const server = setupServer(...handlers);

beforeAll(() => {
	// Start MSW server
	server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
	// Reset handlers after each test
	server.resetHandlers();
});

afterAll(() => {
	// Clean up after all tests
	server.close();
});

// Global test utilities interface
interface TestUtils {
	// Placeholder property to satisfy linter (remove when adding actual utilities)
	_placeholder?: never;
	// Add global test utility methods here as needed
	// Example: createMockUser: () => User;
}

declare global {
	// eslint-disable-next-line no-var
	var testUtils: TestUtils;
}

global.testUtils = {} as TestUtils;
