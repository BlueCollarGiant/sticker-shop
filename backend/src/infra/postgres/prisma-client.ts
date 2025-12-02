/**
 * Postgres client placeholder
 * Disabled while the backend runs in demo (file-based) mode only.
 */

// Stub keeps the API surface without pulling in the Prisma client package.
export const prisma = undefined as never;

export async function connectDatabase(): Promise<void> {
  console.warn('[postgres] connectDatabase skipped; demo mode is active.');
}

export async function disconnectDatabase(): Promise<void> {
  console.warn('[postgres] disconnectDatabase skipped; demo mode is active.');
}
