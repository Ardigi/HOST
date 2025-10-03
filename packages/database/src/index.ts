/**
 * Database Package Entry Point
 * Exports client, schema, and main database instance
 */

export * from './client';
export * as schema from './schema';
export { db } from './client';
