import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup MSW for API mocking
beforeAll(() => {
	// Start MSW server if needed
	// server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
	// Reset handlers after each test
	// server.resetHandlers();
});

afterAll(() => {
	// Clean up after all tests
	// server.close();
});

// Global test utilities
global.testUtils = {
	// Add global test utilities here
};