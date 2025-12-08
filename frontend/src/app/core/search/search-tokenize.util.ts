/**
 * Tokenization utilities for search queries
 */

/**
 * Tokenize a search query into normalized tokens
 *
 * @param query - The search query string
 * @returns Array of normalized tokens (lowercase, trimmed)
 *
 * @example
 * tokenize("john t") => ["john", "t"]
 * tokenize("  Mary   Jane  ") => ["mary", "jane"]
 */
export function tokenize(query: string): string[] {
  if (!query || typeof query !== 'string') {
    return [];
  }

  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Extract field value from an item (supports nested paths)
 *
 * @param item - The item to extract from
 * @param field - The field path (e.g., 'name' or 'user.name')
 * @returns The field value as a string, or empty string if not found
 */
export function getFieldValue(item: any, field: string): string {
  if (!item) return '';

  const parts = field.split('.');
  let value = item;

  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) {
      return '';
    }
  }

  return String(value);
}

/**
 * Extract all searchable values from an item based on field configuration
 *
 * @param item - The item to extract from
 * @param fields - Array of field paths to extract
 * @returns Array of normalized string values
 */
export function extractSearchableValues(item: any, fields: string[]): string[] {
  return fields
    .map(field => getFieldValue(item, field))
    .filter(value => value.length > 0)
    .map(value => value.toLowerCase());
}
